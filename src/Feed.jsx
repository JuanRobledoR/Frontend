import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css'; 

// Tarjeta música
function MusicCard({ cancion }) {
  const [jugando, setJugando] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (jugando) {
        audioRef.current.pause();
      } else {
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

// Lógica feed
function Feed() {
  const [feed, setFeed] = useState([]);
  const [cargando, setCargando] = useState(false);
  const PLAYLIST_ID = "0eDv7SF2SNwIHGpc2vJWzt"; 
  const scrollContainerRef = useRef(null);

  // Carga lote
  const cargarLoteInfinito = useCallback(async () => {
    if (cargando) return;
    setCargando(true);
    console.log("🔄 Cargando lote infinito...");

    try {
        const seenIds = feed.map(t => t.id);

        const response = await fetch('https://backend-nx0h.onrender.com/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlist_id: PLAYLIST_ID,
                limit: 10, 
                seen_ids: seenIds
            })
        });

        if (!response.ok) throw new Error("Error en backend");

        const nuevasCanciones = await response.json();
        
        if (nuevasCanciones.length > 0) {
            console.log(`✅ Recibidas ${nuevasCanciones.length} canciones nuevas.`);
            setFeed(prev => [...prev, ...nuevasCanciones]);
        } 

    } catch (error) {
        console.error("❌ Error cargando feed:", error);
    } finally {
        setCargando(false);
    }
  }, [feed, cargando]); 

  // Carga inicial
  useEffect(() => {
    if (feed.length === 0) {
        cargarLoteInfinito();
    }
  }, []); 

  // Control scroll
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
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
            scrollSnapType: 'y mandatory' 
        }}
        ref={scrollContainerRef}
    >
      {feed.length === 0 && !cargando && (
          <div style={{color:'white', marginTop:'50px'}}>No hay canciones. Intenta recargar.</div>
      )}

      {feed.map((cancion, index) => (
         <div key={`${cancion.id}-${index}`} style={{ scrollSnapAlign: 'start' }}>
            <MusicCard cancion={cancion} />
         </div>
      ))}

      {cargando && (
        <div style={{ padding: '20px', color: '#00ff88', textAlign: 'center' }}>
           🧬 Buscando nuevas frecuencias...
        </div>
      )}
      
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