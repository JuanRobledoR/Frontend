// FeedContext.jsx actualizado
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FeedContext = createContext();
const API_URL = "http://localhost:8000";

export const useFeed = () => useContext(FeedContext);

export const FeedProvider = ({ children }) => {
    const { userId, isAuthenticated } = useAuth();
    const [feed, setFeed] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // Solo para la carga inicial
    const [isFetchingMore, setIsFetchingMore] = useState(false); // Carga silenciosa
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    // Evitar peticiones duplicadas
    const fetchingRef = useRef(false);

    const fetchMoreSongs = useCallback(async (isInitial = false) => {
    if (!userId || fetchingRef.current) return;
    
    fetchingRef.current = true;
    if (isInitial) setIsLoading(true);

    try {
        // Obtenemos los IDs que ya están en el feed actual de React para avisarle al backend
        const currentIds = feed.map(s => s.id);
        const excludeParam = currentIds.length > 0 ? `?exclude=${currentIds.join('&exclude=')}` : '';
        
        const res = await axios.get(`${API_URL}/generar-smart-playlist/${userId}${excludeParam}`);
        const nuevas = res.data.playlist_evolucionada;

        // Doble filtro de seguridad: No añadir si el ID ya existe en nuestro estado
        const filtradas = nuevas.filter(n => !currentIds.includes(n.id));

        setFeed(prev => [...prev, ...filtradas]);
    } catch (error) {
        console.error("Error cargando el feed:", error);
    } finally {
        setIsLoading(false);
        fetchingRef.current = false;
    }
}, [userId, feed]);

    // Verificar onboarding y carga inicial
    useEffect(() => {
        if (isAuthenticated && userId) {
            axios.get(`${API_URL}/usuarios/check-onboarding/${userId}`)
                .then(check => {
                    setOnboardingComplete(check.data.completado);
                    if (check.data.completado && feed.length === 0) {
                        fetchMoreSongs(true); // Carga inicial de 10
                    }
                });
        }
    }, [isAuthenticated, userId, fetchMoreSongs]);

    // LÓGICA DE PRE-FETCHING
    // Cuando el usuario avanza, revisamos si faltan pocas canciones
    useEffect(() => {
        const cancionesRestantes = feed.length - currentIndex;
        
        // Si solo quedan 5 canciones en el buffer, cargamos 10 más en silencio
        if (cancionesRestantes > 0 && cancionesRestantes <= 5 && !isFetchingMore) {
            console.log("🚀 Pre-cargando siguiente lote de 10...");
            fetchMoreSongs(false);
        }
    }, [currentIndex, feed.length, isFetchingMore, fetchMoreSongs]);

    return (
        <FeedContext.Provider value={{ 
            feed, 
            currentIndex, 
            setCurrentIndex, 
            isLoading, 
            isFetchingMore, // Útil para mostrar un pequeño spinner discreto si quieres
            onboardingComplete,
            refreshFeed: () => { setFeed([]); setCurrentIndex(0); fetchMoreSongs(true); } 
        }}>
            {children}
        </FeedContext.Provider>
    );
};