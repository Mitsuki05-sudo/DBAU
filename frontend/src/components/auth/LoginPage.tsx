import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { utilisateur, chargement, connecter } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [chargementConnexion, setChargementConnexion] = useState(false);
  const [erreur, setErreur] = useState('');
  const [emailTouche, setEmailTouche] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!chargement && utilisateur) {
      if (utilisateur.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/manager', { replace: true });
      }
    }
  }, [utilisateur, chargement, navigate]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setChargementConnexion(true);
    try {
      await connecter(email, motDePasse);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setChargementConnexion(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F4F7F5',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
      }}
    >
      {/* En-tête centré */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/1/13/Coat_of_arms_of_Benin.svg"
          alt="Armoiries du Bénin"
          style={{ height: '72px', marginBottom: '10px' }}
        />
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#1B6B3A',
          }}
        >
          DBAU
        </div>
        <div style={{ display: 'flex', width: '120px', height: '3px', margin: '6px auto' }}>
          <div style={{ flex: 1, background: '#4ADE80' }} />
          <div style={{ flex: 1, background: '#FCD34D' }} />
          <div style={{ flex: 1, background: '#F87171' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: '#5A7262',
            marginBottom: '4px',
          }}
        >
          Direction des Bourses et Aides Universitaires
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: '#5A7262',
          }}
        >
          Ministère de l'Enseignement Supérieur et de la Recherche Scientifique
        </div>
      </div>

      {/* Carte */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          boxShadow: '0 2px 16px rgba(27,107,58,0.08)',
          padding: '36px 32px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Icône + titre */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <i
            className="bi bi-shield-lock-fill"
            style={{ fontSize: '28px', color: '#1B6B3A', display: 'block' }}
          />
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#1A2E1F',
              marginTop: '8px',
            }}
          >
            Espace sécurisé
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              color: '#5A7262',
              marginTop: '4px',
            }}
          >
            Réservé aux agents de la DBAU
          </div>
        </div>

        <form onSubmit={soumettre} noValidate>
          {/* Champ email */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#1A2E1F',
                marginBottom: '6px',
              }}
            >
              <i className="bi bi-envelope" style={{ color: '#1B6B3A' }} />
              Adresse email
            </label>
            <input
              ref={emailRef}
              type="email"
              className={`form-control${erreur && emailTouche ? ' is-invalid' : ''}`}
              placeholder="votre.email@dbau.bj"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouche(true)}
              required
              style={{ fontFamily: "'Inter', sans-serif", borderColor: '#D1E5D8' }}
            />
          </div>

          {/* Champ mot de passe */}
          <div style={{ marginBottom: erreur ? '16px' : '24px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#1A2E1F',
                marginBottom: '6px',
              }}
            >
              <i className="bi bi-lock" style={{ color: '#1B6B3A' }} />
              Mot de passe
            </label>
            <div className="input-group">
              <input
                type={afficherMotDePasse ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                style={{
                  fontFamily: "'Inter', sans-serif",
                  borderColor: '#D1E5D8',
                  borderRight: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setAfficherMotDePasse((v) => !v)}
                style={{
                  background: 'transparent',
                  border: '1px solid #D1E5D8',
                  borderLeft: 'none',
                  color: '#5A7262',
                  padding: '0 12px',
                  cursor: 'pointer',
                  borderRadius: '0 6px 6px 0',
                }}
              >
                <i className={afficherMotDePasse ? 'bi bi-eye-slash' : 'bi bi-eye'} />
              </button>
            </div>
          </div>

          {/* Bloc erreur */}
          {erreur && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#B91C1C',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
              role="alert"
            >
              <i className="bi bi-exclamation-circle" style={{ flexShrink: 0 }} />
              {erreur}
            </div>
          )}

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={chargementConnexion}
            style={{
              width: '100%',
              padding: '13px',
              background: '#1B6B3A',
              color: '#FFFFFF',
              borderRadius: '10px',
              border: 'none',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              fontWeight: 700,
              cursor: chargementConnexion ? 'not-allowed' : 'pointer',
              opacity: chargementConnexion ? 0.75 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background 0.2s ease',
              marginBottom: '20px',
            }}
            onMouseEnter={(e) => {
              if (!chargementConnexion)
                (e.currentTarget as HTMLButtonElement).style.background = '#145230';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1B6B3A';
            }}
          >
            {chargementConnexion ? (
              <>
                <span className="spinner-border spinner-border-sm text-white" />
                Connexion...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" />
                Se connecter
              </>
            )}
          </button>

          {/* Pied de carte */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              color: '#5A7262',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <i className="bi bi-lock-fill" style={{ fontSize: '11px' }} />
            <span>
              Accès restreint — Visiteurs, rendez-vous sur la{' '}
              <Link to="/" style={{ color: '#1B6B3A', textDecoration: 'none', fontWeight: 500 }}>
                page d'accueil
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
