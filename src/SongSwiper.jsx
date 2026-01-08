import React, { useEffect } from 'react';
import SongCard from './SongCard';
import axios from 'axios';
import { useFeed } from './FeedContext';
import { useAuth } from './AuthContext';

const API_URL = "https://backend-nx0h.onrender.com/";

const SongSwiper = () => {
    const { feed, currentIndex, setCurrentIndex, isLoading, refreshFeed } = useFeed();
    const { userId } = useAuth();

    useEffect(() => {
        if (feed.length === 0 && !isLoading) {
            refreshFeed();
        }
    }, [feed.length, isLoading, refreshFeed]);

    const handleDecision = async (type) => {
        const song = feed[currentIndex];
        if (!song || !userId) return;

        const endpoint = type === 'like' ? 'like' : 'dislike';
        try {
            await axios.post(`${API_URL}/interacciones/${endpoint}`, {
                id_usuario: userId,
                cancion: {
                    id_externo: String(song.id_externo || song.id), 
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

        if (currentIndex === feed.length - 1) {
            refreshFeed();
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };


    if (isLoading && feed.length === 0) {
        return (
            <div className="feed-container">
                <p style={{ color: '#6a11cb', fontWeight: 'bold' }}>
                    🧬 Evolucionando tu playlist...
                </p>
            </div>
        );
    }

    const currentSong = feed[currentIndex];

    return (
        <div className="feed-container">
            {currentSong ? (
                <SongCard 
                    key={currentSong.id_externo || currentSong.id} 
                    song={currentSong} 
                    onLike={() => handleDecision('like')}
                    onDislike={() => handleDecision('dislike')}
                />
            ) : (
                <div style={{ padding: 20, color: '#222', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '20px' }}>No hay más canciones disponibles.</h3>
                    <button className="btn-primary" onClick={refreshFeed}>
                        🔄 Reintentar evolución
                    </button>
                </div>
            )}
        </div>
    );
};

export default SongSwiper;