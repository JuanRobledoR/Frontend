import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useFeed } from './FeedContext'; ////Importado para corregir loop
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiPause, FiPlus, FiMusic, FiSearch, FiX } from 'react-icons/fi';

const API_URL = "https://backend-nx0h.onrender.com";

function useWindowSize() {
    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    useEffect(() => {
        const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
}

const SearchItem = ({ track, onSelect, disabled }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (playing) { audioRef.current.pause(); } 
            else { 
                audioRef.current.play().catch(err => console.error("Error de audio:", err)); 
            }
            setPlaying(!playing);
        }
    };

    return (
        <div className="neumorphic-card" style={{ 
            display: 'flex', alignItems: 'center', padding: '10px 15px', 
            marginBottom: '15px', background: 'var(--color-bg-primary)',
            borderRadius: '15px', width: '100%', boxSizing: 'border-box' 
        }}>
            <img src={track.imagen} alt={track.titulo} style={{ width: '50px', height: '50px', borderRadius: '10px', marginRight: '15px', objectFit: 'cover', flexShrink: 0 }} />
            
            <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden', minWidth: 0, marginRight: '10px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.titulo}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.artista}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {track.preview && (
                    <button onClick={togglePlay} className="btn-icon" style={{ 
                        width: '35px', height: '35px', borderRadius: '50%', border: 'none',
                        background: 'var(--color-bg-primary)', color: playing ? '#1DB954' : '#6a11cb',
                        boxShadow: '3px 3px 6px #bebebe, -3px -3px 6px #ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}>
                        {playing ? <FiPause size={18}/> : <FiPlay size={18} style={{marginLeft:2}}/>}
                    </button>
                )}
                
                <button 
                    onClick={(e) => { e.preventDefault(); onSelect(track); }} 
                    disabled={disabled} 
                    style={{ 
                        width: '35px', height: '35px', display:'flex', alignItems:'center', justifyContent:'center',
                        background: 'linear-gradient(145deg, #6a11cb, #2575fc)', border: 'none',
                        borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s',
                        color: 'white', boxShadow: '3px 3px 6px rgba(106, 17, 203, 0.2)'
                    }}
                >
                    <FiPlus size={20} /> 
                </button>
            </div>
            {track.preview && <audio ref={audioRef} src={track.preview} crossOrigin="anonymous" onEnded={() => setPlaying(false)} />}
        </div>
    );
};

const Onboarding = () => {
    const { userId } = useAuth();
    const { setOnboardingComplete } = useFeed(); ////Contexto para romper el loop
    const navigate = useNavigate();
    const [width] = useWindowSize();
    
    const [busqueda, setBusqueda] = useState("Maluma");
    const [resultados, setResultados] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [progreso, setProgreso] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [buscando, setBuscando] = useState(false);

    // Estados para Spotify
    const [showSpotifyModal, setShowSpotifyModal] = useState(false);
    const [spotifyUrl, setSpotifyUrl] = useState("");

    const isMobile = width < 850;

    useEffect(() => {
        if(userId) {
            axios.get(`${API_URL}/usuarios/check-onboarding/${userId}`)
            .then(res => {
                if (res.data.completado) {
                    setOnboardingComplete(true);
                    navigate('/feed');
                }
                setProgreso(10 - res.data.faltantes);
            })
            .catch(err => console.error(err));

            axios.get(`${API_URL}/usuarios/semillas/${userId}`)
                .then(res => setSeleccionadas(res.data))
                .catch(err => console.error("Error cargando semillas guardadas", err));
        }
    }, [userId, navigate, setOnboardingComplete]);

    useEffect(() => {
        if (busqueda.trim().length < 2) { setResultados([]); return; }
        setBuscando(true);
        const timer = setTimeout(() => {
            axios.get(`${API_URL}/buscar?q=${busqueda}`)
                .then(res => { setResultados(res.data); setBuscando(false); })
                .catch(() => setBuscando(false));
        }, 600);
        return () => clearTimeout(timer);
    }, [busqueda]);

    // Función crucial para evitar el parpadeo de rutas
    const finalizarOnboarding = () => {
        setOnboardingComplete(true);
        setTimeout(() => navigate('/feed'), 100);
    };

    const handleSpotifyImport = async () => {
        if (!spotifyUrl) return;
        setCargando(true);
        try {
            const res = await axios.post(`${API_URL}/importar-playlist-spotify`, {
                id_usuario: userId,
                spotify_playlist_id: spotifyUrl
            });
            
            const nuevasCanciones = res.data.canciones;
            setSeleccionadas(prev => {
                const combined = [...prev, ...nuevasCanciones];
                // Evitar duplicados visuales por id
                return Array.from(new Map(combined.map(item => [item.id, item])).values());
            });
            setProgreso(res.data.total_semillas);
            
            if (res.data.total_semillas >= 10) {
                finalizarOnboarding();
            }
            setShowSpotifyModal(false);
            setSpotifyUrl("");
        } catch (error) {
            alert("Error importando playlist. Verifica que sea pública.");
        } finally {
            setCargando(false);
        }
    };

    const seleccionarSemilla = async (cancion) => {
        if (cargando || seleccionadas.find(s => s.id === cancion.id)) return;
        setCargando(true);
        try {
            const res = await axios.post(`${API_URL}/usuarios/registrar-semilla`, {
                id_usuario: userId,
                cancion: {
                    id_externo: String(cancion.id), plataforma: 'DEEZER',
                    titulo: cancion.titulo, artista: cancion.artista,
                    imagen_url: cancion.imagen, preview_url: cancion.preview || null
                }
            });
            setSeleccionadas(prev => [...prev, cancion]);
            setProgreso(res.data.total);
            if (res.data.total >= 10) finalizarOnboarding();
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    const eliminarSemilla = async (cancionId) => {
        try {
            const res = await axios.delete(`${API_URL}/usuarios/eliminar-semilla`, {
                data: { id_usuario: userId, id_externo: String(cancionId) }
            });
            setSeleccionadas(prev => prev.filter(s => s.id !== cancionId));
            setProgreso(res.data.total);
        } catch (error) { console.error(error); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', background: '#e0e5ec', padding: isMobile ? '20px' : '40px', gap: '30px', justifyContent: 'center' }}>
            
            <div style={{ width: isMobile ? '100%' : '380px', position: isMobile ? 'static' : 'sticky', top: '40px' }}>
                <div className="neumorphic-card" style={{ padding: '30px', textAlign: 'center' }}>
                    <FiMusic size={35} color="#6a11cb" style={{ marginBottom: '15px' }} />
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Define tu Estilo</h1>
                    
                    {/* Botón de Spotify integrado */}
                    <button 
                        onClick={() => setShowSpotifyModal(true)}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '15px', border: 'none',
                            background: '#1DB954', color: 'white', fontWeight: 'bold',
                            cursor: 'pointer', marginBottom: '20px', boxShadow: '4px 4px 8px #bebebe'
                        }}
                    >
                        Importar de Spotify
                    </button>

                    <div style={{ height: '18px', background: '#e0e0e0', borderRadius: '15px', margin: '20px 0', padding: '3px', boxShadow: 'inset 4px 4px 8px #bebebe' }}>
                        <div style={{ width: `${(progreso / 10) * 100}%`, background: 'linear-gradient(90deg, #6a11cb, #2575fc)', height: '100%', borderRadius: '10px', transition: 'width 0.5s' }} />
                    </div>
                    <h2 style={{ fontWeight: '800', marginBottom: '25px' }}>{progreso} / 10</h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', borderTop: '1px solid #d1d9e6', paddingTop: '20px' }}>
                        {seleccionadas.map((s) => (
                            <div key={s.id} style={{ position: 'relative', width: '55px', height: '55px' }}>
                                <img src={s.imagen} alt="selected" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover', boxShadow: '3px 3px 6px #bebebe' }} />
                                <button onClick={() => eliminarSemilla(s.id)} style={{ position: 'absolute', top: '-6px', left: '-6px', background: '#ff4b2b', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '10px' }}>
                                    <FiX />
                                </button>
                            </div>
                        ))}
                        {[...Array(max(0, 10 - seleccionadas.length))].map((_, i) => (
                            <div key={i} style={{ width: '55px', height: '55px', borderRadius: '10px', background: '#d1d9e6', border: '2px dashed #b8c2d1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b8c2d1' }}><FiPlus size={14} /></div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div style={{ 
                    position: 'relative', marginBottom: '25px', width: '100%',
                    background: 'var(--color-bg-primary)', borderRadius: '50px',
                    boxShadow: 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff',
                    display: 'flex', alignItems: 'center', padding: '5px'
                }}>
                    <FiSearch size={20} color="#6a11cb" style={{ marginLeft: '20px' }} />
                    <input 
                        type="text" 
                        placeholder="Busca artistas o canciones..." 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                        style={{ 
                            flex: 1, border: 'none', background: 'transparent', padding: '15px',
                            outline: 'none', fontSize: '1rem', color: '#444', fontWeight: '500'
                        }}
                    />
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', maxHeight: '600px' }}>
                    {buscando ? (
                        <p style={{ textAlign: 'center', color: '#6a11cb', fontWeight: '600', padding: '20px' }}>🎧 Escaneando...</p>
                    ) : (
                        resultados.map(t => (
                            <SearchItem 
                                key={t.id} 
                                track={t} 
                                onSelect={seleccionarSemilla} 
                                disabled={cargando || seleccionadas.some(s => s.id === t.id)} 
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modal para importar playlist */}
            {showSpotifyModal && (
                <div className="modal-overlay">
                    <div className="neumorphic-modal">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                            <h3 style={{margin:0, color:'#1DB954'}}>Importar Playlist</h3>
                            <button onClick={() => setShowSpotifyModal(false)} className="btn-mini-action" style={{boxShadow:'none'}}><FiX/></button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Pega el link de Spotify..." 
                            value={spotifyUrl}
                            onChange={(e) => setSpotifyUrl(e.target.value)}
                            className="search-input-clean"
                            style={{boxShadow:'inset 2px 2px 5px #bebebe', borderRadius:'10px', marginBottom:'15px'}}
                        />
                        <button onClick={handleSpotifyImport} className="btn-primary" style={{width:'100%'}} disabled={cargando}>
                            {cargando ? "Analizando..." : "Comenzar Importación"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const max = (a, b) => (a > b ? a : b);

export default Onboarding;