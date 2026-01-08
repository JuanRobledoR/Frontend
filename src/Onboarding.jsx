import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiPause, FiPlus, FiMusic } from 'react-icons/fi';

const API_URL = "http://localhost:8000";

const SearchItem = ({ track, onSelect, disabled }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (playing) { audioRef.current.pause(); } 
            else { 
                audioRef.current.play().catch(() => alert("Preview no disponible")); 
            }
            setPlaying(!playing);
        }
    };

    return (
        <div className="neumorphic-card" style={{ display: 'flex', alignItems: 'center', padding: '15px', marginBottom: '15px', background: '#f5f5f5' }}>
            <img src={track.imagen} alt={track.titulo} style={{ width: '60px', height: '60px', borderRadius: '12px', marginRight: '15px', objectFit: 'cover' }} />
            
            <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.titulo}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {track.artista}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {track.preview && (
                    <button onClick={togglePlay} className="btn-icon" style={{ width: '40px', height: '40px', color: playing ? '#1DB954' : '#a3c4db' }}>
                        {playing ? <FiPause size={20}/> : <FiPlay size={20}/>}
                    </button>
                )}
                <button onClick={() => onSelect(track)} disabled={disabled} className="btn-primary" style={{ width: '40px', height: '40px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <FiPlus size={20}/>
                </button>
            </div>
            {track.preview && <audio ref={audioRef} src={track.preview} onEnded={() => setPlaying(false)} />}
        </div>
    );
};

const Onboarding = () => {
    const { userId } = useAuth();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [progreso, setProgreso] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [buscando, setBuscando] = useState(false);

    useEffect(() => {
        if(userId) {
            axios.get(`${API_URL}/usuarios/check-onboarding/${userId}`)
            .then(res => {
                if (res.data.completado) navigate('/feed');
                setProgreso(10 - res.data.faltantes);
            })
            .catch(err => console.error(err));
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (busqueda.trim().length < 2) { setResultados([]); return; }
        setBuscando(true);
        const timer = setTimeout(() => {
            axios.get(`${API_URL}/buscar?q=${busqueda}`)
                .then(res => {
                    setResultados(res.data);
                    setBuscando(false);
                })
                .catch(() => setBuscando(false));
        }, 600);
        return () => clearTimeout(timer);
    }, [busqueda]);

    const seleccionarSemilla = async (cancion) => {
        if(cargando) return;
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
            setProgreso(res.data.total);
            setBusqueda("");
            setResultados([]);
            if (res.data.total >= 10) navigate('/feed');
        } catch (error) { console.error(error); } 
        finally { setCargando(false); }
    };

    return (
        <div className="page-content" style={{ padding: '30px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', background: 'var(--color-bg-primary)' }}>
            <div className="neumorphic-card" style={{ padding: '30px 20px', marginBottom: '30px' }}>
                <FiMusic size={40} style={{ color: 'var(--color-accent-blue)', marginBottom: '10px' }} />
                <h1 style={{ color: '#222', marginBottom: '5px', fontWeight: '800' }}>Define tu Estilo</h1>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>Elige 10 canciones para entrenar a tu IA.</p>
                <div style={{ height: '20px', background: '#e0e0e0', borderRadius: '15px', margin: '20px 0', padding: '3px', boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff' }}>
                    <div style={{ width: `${(progreso / 10) * 100}%`, background: 'linear-gradient(90deg, #a3c4db, #6a11cb)', height: '100%', borderRadius: '10px', transition: 'width 0.8s ease' }}></div>
                </div>
                <h2 style={{ color: '#444' }}>{progreso} / 10</h2>
            </div>
            <input type="text" className="neumorphic-input" placeholder="Busca un artista..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            <div style={{ marginTop: '20px', maxHeight: '50vh', overflowY: 'auto' }}>
                {buscando && <p>📡 Buscando...</p>}
                {resultados.map(t => <SearchItem key={t.id} track={t} onSelect={seleccionarSemilla} disabled={cargando} />)}
            </div>
        </div>
    );
};

export default Onboarding;