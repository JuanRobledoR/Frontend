import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = "https://backend-nx0h.onrender.com/"; 

export const useAuth = () => useContext(AuthContext);

// Manejo de sesión usuario
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('beatmatch_user');
        return saved ? JSON.parse(saved) : null;
    });

    const isAuthenticated = !!user;
    const userId = user?.id_usuario;

    // Sincronización local
    useEffect(() => {
        if (user) localStorage.setItem('beatmatch_user', JSON.stringify(user));
        else localStorage.removeItem('beatmatch_user');
    }, [user]);

    // Petición de ingreso
    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { username, password });
            setUser(res.data); 
            return { success: true };
        } catch (error) {
            return { success: false, msg: error.response?.data?.detail || "Credenciales incorrectas" };
        }
    };

    // Petición de registro
    const register = async (username, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
            setUser(res.data);
            return { success: true };
        } catch (error) {
            return { success: false, msg: error.response?.data?.detail || "Error al registrar" };
        }
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, userId, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};