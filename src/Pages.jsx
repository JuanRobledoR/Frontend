import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Buscador from './Buscador'; // Asegúrate de importar esto

const API_URL = "http://localhost:8000";
const USER_ID = 1;

const containerStyle = {
  padding: '20px',
  paddingBottom: '100px', 
  minHeight: '100vh',
  backgroundColor: '#000',
  color: 'white',
  overflowY: 'auto'
};

// --- ME GUSTA ---
// --- LIKES PAGE CON MODAL DE PLAYLIST ---
// --- LIKES PAGE CON MODAL DE PLAYLIST ---
export const LikesPage = () => {
  const [likes, setLikes] = useState([]);
  
  // Estados para el Modal
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);

  useEffect(() => {
    cargarLikes();
    // Cargamos playlists por si quiere agregar alguna canción
    axios.get(`${API_URL}/interacciones/playlist/${USER_ID}`).then(res => setPlaylists(res.data));
  }, []);

  const cargarLikes = () => {
      axios.get(`${API_URL}/interacciones/mis-likes/${USER_ID}`)
      .then(res => setLikes(res.data))
      .catch(err => console.error(err));
  }

  const handleUnlike = (idCancionDb) => {
    axios.delete(`${API_URL}/interacciones/like/${USER_ID}/${idCancionDb}`)
      .then(() => setLikes(prev => prev.filter(t => t.id !== idCancionDb)))
      .catch(err => console.error(err));
  };

  // Abrir Modal
  const openPlaylistModal = (track) => {
      setSelectedTrackForPlaylist(track);
      setShowModal(true);
  };

  // Guardar en Playlist
  const saveToPlaylist = (playlistId) => {
    axios.post(`${API_URL}/interacciones/playlist/add`, {
        id_playlist: playlistId,
        cancion: {
            id_externo: String(selectedTrackForPlaylist.id), // Ojo: Asegúrate de que el endpoint de likes devuelva el ID externo o usar el interno
            plataforma: 'DEEZER', 
            titulo: selectedTrackForPlaylist.titulo,
            artista: selectedTrackForPlaylist.artista,
            imagen_url: selectedTrackForPlaylist.imagen,
            preview_url: selectedTrackForPlaylist.preview
        }
    }).then(() => {
        alert("¡Guardada en playlist!");
        setShowModal(false);
    });
  };

  return (
    <div style={containerStyle}>
      <h1 style={{marginBottom:'20px'}}>💜 Mis Me Gusta</h1>
      
      <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        {likes.map((track) => (
          <div key={track.id} style={{display:'flex', gap:'10px', background:'#1a1a1a', padding:'10px', borderRadius:'12px', alignItems:'center', border:'1px solid #333'}}>
            
            <img src={track.imagen} style={{width:50, height:50, borderRadius:8, objectFit:'cover'}} />
            
            <div style={{flex: 1, textAlign:'left'}}>
              <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{track.titulo}</div>
              <div style={{fontSize:'0.8rem', color:'#aaa'}}>{track.artista}</div>
            </div>
            
            {track.preview && <audio controls src={track.preview} style={{height:30, width:80}} />}
            
            {/* BOTÓN AGREGAR A PLAYLIST (NUEVO) */}
            <button onClick={() => openPlaylistModal(track)} style={{background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer'}} title="Añadir a Playlist">
                📂
            </button>

            {/* BOTÓN QUITAR LIKE */}
            <button onClick={() => handleUnlike(track.id)} style={{background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer'}} title="Quitar Like">
                💔
            </button>
          </div>
        ))}
      </div>

      {/* MODAL (Igual que en Buscador) */}
      {showModal && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'#222', padding:'20px', borderRadius:'10px', width:'80%', maxWidth:'300px'}}>
                <h3>Guardar en...</h3>
                {playlists.map(p => (
                    <button key={p.id} onClick={() => saveToPlaylist(p.id)} style={{display:'block', width:'100%', padding:'10px', margin:'5px 0', background:'#333', border:'none', color:'white', textAlign:'left'}}>
                        💿 {p.nombre}
                    </button>
                ))}
                <button onClick={() => setShowModal(false)} style={{marginTop:'15px', background:'red', width:'100%'}}>Cancelar</button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- HISTORIAL ---
export const HistoryPage = () => {
    const [historial, setHistorial] = useState([]);
    
    useEffect(() => {
        axios.get(`${API_URL}/interacciones/historial/${USER_ID}`)
            .then(res => setHistorial(res.data))
            .catch(err => console.error(err));
    }, []);

    const darLikeDesdeHistorial = (item) => {
        // Ahora sí enviamos el ID correcto
        axios.post(`${API_URL}/interacciones/like`, {
            id_usuario: USER_ID,
            cancion: {
                id_externo: String(item.id_externo), // <--- USO DEL ID CORRECTO
                plataforma: item.plataforma || 'DEEZER', 
                titulo: item.titulo,
                artista: item.artista,
                imagen_url: item.imagen,
                preview_url: item.preview
            }
        }).then(() => alert(`❤️ ${item.titulo} agregada a Me Gusta`))
          .catch(e => console.error(e));
    };

    const getIcon = (tipo) => {
        if (tipo === 'LIKE') return '💜';
        if (tipo === 'DISLIKE') return '❌';
        if (tipo === 'PLAY') return '🎧';
        return '•';
    };

    return (
        <div style={containerStyle}>
            <h1>📜 Historial</h1>
            <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                {historial.map((item, idx) => (
                    // Usamos idx como key, pero los datos vienen del item correcto
                    <div key={`${item.id_interno}-${idx}`} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #333', background: '#111'}}>
                        
                        <div style={{display:'flex', alignItems:'center', gap:'15px', flex: 1}}>
                             <span style={{fontSize:'1.5rem', minWidth:'30px'}}>{getIcon(item.tipo)}</span>
                             <img src={item.imagen} style={{width:40, height:40, borderRadius:5}} />
                             <div style={{textAlign:'left'}}>
                                 <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{item.titulo}</div>
                                 <div style={{fontSize:'0.7rem', color:'#888'}}>{item.artista}</div>
                             </div>
                        </div>

                        {/* CONTROLES: REPRODUCTOR + LIKE */}
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            {/* Reproductor: Solo si hay preview */}
                            {item.preview ? (
                                <audio controls src={item.preview} style={{height:30, width:100}} />
                            ) : <span style={{fontSize:'0.7em', color:'red'}}>Sin audio</span>}

                            <button onClick={() => darLikeDesdeHistorial(item)} style={{background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer'}} title="Guardar">
                                ❤️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- PLAYLISTS + BUSCADOR ---
export const PlaylistsPage = () => {
  const [tab, setTab] = useState('listas');
  const [playlists, setPlaylists] = useState([]);
  const [expandedId, setExpandedId] = useState(null); 
  const [tracks, setTracks] = useState([]); 
  const [loadingIA, setLoadingIA] = useState(false); 

  const cargarPlaylists = () => {
    axios.get(`${API_URL}/interacciones/playlist/${USER_ID}`).then(res => setPlaylists(res.data));
  };
  useEffect(cargarPlaylists, []);

  // --- 1. CREAR PLAYLIST IA (BASADA EN LIKES) ---
  const crearPlaylistIA = () => {
      const nombre = prompt("Nombre para la Playlist Inteligente:");
      if(!nombre) return;
      setLoadingIA(true);
      alert("🧬 Analizando tus gustos (Likes)...");
      
      axios.post(`${API_URL}/crear-playlist-inteligente-auto`, {
          id_usuario: USER_ID,
          nombre_playlist: nombre
      }).then(res => {
          setLoadingIA(false);
          alert(`✅ ¡Creada con ${res.data.total} canciones!`);
          cargarPlaylists();
      }).catch(e => {
          setLoadingIA(false);
          alert("Error generando playlist IA");
      });
  };

  // --- 2. IMPORTAR SPOTIFY ---
  const importarSpotify = () => {
      const link = prompt("Ingresa el ID de la Playlist de Spotify:\n(Ej: 37i9dQZF1DXcBWIGoYBM5M)");
      if(!link) return;
      
      // Limpieza básica por si pegan la URL entera
      const idLimpio = link.split('playlist/')[1]?.split('?')[0] || link;

      alert("⏳ Importando... esto puede tomar unos segundos.");
      axios.post(`${API_URL}/importar-playlist-spotify`, {
          id_usuario: USER_ID,
          spotify_playlist_id: idLimpio
      }).then(res => {
          alert(`✅ Importada: ${res.data.mensaje}`);
          cargarPlaylists();
      }).catch(e => alert("Error importando (Revisa que la playlist sea pública)"));
  };

  // --- 3. IMPORTAR DEEZER (Placeholder) ---
  const importarDeezer = () => {
      alert("🚧 Funcionalidad en mantenimiento. Usa Spotify por ahora.");
  };

  // --- 4. COMPLETAR PLAYLIST CON IA ---
  const completarPlaylist = (idPlaylist) => {
      const confirmar = confirm("🧬 ¿Quieres que la IA escuche esta playlist y agregue 5 canciones que combinen?");
      if(!confirmar) return;

      alert("🎧 La IA está analizando la vibra de la playlist...");
      axios.post(`${API_URL}/completar-playlist-ia`, {
          id_usuario: USER_ID,
          id_playlist: idPlaylist
      }).then(res => {
          alert(`✅ ¡Listo! Se agregaron ${res.data.agregadas} canciones nuevas.`);
          // Recargamos tracks
          toggleExpand(idPlaylist); 
          // Forzamos recarga visual cerrando y abriendo si ya estaba abierta
          if(expandedId === idPlaylist) {
             setExpandedId(null);
             setTimeout(() => toggleExpand(idPlaylist), 100);
          }
      }).catch(e => {
          console.error(e);
          alert("Error: Tal vez la playlist está vacía y no tienes likes para usar de referencia.");
      });
  };

  // --- MANEJO BÁSICO ---
  const toggleExpand = (id) => {
    if (expandedId === id) {
        setExpandedId(null); setTracks([]);
    } else {
        setExpandedId(id);
        axios.get(`${API_URL}/interacciones/playlist/${id}/tracks`).then(res => setTracks(res.data));
    }
  };
  const crearPlaylistManual = () => {
    const nombre = prompt("Nombre:");
    if (nombre) axios.post(`${API_URL}/interacciones/playlist`, { id_usuario: USER_ID, nombre }).then(cargarPlaylists);
  };
  const borrarPlaylist = (e, id) => { e.stopPropagation(); if(confirm("¿Borrar?")) axios.delete(`${API_URL}/interacciones/playlist/${id}`).then(cargarPlaylists); };
  const eliminarTrack = (pid, tid) => { axios.delete(`${API_URL}/interacciones/playlist/${pid}/track/${tid}`).then(() => toggleExpand(pid)); };

  return (
    <div style={containerStyle}>
      <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
        <button onClick={() => setTab('listas')} style={{flex:1, padding:'10px', background: tab==='listas'?'#1DB954':'#333', border:'none', borderRadius:'20px', color:'white', fontWeight:'bold'}}>Mis Playlists</button>
        <button onClick={() => setTab('buscar')} style={{flex:1, padding:'10px', background: tab==='buscar'?'#1DB954':'#333', border:'none', borderRadius:'20px', color:'white', fontWeight:'bold'}}>🔍 Buscar</button>
      </div>

      {tab === 'listas' ? (
        <>
            {/* CABECERA Y BOTONES GLOBALES */}
            <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom: 20}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h1>Biblioteca</h1>
                    <button onClick={crearPlaylistManual} style={{background:'#333', padding:'5px 15px', borderRadius:20, color:'white'}}>+ Manual</button>
                </div>
                
                {/* BARRA DE HERRAMIENTAS IA & IMPORT */}
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                    <button onClick={crearPlaylistIA} disabled={loadingIA} style={{flex:1, background: loadingIA ? '#555' : 'purple', padding:'8px', borderRadius:10, color:'white', border:'1px solid #d0f', fontWeight:'bold'}}>
                        {loadingIA ? '⏳ Creando...' : '🧬 Crear con IA'}
                    </button>
                    
                    <button onClick={importarSpotify} style={{flex:1, background:'#1DB954', padding:'8px', borderRadius:10, color:'black', border:'none', fontWeight:'bold'}}>
                        ⬇ Spotify
                    </button>
                    
                    <button onClick={importarDeezer} style={{flex:1, background:'#333', padding:'8px', borderRadius:10, color:'#777', border:'1px dashed #555', cursor:'not-allowed'}}>
                        ⬇ Deezer
                    </button>
                </div>
            </div>
            
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                {playlists.map(p => (
                    <div key={p.id} style={{background:'#222', borderRadius:10, overflow:'hidden'}}>
                        <div onClick={() => toggleExpand(p.id)} style={{padding:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:'#333'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <span style={{fontSize:'1.5rem'}}>🎵</span>
                                <span style={{fontWeight:'bold'}}>{p.nombre}</span>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <span>{expandedId === p.id ? '▲' : '▼'}</span>
                                <button onClick={(e) => borrarPlaylist(e, p.id)} style={{background:'transparent', border:'none'}}>🗑️</button>
                            </div>
                        </div>
                        
                        {/* ZONA EXPANDIDA */}
                        {expandedId === p.id && (
                            <div style={{padding:'10px', background:'#1a1a1a'}}>
                                
                                {/* BOTÓN COMPLETAR CON IA (ACTIVO) */}
                                <button onClick={() => completarPlaylist(p.id)} style={{width:'100%', marginBottom:'10px', background:'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', color:'white', border:'none', padding:'10px', borderRadius:'5px', fontWeight:'bold', cursor:'pointer'}}>
                                    ✨ Completar Playlist con IA
                                </button>
                                
                                {tracks.length === 0 && <p style={{textAlign:'center', color:'#666'}}>Vacía</p>}
                                {tracks.map(t => (
                                    <div key={t.id} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', borderBottom:'1px solid #333'}}>
                                        {/* Imagen con fallback si viene vacía de Spotify */}
                                        <img src={t.imagen || 'https://via.placeholder.com/40'} style={{width:40, height:40, borderRadius:4}} />
                                        <div style={{flex:1}}>
                                            <div style={{fontWeight:'bold'}}>{t.titulo}</div>
                                            <div style={{fontSize:'0.7rem'}}>{t.artista}</div>
                                        </div>
                                        {t.preview && <audio controls src={t.preview} style={{height:25, width:70}} />}
                                        <button onClick={() => eliminarTrack(p.id, t.id)} style={{background:'transparent', border:'none', color:'red'}}>✖</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
      ) : (
        <Buscador />
      )}
    </div>
  );
};

export const ProfilePage = () => (
    <div style={containerStyle}><h1>👤 Perfil</h1><p>Usuario: Tester</p></div>
);