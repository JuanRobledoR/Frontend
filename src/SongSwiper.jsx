import React, { useEffect, useRef, useState, useCallback } from 'react';
import SongCard from './SongCard';
import axios from 'axios';
import { useFeed } from './FeedContext'; 

const API_URL = "http://localhost:8000"; 
const USER_ID_TEST = 1; 

const SongSwiper = () => {
  const { 
    feed, setFeed, 
    currentIndex, setCurrentIndex, 
    nextBatchBuffer, setNextBatchBuffer, 
    seenIds, setSeenIds, 
    fetchBatch, inicializarFeed, isLoading 
  } = useFeed();

  const [likedSongs, setLikedSongs] = useState([]); 
  const audioRef = useRef(new Audio()); 
  
  // REF CLAVE: Guarda el ID de la canción actual para no repetir historial al cambiar de tab
  const currentSongIdRef = useRef(null);

  // 1. Carga inicial
  useEffect(() => {
    inicializarFeed();
  }, [inicializarFeed]);

  // 2. Cleanup del audio
  useEffect(() => {
    const player = audioRef.current;
    return () => {
      player.pause();
    };
  }, []);

  // 3. REPRODUCCIÓN Y REGISTRO INTELIGENTE
  useEffect(() => {
    if (feed.length === 0 || !feed[currentIndex]) return;

    const song = feed[currentIndex];
    const player = audioRef.current;

    // ¿Es una canción nueva o es la misma porque regresé de otra pestaña?
    const isNewSong = currentSongIdRef.current !== song.id;

    if (isNewSong) {
        // SI ES NUEVA: Preparamos y reproducimos
        player.pause();
        player.currentTime = 0;
        currentSongIdRef.current = song.id; // Actualizamos la ref

        if (song.preview) {
            player.src = song.preview;
            player.volume = 0.5;
            player.play()
                .then(() => {
                    // Solo registramos en historial si efectivamente empezó a sonar Y es nueva
                    axios.post(`${API_URL}/interacciones/historial/play`, {
                        id_usuario: USER_ID_TEST,
                        cancion: {
                            id_externo: String(song.id),
                            plataforma: 'DEEZER',
                            titulo: song.titulo,
                            artista: song.artista,
                            imagen_url: song.imagen,
                            preview_url: song.preview
                        }
                    }).catch(e => console.log("Backend offline o error db:", e));
                })
                .catch(e => console.log("Autoplay bloqueado:", e));
        }
    } else {
        // SI ES LA MISMA (Solo volvimos a la pestaña):
        // No hacemos nada, o si quieres que reanude sola, descomenta abajo:
        // if (player.paused && song.preview) player.play().catch(()=>{});
    }
  }, [currentIndex, feed]); 

  // 4. Guardar Like/Dislike
  const saveInteraction = async (song, tipo) => {
    try {
        const endpoint = tipo === 'like' ? 'like' : 'dislike';
        await axios.post(`${API_URL}/interacciones/${endpoint}`, {
            id_usuario: USER_ID_TEST,
            cancion: {
                id_externo: String(song.id),
                plataforma: 'DEEZER',
                titulo: song.titulo,
                artista: song.artista,
                imagen_url: song.imagen,
                preview_url: song.preview
            }
        });
    } catch (error) {
        console.error("Error guardando interacción:", error);
    }
  };

  // 5. Botones
  const handleDecision = useCallback((decision) => {
    if (feed.length === 0) return;
    const song = feed[currentIndex];

    if (decision === 'like') {
      // BLINDAJE: Solo agregamos a la lista visual si no está ya ahí por ID
      setLikedSongs(prev => {
          const yaExiste = prev.some(s => s.id === song.id);
          if (yaExiste) return prev; // Si ya está, no hacemos nada
          return [...prev, song];    // Si es nueva, la agregamos
      });
      saveInteraction(song, 'like');
    } else {
      saveInteraction(song, 'dislike');
    }

    // Avanzar
    const nextIndex = currentIndex + 1;
    if (nextIndex >= feed.length) {
        if (nextBatchBuffer && nextBatchBuffer.length > 0) {
            const newIds = nextBatchBuffer.map(t => t.id);
            setSeenIds(prev => [...prev, ...newIds]);
            setFeed(prev => [...prev, ...nextBatchBuffer]); 
            setNextBatchBuffer(null);
            fetchBatch([...seenIds, ...newIds]).then(newBatch => setNextBatchBuffer(newBatch));
            setCurrentIndex(nextIndex);
        } else {
            fetchBatch(seenIds).then(newBatch => {
                setFeed(prev => [...prev, ...newBatch]);
                setCurrentIndex(nextIndex);
            });
        }
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [feed, currentIndex, nextBatchBuffer, seenIds, fetchBatch]);

  if (isLoading && feed.length === 0) return <div style={styles.loading}>Cargando...</div>;
  const currentSong = feed[currentIndex];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
         <span style={{marginRight: '15px'}}>❤️ {likedSongs.length}</span>
      </div>

      {currentSong ? (
        <div style={styles.mainArea}>
            <SongCard song={currentSong} />
            <div style={styles.floatingControls}>
                <button style={{...styles.btn, ...styles.btnReject}} onClick={() => handleDecision('dislike')}>❌</button>
                <div style={{width: 40}}></div>
                <button style={{...styles.btn, ...styles.btnLike}} onClick={() => handleDecision('like')}>💜</button>
            </div>
        </div>
      ) : (
          <div style={{color:'white'}}>No hay más canciones.</div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: { width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  loading: { color: 'white', fontSize: '1.5rem' },
  header: { position: 'absolute', top: 20, right: 20, zIndex: 100, background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '30px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center' },
  mainArea: { width: '100%', height: '100%', maxWidth: '450px', maxHeight: '800px', position: 'relative', borderRadius: '20px', boxShadow: '0 0 50px rgba(0,0,0,0.5)', overflow: 'hidden' },
  floatingControls: { position: 'absolute', bottom: 90, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 99 }, 
  btn: { width: '70px', height: '70px', borderRadius: '50%', border: 'none', fontSize: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', transition: 'transform 0.1s' },
  btnReject: { backgroundColor: '#ff4b4b', color: 'white' },
  btnLike: { backgroundColor: '#a044ff', color: 'white' },
};

export default SongSwiper;