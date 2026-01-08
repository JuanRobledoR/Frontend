import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const inputStyle = {
    width: '100%', padding: '15px', border: 'none', borderRadius: '15px',
    background: 'var(--color-bg-primary)', color: '#222', marginBottom: '20px',
    boxShadow: 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff', outline: 'none',
    fontWeight: '500'
};

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ user: '', pass: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(form.user, form.pass);
        if (res.success) navigate('/'); // Redirige a la lógica central
        else alert(res.msg);
    };

    return (
        <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
            <div className="neumorphic-card" style={{ padding: '40px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ color: '#222', marginBottom: '10px', fontWeight: '800' }}>¡Qué onda!</h1>
                <p style={{ color: '#666', marginBottom: '30px' }}>Entra a tu cuenta BeatMatch</p>
                <form onSubmit={handleSubmit}>
                    <input style={inputStyle} type="text" placeholder="Usuario" onChange={e => setForm({...form, user: e.target.value})} />
                    <input style={inputStyle} type="password" placeholder="Contraseña" onChange={e => setForm({...form, pass: e.target.value})} />
                    <button className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>Entrar</button>
                </form>
                <p style={{ marginTop: '25px', color: '#555' }}>
                    ¿Eres nuevo? <Link to="/register" style={{ color: 'var(--color-accent-blue)', fontWeight: 'bold' }}>Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ user: '', email: '', pass: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(form.user, form.email, form.pass);
        if (res.success) navigate('/onboarding'); // Usuario nuevo directo a onboarding
        else alert(res.msg);
    };

    return (
        <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
            <div className="neumorphic-card" style={{ padding: '40px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ color: '#222', marginBottom: '10px', fontWeight: '800' }}>Únete</h1>
                <p style={{ color: '#666', marginBottom: '30px' }}>Crea tu perfil musical</p>
                <form onSubmit={handleSubmit}>
                    <input style={inputStyle} type="text" placeholder="Nombre de usuario" onChange={e => setForm({...form, user: e.target.value})} />
                    <input style={inputStyle} type="email" placeholder="Correo electrónico" onChange={e => setForm({...form, email: e.target.value})} />
                    <input style={inputStyle} type="password" placeholder="Crea una contraseña" onChange={e => setForm({...form, pass: e.target.value})} />
                    <button className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>Registrarme</button>
                </form>
                <p style={{ marginTop: '25px', color: '#555' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--color-accent-blue)', fontWeight: 'bold' }}>Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};