/* ========================================
   AnimeSection.jsx - Anime Section with Filters
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as anilistApi from '../../utils/anilist';
import { useApp } from '../../context/AppContext';
import ContentGrid from '../cards/ContentGrid';
import './Sections.css';

function AnimeSection({ onPlay, onEdit, searchQuery }) {
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

  // Load Anime with filters
  const loadAnime = useCallback(async (pageNum = 1, append = false) => {
    console.log('AnimeSection: Loading anime, page:', pageNum, 'filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (searchQuery && searchQuery.trim()) {
        setIsSearchMode(true);
        console.log('AnimeSection: Searching for:', searchQuery);
        data = await anilistApi.searchAnime(searchQuery, pageNum);
      } else {
        setIsSearchMode(false);
        console.log('AnimeSection: Getting anime with filters:', filters);
        
        // Pass filters to API
        data = await anilistApi.getPopularAnime(pageNum, 20, {
          genre: filters.genre || undefined,
          year: filters.year || undefined,
          rating: filters.rating || undefined,
          format: filters.format || undefined,
          status: filters.status || undefined,
          sort: filters.sort || undefined
        });
      }

      console.log('AnimeSection: Received data:', data);

      if (!mountedRef.current) return;

      // Handle both {results: [...]} format and direct array format
      const results = data?.results || (Array.isArray(data) ? data : []);
      console.log('AnimeSection: Results count:', results.length);
      
      const animeWithType = results.map(a => ({ ...a, type: 'anime' }));

      if (append) {
        setItems(prev => [...prev, ...animeWithType]);
      } else {
        setItems(animeWithType);
      }

      setHasMore(animeWithType.length >= 20);
    } catch (err) {
      console.error('AnimeSection: Error loading anime:', err);
      if (mountedRef.current) {
        setError(`Failed to load anime: ${err.message}`);
        actions?.addNotification?.('Error loading anime', 'error');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [searchQuery, filters.genre, filters.year, filters.rating, filters.format, filters.status, filters.sort, actions]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Create a filter key to track changes
  useEffect(() => {
    const filterKey = JSON.stringify({
      genre: filters.genre,
      year: filters.year,
      rating: filters.rating,
      format: filters.format,
      status: filters.status,
      sort: filters.sort,
      search: searchQuery
    });
    
    if (filterKey !== activeFilters) {
      console.log('AnimeSection: Filters changed, reloading...', filterKey);
      setActiveFilters(filterKey);
      setPage(1);
      setItems([]);
      loadAnime(1, false);
    }
  }, [filters.genre, filters.year, filters.rating, filters.format, filters.status, filters.sort, searchQuery, activeFilters, loadAnime]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadAnime(nextPage, true);
    }
  }, [loading, hasMore, page, loadAnime]);

  // Build filter description
  const getFilterDescription = () => {
    const parts = [];
    if (filters.genre) parts.push(filters.genre);
    if (filters.year) parts.push(filters.year);
    if (filters.rating) parts.push(`${filters.rating}+ ★`);
    if (filters.format) parts.push(filters.format);
    if (filters.status) parts.push(filters.status);
    return parts.length > 0 ? ` (${parts.join(', ')})` : '';
  };

  return (
    <section className="section anime-section">
      <div className="section-header">
        <h2 className="section-title">
          {isSearchMode 
            ? `🔍 Search: "${searchQuery}"` 
            : `🎌 Popular Anime${getFilterDescription()}`
          }
        </h2>
        {!isSearchMode && items.length > 0 && (
          <span className="result-count">{items.length} results</span>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => loadAnime(1, false)}>Try Again</button>
        </div>
      )}

      <ContentGrid
        items={items}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onPlay={onPlay}
        onEdit={onEdit}
        emptyMessage={isSearchMode ? 'No anime found for your search' : 'No anime found matching your filters'}
      />
    </section>
  );
}

export default AnimeSection;
