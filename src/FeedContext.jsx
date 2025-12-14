import React, { createContext, useState, useCallback, useContext } from 'react';
import axios from 'axios';

const FeedContext = createContext();
const API_URL = "http://localhost:8000"; 
const PLAYLIST_ID = "0M0kDGL860f0n8PZ2usv6B"; 

export const FeedProvider = ({ children }) => {
  const [feed, setFeed] = useState([]);          
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [nextBatchBuffer, setNextBatchBuffer] = useState(null); 
  const [seenIds, setSeenIds] = useState([]);    
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatch = useCallback(async (existingIds) => {
    try {
      const res = await axios.post(`${API_URL}/feed-playlist`, {
        playlist_id: PLAYLIST_ID, limit: 10, seen_ids: existingIds
      });
      return res.data;
    } catch (e) { console.error(e); return []; }
  }, []);

  const inicializarFeed = useCallback(async () => {
    if (feed.length > 0) return; // SI YA HAY DATOS, NO REINICIAMOS
    setIsLoading(true);
    const batch1 = await fetchBatch([]);
    if (batch1.length > 0) {
      setFeed(batch1);
      const ids = batch1.map(t => t.id);
      setSeenIds(ids);
      fetchBatch(ids).then(b => setNextBatchBuffer(b));
    }
    setIsLoading(false);
  }, [feed.length, fetchBatch]);

  return (
    <FeedContext.Provider value={{
      feed, setFeed, currentIndex, setCurrentIndex,
      nextBatchBuffer, setNextBatchBuffer, seenIds, setSeenIds,
      isLoading, fetchBatch, inicializarFeed
    }}>
      {children}
    </FeedContext.Provider>
  );
};
export const useFeed = () => useContext(FeedContext);