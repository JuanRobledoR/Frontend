import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FeedContext = createContext();
const API_URL = "https://backend-nx0h.onrender.com";

export const useFeed = () => useContext(FeedContext);

export const FeedProvider = ({ children }) => {
    const { userId, isAuthenticated } = useAuth();
    const [feed, setFeed] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    const fetchingRef = useRef(false);

    // Obtención canciones
    const fetchMoreSongs = useCallback(async (isInitial = false) => {
        if (!userId || fetchingRef.current) return;
        
        fetchingRef.current = true;
        if (isInitial) setIsLoading(true);

        try {
            const currentIds = feed.map(s => s.id);
            const excludeParam = currentIds.length > 0 ? `?exclude=${currentIds.join('&exclude=')}` : '';
            
            const res = await axios.get(`${API_URL}/generar-smart-playlist/${userId}${excludeParam}`);
            const nuevas = res.data.playlist_evolucionada;

            const filtradas = nuevas.filter(n => !currentIds.includes(n.id));
            setFeed(prev => [...prev, ...filtradas]);
        } catch (error) {
            console.error("Error cargando el feed:", error);
        } finally {
            setIsLoading(false);
            fetchingRef.current = false;
        }
    }, [userId, feed]);

    // Estado onboarding
    useEffect(() => {
        if (isAuthenticated && userId) {
            axios.get(`${API_URL}/usuarios/check-onboarding/${userId}`)
                .then(check => {
                    const completado = check.data.completado;
                    setOnboardingComplete(completado);
                    
                    if (completado && feed.length === 0 && !fetchingRef.current) {
                        fetchMoreSongs(true);
                    }
                });
        }
    }, [isAuthenticated, userId, fetchMoreSongs, feed.length]);

    // Pre-carga
    useEffect(() => {
        const cancionesRestantes = feed.length - currentIndex;
        if (cancionesRestantes > 0 && cancionesRestantes <= 5 && !isFetchingMore) {
            fetchMoreSongs(false);
        }
    }, [currentIndex, feed.length, isFetchingMore, fetchMoreSongs]);

    return (
        <FeedContext.Provider value={{ 
            feed, 
            currentIndex, 
            setCurrentIndex, 
            isLoading, 
            isFetchingMore,
            onboardingComplete,
            refreshFeed: () => { setFeed([]); setCurrentIndex(0); fetchMoreSongs(true); } 
        }}>
            {children}
        </FeedContext.Provider>
    );
};