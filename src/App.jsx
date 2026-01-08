import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes Base
import Navbar from './Navbar';
import SongSwiper from './SongSwiper';
import Buscador from './Buscador';
import Onboarding from './Onboarding';
import { AuthProvider, useAuth } from './AuthContext';
import { FeedProvider, useFeed } from './FeedContext';

// Páginas (Asegúrate de que Pages.jsx tenga todos los exports abajo)
import { LikesPage, ProfilePage, HistoryPage, PlaylistsPage } from './Pages';
import { LoginPage, RegisterPage } from './AuthPages';
import { AdminDashboard } from './AdminDashboard'; 

function AppContent() {
    const { isAuthenticated } = useAuth();
    const { onboardingComplete, isLoading } = useFeed();

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    if (isLoading) return <div style={{textAlign:'center', marginTop:'50px', color: '#222'}}>🧬 Sincronizando BeatMatch...</div>;

    return (
        <div className="app-layout">
             <Routes>
                <Route path="/" element={!onboardingComplete ? <Navigate to="/onboarding" /> : <Navigate to="/feed" />} />
                {!onboardingComplete ? (
                    <>
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="*" element={<Navigate to="/onboarding" replace />} />
                    </>
                ) : (
                    <>
                        <Route path="/feed" element={<SongSwiper />} />
                        <Route path="/buscador" element={<Buscador />} />
                        <Route path="/historial" element={<HistoryPage />} />
                        <Route path="/playlists" element={<PlaylistsPage />} />
                        <Route path="/likes" element={<LikesPage />} />
                        <Route path="/perfil" element={<ProfilePage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="*" element={<Navigate to="/feed" replace />} />
                    </>
                )}
             </Routes>
             {onboardingComplete && <Navbar />}
        </div>
    );
}

export default function App() {
  return (
    <AuthProvider>
      <FeedProvider>
        <AppContent />
      </FeedProvider>
    </AuthProvider>
  );
}