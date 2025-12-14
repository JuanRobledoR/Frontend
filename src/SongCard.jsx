import React from 'react';

const SongCard = ({ song }) => {
  if (!song) return null;

  return (
    <div style={styles.cardContainer}>
      {/* IMAGEN DE FONDO */}
      <img 
        src={song.imagen || "https://via.placeholder.com/300"} 
        alt={song.titulo} 
        style={styles.backgroundImage} 
      />
      
      {/* SOMBRA PARA QUE SE LEA EL TEXTO */}
      <div style={styles.gradientOverlay}></div>

      {/* TEXTO INFORMATIVO */}
      <div style={styles.infoContainer}>
        <h1 style={styles.title}>{song.titulo}</h1>
        <h2 style={styles.artist}>{song.artista}</h2>
        {/* Indicador de si suena preview */}
        {song.preview && <span style={styles.badge}>🔊 Preview</span>}
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    position: 'relative', width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
  },
  backgroundImage: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    objectFit: 'cover', zIndex: 1,
  },
  gradientOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)',
    zIndex: 2,
  },
  infoContainer: {
    position: 'relative', zIndex: 3, padding: '30px', paddingBottom: '140px', // Espacio para botones
    textAlign: 'left', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)'
  },
  title: { margin: 0, fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.1' },
  artist: { margin: '5px 0 0 0', fontSize: '1.2rem', opacity: 0.9, fontWeight: '400' },
  badge: { 
      marginTop: '10px', display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', 
      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', backdropFilter: 'blur(5px)'
  }
};

export default SongCard;