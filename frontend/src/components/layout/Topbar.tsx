import { Bell, ChevronDown, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useDateStore } from '../../store/useDateStore';
import { useUIStore } from '../../store/useUIStore';
import './Topbar.css';

export default function Topbar() {
  const { dateDebut, dateFin, setDates } = useDateStore();
  const { toggleMenu } = useUIStore();

  return (
    <div className="topbar">
      
      {/* Bouton Hamburger (Visible uniquement sur mobile) */}
      <button className="menu-btn" onClick={toggleMenu}>
        <Menu size={24} />
      </button>
      
      <div className="topbar-actions">
        
        {/* Sélecteurs de dates */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="date" 
            value={dateDebut} 
            onChange={(e) => setDates(e.target.value, dateFin)} 
            className="date-input"
          />
          <span style={{ color: '#64748B', fontSize: '12px' }}>au</span>
          <input 
            type="date" 
            value={dateFin} 
            onChange={(e) => setDates(dateDebut, e.target.value)} 
            className="date-input"
          />
        </div>
        
        {/* Cloche de notifications */}
        <div className="notification">
          <Bell size={20} color="#64748B" />
          <span className="badge">3</span>
        </div>

        {/* Profil Utilisateur */}
        <NavLink to="/profil" style={{ textDecoration: 'none' }}>
          <div className="user-profile">
            <div 
              style={{
                width: 36, 
                height: 36, 
                backgroundColor: '#0B1437', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold'
              }}
            >
              A
            </div>
            
            <div className="user-text">
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1E293B' }}>Profil</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Mon compte</div>
            </div>
            
            <ChevronDown size={16} color="#64748B" className="user-text" />
          </div>
        </NavLink>

      </div>
    </div>
  );
}