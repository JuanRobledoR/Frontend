import { useState, useEffect } from 'react'
import axios from 'axios';
import './App.css'; 

const API_URL = "http://localhost:8000";
const USER_ID = 1; // Usuario temporal

function Buscador() {
  const [busqueda, setBusqueda] = useState("")
  const [resultados, setResultados] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(null)

  // Cargar playlists del usuario al iniciar (para el menú de agregar)
  useEffect(() => {
    axios.get(`${API_URL}/interacciones/playlist/${USER_ID}`)
      .then(res => setPlaylists(res.data))
      .catch(e => console.error(e));
  }, []);

  // Efecto Debounce para buscar
  useEffect(() => {
    if (busqueda.trim() === "") { setResultados([]); return }
    const timer = setTimeout(() => {
      fetch(`${API_URL}/buscar?q=${busqueda}`)
        .then(res => res.json()).then(data => setResultados(data))
    }, 500)
    return () => clearTimeout(timer)
  }, [busqueda])

  // Abrir menú de playlists
  const handleAddToClick = (track) => {
    setSelectedTrack(track);
    setShowModal(true);
  }

  // --- NUEVA FUNCIÓN PARA DAR LIKE DIRECTO ---
  const handleQuickLike = (cancion) => {
    axios.post(`${API_URL}/interacciones/like`, {
        id_usuario: USER_ID,
        cancion: {
            id_externo: String(cancion.id),
            plataforma: 'DEEZER',
            titulo: cancion.titulo,
            artista: cancion.artista,
            imagen_url: cancion.imagen,
            preview_url: cancion.preview
        }
    })
    .then(() => alert("Le diste Like ❤️"))
    .catch((error) => {
        console.error(error);
        alert("Error al dar like");
    });
  };

  // Guardar canción en la playlist elegida
  const saveToPlaylist = (playlistId) => {
    axios.post(`${API_URL}/interacciones/playlist/add`, {
        id_playlist: playlistId,
        cancion: {
            id_externo: String(selectedTrack.id),
            plataforma: 'DEEZER', // Asumimos Deezer por el buscador actual
            titulo: selectedTrack.titulo,
            artista: selectedTrack.artista,
            imagen_url: selectedTrack.imagen,
            preview_url: selectedTrack.preview
        }
    }).then(() => {
        alert("¡Canción agregada a la playlist!");
        setShowModal(false);
    }).catch(() => alert("Error al agregar"));
  }

  return (
    <div className="page-content" style={{padding: '20px', paddingBottom:'100px'}}>
      <h1>🔍 Buscador</h1>
      
      <input 
        type="text" 
        placeholder="Bad Bunny, Daft Punk..." 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '20px', border:'none', marginBottom: '20px', fontSize:'16px' }}
      />

      <div className="resultados">
        {resultados.map((cancion) => (
          <div key={cancion.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#222', padding: '10px', marginBottom: '10px', borderRadius: '10px' }}>
            <img src={cancion.imagen} alt="cover" style={{ width: 50, height: 50, borderRadius: '5px' }} />
            <div style={{flex: 1, textAlign:'left'}}>
              <div style={{ fontWeight: 'bold' }}>{cancion.titulo}</div>
              <div style={{ fontSize: '0.8em', color: '#ccc' }}>{cancion.artista}</div>
            </div>
            
            {/* Reproductor Mini */}
            {cancion.preview && <audio controls src={cancion.preview} style={{height: 30, width: 80}} />}

            {/* --- NUEVO BOTÓN: LIKE DIRECTO --- */}
            <button 
                onClick={() => handleQuickLike(cancion)} 
                style={{fontSize:'1.2rem', background:'transparent', border:'none', cursor:'pointer', marginRight:'5px'}}
                title="Me Gusta"
            >
                ❤️
            </button>

            {/* Botón Agregar a Playlist (+), abre modal */}
            <button 
                onClick={() => handleAddToClick(cancion)} 
                style={{fontSize:'1.2rem', background:'transparent', border:'none', cursor:'pointer'}}
                title="Agregar a Playlist"
            >
                ➕
            </button>
          </div>
        ))}
      </div>

      {/* MODAL PARA ELEGIR PLAYLIST */}
      {showModal && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'#222', padding:'20px', borderRadius:'10px', width:'80%', maxWidth:'300px'}}>
                <h3>Agregar a...</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'10px', maxHeight:'300px', overflowY:'auto'}}>
                    {playlists.length === 0 && <p>No tienes playlists creadas.</p>}
                    {playlists.map(p => (
                        <button key={p.id} onClick={() => saveToPlaylist(p.id)} style={{padding:'10px', background:'#333', border:'none', color:'white', textAlign:'left', borderRadius:'5px'}}>
                            💿 {p.nombre}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowModal(false)} style={{marginTop:'15px', background:'red', border:'none', color:'white', padding:'5px 10px', borderRadius:'5px'}}>Cancelar</button>
            </div>
        </div>
      )}
    </div>
  )
}
export default Buscador