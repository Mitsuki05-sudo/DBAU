// Types pour les utilisateurs
export interface Admin {
  id: number;
  email: string;
  mot_de_passe: string;
  nom: string;
}

export interface Responsable {
  id: number;
  email: string;
  mot_de_passe: string;
  nom: string;
  service_id: number;
}

// Type pour la soumission d'avis
export interface AvisPayload {
  session_id: string;
  note_accueil: number;
  note_temps_attente: number;
  note_amabilite: number;
  note_clarte: number;
  note_proprete: number;
  note_globale: number;
  commentaire?: string;
  motifs: number[];
}

// Type pour les filtres admin
export interface FiltresAdmin {
  date_debut?: string;
  date_fin?: string;
  service_id?: number;
  motif_id?: number;
  note_min?: number;
  note_max?: number;
}

// Session utilisateur
export interface SessionUser {
  id: number;
  email: string;
  nom: string;
  role: 'admin' | 'responsable';
  service_id?: number;
}

// Déclaration pour étendre SessionData
declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}