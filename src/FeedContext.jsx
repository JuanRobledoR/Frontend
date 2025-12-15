import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FeedContext = createContext();
const API_URL = "http://localhost:8000";
// Playlist Semilla (Daft Punk o la que uses)
const PLAYLIST_SEMILLA = "0M0kDGL860f0n8PZ2usv6B"; 

export const useFeed = () => useContext(FeedContext);

export const FeedProvider = ({ children }) => {
    const { userId } = useAuth();
    
    const [feed, setFeed] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [seenIds, setSeenIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nextBatch, setNextBatch] = useState(null);

    // Función para pedir canciones al Backend
    const fetchBatch = useCallback(async (excludeIds) => {
        try {
            // Nota: Usamos tu endpoint real '/feed-playlist'
            const res = await axios.post(`${API_URL}/feed-playlist`, {
                playlist_id: PLAYLIST_SEMILLA,
                limit: 5,
                seen_ids: excludeIds
            });
            return res.data;
        } catch (e) {
            console.error("Error fetching feed:", e);
            return [];
        }
    }, []);

    // Inicializar
    useEffect(() => {
        if (feed.length === 0 && !isLoading) {
            setIsLoading(true);
            fetchBatch([]).then(data => {
                setFeed(data);
                setSeenIds(data.map(t => t.id));
                setIsLoading(false);
                // Precarga siguiente lote
                fetchBatch(data.map(t => t.id)).then(setNextBatch);
            });
        }
    }, [fetchBatch, feed.length, isLoading]);

    // Lógica infinita: Cuando nos acercamos al final, pegamos el nextBatch
    useEffect(() => {
        if (feed.length > 0 && (feed.length - currentIndex) < 3 && nextBatch) {
            console.log("🔋 Pegando lote precargado...");
            setFeed(prev => [...prev, ...nextBatch]);
            setNextBatch(null); // Limpiamos buffer
            
            // Pedimos nuevo buffer en background
            const allSeen = [...seenIds, ...nextBatch.map(t => t.id)];
            setSeenIds(allSeen);
            fetchBatch(allSeen).then(setNextBatch);
        }
    }, [currentIndex, feed, nextBatch, seenIds, fetchBatch]);

    return (
        <FeedContext.Provider value={{ feed, setFeed, currentIndex, setCurrentIndex, isLoading }}>
            {children}
        </FeedContext.Provider>
    );
};