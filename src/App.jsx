import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './Navbar';
import SongSwiper from './SongSwiper';
import Buscador from './Buscador';
import Onboarding from './Onboarding';
import { AuthProvider, useAuth } from './AuthContext';
import { FeedProvider, useFeed } from './FeedContext';

import { LikesPage, ProfilePage, HistoryPage, PlaylistsPage } from './Pages';
import { LoginPage, RegisterPage } from './AuthPages';
import { AdminDashboard } from './AdminDashboard'; 

// Controlador de vista principal
function AppContent() {
    const { isAuthenticated, userId } = useAuth();
    const { onboardingComplete, isLoading } = useFeed();
    
    // Estado de vibe musical
    const [userVibe, setUserVibe] = useState({ label: "Analizando...", score: 0 });

    // Carga perfil musical
    useEffect(() => {
        if (isAuthenticated && userId && onboardingComplete) {
            fetch(`https://backend-nx0h.onrender.com/${userId}`)
                .then(res => res.json())
                .then(data => setUserVibe({ label: data.vibe, score: data.score }))
                .catch(e => console.error(e));
        }
    }, [isAuthenticated, userId, onboardingComplete]);

    // Bloqueo por falta de sesión
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // Vista de carga
    if (isLoading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                minHeight: '100vh', background: '#e0e5ec', color: '#6a11cb', fontWeight: 'bold'
            }}>
                <div className="neumorphic-card" style={{ padding: '40px' }}>
                    🧬 Sincronizando BeatMatch...
                </div>
            </div>
        );
    }

    // Vista de onboarding
    if (!onboardingComplete) {
        return (
            <div style={{ background: '#e0e5ec', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <Routes>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="*" element={<Navigate to="/onboarding" replace />} />
                </Routes>
            </div>
        );
    }

    // Layout principal 3 columnas
    return (
        <div className="main-layout">
            <Navbar />

            <main className="central-content">
                <Routes>
                    <Route path="/feed" element={<SongSwiper />} />
                    <Route path="/search" element={<Buscador />} />
                    <Route path="/historial" element={<HistoryPage />} />
                    <Route path="/playlists" element={<PlaylistsPage />} />
                    <Route path="/likes" element={<LikesPage />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/feed" replace />} />
                </Routes>
            </main>

            <aside className="aside-info-panel">
                <div className="neumorphic-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginTop: 0, color: '#6a11cb', fontSize: '1.2rem' }}>ADN Musical</h3>
                    <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.5' }}>
                        Basado en tus últimos descubrimientos, tu vibe actual es <b>{userVibe.score}% {userVibe.label}</b>.
                    </p>
                    <div style={{ 
                        height: '8px', background: '#d1d9e6', borderRadius: '10px', marginTop: '15px',
                        overflow: 'hidden', boxShadow: 'inset 2px 2px 5px #bebebe'
                    }}>
                        <div style={{ 
                            width: `${userVibe.score}%`, 
                            height: '100%', 
                            background: '#6a11cb',
                            transition: 'width 1s ease' 
                        }} />
                    </div>
                </div>

                <div className="neumorphic-card" style={{ padding: '20px', fontSize: '0.85rem', color: '#777' }}>
                    <p style={{ margin: 0 }}>🎵 <b>Tip:</b> Usa el buscador o importa playlists desde Spotify para agregar canciones y mejorar la precisión del algoritmo.</p>
                </div>
            </aside>
        </div>
    );
}

// Inyección de dependencias
export default function App() {
  return (
    <AuthProvider>
      <FeedProvider>
        <AppContent />
      </FeedProvider>
    </AuthProvider>
  );
}