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

// Fenêtre anti-doublon : 8 heures glissantes par service
const FENETRE_HEURES = 8;

// Vérifier si une session a déjà soumis un avis (F-05)
router.get('/check-session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const [rows] = await pool.query<any[]>(
      `SELECT DISTINCT m.service_id
       FROM avis a
       JOIN avis_motifs am ON am.avis_id = a.id
       JOIN motifs m ON m.id = am.motif_id
       WHERE a.session_id = ?
         AND a.date_soumission >= NOW() - INTERVAL ? HOUR`,
      [sessionId, FENETRE_HEURES]
    );
    const serviceIdsDejaEvalues: number[] = rows.map((r) => r.service_id);
    return res.json({ hasSubmitted: serviceIdsDejaEvalues.length > 0, serviceIdsDejaEvalues });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Soumettre un avis (F-05)
router.post('/submit', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const avis: AvisPayload = req.body;

    if (!avis.session_id || !avis.motifs || avis.motifs.length === 0) {
      return res.status(400).json({ message: 'Données incomplètes' });
    }

    const notes = [
      avis.note_accueil,
      avis.note_temps_attente,
      avis.note_amabilite,
      avis.note_clarte,
      avis.note_proprete,
      avis.note_globale,
    ];

    for (const note of notes) {
      if (note < 1 || note > 5) {
        return res.status(400).json({ message: 'Les notes doivent être entre 1 et 5' });
      }
    }

    const [motifRows] = await connection.query<any[]>(
      `SELECT DISTINCT service_id FROM motifs WHERE id IN (?)`,
      [avis.motifs]
    );

    const serviceIdsDuPayload: number[] = motifRows.map((r) => r.service_id);

    const [doublonRows] = await connection.query<any[]>(
      `SELECT DISTINCT m.service_id
       FROM avis a
       JOIN avis_motifs am ON am.avis_id = a.id
       JOIN motifs m ON m.id = am.motif_id
       WHERE a.session_id = ?
         AND DATE(a.date_soumission) = CURDATE()
         AND m.service_id IN (?)`,
      [avis.session_id, serviceIdsDuPayload]
    );

    if (doublonRows.length > 0) {
      return res.status(409).json({
        message: "Vous avez déjà soumis un avis pour ce service aujourd'hui.",
        serviceIdsEnConflit: doublonRows.map((r) => r.service_id),
      });
    }

    await connection.beginTransaction();

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
        avis.commentaire || null,
      ]
    );

    const avisId = result.insertId;

    for (const motifId of avis.motifs) {
      await connection.query('INSERT INTO avis_motifs (avis_id, motif_id) VALUES (?, ?)', [
        avisId,
        motifId,
      ]);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Avis soumis avec succès',
      avis_id: avisId,
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