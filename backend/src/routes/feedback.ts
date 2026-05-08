import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { AvisPayload } from '../types';

const router = Router();

// Récupérer les motifs de visite (F-02)
router.get('/motifs', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT m.id, m.libelle, m.service_id, s.code as service_code, s.nom as service_nom FROM motifs m JOIN services s ON m.service_id = s.id ORDER BY s.code, m.libelle'
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erreur récupération motifs:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les services
router.get('/services', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY code');
    return res.json(rows);
  } catch (error) {
    console.error('Erreur récupération services:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Vérifier si une session a déjà soumis un avis (F-05)
router.get('/check-session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const [rows] = await pool.query<any[]>(
      'SELECT id FROM avis WHERE session_id = ?',
      [sessionId]
    );
    return res.json({ hasSubmitted: rows.length > 0 });
  } catch (error) {
    console.error('Erreur vérification session:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Soumettre un avis (F-05)
router.post('/submit', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const avis: AvisPayload = req.body;

    // Validation
    if (!avis.session_id || !avis.motifs || avis.motifs.length === 0) {
      return res.status(400).json({ message: 'Données incomplètes' });
    }

    // Vérifier double soumission
    const [existing] = await connection.query<any[]>(
      'SELECT id FROM avis WHERE session_id = ?',
      [avis.session_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Vous avez déjà soumis un avis' });
    }

    // Validation des notes
    const notes = [
      avis.note_accueil,
      avis.note_temps_attente,
      avis.note_amabilite,
      avis.note_clarte,
      avis.note_proprete,
      avis.note_globale
    ];

    for (const note of notes) {
      if (note < 1 || note > 5) {
        return res.status(400).json({ message: 'Les notes doivent être entre 1 et 5' });
      }
    }

    await connection.beginTransaction();

    // Insérer l'avis
    const [result] = await connection.query<any>(
      `INSERT INTO avis (session_id, note_accueil, note_temps_attente, note_amabilite, note_clarte, note_proprete, note_globale, commentaire) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        avis.session_id,
        avis.note_accueil,
        avis.note_temps_attente,
        avis.note_amabilite,
        avis.note_clarte,
        avis.note_proprete,
        avis.note_globale,
        avis.commentaire || null
      ]
    );

    const avisId = result.insertId;

    // Insérer les motifs liés
    for (const motifId of avis.motifs) {
      await connection.query(
        'INSERT INTO avis_motifs (avis_id, motif_id) VALUES (?, ?)',
        [avisId, motifId]
      );
    }

    await connection.commit();

    return res.status(201).json({ 
      success: true, 
      message: 'Avis soumis avec succès',
      avis_id: avisId 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erreur soumission avis:', error);
    return res.status(500).json({ message: 'Erreur lors de la soumission' });
  } finally {
    connection.release();
  }
});

export default router;