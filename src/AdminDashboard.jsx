import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const API_URL = "http://localhost:8000";

    useEffect(() => {
        axios.get(`${API_URL}/admin/stats`)
            .then(res => setStats(res.data))
            .catch(err => console.error("Error en Dashboard:", err));
    }, []);

    if (!stats) return <div className="page-content" style={{textAlign:'center', paddingTop:'50px'}}>Cargando panel...</div>;

    return (
        <div className="page-content" style={{ padding: '30px', background: 'var(--color-bg-primary)', minHeight: '100vh' }}>
            <div className="neumorphic-card" style={{ padding: '20px', marginBottom: '30px' }}>
                <h1 style={{ color: '#222', fontWeight: '800' }}>📊 Panel Administrativo</h1>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                <div className="neumorphic-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{color:'#555', fontSize:'0.8rem'}}>USUARIOS</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent-blue)' }}>{stats.usuarios}</p>
                </div>
                <div className="neumorphic-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{color:'#555', fontSize:'0.8rem'}}>POOL CANCIONES</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.canciones_totales}</p>
                </div>
                <div className="neumorphic-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{color:'#555', fontSize:'0.8rem'}}>ANALIZADAS IA</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1DB954' }}>{stats.canciones_ia}</p>
                </div>
            </div>

            <div className="neumorphic-card" style={{ marginTop: '40px', padding: '20px' }}>
                <h3 style={{ color: '#222' }}>Últimas adiciones</h3>
                <table style={{ width: '100%', marginTop: '15px', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{borderBottom:'1px solid #ddd'}}>
                            <th style={{padding:'10px'}}>Título</th>
                            <th style={{padding:'10px'}}>Artista</th>
                            <th style={{padding:'10px'}}>Origen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recientes.map((s, i) => (
                            <tr key={i} style={{borderBottom:'1px solid #eee'}}>
                                <td style={{padding:'10px'}}>{s.titulo}</td>
                                <td style={{padding:'10px'}}>{s.artista}</td>
                                <td style={{padding:'10px'}}><span style={{background:'#eee', padding:'2px 8px', borderRadius:'5px', fontSize:'0.7rem'}}>{s.plataforma}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};