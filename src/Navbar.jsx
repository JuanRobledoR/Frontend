import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Importamos los íconos necesarios (incluyendo Clock para historial y Disc para playlists)
import { FiHome, FiHeart, FiSearch, FiUser, FiClock, FiDisc } from 'react-icons/fi'; 
import './index.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Feed', icon: FiHome, path: '/feed' },
    { name: 'Historial', icon: FiClock, path: '/historial' }, // ¡Recuperado!
    { name: 'Likes', icon: FiHeart, path: '/likes' },
    { name: 'Playlists', icon: FiDisc, path: '/playlists' },  // ¡Recuperado!
    { name: 'Perfil', icon: FiUser, path: '/perfil' },
  ];

  return (
    <nav className="navbar-container" style={{maxWidth: '500px'}}> {/* Un poco más ancho para que quepan 5 */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.name} to={item.path} className={`navbar-item ${isActive ? 'active' : ''}`}>
            <Icon size={24} />
          </Link>
        );
      })}
    </nav>
  );
};
export default Navbar;