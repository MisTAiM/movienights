/* ========================================
   useTMDB.js - TMDB API Hook
   ======================================== */

import { useState, useCallback } from 'react';
import * as tmdb from '../utils/tmdb';

/**
 * Custom hook for TMDB API operations
 * @returns {Object} TMDB API methods and state
 */
export function useTMDB() {
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

  // Get trending content
  const getTrending = useCallback(async (mediaType = 'all', timeWindow = 'week', page = 1) => {
    return fetchWithState(tmdb.getTrending, mediaType, timeWindow, page);
  }, [fetchWithState]);

  // Get popular movies
  const getPopularMovies = useCallback(async (page = 1, filters = {}) => {
    return fetchWithState(tmdb.getPopularMovies, page, filters);
  }, [fetchWithState]);

  // Get popular TV shows
  const getPopularTVShows = useCallback(async (page = 1, filters = {}) => {
    return fetchWithState(tmdb.getPopularTVShows, page, filters);
  }, [fetchWithState]);

  // Search content
  const search = useCallback(async (query, type = 'multi', page = 1) => {
    return fetchWithState(tmdb.search, query, type, page);
  }, [fetchWithState]);

  // Get movie details
  const getMovieDetails = useCallback(async (id) => {
    return fetchWithState(tmdb.getMovieDetails, id);
  }, [fetchWithState]);

  // Get TV show details
  const getTVShowDetails = useCallback(async (id) => {
    return fetchWithState(tmdb.getTVShowDetails, id);
  }, [fetchWithState]);

  // Get TV show seasons
  const getTVShowSeasons = useCallback(async (id) => {
    return fetchWithState(tmdb.getTVShowSeasons, id);
  }, [fetchWithState]);

  // Get season episodes
  const getSeasonEpisodes = useCallback(async (tvId, seasonNumber) => {
    return fetchWithState(tmdb.getSeasonEpisodes, tvId, seasonNumber);
  }, [fetchWithState]);

  // Get movie runtime
  const getMovieRuntime = useCallback(async (id) => {
    return tmdb.getMovieRuntime(id);
  }, []);

  // Get trailer
  const getTrailer = useCallback(async (id, type = 'movie') => {
    return tmdb.getTrailer(id, type);
  }, []);

  // Get credits
  const getCredits = useCallback(async (id, type = 'movie') => {
    return fetchWithState(tmdb.getCredits, id, type);
  }, [fetchWithState]);

  // Get recommendations
  const getRecommendations = useCallback(async (id, type = 'movie', page = 1) => {
    return fetchWithState(tmdb.getRecommendations, id, type, page);
  }, [fetchWithState]);

  // Get genres
  const getGenres = useCallback(async (type = 'movie') => {
    return tmdb.getGenres(type);
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
    getTrending,
    getPopularMovies,
    getPopularTVShows,
    search,
    getMovieDetails,
    getTVShowDetails,
    getTVShowSeasons,
    getSeasonEpisodes,
    getMovieRuntime,
    getTrailer,
    getCredits,
    getRecommendations,
    getGenres,
    clearState,
    
    // Utilities
    getPosterUrl: tmdb.getPosterUrl,
    TMDB_IMG_URL: tmdb.TMDB_IMG_URL,
    TMDB_IMG_ORIGINAL: tmdb.TMDB_IMG_ORIGINAL
  };
}

export default useTMDB;
