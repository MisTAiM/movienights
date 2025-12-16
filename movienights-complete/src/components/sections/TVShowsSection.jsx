/* ========================================
   TVShowsSection.jsx - TV Shows Section with Filters
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as tmdbApi from '../../utils/tmdb';
import { useApp } from '../../context/AppContext';
import ContentGrid from '../cards/ContentGrid';
import './Sections.css';

function TVShowsSection({ onPlay, onEdit, searchQuery }) {
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

  // Load TV shows with filters
  const loadTVShows = useCallback(async (pageNum = 1, append = false) => {
    console.log('TVShowsSection: Loading TV shows, page:', pageNum, 'filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (searchQuery && searchQuery.trim()) {
        setIsSearchMode(true);
        console.log('TVShowsSection: Searching for:', searchQuery);
        data = await tmdbApi.search(searchQuery, 'tv', pageNum);
      } else {
        setIsSearchMode(false);
        console.log('TVShowsSection: Getting TV shows with filters');
        
        // Pass filters to API including language
        data = await tmdbApi.getPopularTVShows(pageNum, {
          genre: filters.genre || undefined,
          year: filters.year || undefined,
          rating: filters.rating || undefined,
          language: filters.language || undefined
        });
      }

      console.log('TVShowsSection: Received data:', data);

      if (!mountedRef.current) return;

      const results = data?.results || [];
      console.log('TVShowsSection: Results count:', results.length);
      
      const showsWithType = results.map(s => ({ ...s, type: 'tv' }));

      if (append) {
        setItems(prev => [...prev, ...showsWithType]);
      } else {
        setItems(showsWithType);
      }

      setHasMore(results.length >= 20);
    } catch (err) {
      console.error('TVShowsSection: Error loading TV shows:', err);
      if (mountedRef.current) {
        setError(`Failed to load TV shows: ${err.message}`);
        actions?.addNotification?.('Error loading TV shows', 'error');
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
      console.log('TVShowsSection: Filters changed, reloading...', filterKey);
      setActiveFilters(filterKey);
      setPage(1);
      setItems([]);
      loadTVShows(1, false);
    }
  }, [filters.genre, filters.year, filters.rating, filters.language, searchQuery, activeFilters, loadTVShows]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTVShows(nextPage, true);
    }
  }, [loading, hasMore, page, loadTVShows]);

  // Build filter description
  const getFilterDescription = () => {
    const parts = [];
    if (filters.genre) {
      const genreNames = {
        10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy',
        80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
        10762: 'Kids', 9648: 'Mystery', 10763: 'News', 10764: 'Reality',
        10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk',
        10768: 'War & Politics', 37: 'Western'
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
    <section className="section tvshows-section">
      <div className="section-header">
        <h2 className="section-title">
          {isSearchMode 
            ? `🔍 Search: "${searchQuery}"` 
            : `📺 Popular TV Shows${getFilterDescription()}`
          }
        </h2>
        {!isSearchMode && items.length > 0 && (
          <span className="result-count">{items.length} results</span>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => loadTVShows(1, false)}>Try Again</button>
        </div>
      )}

      <ContentGrid
        items={items}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onPlay={onPlay}
        onEdit={onEdit}
        emptyMessage={isSearchMode ? 'No TV shows found for your search' : 'No TV shows found matching your filters'}
      />
    </section>
  );
}

export default TVShowsSection;
