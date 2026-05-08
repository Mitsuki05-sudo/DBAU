import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/connection';

const router = Router();

// Page de connexion unifiée
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Chercher d'abord dans la table admins
    const [admins] = await pool.query<any[]>(
      'SELECT id, email, mot_de_passe, nom FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length > 0) {
      const admin = admins[0];
      const match = await bcrypt.compare(mot_de_passe, admin.mot_de_passe);
      
      if (match) {
        req.session.user = {
          id: admin.id,
          email: admin.email,
          nom: admin.nom,
          role: 'admin'
        };
        return res.json({ 
          success: true, 
          role: 'admin',
          nom: admin.nom,
          redirectTo: '/admin/dashboard'
        });
      }
    }

    // Chercher dans la table responsables
    const [responsables] = await pool.query<any[]>(
      'SELECT r.id, r.email, r.mot_de_passe, r.nom, r.service_id, s.code as service_code, s.nom as service_nom FROM responsables r JOIN services s ON r.service_id = s.id WHERE r.email = ?',
      [email]
    );

    if (responsables.length > 0) {
      const responsable = responsables[0];
      const match = await bcrypt.compare(mot_de_passe, responsable.mot_de_passe);
      
      if (match) {
        req.session.user = {
          id: responsable.id,
          email: responsable.email,
          nom: responsable.nom,
          role: 'responsable',
          service_id: responsable.service_id
        };
        return res.json({ 
          success: true, 
          role: 'responsable',
          nom: responsable.nom,
          service: responsable.service_nom,
          service_code: responsable.service_code,
          redirectTo: '/manager/dashboard'
        });
      }
    }

    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

  } catch (error) {
    console.error('Erreur login:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Vérifier la session
router.get('/session', (req: Request, res: Response) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ message: 'Non authentifié' });
});

// Déconnexion
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

export default router;