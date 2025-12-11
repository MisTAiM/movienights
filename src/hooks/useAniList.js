/* ========================================
   useAniList.js - AniList API Hook
   ======================================== */

import { useState, useCallback } from 'react';
import * as anilist from '../utils/anilist';

/**
 * Custom hook for AniList API operations
 * @returns {Object} AniList API methods and state
 */
export function useAniList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Generic fetch wrapper
  const fetchWithState = useCallback(async (fetchFn, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get popular anime
  const getPopularAnime = useCallback(async (page = 1, perPage = 24, filters = {}) => {
    return fetchWithState(anilist.getPopularAnime, page, perPage, filters);
  }, [fetchWithState]);

  // Search anime
  const searchAnime = useCallback(async (query, page = 1, perPage = 24) => {
    return fetchWithState(anilist.searchAnime, query, page, perPage);
  }, [fetchWithState]);

  // Get anime details
  const getAnimeDetails = useCallback(async (id) => {
    return fetchWithState(anilist.getAnimeDetails, id);
  }, [fetchWithState]);

  // Get trending anime
  const getTrendingAnime = useCallback(async (page = 1, perPage = 24) => {
    return fetchWithState(anilist.getTrendingAnime, page, perPage);
  }, [fetchWithState]);

  // Get anime genres
  const getAnimeGenres = useCallback(async () => {
    return anilist.getAnimeGenres();
  }, []);

  // Get streaming sources
  const getStreamingSources = useCallback((anime, episode = 1, language = 'sub') => {
    return anilist.getStreamingSources(anime, episode, language);
  }, []);

  // Clear state
  const clearState = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // State
    loading,
    error,
    data,
    
    // Methods
    getPopularAnime,
    searchAnime,
    getAnimeDetails,
    getTrendingAnime,
    getAnimeGenres,
    getStreamingSources,
    clearState
  };
}

export default useAniList;
