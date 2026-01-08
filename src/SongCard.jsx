import React, { useState, useRef } from 'react';
import { FiPlay, FiPause, FiHeart, FiX, FiDisc } from 'react-icons/fi'; 

const SongCard = ({ song, onLike, onDislike }) => {
  const [jugando, setJugando] = useState(false);
  const audioRef = useRef(null);

  if (!song) return null;

  const togglePlay = () => {
    if (audioRef.current) {
      if (jugando) { audioRef.current.pause(); setJugando(false); } 
      else { audioRef.current.play().catch(() => setJugando(false)); setJugando(true); }
    }
  };

  return (
    <div className="neumorphic-card" style={{ 
        width: '400px', 
        padding: '25px',
        // carta tenga el color gris
        background: 'var(--color-bg-primary)' 
    }}>
      {/* Imagen */}
      <div style={{ 
        position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '25px', 
        overflow: 'hidden', boxShadow: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff' 
      }}>
        <img src={song.imagen} alt={song.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
          <button onClick={togglePlay} className="play-btn-neumorphic">
            {jugando ? <FiPause size={28}/> : <FiPlay size={28} style={{marginLeft: '4px'}}/>}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: '25px', textAlign: 'left', padding: '0 10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#222' }}>{song.titulo}</h2>
        <p style={{ margin: '5px 0 0', fontSize: '1.1rem', color: '#666' }}>{song.artista}</p>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px' }}>
        <button onClick={onDislike} className="btn-action-dislike" style={{color: '#222'}}><FiX size={32} /></button>
        <button onClick={onLike} className="btn-action-like" style={{color: '#ff4b2b'}}><FiHeart size={32} /></button>
      </div>

      {song.preview && <audio ref={audioRef} src={song.preview} crossOrigin="anonymous" loop onEnded={() => setJugando(false)} />}
    </div>
  );
};
export default SongCard;