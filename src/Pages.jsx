import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Buscador from './Buscador';
import { useAuth } from './AuthContext';
import { FiPlay, FiHeart, FiFolder, FiTrash2, FiPlus, FiMusic, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const API_URL = "http://localhost:8000";

const containerStyle = { padding: '20px', paddingBottom: '100px', minHeight: '100vh', backgroundColor: '#000', color: 'white', overflowY: 'auto' };

// --- 1. LIKES (Con Folder para Playlist y Audio) ---
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
    <div style={containerStyle}>
      <h1 style={{textAlign:'left'}}>💜 Mis Me Gusta</h1>
      <div style={{display:'flex', flexDirection:'column', gap:'15px', marginTop:'20px'}}>
        {likes.map((t) => (
          <div key={t.id} style={{display:'flex', gap:'10px', background:'#1a1a1a', padding:'12px', borderRadius:'12px', alignItems:'center'}}>
            <img src={t.imagen} style={{width:50, height:50, borderRadius:8}} alt="cover" />
            <div style={{flex: 1, textAlign:'left'}}>
              <div style={{fontWeight:'bold'}}>{t.titulo}</div>
              <div style={{fontSize:'0.8rem', color:'#aaa'}}>{t.artista}</div>
            </div>
            {t.preview && <audio controls src={t.preview} style={{height:30, width:100}} />}
            <button onClick={() => {setSelectedTrack(t); setShowModal(true)}} style={{background:'none', border:'none', color:'white'}}><FiFolder size={22}/></button>
          </div>
        ))}
      </div>
      {showModal && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'#222', padding:'20px', borderRadius:'10px', width:'280px'}}>
                <h3>Guardar en...</h3>
                {playlists.map(p => <button key={p.id} onClick={() => saveToPlaylist(p.id)} style={{display:'block', width:'100%', padding:'10px', margin:'5px 0', background:'#333', color:'white', border:'none'}}>💿 {p.nombre}</button>)}
                <button onClick={() => setShowModal(false)} style={{width:'100%', background:'red', border:'none', color:'white', padding:'5px', marginTop:'10px'}}>Cerrar</button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- 2. HISTORIAL (Con Like y Audio) ---
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
        <div style={containerStyle}>
            <h1 style={{textAlign:'left'}}>📜 Historial</h1>
            <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                {historial.map((item, idx) => (
                    <div key={idx} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px', background: '#111', borderRadius:'10px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                             <img src={item.imagen} style={{width:40, height:40, borderRadius:5}} alt="cover" />
                             <div style={{textAlign:'left'}}>
                                 <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{item.titulo}</div>
                                 <div style={{fontSize:'0.7rem', color:'#888'}}>{item.artista}</div>
                             </div>
                        </div>
                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                            {item.preview && <audio controls src={item.preview} style={{height:30, width:90}} />}
                            <button onClick={() => darLike(item)} style={{background:'none', border:'none', color:'#ff4b2b'}}><FiHeart size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 3. PLAYLISTS (LIBRARY COMPLETA RESTAURADA) ---
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
    if(confirm("¿Borrar playlist completa?")) axios.delete(`${API_URL}/interacciones/playlist/${id}`).then(cargarPlaylists);
  };

  const eliminarTrack = (pid, tid) => {
    axios.delete(`${API_URL}/interacciones/playlist/${pid}/track/${tid}`).then(() => {
        axios.get(`${API_URL}/interacciones/playlist/${pid}/tracks`).then(res => setTracks(res.data));
    });
  };

  return (
    <div style={containerStyle}>
      <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
        <button onClick={() => setTab('listas')} style={{flex:1, padding:'12px', background: tab==='listas'?'#1DB954':'#333', border:'none', borderRadius:'20px', color:'white', fontWeight:'bold'}}>Mis Playlists</button>
        <button onClick={() => setTab('buscar')} style={{flex:1, padding:'12px', background: tab==='buscar'?'#1DB954':'#333', border:'none', borderRadius:'20px', color:'white', fontWeight:'bold'}}>🔍 Buscar</button>
      </div>

      {tab === 'listas' ? (
        <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                <h1 style={{margin:0}}>Biblioteca</h1>
                <button onClick={() => {const n = prompt("Nombre:"); if(n) axios.post(`${API_URL}/interacciones/playlist`, {id_usuario:userId, nombre:n}).then(cargarPlaylists)}} style={{background:'#333', border:'none', color:'white', padding:'5px 15px', borderRadius:'20px'}}>+ Manual</button>
            </div>

            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <button onClick={crearPlaylistIA} style={{flex:1, padding:'10px', background:'#8e24aa', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold'}}>🧬 Crear con IA</button>
                <button onClick={importarSpotify} style={{flex:1, padding:'10px', background:'#1DB954', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold'}}>Spotify</button>
                <button disabled style={{flex:1, padding:'10px', background:'#444', color:'#777', border:'none', borderRadius:'10px'}}>Deezer</button>
            </div>
            
            {playlists.map(p => (
                <div key={p.id} style={{background:'#1a1a1a', borderRadius:12, marginBottom:'12px', overflow:'hidden', border: '1px solid #333'}}>
                    <div onClick={() => toggleExpand(p.id)} style={{padding:'18px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:'#282828'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <FiMusic size={20} color="#1DB954"/> <strong>{p.nombre}</strong>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            {expandedId === p.id ? <FiChevronUp /> : <FiChevronDown />}
                            <button onClick={(e) => borrarPlaylist(e, p.id)} style={{background:'none', border:'none', color:'#ff4b2b'}}><FiTrash2 size={18}/></button>
                        </div>
                    </div>
                    {expandedId === p.id && (
                        <div style={{padding:'10px', background:'#121212'}}>
                            <button onClick={() => completarIA(p.id)} disabled={loadingIA} style={{width:'100%', padding:'12px', background:'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', border:'none', color:'white', borderRadius:'8px', marginBottom:'15px', fontWeight:'bold'}}>
                                {loadingIA ? '⏳ Analizando vibra...' : '✨ Completar Playlist con IA'}
                            </button>
                            {tracks.length === 0 && <p style={{textAlign:'center', color:'#555'}}>Vacía</p>}
                            {tracks.map(t => (
                                <div key={t.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px', background:'#1a1a1a', marginBottom:'5px', borderRadius:'8px'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <img src={t.imagen || 'https://via.placeholder.com/40'} style={{width:35, height:35, borderRadius:4}} alt="song" />
                                        <div style={{textAlign:'left'}}>
                                            <div style={{fontSize:'0.9rem', fontWeight:'bold'}}>{t.titulo}</div>
                                            <div style={{fontSize:'0.7rem', color:'#888'}}>{t.artista}</div>
                                        </div>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        {t.preview && <FiPlay size={16} onClick={(e) => {e.stopPropagation(); new Audio(t.preview).play()}} style={{cursor:'pointer'}}/>}
                                        <button onClick={() => eliminarTrack(p.id, t.id)} style={{color:'#ff4b2b', background:'none', border:'none'}}><FiX /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </>
      ) : <Buscador />}
    </div>
  );
};

// --- 4. PERFIL (Con Export) ---
export const ProfilePage = () => {
    const { user, logout } = useAuth();
    return (
        <div style={containerStyle}>
            <div className="neumorphic-card" style={{padding:'40px', textAlign:'center', marginTop:'50px', background:'#1a1a1a'}}>
                <h1 style={{color:'white'}}>👤 Mi Perfil</h1>
                <p style={{color:'#aaa'}}>Usuario: {user?.username || 'Tester'}</p>
                <button onClick={logout} className="btn-primary" style={{marginTop:'30px', background:'#ff4b2b', color:'white', width:'100%'}}>Cerrar Sesión 🚪</button>
            </div>
        </div>
    );
};