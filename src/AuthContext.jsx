import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = "http://localhost:8000"; 

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Leemos del localStorage al inicio para mantener sesión
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('beatmatch_user');
        return saved ? JSON.parse(saved) : null;
    });
    
    // Estado derivado
    const isAuthenticated = !!user;
    const userId = user?.id_usuario; // Asegúrate que tu backend devuelve 'id_usuario'

    useEffect(() => {
        if (user) {
            localStorage.setItem('beatmatch_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('beatmatch_user');
        }
    }, [user]);

    // LOGIN: Adapta la URL a tu backend real
    const login = useCallback(async (username, password) => {
        try {
            // EJEMPLO: Ajusta '/usuarios/login' a tu ruta real
            // Como tu backend actual no tiene login, esto fallará hasta que lo crees.
            // Por ahora simularemos un login exitoso con ID 1 para que puedas probar el diseño.
            
            // --- SIMULACIÓN (BORRAR CUANDO TENGAS BACKEND DE LOGIN) ---
             const fakeUser = { id_usuario: 1, username: username };
             setUser(fakeUser);
             return true;
            // ----------------------------------------------------------

            /* CODIGO REAL (DESCOMENTAR CUANDO TENGAS BACKEND)
            const res = await axios.post(`${API_URL}/auth/login`, { username, password });
            setUser(res.data); // data debe traer { id_usuario, username, token }
            return true;
            */
        } catch (error) {
            console.error("Login error", error);
            return false;
        }
    }, []);

    const logout = useCallback(() => setUser(null), []);

    return (
        <AuthContext.Provider value={{ user, userId, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};