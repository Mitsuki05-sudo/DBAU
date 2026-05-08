import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { isResponsable } from '../middleware/auth';

const router = Router();

router.use(isResponsable);

// KPIs du service du responsable (F-17)
router.get('/kpis', async (req: Request, res: Response) => {
  try {
    const serviceId = req.session.user?.service_id;

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
        SUM(CASE WHEN a.note_globale <= 2 THEN 1 ELSE 0 END) as avis_negatifs
      FROM avis a
      JOIN avis_motifs am ON a.id = am.avis_id
      JOIN motifs m ON am.motif_id = m.id
      WHERE m.service_id = ?`,
      [serviceId]
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
    console.error('Erreur KPIs responsable:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Commentaires du service
router.get('/commentaires', async (req: Request, res: Response) => {
  try {
    const serviceId = req.session.user?.service_id;
    const [rows] = await pool.query(
      `SELECT a.id, a.date_soumission, a.note_globale, a.commentaire
      FROM avis a
      JOIN avis_motifs am ON a.id = am.avis_id
      JOIN motifs m ON am.motif_id = m.id
      WHERE m.service_id = ? AND a.commentaire IS NOT NULL AND a.commentaire != ''
      GROUP BY a.id
      ORDER BY a.date_soumission DESC
      LIMIT 20`,
      [serviceId]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erreur commentaires responsable:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;