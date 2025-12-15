import React from 'react';
import SongCard from './SongCard';
import axios from 'axios';
import { useFeed } from './FeedContext';
import { useAuth } from './AuthContext';

const API_URL = "http://localhost:8000";

const SongSwiper = () => {
    const { feed, currentIndex, setCurrentIndex, isLoading } = useFeed();
    const { userId } = useAuth();

    const handleDecision = async (type) => {
        const song = feed[currentIndex];
        if (!song) return;

        // Avanzar UI inmediatamente
        if (currentIndex < feed.length - 1) setCurrentIndex(prev => prev + 1);

        // Llamada Backend (Sin esperar para fluidez)
        const endpoint = type === 'like' ? 'like' : 'dislike';
        try {
            await axios.post(`${API_URL}/interacciones/${endpoint}`, {
                id_usuario: userId || 1, // Fallback a 1 si no hay login real
                cancion: {
                    id_externo: String(song.id),
                    plataforma: 'DEEZER',
                    titulo: song.titulo,
                    artista: song.artista,
                    imagen_url: song.imagen,
                    preview_url: song.preview
                }
            });
        } catch (e) {
            console.error("Error guardando interacción", e);
        }
    };

    if (isLoading && feed.length === 0) return <div style={{marginTop:100}}>Cargando música...</div>;

    const currentSong = feed[currentIndex];

    return (
        <div className="feed-container">
            {currentSong ? (
                <SongCard 
                    song={currentSong} 
                    onLike={() => handleDecision('like')}
                    onDislike={() => handleDecision('dislike')}
                />
            ) : (
                <div style={{padding:20}}>No hay más canciones disponibles.</div>
            )}
        </div>
    );
};
export default SongSwiper;