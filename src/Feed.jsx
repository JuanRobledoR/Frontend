import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css'; // Asegúrate de tener estilos para .feed-scroll-container

// --- MusicCard (Sin cambios, solo props) ---
function MusicCard({ cancion }) {
  const [jugando, setJugando] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (jugando) {
        audioRef.current.pause();
      } else {
        // Pausar otros audios si quisieras implementar exclusividad
        audioRef.current.play();
      }
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
        
        <div className="player-ui">
            {cancion.preview ? (
                <button onClick={togglePlay} className="play-btn" style={{fontSize: '2rem', background: 'none', border:'none', color:'white', cursor:'pointer'}}>
                    {jugando ? "⏸" : "▶"}
                </button>
            ) : <span style={{fontSize:'0.7em', color:'red'}}>⚠️ Sin preview</span>}
        </div>
        
        <div className="action-buttons">
          <button className="btn-circle">❌</button>
          <button className="btn-circle">💜</button>
        </div>
      </div>
      {cancion.preview && <audio ref={audioRef} src={cancion.preview} loop />}
    </div>
  );
}

// --- LOGICA DEL FEED INFINITO ---
function Feed() {
  const [feed, setFeed] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // Tu playlist semilla
  const PLAYLIST_ID = "0M0kDGL860f0n8PZ2usv6B"; 
  //0M0kDGL860f0n8PZ2usv6B
  //6GjULfC3dnq103KCta8plp

  // Referencia al contenedor para detectar scroll
  const scrollContainerRef = useRef(null);

  // --- FUNCIÓN DE CARGA INTELIGENTE (POST) ---
  const cargarLoteInfinito = useCallback(async () => {
    if (cargando) return;
    setCargando(true);
    console.log("🔄 Cargando lote infinito...");

    try {
        // 1. Recopilamos IDs vistos para enviarlos a la lista negra
        const seenIds = feed.map(t => t.id);

        // 2. Petición POST con el payload
        const response = await fetch('http://localhost:8000/feed-playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlist_id: PLAYLIST_ID,
                limit: 10, // Pedimos lotes de 10 para que cargue rápido
                seen_ids: seenIds
            })
        });

        if (!response.ok) throw new Error("Error en backend");

        const nuevasCanciones = await response.json();
        
        if (nuevasCanciones.length > 0) {
            console.log(`✅ Recibidas ${nuevasCanciones.length} canciones nuevas.`);
            // Añadimos al final (append)
            setFeed(prev => [...prev, ...nuevasCanciones]);
        } else {
            console.log("⚠️ Backend no devolvió canciones (posiblemente filtro estricto).");
        }

    } catch (error) {
        console.error("❌ Error cargando feed:", error);
    } finally {
        setCargando(false);
    }
  }, [feed, cargando]); // Dependencias del useCallback

  // 1. Carga Inicial (Mount)
  useEffect(() => {
    // Solo cargamos si está vacío al inicio
    if (feed.length === 0) {
        cargarLoteInfinito();
    }
  }, []); // Array vacío = solo al montar

  // 2. Handler de Scroll
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    
    // Si estamos cerca del final (a 100px) y no estamos cargando
    if (scrollHeight - scrollTop <= clientHeight + 300 && !cargando) {
        cargarLoteInfinito();
    }
  };

  return (
    <div 
        className="feed-container" 
        onScroll={handleScroll}
        style={{ 
            height: '100vh', 
            overflowY: 'auto', 
            scrollSnapType: 'y mandatory' // Efecto "Tiktok" opcional
        }}
        ref={scrollContainerRef}
    >
      {feed.length === 0 && !cargando && (
          <div style={{color:'white', marginTop:'50px'}}>No hay canciones. Intenta recargar.</div>
      )}

      {feed.map((cancion, index) => (
         // scrollSnapAlign ayuda a centrar las cartas si usas scrollSnapType
         <div key={`${cancion.id}-${index}`} style={{ scrollSnapAlign: 'start' }}>
            <MusicCard cancion={cancion} />
         </div>
      ))}

      {cargando && (
        <div style={{ padding: '20px', color: '#00ff88', textAlign: 'center' }}>
           🧬 Buscando nuevas frecuencias...
        </div>
      )}
      
      {/* Botón flotante de Debug por si el scroll falla */}
      <button 
        onClick={cargarLoteInfinito}
        style={{
            position:'fixed', bottom: 20, right: 20, zIndex: 999,
            padding: '10px 20px', borderRadius: '50px', border: 'none',
            background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)',
            cursor: 'pointer'
        }}
      >
        {cargando ? "..." : "+ Cargar"}
      </button>
    </div>
  );
}

export default Feed;