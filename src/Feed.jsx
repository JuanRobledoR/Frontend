import { useState, useEffect, useRef } from 'react';
import './App.css'; 

// --- Tu componente MusicCard (Igualito, no cambia nada) ---
function MusicCard({ cancion }) {
  const [jugando, setJugando] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (jugando) audioRef.current.pause();
      else audioRef.current.play();
      setJugando(!jugando);
    }
  };

  return (
    <div className="music-card">
      <img src={cancion.imagen} alt="cover" className="card-bg" />
      <div className="overlay"></div>
      <div className="controls-container">
        <h2>{cancion.titulo}</h2>
        <p>{cancion.artista}</p>
        
        {!cancion.preview && <span style={{fontSize:'0.7em', color:'red'}}>⚠️ Sin preview disponible</span>}
        
        <div className="player-ui">
            {cancion.preview && (
                <button onClick={togglePlay} className="play-btn" style={{fontSize: '2rem', background: 'none', border:'none', color:'white', cursor:'pointer'}}>
                    {jugando ? "⏸" : "▶"}
                </button>
            )}
        </div>
        
        <div className="action-buttons">
          <button className="btn-circle">❌</button>
          <button className="btn-circle">💜</button>
          <button className="btn-circle">➕</button>
        </div>
      </div>
      {cancion.preview && <audio ref={audioRef} src={cancion.preview} loop />}
    </div>
  );
}

// --- LOGICA DEL FEED INFINITO ACTUALIZADA ---
function Feed() {
  const [feed, setFeed] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // ID de la playlist (Esto viene de tu variable)
  const PLAYLIST_ID = "0M0kDGL860f0n8PZ2usv6B"; 
    //0M0kDGL860f0n8PZ2usv6B
    //6GjULfC3dnq103KCta8plp

  // Función para cargar canciones
  // NOTA: Ya no necesitamos pasarle 'offset' porque el backend ahora es RANDOM
  const cargarMasCanciones = async () => {
    if (cargando) return; // Si ya está cargando, no molestamos
    
    setCargando(true);
    console.log("Peticion del pack de canciondes...");

    try {
      // Solo pedimos el limit. El backend se encarga de dar randoms.
      const response = await fetch(`http://localhost:8000/feed-playlist/${PLAYLIST_ID}?limit=10`);
      const nuevasCanciones = await response.json();

      if (nuevasCanciones.length > 0) {
        // ACUMULAMOS: Las viejas + las nuevas
        setFeed(prevFeed => [...prevFeed, ...nuevasCanciones]);
      }
    } catch (error) {
      console.error("Error cargando feed:", error);
    } finally {
      setCargando(false);
    }
  };

  // 1. Carga inicial (Arranca la app y pide las primeras 10)
  useEffect(() => {
    cargarMasCanciones();
  }, []);

  // 2. Detector de Scroll (El "Vigilante")
  const handleScroll = (e) => {
    const contenedor = e.target;
    
    // Altura de una tarjeta (lo que mide la pantalla visible)
    const alturaVisible = contenedor.clientHeight;
    // Cuánto scroll ha bajado el usuario
    const scrollBajado = contenedor.scrollTop;
    
    // Calculamos en qué índice de canción va el usuario (0, 1, 5, 20...)
    const indiceActual = Math.round(scrollBajado / alturaVisible);

    // LOGICA MATEMÁTICA:
    // Total de canciones (ej: 20) - Donde voy (ej: 15) = Quedan 5
    const cancionesRestantes = feed.length - indiceActual;

    // Si quedan 5 o menos, y no estoy cargando ya... ¡PIDE MÁS!
    if (!cargando && cancionesRestantes <= 5) {
      console.log(`Quedan ${cancionesRestantes} canciones. Recargando...`);
      cargarMasCanciones(); 
    }
  };

  return (
    <div className="feed-container" onScroll={handleScroll}>
      {feed.length > 0 ? (
        feed.map((cancion, index) => (
          // IMPORTANTE: key combinada. 
          // Como es random, podría salir repetida raramente, así que usamos el index para asegurar que React no se queje.
          <MusicCard key={`${cancion.id}-${index}`} cancion={cancion} />
        ))
      ) : (
        // Pantalla de carga inicial
        <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection:'column'}}>
            <h2 style={{color: 'white'}}>Generando Feed Aleatorio... 🧬</h2>
            <p style={{color: '#aaa'}}>Conectando con Spotify y Deezer</p>
        </div>
      )}
      
      {/* Indicador discreto de que estamos trayendo más en segundo plano */}
      {cargando && feed.length > 0 && (
          <div style={{
              position:'fixed', 
              bottom: 20, 
              right: 20, 
              color:'black', 
              background:'#00ff88', 
              padding:'8px 15px',
              borderRadius: '20px',
              fontWeight: 'bold',
              boxShadow: '0 0 10px #00ff88'
          }}>
              ↻ Cargando más...
          </div>
      )}
    </div>
  );
}

export default Feed;