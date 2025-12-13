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
      
      {/* DEGRADADO PARA QUE SE LEA EL TEXTO */}
      <div style={styles.gradientOverlay}></div>

      {/* INFO DEL TEXTO (Con pointer-events none para que el click pase a traves si es necesario) */}
      <div style={styles.infoContainer}>
        <h1 style={styles.title}>{song.titulo}</h1>
        <h2 style={styles.artist}>{song.artist}</h2>
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    position: 'relative',
    width: '100%',
    height: '100%', // Ocupa todo el contenedor padre
    borderRadius: '20px',
    overflow: 'hidden', // Importante para que la imagen no se salga
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end', // Texto abajo
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Cubre todo el espacio tipo Story de Instagram
    zIndex: 1, // Al fondo
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 50%)',
    zIndex: 2, // Encima de la imagen
  },
  infoContainer: {
    position: 'relative',
    zIndex: 3, // Encima del gradiente
    padding: '20px',
    paddingBottom: '100px', // Espacio para que los botones no tapen el texto
    textAlign: 'left',
    color: 'white',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  title: { margin: 0, fontSize: '2em', fontWeight: 'bold' },
  artist: { margin: 0, fontSize: '1.2em', opacity: 0.9 },
};

export default SongCard;