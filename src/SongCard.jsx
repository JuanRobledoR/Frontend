import React, { useState, useRef } from 'react';
// CAMBIO AQUÍ: Usamos 'fi'
import { FiPlay, FiPause, FiHeart, FiX, FiDisc } from 'react-icons/fi'; 
import './index.css';

const SongCard = ({ song, onLike, onDislike }) => {
  const [jugando, setJugando] = useState(false);
  const audioRef = useRef(null);

  if (!song) return null;

  const togglePlay = () => {
      if (audioRef.current) {
          if (jugando) {
              audioRef.current.pause();
              setJugando(false);
          } else {
              audioRef.current.play().catch(e => {
                  console.error("Error de reproducción:", e);
                  alert("El enlace de esta canción ha expirado. Dale a 'Reintentar evolución' para refrescar el pool.");
                  setJugando(false);
              });
              setJugando(true);
          }
      }
  };

  return (
    <div className="music-card-screen">
      <img src={song.imagen} alt={song.titulo} className="music-card-bg" />
      <div className="gradient-overlay"></div>

      <div className="central-player-container">
        {song.preview ? (
            <button onClick={togglePlay} className="play-btn-lg">
                {/* Usamos los nuevos iconos Fi */}
                {jugando ? <FiPause size={40}/> : <FiPlay size={40}/>}
            </button>
        ) : <div className="play-btn-lg"><FiDisc size={30}/></div>}
      </div>

      <div className="info-container-bottom">
        <h2 style={{margin:0, fontSize:'1.5rem', fontWeight:'bold'}}>{song.titulo}</h2>
        <p style={{margin:0, opacity:0.8}}>{song.artista}</p>
      </div>

      <div className="action-buttons-container">
        <button onClick={onDislike} className="btn-circle-action dislike-btn">
            <FiX size={30} />
        </button>
        <button onClick={onLike} className="btn-circle-action like-btn">
            <FiHeart size={30} />
        </button>
      </div>

      {song.preview && <audio ref={audioRef} src={song.preview} loop />}
    </div>
  );
};
export default SongCard;