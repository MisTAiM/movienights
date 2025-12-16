/* ========================================
   MoviesSection.jsx - Movies Section with Filters
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as tmdbApi from '../../utils/tmdb';
import { useApp } from '../../context/AppContext';
import ContentGrid from '../cards/ContentGrid';
import './Sections.css';

function MoviesSection({ onPlay, onEdit, searchQuery }) {
  const { state, actions } = useApp();
  const filters = state?.filters || {};
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState('');
  
  const mountedRef = useRef(true);

  // Load movies with filters
  const loadMovies = useCallback(async (pageNum = 1, append = false) => {
    console.log('MoviesSection: Loading movies, page:', pageNum, 'filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (searchQuery && searchQuery.trim()) {
        setIsSearchMode(true);
        console.log('MoviesSection: Searching for:', searchQuery);
        data = await tmdbApi.search(searchQuery, 'movie', pageNum);
      } else {
        setIsSearchMode(false);
        console.log('MoviesSection: Getting movies with filters');
        
        // Pass filters to API including language
        data = await tmdbApi.getPopularMovies(pageNum, {
          genre: filters.genre || undefined,
          year: filters.year || undefined,
          rating: filters.rating || undefined,
          language: filters.language || undefined
        });
      }

      console.log('MoviesSection: Received data:', data);

      if (!mountedRef.current) return;

      const results = data?.results || [];
      console.log('MoviesSection: Results count:', results.length);
      
      const moviesWithType = results.map(m => ({ ...m, type: 'movie' }));

      if (append) {
        setItems(prev => [...prev, ...moviesWithType]);
      } else {
        setItems(moviesWithType);
      }

      setHasMore(results.length >= 20);
    } catch (err) {
      console.error('MoviesSection: Error loading movies:', err);
      if (mountedRef.current) {
        setError(`Failed to load movies: ${err.message}`);
        actions?.addNotification?.('Error loading movies', 'error');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [searchQuery, filters.genre, filters.year, filters.rating, filters.language, actions]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Track filter changes and reload
  useEffect(() => {
    const filterKey = JSON.stringify({
      genre: filters.genre,
      year: filters.year,
      rating: filters.rating,
      language: filters.language,
      search: searchQuery
    });
    
    if (filterKey !== activeFilters) {
      console.log('MoviesSection: Filters changed, reloading...', filterKey);
      setActiveFilters(filterKey);
      setPage(1);
      setItems([]);
      loadMovies(1, false);
    }
  }, [filters.genre, filters.year, filters.rating, filters.language, searchQuery, activeFilters, loadMovies]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMovies(nextPage, true);
    }
  }, [loading, hasMore, page, loadMovies]);

  // Build filter description
  const getFilterDescription = () => {
    const parts = [];
    if (filters.genre) {
      const genreNames = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
        80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
        14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
        9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
        10752: 'War', 37: 'Western'
      };
      parts.push(genreNames[filters.genre] || filters.genre);
    }
    if (filters.year) parts.push(filters.year);
    if (filters.rating) parts.push(`${filters.rating}+ ★`);
    if (filters.language) {
      const langNames = {
        en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
        pt: 'Portuguese', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', hi: 'Hindi',
        ar: 'Arabic', ru: 'Russian', th: 'Thai', vi: 'Vietnamese', id: 'Indonesian',
        tr: 'Turkish', pl: 'Polish', nl: 'Dutch', sv: 'Swedish', da: 'Danish',
        no: 'Norwegian', fi: 'Finnish', tl: 'Filipino', he: 'Hebrew', el: 'Greek',
        cs: 'Czech', hu: 'Hungarian', ro: 'Romanian', uk: 'Ukrainian', bn: 'Bengali',
        ta: 'Tamil', te: 'Telugu', ml: 'Malayalam', mr: 'Marathi', pa: 'Punjabi'
      };
      parts.push(langNames[filters.language] || filters.language);
    }
    return parts.length > 0 ? ` (${parts.join(', ')})` : '';
  };

  return (
    <section className="section movies-section">
      <div className="section-header">
        <h2 className="section-title">
          {isSearchMode 
            ? `🔍 Search: "${searchQuery}"` 
            : `🎬 Popular Movies${getFilterDescription()}`
          }
        </h2>
        {!isSearchMode && items.length > 0 && (
          <span className="result-count">{items.length} results</span>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => loadMovies(1, false)}>Try Again</button>
        </div>
      )}

      <ContentGrid
        items={items}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onPlay={onPlay}
        onEdit={onEdit}
        emptyMessage={isSearchMode ? 'No movies found for your search' : 'No movies found matching your filters'}
      />
    </section>
  );
}

export default MoviesSection;
