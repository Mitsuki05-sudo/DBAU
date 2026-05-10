import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, LogOut as LogoutIcon, QrCode } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuth } from '../auth/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { menuOuvert, fermerMenu } = useUIStore();
  const { utilisateur, deconnecter } = useAuth();

  const gererDeconnexion = async () => {
    await deconnecter();
  };

  return (
    <>
      {/* Overlay pour mobile */}
      <div
        className={`sidebar-overlay ${menuOuvert ? 'show' : ''}`}
        onClick={fermerMenu}
      ></div>

      <div className={`sidebar ${menuOuvert ? 'open' : ''}`}>

        <div className="sidebar-logo">
          <div style={{ width: 40, height: 40, backgroundColor: '#FFB547', borderRadius: '50%' }}></div>
          <div>
            <div className="logo-title">SGEC - DBAU</div>
            <div className="logo-subtitle">Système de Gestion des Expériences Clients</div>
          </div>
        </div>

        {/* SECTION 1 : Tableau de bord */}
        <div className="menu-section">
          <div className="menu-title">Tableau de bord</div>
          <NavLink
            to={utilisateur?.role === 'admin' ? '/admin' : '/manager'}
            end
            onClick={fermerMenu}
            className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
          >
            <Home size={20} />
            Vue d'ensemble
          </NavLink>
        </div>

        {/* SECTION 2 : Avis */}
        <div className="menu-section" style={{ marginTop: '24px' }}>
          <div className="menu-title">Avis</div>
          <NavLink
            to={utilisateur?.role === 'admin' ? '/admin/avis/negatifs' : '/manager/avis/negatifs'}
            onClick={fermerMenu}
            className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
          >
            <MessageCircle size={20} />
            Avis négatifs
          </NavLink>

          <NavLink
            to={utilisateur?.role === 'admin' ? '/admin/avis/tous' : '/manager/avis/tous'}
            onClick={fermerMenu}
            className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
          >
            <MessageCircle size={20} />
            Tous les avis
          </NavLink>
        </div>

        {/* SECTION 3 : QR Code — admin uniquement */}
        {utilisateur?.role === 'admin' && (
          <div className="menu-section" style={{ marginTop: '24px' }}>
            <div className="menu-title">Outils</div>
            <NavLink
              to="/admin/qrcode"
              onClick={fermerMenu}
              className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
            >
              <QrCode size={20} />
              QR Code
            </NavLink>
          </div>
        )}

        {/* SECTION 4 : Déconnexion */}
        <div className="sidebar-footer">
          <div className="menu-item" onClick={gererDeconnexion} style={{ cursor: 'pointer' }}>
            <LogoutIcon size={20} />
            Déconnexion
          </div>
        </div>

      </div>
    </>
  );
}
