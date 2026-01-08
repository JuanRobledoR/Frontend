import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiMusic, FiMail } from 'react-icons/fi';

// Estilo base
const inputStyle = {
    width: '100%', padding: '15px 15px 15px 45px', border: 'none', borderRadius: '15px',
    background: 'var(--color-bg-primary)', color: '#222', outline: 'none', fontWeight: '500',
    boxShadow: 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff', boxSizing: 'border-box'
};

const btnStyle = {
    width: '100%', padding: '15px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none',
    borderRadius: '15px', color: 'white', cursor: 'pointer', marginTop: '10px',
    background: 'linear-gradient(145deg, #6a11cb, #2575fc)', boxShadow: '4px 4px 10px rgba(106, 17, 203, 0.3)'
};

const iconStyle = { position: 'absolute', left: '15px', top: '18px', color: '#6a11cb', zIndex: 10 };

// Logo reutilizable
const AuthLogo = () => (
    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-bg-primary)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff' }}>
        <FiMusic size={30} color="#6a11cb" />
    </div>
);

// Vista login
export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ user: '', pass: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(form.user, form.pass);
        if (res.success) navigate('/'); 
        else alert(res.msg); 
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#e0e5ec' }}>
            <div className="neumorphic-card" style={{ padding: '40px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                <AuthLogo />
                <h1 style={{ color: '#222', fontWeight: '800', fontSize: '2rem', marginBottom: '5px' }}>BeatMatch</h1>
                <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>Sincroniza tu ritmo interior</p>
                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <FiUser style={iconStyle} />
                        <input style={inputStyle} type="text" placeholder="Usuario" onChange={e => setForm({...form, user: e.target.value})} />
                    </div>
                    <div style={{ position: 'relative', marginBottom: '25px' }}>
                        <FiLock style={iconStyle} />
                        <input style={inputStyle} type="password" placeholder="Contraseña" onChange={e => setForm({...form, pass: e.target.value})} />
                    </div>
                    <button type="submit" style={btnStyle}>Entrar</button>
                </form>
                <p style={{ marginTop: '25px', fontSize: '0.9rem' }}>
                    ¿Eres nuevo? <Link to="/register" style={{ color: '#2575fc', fontWeight: 'bold' }}>Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

// Vista registro
export const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ user: '', email: '', pass: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(form.user, form.email, form.pass);
        if (res.success) navigate('/onboarding');
        else alert(res.msg);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#e0e5ec' }}>
            <div className="neumorphic-card" style={{ padding: '40px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                <AuthLogo />
                <h1 style={{ color: '#222', fontWeight: '800', fontSize: '2rem', marginBottom: '5px' }}>Únete</h1>
                <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>Crea tu perfil musical inteligente</p>
                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <FiUser style={iconStyle} />
                        <input style={inputStyle} type="text" placeholder="Nombre de usuario" onChange={e => setForm({...form, user: e.target.value})} />
                    </div>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <FiMail style={iconStyle} />
                        <input style={inputStyle} type="email" placeholder="Correo electrónico" onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div style={{ position: 'relative', marginBottom: '25px' }}>
                        <FiLock style={iconStyle} />
                        <input style={inputStyle} type="password" placeholder="Contraseña" onChange={e => setForm({...form, pass: e.target.value})} />
                    </div>
                    <button type="submit" style={btnStyle}>Registrarme</button>
                </form>
                <p style={{ marginTop: '25px', fontSize: '0.9rem' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#2575fc', fontWeight: 'bold' }}>Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};