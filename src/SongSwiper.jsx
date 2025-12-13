import React, { useState, useEffect, useCallback, useRef } from 'react';
import SongCard from './SongCard';
import axios from 'axios';

// --- AJUSTA ESTO A TU PUERTO LOCAL ---
const API_URL = "http://localhost:8000"; 
const PLAYLIST_ID_SEMILLA = "37i9dQZF1DXcBWIGoYBM5M"; 

const SongSwiper = () => {
  const [currentBatch, setCurrentBatch] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextBatchBuffer, setNextBatchBuffer] = useState(null);
  const [mergedPlaylist, setMergedPlaylist] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  // REFERENCIA AL AUDIO
  const audioRef = useRef(new Audio()); 

  const fetchBatch = useCallback(async (existingIds) => {
    try {
      // Nota: Asegúrate que tu backend reciba 'playlist_id' y 'seen_ids' correctamente
      const response = await axios.post(`${API_URL}/feed-playlist`, {
        playlist_id: PLAYLIST_ID_SEMILLA,
        limit: 20, 
        seen_ids: existingIds
      });
      return response.data;
    } catch (error) {
      console.error("Error cargando:", error);
      return [];
    }
  }, []);

  // 1. CARGA INICIAL
  useEffect(() => {
    const init = async () => {
      setIsLoadingInitial(true);
      const batch1 = await fetchBatch([]);
      setCurrentBatch(batch1);
      const idsBatch1 = batch1.map(t => t.id);
      setSeenIds(prev => [...prev, ...idsBatch1]);
      setIsLoadingInitial(false);

      // Precargar siguiente
      const batch2 = await fetchBatch(idsBatch1);
      setNextBatchBuffer(batch2);
    };
    init();
  }, [fetchBatch]);

  // 2. CONTROL DE AUDIO (Centralizado)
  useEffect(() => {
    if (currentBatch.length === 0 || !currentBatch[currentIndex]) return;

    const song = currentBatch[currentIndex];
    const player = audioRef.current;

    // Pausar anterior
    player.pause();
    player.currentTime = 0;

    if (song.preview) {
      console.log("🔊 Intentando reproducir:", song.titulo);
      player.src = song.preview;
      player.volume = 0.6;
      
      const playPromise = player.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("⚠️ Autoplay bloqueado. El usuario debe interactuar primero.", error);
          // Esto es normal la primera vez. Al primer click del usuario, se desbloquea.
        });
      }
    }
  }, [currentIndex, currentBatch]); // Se activa al cambiar de índice

  // 3. LÓGICA DE BOTONES (SWIPE)
  const handleDecision = useCallback((decision) => {
    console.log("🖱️ Click detectado:", decision); // DEBUG: Si no ves esto en consola, algo tapa el botón
    
    if (currentBatch.length === 0) return;
    const song = currentBatch[currentIndex];

    if (decision === 'like') {
      setMergedPlaylist(prev => [...prev, song]);
    }

    // Calcular siguiente índice
    const nextIndex = currentIndex + 1;

    // Si llegamos al final del lote actual
    if (nextIndex >= currentBatch.length) {
      console.log("🔄 Cambio de Lote...");
      if (nextBatchBuffer && nextBatchBuffer.length > 0) {
        const newIds = nextBatchBuffer.map(t => t.id);
        setSeenIds(prev => [...prev, ...newIds]);
        setCurrentBatch(nextBatchBuffer);
        setCurrentIndex(0); // Reset a 0 para el nuevo lote
        setNextBatchBuffer(null);
        
        // Pedir más en fondo
        fetchBatch([...seenIds, ...newIds]).then(newBatch => setNextBatchBuffer(newBatch));
      } else {
        setIsLoadingInitial(true); // Spinner si no hay buffer
        fetchBatch(seenIds).then(newBatch => {
            setCurrentBatch(newBatch);
            setCurrentIndex(0);
            setIsLoadingInitial(false);
        });
      }
    } else {
      // Simplemente siguiente canción
      setCurrentIndex(nextIndex);
    }
  }, [currentBatch, currentIndex, nextBatchBuffer, seenIds, fetchBatch]);

  // TECLADO
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handleDecision('dislike');
      if (e.key === 'ArrowRight') handleDecision('like');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDecision]);

  if (isLoadingInitial) return <div style={{color:'white', padding: 50}}>Cargando...</div>;
  const currentSong = currentBatch[currentIndex];

  return (
    <div style={styles.pageContainer}> {/* Contenedor que evita el scroll */}
      
      {/* HEADER FLOTANTE */}
      <div style={styles.header}>
         <span>❤️ {mergedPlaylist.length} guardadas</span>
      </div>

      {currentSong && (
        <div style={styles.mainArea}>
            {/* LA CARTA */}
            <SongCard song={currentSong} />
            
            {/* LOS BOTONES FLOTANTES ENCIMA DE TODO */}
            <div style={styles.floatingControls}>
                <button 
                    style={{...styles.btn, ...styles.btnReject}} 
                    onClick={() => handleDecision('dislike')}
                >
                    ❌
                </button>

                <div style={{width: 40}}></div>

                <button 
                    style={{...styles.btn, ...styles.btnLike}} 
                    onClick={() => handleDecision('like')}
                >
                    💜
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    overflow: 'hidden', // ESTO EVITA EL SCROLL
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 20,
    zIndex: 100, // Encima de todo
    background: 'rgba(0,0,0,0.5)',
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
  },
  mainArea: {
    width: '100%',
    height: '100%',
    maxWidth: '450px', // Ancho máximo tipo móvil
    maxHeight: '850px',
    position: 'relative',
    borderRadius: '0px', // En desktop se vería como móvil, en full screen 0
    boxShadow: '0 0 50px rgba(0,0,0,0.5)',
  },
  floatingControls: {
    position: 'absolute',
    bottom: 30, // Pegado abajo
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // <--- AQUÍ ESTÁ EL ARREGLO DE TUS BOTONES
  },
  btn: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
    transition: 'transform 0.1s',
    outline: 'none',
  },
  btnReject: { backgroundColor: '#333', color: '#ff4444' },
  btnLike: { backgroundColor: '#333', color: '#a044ff' },
};

export default SongSwiper;