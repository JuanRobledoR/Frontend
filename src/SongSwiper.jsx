import React from 'react';
import SongCard from './SongCard';
import axios from 'axios';
import { useFeed } from './FeedContext';
import { useAuth } from './AuthContext';

const API_URL = "http://localhost:8000";

const SongSwiper = () => {
    const { feed, currentIndex, setCurrentIndex, isLoading, refreshFeed } = useFeed();
    const { userId } = useAuth();

    const handleDecision = async (type) => {
        const song = feed[currentIndex];
        if (!song || !userId) return;

        const endpoint = type === 'like' ? 'like' : 'dislike';
        try {
            await axios.post(`${API_URL}/interacciones/${endpoint}`, {
                id_usuario: userId,
                cancion: {
                    // Mantenemos consistencia con lo que espera el backend
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

        // Avanzar al siguiente
        if (currentIndex === feed.length - 1) {
            refreshFeed();
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (isLoading && feed.length === 0) {
        return (
            <div className="feed-container" style={{justifyContent:'center', color:'white'}}>
                <p>🧬 Evolucionando tu playlist...</p>
            </div>
        );
    }

    const currentSong = feed[currentIndex];

    return (
        <div className="feed-container">
            {currentSong ? (
                <SongCard 
                    // EL FIX: Al cambiar el ID, SongCard se reinicia completamente
                    // Esto arregla el problema de los audios que no cargan
                    key={currentSong.id_externo || currentSong.id} 
                    song={currentSong} 
                    onLike={() => handleDecision('like')}
                    onDislike={() => handleDecision('dislike')}
                />
            ) : (
                <div style={{padding:20, color:'white', textAlign:'center'}}>
                    <h3>No hay más canciones en el pool.</h3>
                    <button className="btn-primary" onClick={refreshFeed} style={{marginTop:'20px'}}>
                        🔄 Reintentar evolución
                    </button>
                </div>
            )}
        </div>
    );
};

export default SongSwiper;