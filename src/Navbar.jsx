import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './App.css'; 

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <nav className="bottom-navbar">
      <Link to="/feed" className={isActive('/feed')}>
        <span className="icon">🔥</span>
      </Link>
      
      <Link to="/historial" className={isActive('/historial')}>
        <span className="icon">📜</span>
      </Link>

      <Link to="/likes" className={isActive('/likes')}>
        <span className="icon">💜</span>
      </Link>

      <Link to="/playlists" className={isActive('/playlists')}>
        <span className="icon">💿</span>
      </Link>

      <Link to="/perfil" className={isActive('/perfil')}>
        <span className="icon">👤</span>
      </Link>
    </nav>
  );
};

export default Navbar;