import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Buscador from './Buscador';
import SongSwiper from './SongSwiper';
import { LikesPage, PlaylistsPage, HistoryPage, ProfilePage } from './Pages';
import { FeedProvider } from './FeedContext'; // <--- 1. IMPORTARLO

function App() {
  return (
    // 2. ENVOLVER TODO (Si te falta esta línea, el Feed se muere)
    <FeedProvider> 
      <BrowserRouter>
        <div className="app-container" style={{paddingBottom: '80px', background: 'black', minHeight: '100vh'}}>
            <Routes>
              <Route path="/buscador" element={<Buscador />} />
              <Route path="/feed" element={<SongSwiper />} />
              <Route path="/likes" element={<LikesPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/historial" element={<HistoryPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/" element={<Navigate to="/feed" replace />} />
            </Routes>
        </div>
        <Navbar />
      </BrowserRouter>
    </FeedProvider>
  );
}

export default App;