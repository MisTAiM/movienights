/* ========================================
   DiscoverSection.jsx - Discover/Trending Section
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as tmdbApi from '../../utils/tmdb';
import * as anilistApi from '../../utils/anilist';
import { useApp } from '../../context/AppContext';
import ContentGrid from '../cards/ContentGrid';
import './Sections.css';

function DiscoverSection({ onPlay, onEdit, searchQuery }) {
  const { actions } = useApp();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('all');
  
  const mountedRef = useRef(true);

  // Load trending content
  const loadContent = useCallback(async (pageNum = 1, append = false) => {
    console.log('DiscoverSection: Loading content, page:', pageNum, 'category:', category);
    setLoading(true);
    setError(null);
    
    try {
      let newItems = [];

      // Handle search query
      if (searchQuery && searchQuery.trim()) {
        console.log('DiscoverSection: Searching for:', searchQuery);
        const searchResults = await tmdbApi.search(searchQuery, 'multi', pageNum);
        if (searchResults?.results) {
          newItems = searchResults.results.map(item => ({
            ...item,
            type: item.media_type || 'movie',
            title: item.title || item.name
          }));
        }
      } else {
        // Load trending content
        if (category === 'all' || category === 'movies') {
          try {
            console.log('DiscoverSection: Fetching trending movies...');
            const moviesData = await tmdbApi.getTrending('movie', 'week', pageNum);
            console.log('DiscoverSection: Movies data:', moviesData);
            if (moviesData?.results) {
              newItems = [...newItems, ...moviesData.results.map(m => ({ ...m, type: 'movie' }))];
            }
          } catch (e) {
            console.error('DiscoverSection: Error loading movies:', e);
          }
        }

        if (category === 'all' || category === 'tv') {
          try {
            console.log('DiscoverSection: Fetching trending TV...');
            const tvData = await tmdbApi.getTrending('tv', 'week', pageNum);
            console.log('DiscoverSection: TV data:', tvData);
            if (tvData?.results) {
              newItems = [...newItems, ...tvData.results.map(t => ({ ...t, type: 'tv' }))];
            }
          } catch (e) {
            console.error('DiscoverSection: Error loading TV shows:', e);
          }
        }

        if (category === 'all' || category === 'anime') {
          try {
            console.log('DiscoverSection: Fetching trending anime...');
            const animeData = await anilistApi.getTrendingAnime(pageNum);
            console.log('DiscoverSection: Anime data:', animeData);
            // Handle both {results: [...]} format and direct array format
            const animeResults = animeData?.results || (Array.isArray(animeData) ? animeData : []);
            if (animeResults.length > 0) {
              newItems = [...newItems, ...animeResults.map(a => ({ ...a, type: 'anime' }))];
            }
          } catch (e) {
            console.error('DiscoverSection: Error loading anime:', e);
          }
        }

        // Shuffle for variety
        newItems = newItems.sort(() => Math.random() - 0.5);
      }

      console.log('DiscoverSection: Total items loaded:', newItems.length);

      if (!mountedRef.current) return;

      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      setHasMore(newItems.length >= 10);
      
      if (newItems.length === 0 && !searchQuery) {
        setError('No content available. Please check your connection and try again.');
      }
    } catch (err) {
      console.error('DiscoverSection: Error loading content:', err);
      if (mountedRef.current) {
        setError(`Failed to load content: ${err.message}`);
        actions?.addNotification?.('Error loading content', 'error');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [category, searchQuery, actions]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initial load and when category/search changes
  useEffect(() => {
    console.log('DiscoverSection: useEffect triggered, category:', category, 'search:', searchQuery);
    setPage(1);
    setItems([]);
    loadContent(1, false);
  }, [category, searchQuery, loadContent]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadContent(nextPage, true);
    }
  }, [loading, hasMore, page, loadContent]);

  return (
    <section className="section discover-section">
      <div className="section-header">
        <h2 className="section-title">
          {searchQuery ? `🔍 Search: "${searchQuery}"` : '🔥 Trending Now'}
        </h2>
        {!searchQuery && (
          <div className="category-tabs">
            <button
              className={`category-tab ${category === 'all' ? 'active' : ''}`}
              onClick={() => setCategory('all')}
            >
              All
            </button>
            <button
              className={`category-tab ${category === 'movies' ? 'active' : ''}`}
              onClick={() => setCategory('movies')}
            >
              Movies
            </button>
            <button
              className={`category-tab ${category === 'tv' ? 'active' : ''}`}
              onClick={() => setCategory('tv')}
            >
              TV Shows
            </button>
            <button
              className={`category-tab ${category === 'anime' ? 'active' : ''}`}
              onClick={() => setCategory('anime')}
            >
              Anime
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => loadContent(1, false)}>Try Again</button>
        </div>
      )}

      <ContentGrid
        items={items}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onPlay={onPlay}
        onEdit={onEdit}
        emptyMessage={searchQuery ? "No results found" : "No trending content found"}
      />
    </section>
  );
}

export default DiscoverSection;
