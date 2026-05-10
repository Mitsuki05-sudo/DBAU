import { Mail, Shield, Building, KeyRound } from 'lucide-react';
import './Profil.css';

export default function Profil() {
  // Ces données viendront plus tard du Backend (Session Utilisateur)
  const utilisateur = {
    nom: "Admin DBAU",
    email: "admin@dbau.bj",
    role: "Administrateur",
    service: "Direction Centrale" // Si c'était un responsable, ça serait "SAF" ou "SAUA"
  };

  return (
    <div>
      <div className="profil-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles et vos paramètres de sécurité.</p>
      </div>

      <div className="profil-grid">
        
        {/* COLONNE GAUCHE : Informations */}
        <div className="profil-card">
          <h2 className="profil-card-title">Informations Personnelles</h2>
          
          <div className="avatar-lg">
            {utilisateur.nom.charAt(0)} {/* Affiche la première lettre du nom ("A") */}
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E293B' }}>{utilisateur.nom}</h3>
            <span style={{ backgroundColor: '#ECFDF5', color: '#10B981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              En ligne
            </span>
          </div>

          <div className="info-item">
            <Mail color="#94A3B8" size={20} />
            <div className="info-item-text">
              <span className="info-label">Adresse Email</span>
              <span className="info-value">{utilisateur.email}</span>
            </div>
          </div>

          <div className="info-item">
            <Shield color="#94A3B8" size={20} />
            <div className="info-item-text">
              <span className="info-label">Rôle</span>
              <span className="info-value">{utilisateur.role}</span>
            </div>
          </div>

          <div className="info-item">
            <Building color="#94A3B8" size={20} />
            <div className="info-item-text">
              <span className="info-label">Service rattaché</span>
              <span className="info-value">{utilisateur.service}</span>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Sécurité / Mot de passe */}
        <div className="profil-card" style={{ height: 'fit-content' }}>
          <h2 className="profil-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={20} color="#4318FF" /> 
            Changer le mot de passe
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); alert("Fonctionnalité prête pour le backend !"); }}>
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <input type="password" placeholder="Saisissez votre mot de passe actuel" required />
            </div>

            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" placeholder="Minimum 8 caractères" required />
            </div>

            <div className="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input type="password" placeholder="Retapez le nouveau mot de passe" required />
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button type="submit" className="btn-primary">
                Mettre à jour la sécurité
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}