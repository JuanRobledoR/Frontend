import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Buscador from './Buscador'; // Importa tu componente de buscador
import Feed from './Feed';         // Importa el componente del feed

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta para el Buscador */}
        <Route path="/buscador" element={<Buscador />} />

        {/* Ruta para el Feed */}
        <Route path="/feed" element={<Feed />} />

        {/* Opcional: Si entran a la raíz (localhost:5173), redirigir al buscador */}
        <Route path="/" element={<Navigate to="/buscador" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;