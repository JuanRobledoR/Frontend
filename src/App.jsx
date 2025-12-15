import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import SongSwiper from './SongSwiper';
import Buscador from './Buscador';
import { AuthProvider, useAuth } from './AuthContext';
import { FeedProvider } from './FeedContext';
import { LikesPage, ProfilePage, HistoryPage, PlaylistsPage } from './Pages';

// Componente para proteger rutas (Si no estás logueado, te manda a login)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, login } = useAuth();
    
    // COMO NO TIENES PÁGINA DE LOGIN AÚN:
    // Si no está autenticado, forzamos login automático (Simulación)
    if (!isAuthenticated) {
        return (
            <div style={{height:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <h2>Bienvenido a BeatMatch</h2>
                <button className="btn-primary" onClick={() => login("testUser", "123")}>
                    Entrar como Test User
                </button>
            </div>
        );
    }
    return children;
};

function AppContent() {
    const { isAuthenticated } = useAuth();
    return (
        <div className="app-layout">
             <Routes>
                <Route path="/feed" element={
                    <ProtectedRoute>
                        <SongSwiper />
                    </ProtectedRoute>
                } />
                <Route path="/buscador" element={<ProtectedRoute><Buscador /></ProtectedRoute>} />
                
                {/* --- RUTAS RECUPERADAS --- */}
                <Route path="/historial" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
                {/* ------------------------- */}

                <Route path="/likes" element={<ProtectedRoute><LikesPage /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/feed" replace />} />
             </Routes>
             
             {/* Mostrar Navbar solo si está logueado */}
             {isAuthenticated && <Navbar />}
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