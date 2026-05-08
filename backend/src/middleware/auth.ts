import { Request, Response, NextFunction } from 'express';

// Vérifie que l'utilisateur est connecté
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  next();
};

// Vérifie que l'utilisateur est admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé à l\'administrateur' });
  }
  next();
};

// Vérifie que l'utilisateur est responsable
export const isResponsable = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user || req.session.user.role !== 'responsable') {
    return res.status(403).json({ message: 'Accès réservé aux responsables de service' });
  }
  next();
};

// Vérifie que l'utilisateur est admin OU responsable
export const isAdminOrResponsable = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  next();
};