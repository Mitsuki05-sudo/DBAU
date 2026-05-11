import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { isAdmin } from '../middleware/auth';

const router = Router();

// Toutes les routes admin nécessitent d'être admin
router.use(isAdmin);

// KPIs globaux (F-07)
router.get('/kpis', async (req: Request, res: Response) => {
  try {
    const { date_debut, date_fin, service_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (date_debut) {
      whereClause += ' AND DATE(a.date_soumission) >= ?';
      params.push(date_debut);
    }
    if (date_fin) {
      whereClause += ' AND DATE(a.date_soumission) <= ?';
      params.push(date_fin);
    }
    if (service_id) {
      whereClause += ' AND am.motif_id IN (SELECT id FROM motifs WHERE service_id = ?)';
      params.push(service_id);
    }

    const filterJoin = service_id 
      ? 'JOIN avis_motifs am ON a.id = am.avis_id' 
      : '';

    const [kpis] = await pool.query<any[]>(
      `SELECT 
        COUNT(DISTINCT a.id) as total_avis,
        ROUND(AVG(a.note_globale), 2) as note_moyenne,
        ROUND(AVG(a.note_accueil), 2) as moyenne_accueil,
        ROUND(AVG(a.note_temps_attente), 2) as moyenne_temps_attente,
        ROUND(AVG(a.note_amabilite), 2) as moyenne_amabilite,
        ROUND(AVG(a.note_clarte), 2) as moyenne_clarte,
        ROUND(AVG(a.note_proprete), 2) as moyenne_proprete,
        SUM(CASE WHEN a.note_globale >= 4 THEN 1 ELSE 0 END) as avis_satisfaits,
        SUM(CASE WHEN a.note_globale <= 2 THEN 1 ELSE 0 END) as avis_negatifs,
        SUM(CASE WHEN a.note_globale <= 2 AND a.traite = 0 THEN 1 ELSE 0 END) as avis_negatifs_non_traites
      FROM avis a ${filterJoin} ${whereClause}`,
      params
    );

    const total = kpis[0].total_avis || 0;
    const taux_satisfaction = total > 0 
      ? Math.round((kpis[0].avis_satisfaits / total) * 100) 
      : 0;

    return res.json({
      ...kpis[0],
      taux_satisfaction
    });
  } catch (error) {
    console.error('Erreur KPIs:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Analyse par service (F-09)
router.get('/analyse-services', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        s.id, s.code, s.nom,
        COUNT(DISTINCT a.id) as nombre_avis,
        ROUND(AVG(a.note_globale), 2) as note_moyenne,
        ROUND(AVG(a.note_accueil), 2) as moyenne_accueil,
        ROUND(AVG(a.note_temps_attente), 2) as moyenne_temps_attente,
        ROUND(AVG(a.note_amabilite), 2) as moyenne_amabilite,
        ROUND(AVG(a.note_clarte), 2) as moyenne_clarte,
        ROUND(AVG(a.note_proprete), 2) as moyenne_proprete
      FROM services s
      LEFT JOIN motifs m ON s.id = m.service_id
      LEFT JOIN avis_motifs am ON m.id = am.motif_id
      LEFT JOIN avis a ON am.avis_id = a.id
      GROUP BY s.id, s.code, s.nom
      ORDER BY s.code`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erreur analyse services:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Analyse par motif (F-10)
router.get('/analyse-motifs', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        m.id, m.libelle, s.code as service_code,
        COUNT(a.id) as nombre_avis,
        ROUND(AVG(a.note_globale), 2) as note_moyenne
      FROM motifs m
      JOIN services s ON m.service_id = s.id
      LEFT JOIN avis_motifs am ON m.id = am.motif_id
      LEFT JOIN avis a ON am.avis_id = a.id
      GROUP BY m.id, m.libelle, s.code
      ORDER BY note_moyenne ASC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erreur analyse motifs:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Derniers commentaires (F-11)
router.get('/commentaires', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const [rows] = await pool.query(
      `SELECT a.id, a.date_soumission, a.note_globale, a.commentaire, a.traite,
        GROUP_CONCAT(DISTINCT m.libelle SEPARATOR ', ') as motifs,
        GROUP_CONCAT(DISTINCT s.code SEPARATOR ', ') as services,
        GROUP_CONCAT(DISTINCT s.nom SEPARATOR ', ') as services_nom
      FROM avis a
      LEFT JOIN avis_motifs am ON a.id = am.avis_id
      LEFT JOIN motifs m ON am.motif_id = m.id
      LEFT JOIN services s ON m.service_id = s.id
      GROUP BY a.id
      ORDER BY a.date_soumission DESC
      LIMIT ?`,
      [limit]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erreur commentaires:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Liste des avis négatifs (F-12)
router.get('/avis-negatifs', async (req: Request, res: Response) => {
  try {
    const { non_traites } = req.query;
    let whereClause = 'WHERE a.note_globale <= 2';
    
    if (non_traites === 'true') {
      whereClause += ' AND a.traite = 0';
    }

    const [rows] = await pool.query(
      `SELECT a.*, 
        GROUP_CONCAT(DISTINCT m.libelle SEPARATOR ', ') as motifs,
        GROUP_CONCAT(DISTINCT s.code SEPARATOR ', ') as services,
        GROUP_CONCAT(DISTINCT s.nom SEPARATOR ', ') as services_nom
      FROM avis a
      LEFT JOIN avis_motifs am ON a.id = am.avis_id
      LEFT JOIN motifs m ON am.motif_id = m.id
      LEFT JOIN services s ON m.service_id = s.id
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.date_soumission DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erreur avis négatifs:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Marquer un avis comme traité (F-12)
router.put('/marquer-traite/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE avis SET traite = 1 WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Avis marqué comme traité' });
  } catch (error) {
    console.error('Erreur marquage traité:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Exporter les avis (pour PDF) (F-13)
router.get('/export-avis', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, GROUP_CONCAT(m.libelle SEPARATOR ', ') as motifs,
        GROUP_CONCAT(DISTINCT s.code SEPARATOR ', ') as services
      FROM avis a
      LEFT JOIN avis_motifs am ON a.id = am.avis_id
      LEFT JOIN motifs m ON am.motif_id = m.id
      LEFT JOIN services s ON m.service_id = s.id
      GROUP BY a.id
      ORDER BY a.date_soumission DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erreur export:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;