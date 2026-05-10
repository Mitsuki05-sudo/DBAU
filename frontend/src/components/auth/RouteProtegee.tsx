import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface RouteProtegeeProps {
  roles: ('admin' | 'responsable')[];
  children: React.ReactNode;
}

export default function RouteProtegee({ roles, children }: RouteProtegeeProps) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F4F7F5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <span
          className="spinner-border"
          style={{ width: '48px', height: '48px', color: '#1B6B3A', borderWidth: '3px' }}
        />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#5A7262' }}>
          Chargement...
        </span>
      </div>
    );
  }

  if (!utilisateur) return <Navigate to="/login" replace />;
  if (!roles.includes(utilisateur.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
