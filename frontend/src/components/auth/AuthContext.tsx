import { createContext, useContext, useEffect, useState } from 'react';

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: 'admin' | 'responsable';
  service_id?: number;
  service_nom?: string;
}

interface AuthContextType {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  deconnecter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const verifierSession = async () => {
      try {
        const reponse = await fetch('http://localhost:3000/api/auth/session', {
          credentials: 'include',
        });
        if (reponse.ok) {
          const donnees = await reponse.json();
          setUtilisateur(donnees.user);
        } else {
          setUtilisateur(null);
        }
      } catch {
        setUtilisateur(null);
      } finally {
        setChargement(false);
      }
    };
    verifierSession();
  }, []);

  const connecter = async (email: string, motDePasse: string) => {
    const reponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, mot_de_passe: motDePasse }),
    });
    if (reponse.status === 401) {
      throw new Error('Email ou mot de passe incorrect');
    }
    if (!reponse.ok) {
      throw new Error('Erreur de connexion au serveur');
    }
    const donnees = await reponse.json();
    const sessionReponse = await fetch('http://localhost:3000/api/auth/session', {
      credentials: 'include',
    });
    if (sessionReponse.ok) {
      const sessionDonnees = await sessionReponse.json();
      setUtilisateur(sessionDonnees.user);
    } else {
      setUtilisateur({
        id: 0,
        nom: donnees.nom,
        email,
        role: donnees.role === 'responsable' ? 'responsable' : 'admin',
        service_nom: donnees.service,
      });
    }
  };

  const deconnecter = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
    } finally {
      setUtilisateur(null);
    }
  };

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const contexte = useContext(AuthContext);
  if (contexte === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return contexte;
}

export { AuthContext };
