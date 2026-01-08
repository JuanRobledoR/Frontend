import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiHeart, FiSearch, FiUser, FiClock, FiDisc, FiMusic } from 'react-icons/fi'; 
import './index.css';

/* Barra de navegación lateral */
const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Para ti', icon: FiHome, path: '/feed' },
    { name: 'Explorar', icon: FiSearch, path: '/search' },
    { name: 'Historial', icon: FiClock, path: '/historial' },
    { name: 'Me gusta', icon: FiHeart, path: '/likes' },
    { name: 'Playlists', icon: FiDisc, path: '/playlists' },
    { name: 'Perfil', icon: FiUser, path: '/perfil' },
  ];

  return (
    <nav className="sidebar-container">
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
        <div style={{ 
          width: '45px', height: '45px', borderRadius: '12px', background: '#e0e5ec',
          boxShadow: '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FiMusic size={24} color="#6a11cb" />
        </div>
        <span className="nav-text" style={{ fontWeight: '900', fontSize: '1.4rem', color: '#222' }}>BeatMatch</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-item-sidebar ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
              <span className="nav-text" style={{ marginLeft: '15px', fontWeight: '600' }}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
export default Navbar;