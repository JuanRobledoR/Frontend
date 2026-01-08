import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { FiSearch, FiPlay, FiPause, FiPlus, FiHeart, FiX, FiDisc, FiMusic } from 'react-icons/fi';
import './index.css'; 

const API_URL = "http://localhost:8000";

// Tarjeta resultado
const SearchResultCard = ({ track, onLike, onAdd }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().catch(e => console.error("Error al reproducir", e));
            setPlaying(true);
        }
    };

    return (
        <div className="mini-song-card fade-in">
            <img src={track.imagen} alt={track.titulo} className="mini-card-img"/>
            
            <div className="mini-card-info">
                <h4>{track.titulo}</h4>
                <p>{track.artista}</p>
            </div>

            <div className="mini-card-actions">
                {track.preview ? (
                    <button className="btn-mini-action play" onClick={togglePlay}>
                        {playing ? <FiPause size={16} /> : <FiPlay size={16} />}
                    </button>
                ) : (
                    <div style={{width: 35, height: 35, display:'flex', alignItems:'center', justifyContent:'center', opacity:0.3}}>
                        <FiDisc size={16}/>
                    </div>
                )}

                <button className="btn-mini-action like" onClick={() => onLike(track)}>
                    <FiHeart size={16} />
                </button>

                <button className="btn-mini-action add" onClick={() => onAdd(track)}>
                    <FiPlus size={16} />
                </button>
            </div>

            {track.preview && (
                <audio 
                    ref={audioRef} 
                    src={track.preview} 
                    onEnded={() => setPlaying(false)} 
                />
            )}
        </div>
    );
};

// Componente principal
const Buscador = () => {
  const { userId } = useAuth();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Carga playlist usuario
  useEffect(() => {
    if (userId) {
        axios.get(`${API_URL}/interacciones/playlist/${userId}`)
        .then(res => setPlaylists(res.data))
        .catch(e => console.error("Error cargando playlists:", e));
    }
  }, [userId]);

  // Búsqueda debounce
  useEffect(() => {
    if (query.trim() === "") { 
        setResultados([]); 
        return; 
    }
    const timer = setTimeout(() => {
      setBuscando(true);
      axios.get(`${API_URL}/buscar?q=${query}`)
        .then(res => {
            setResultados(res.data);
            setBuscando(false);
        })
        .catch(err => {
            console.error(err);
            setBuscando(false);
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Like rápido
  const handleQuickLike = (cancion) => {
    axios.post(`${API_URL}/interacciones/like`, {
        id_usuario: userId,
        cancion: {
            id_externo: String(cancion.id),
            plataforma: 'DEEZER',
            titulo: cancion.titulo,
            artista: cancion.artista,
            imagen_url: cancion.imagen,
            preview_url: cancion.preview
        }
    })
    .then(() => alert(`❤️ Agregada a Likes`))
    .catch((error) => console.error(error));
  };

  const handleAddToClick = (track) => {
    setSelectedTrack(track);
    setShowModal(true);
  };

  // Guardado playlist
  const saveToPlaylist = (playlistId) => {
    if (!selectedTrack) return;
    axios.post(`${API_URL}/interacciones/playlist/add`, {
        id_playlist: playlistId,
        cancion: {
            id_externo: String(selectedTrack.id),
            plataforma: 'DEEZER',
            titulo: selectedTrack.titulo,
            artista: selectedTrack.artista,
            imagen_url: selectedTrack.imagen,
            preview_url: selectedTrack.preview
        }
    }).then(() => {
        alert("¡Agregada correctamente!");
        setShowModal(false);
    }).catch(() => alert("Error al agregar a playlist"));
  };

  const limpiarBusqueda = () => {
    setQuery('');
    setResultados([]);
  };

  return (
    <div className="search-page-container">
      
      <div className="search-header">
        <h2 style={{color: '#6a11cb', margin: '0 0 20px 0'}}>Explorar</h2>
        <div className="neumorphic-search-bar">
            <FiSearch size={20} color="#888" style={{marginLeft: '15px'}}/>
            <input 
                type="text" 
                placeholder="Bad Bunny, Daft Punk, Phonk..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input-clean"
            />
            {query && (
                <button type="button" onClick={limpiarBusqueda} className="btn-clear">
                    <FiX size={18} />
                </button>
            )}
        </div>
      </div>

      <div className="search-results-area">
        {buscando && <p style={{textAlign:'center', marginTop: 20, color:'#666'}}>🎧 Buscando frecuencias...</p>}
        
        {!buscando && resultados.length === 0 && query === '' && (
            <div className="empty-state-search">
                <FiDisc size={50} color="#cbd5e0" />
                <p>Escribe tu artista favorito para comenzar.</p>
            </div>
        )}

        <div className="results-grid">
            {resultados.map((track) => (
                <SearchResultCard 
                    key={track.id} 
                    track={track} 
                    onLike={handleQuickLike} 
                    onAdd={handleAddToClick} 
                />
            ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
            <div className="neumorphic-modal">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                    <h3 style={{margin:0, color:'#6a11cb'}}>Agregar a...</h3>
                    <button onClick={() => setShowModal(false)} className="btn-mini-action" style={{boxShadow:'none'}}>
                        <FiX size={20}/>
                    </button>
                </div>
                
                <div className="modal-list">
                    {playlists.length === 0 && <p style={{fontSize:'0.9rem'}}>No tienes playlists creadas.</p>}
                    {playlists.map(p => (
                        <button key={p.id} onClick={() => saveToPlaylist(p.id)} className="playlist-option-btn">
                            <FiMusic style={{marginRight:10}}/> {p.nombre}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Buscador;