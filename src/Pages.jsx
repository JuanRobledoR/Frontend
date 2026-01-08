import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Buscador from './Buscador';
import { useAuth } from './AuthContext';
import { 
    FiPlay, FiPause, FiHeart, FiFolder, FiTrash2, FiPlus, 
    FiMusic, FiChevronDown, FiChevronUp, FiX, FiUser, FiDisc, FiCpu 
} from 'react-icons/fi';
import './index.css';

const API_URL = "https://backend-nx0h.onrender.com/";

// --- COMPONENTE REUTILIZABLE PARA FILAS DE CANCIONES (Audio + Estilo) ---
const TrackRow = ({ track, subtitle, image, onAction1, icon1, onAction2, icon2, isPlayingProp }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            audioRef.current.play().catch(err => console.error(err));
            setPlaying(true);
        }
    };

    return (
        <div className="neumorphic-list-item fade-in">
            <div className="list-item-left">
                <img src={image || track.imagen || track.imagen_url || 'https://via.placeholder.com/50'} alt="cover" className="list-item-img" />
                <div className="list-item-info">
                    <h4>{track.titulo}</h4>
                    <p>{subtitle || track.artista}</p>
                </div>
            </div>

            <div className="list-item-actions">
                {/* Reproductor */}
                {(track.preview || track.preview_url) && (
                    <button className={`btn-icon-small ${playing ? 'active' : ''}`} onClick={togglePlay}>
                        {playing ? <FiPause /> : <FiPlay />}
                    </button>
                )}
                
                {/* Botón Acción 1 (Ej: Folder o Like) */}
                {onAction1 && (
                    <button className="btn-icon-small" onClick={(e) => { e.stopPropagation(); onAction1(track); }}>
                        {icon1}
                    </button>
                )}

                {/* Botón Acción 2 (Ej: Borrar) */}
                {onAction2 && (
                    <button className="btn-icon-small danger" onClick={(e) => { e.stopPropagation(); onAction2(track); }}>
                        {icon2}
                    </button>
                )}

                {/* Audio Oculto */}
                {(track.preview || track.preview_url) && (
                    <audio ref={audioRef} src={track.preview || track.preview_url} onEnded={() => setPlaying(false)} />
                )}
            </div>
        </div>
    );
};

// --- 1. LIKES PAGE ---
export const LikesPage = () => {
  const [likes, setLikes] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/interacciones/mis-likes/${userId}`).then(res => setLikes(res.data));
      axios.get(`${API_URL}/interacciones/playlist/${userId}`).then(res => setPlaylists(res.data));
    }
  }, [userId]);

  const saveToPlaylist = (pid) => {
    axios.post(`${API_URL}/interacciones/playlist/add`, {
        id_playlist: pid,
        cancion: {
            id_externo: String(selectedTrack.id), plataforma: 'DEEZER',
            titulo: selectedTrack.titulo, artista: selectedTrack.artista,
            imagen_url: selectedTrack.imagen, preview_url: selectedTrack.preview
        }
    }).then(() => { alert("¡Agregada!"); setShowModal(false); });
  };

  return (
    <div className="page-container">
      <div className="page-header">
          <div className="header-icon-box"><FiHeart color="#e91e63" size={24}/></div>
          <h1>Mis Me Gusta</h1>
      </div>

      <div className="list-container">
        {likes.length === 0 && <p className="empty-msg">No has dado like a nada aún.</p>}
        {likes.map((t) => (
          <TrackRow 
            key={t.id} 
            track={t} 
            subtitle={t.artista}
            image={t.imagen}
            onAction1={() => { setSelectedTrack(t); setShowModal(true); }}
            icon1={<FiFolder size={18}/>}
          />
        ))}
      </div>

      {/* Modal Neumórfico Reutilizable */}
      {showModal && (
        <div className="modal-overlay">
            <div className="neumorphic-modal">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                    <h3>Guardar en...</h3>
                    <button onClick={() => setShowModal(false)} className="btn-icon-small"><FiX/></button>
                </div>
                <div className="modal-list">
                    {playlists.map(p => (
                        <button key={p.id} onClick={() => saveToPlaylist(p.id)} className="playlist-option-btn">
                            <FiDisc style={{marginRight:10}}/> {p.nombre}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- 2. HISTORIAL PAGE ---
export const HistoryPage = () => {
    const [historial, setHistorial] = useState([]);
    const { userId } = useAuth();
    
    useEffect(() => {
        if (userId) axios.get(`${API_URL}/interacciones/historial/${userId}`).then(res => setHistorial(res.data));
    }, [userId]);

    const darLike = (item) => {
        axios.post(`${API_URL}/interacciones/like`, {
            id_usuario: userId,
            cancion: {
                id_externo: String(item.id_externo), plataforma: item.plataforma || 'DEEZER',
                titulo: item.titulo, artista: item.artista, imagen_url: item.imagen, preview_url: item.preview
            }
        }).then(() => alert("❤️ Agregada a Me Gusta"));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-icon-box"><FiDisc color="#6a11cb" size={24}/></div>
                <h1>Historial</h1>
            </div>
            <div className="list-container">
                {historial.length === 0 && <p className="empty-msg">Tu historial está vacío.</p>}
                {historial.map((item, idx) => (
                    <TrackRow 
                        key={idx} 
                        track={item}
                        subtitle={item.artista}
                        image={item.imagen}
                        onAction1={() => darLike(item)}
                        icon1={<FiHeart size={18} color="#ff4b2b"/>}
                    />
                ))}
            </div>
        </div>
    );
};

// --- 3. PLAYLISTS PAGE (Restaurada y Estilizada) ---
export const PlaylistsPage = () => {
  const [tab, setTab] = useState('listas');
  const [playlists, setPlaylists] = useState([]);
  const [expandedId, setExpandedId] = useState(null); 
  const [tracks, setTracks] = useState([]); 
  const [loadingIA, setLoadingIA] = useState(false);
  const { userId } = useAuth();

  const cargarPlaylists = useCallback(() => {
    if(userId) axios.get(`${API_URL}/interacciones/playlist/${userId}`).then(res => setPlaylists(res.data));
  }, [userId]);

  useEffect(() => { cargarPlaylists(); }, [cargarPlaylists]);

  const toggleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); setTracks([]); }
    else { 
      setExpandedId(id); 
      axios.get(`${API_URL}/interacciones/playlist/${id}/tracks`).then(res => setTracks(res.data)); 
    }
  };

  const crearPlaylistIA = () => {
    const nombre = prompt("Nombre para la Playlist Inteligente:");
    if(!nombre) return;
    setLoadingIA(true);
    axios.post(`${API_URL}/crear-playlist-inteligente-auto`, { id_usuario: userId, nombre_playlist: nombre })
         .then(() => { alert("✅ Playlist IA Creada"); cargarPlaylists(); })
         .finally(() => setLoadingIA(false));
  };

  const importarSpotify = () => {
    const id = prompt("Ingresa el ID de la playlist de Spotify:");
    if(id) {
        axios.post(`${API_URL}/importar-playlist-spotify`, { id_usuario: userId, spotify_playlist_id: id })
             .then(() => { alert("✅ Importada"); cargarPlaylists(); });
    }
  };

  const completarIA = (id) => {
    setLoadingIA(true);
    axios.post(`${API_URL}/completar-playlist-ia`, { id_usuario: userId, id_playlist: id })
         .then(res => { alert(`✨ Se añadieron ${res.data.agregadas} canciones`); toggleExpand(id); })
         .finally(() => setLoadingIA(false));
  };

  const borrarPlaylist = (e, id) => {
    e.stopPropagation();
    if(window.confirm("¿Borrar playlist completa?")) axios.delete(`${API_URL}/interacciones/playlist/${id}`).then(cargarPlaylists);
  };

  const eliminarTrack = (pid, tid) => {
    axios.delete(`${API_URL}/interacciones/playlist/${pid}/track/${tid}`).then(() => {
        axios.get(`${API_URL}/interacciones/playlist/${pid}/tracks`).then(res => setTracks(res.data));
    });
  };

  return (
    <div className="page-container">
      {/* Tabs Neumórficos */}
      <div className="tabs-container">
        <button onClick={() => setTab('listas')} className={`tab-btn ${tab==='listas' ? 'active' : ''}`}>Mis Playlists</button>
        <button onClick={() => setTab('buscar')} className={`tab-btn ${tab==='buscar' ? 'active' : ''}`}>🔍 Buscar</button>
      </div>

      {tab === 'listas' ? (
        <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h1 style={{margin:0, fontSize:'1.5rem'}}>Biblioteca</h1>
                <button onClick={() => {const n = prompt("Nombre:"); if(n) axios.post(`${API_URL}/interacciones/playlist`, {id_usuario:userId, nombre:n}).then(cargarPlaylists)}} className="btn-small-neumorphic">
                    <FiPlus/> Manual
                </button>
            </div>

            {/* Botones de Acción Global */}
            <div style={{display:'flex', gap:'15px', marginBottom:'25px'}}>
                <button onClick={crearPlaylistIA} className="action-btn-large purple">
                    <FiCpu size={20}/> Crear con IA
                </button>
                <button onClick={importarSpotify} className="action-btn-large green">
                    <FiMusic size={20}/> Spotify
                </button>
            </div>
            
            <div className="list-container">
                {playlists.map(p => (
                    <div key={p.id} className={`playlist-card ${expandedId === p.id ? 'expanded' : ''}`}>
                        <div className="playlist-header" onClick={() => toggleExpand(p.id)}>
                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                <div className="playlist-icon"><FiMusic /></div>
                                <strong>{p.nombre}</strong>
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <button onClick={(e) => borrarPlaylist(e, p.id)} className="btn-icon-small danger"><FiTrash2 size={16}/></button>
                                {expandedId === p.id ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                        </div>

                        {expandedId === p.id && (
                            <div className="playlist-body">
                                <button onClick={() => completarIA(p.id)} disabled={loadingIA} className="ia-complete-btn">
                                    {loadingIA ? '⏳ Analizando vibra...' : '✨ Completar Playlist con IA'}
                                </button>
                                
                                {tracks.length === 0 && <p style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Playlist vacía</p>}
                                
                                <div className="tracks-list">
                                    {tracks.map(t => (
                                        <TrackRow 
                                            key={t.id}
                                            track={t}
                                            subtitle={t.artista}
                                            image={t.imagen}
                                            onAction2={() => eliminarTrack(p.id, t.id)}
                                            icon2={<FiX size={16}/>}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
      ) : <Buscador />}
    </div>
  );
};

// --- 4. PROFILE PAGE ---
export const ProfilePage = () => {
    const { user, logout } = useAuth();
    return (
        <div className="page-container" style={{
            justifyContent: 'center', // Centrado Vertical
            alignItems: 'center',     // Centrado Horizontal
            height: '100%'            // Usa toda la altura disponible
        }}>
            <div className="neumorphic-card profile-card">
                <div className="profile-avatar">
                    <FiUser size={40} color="#6a11cb"/>
                </div>
                <h2>Mi Perfil</h2>
                <p className="profile-user">Usuario: <strong>{user?.username || 'Invitado'}</strong></p>
                <button onClick={logout} className="logout-btn">
                    Cerrar Sesión 🚪
                </button>
            </div>
        </div>
    );
};