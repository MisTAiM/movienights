/* ========================================
   Toolbar.jsx - Section-Aware Toolbar Component
   ======================================== */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getYearRange } from '../../utils/helpers';
import './Toolbar.css';

// TMDB Movie Genres
const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

// TMDB TV Genres
const tvGenres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
];

// AniList Anime Genres
const animeGenres = [
  { id: 'Action', name: 'Action' },
  { id: 'Adventure', name: 'Adventure' },
  { id: 'Comedy', name: 'Comedy' },
  { id: 'Drama', name: 'Drama' },
  { id: 'Ecchi', name: 'Ecchi' },
  { id: 'Fantasy', name: 'Fantasy' },
  { id: 'Horror', name: 'Horror' },
  { id: 'Mahou Shoujo', name: 'Mahou Shoujo' },
  { id: 'Mecha', name: 'Mecha' },
  { id: 'Music', name: 'Music' },
  { id: 'Mystery', name: 'Mystery' },
  { id: 'Psychological', name: 'Psychological' },
  { id: 'Romance', name: 'Romance' },
  { id: 'Sci-Fi', name: 'Sci-Fi' },
  { id: 'Slice of Life', name: 'Slice of Life' },
  { id: 'Sports', name: 'Sports' },
  { id: 'Supernatural', name: 'Supernatural' },
  { id: 'Thriller', name: 'Thriller' }
];

// Anime-specific filters
const animeFormats = [
  { id: 'TV', name: 'TV Series' },
  { id: 'TV_SHORT', name: 'TV Short' },
  { id: 'MOVIE', name: 'Movie' },
  { id: 'SPECIAL', name: 'Special' },
  { id: 'OVA', name: 'OVA' },
  { id: 'ONA', name: 'ONA' },
  { id: 'MUSIC', name: 'Music Video' }
];

const animeStatuses = [
  { id: 'RELEASING', name: 'Currently Airing' },
  { id: 'FINISHED', name: 'Finished' },
  { id: 'NOT_YET_RELEASED', name: 'Not Yet Released' },
  { id: 'CANCELLED', name: 'Cancelled' }
];

const animeSortOptions = [
  { id: 'POPULARITY_DESC', name: 'Most Popular' },
  { id: 'SCORE_DESC', name: 'Highest Rated' },
  { id: 'TRENDING_DESC', name: 'Trending' },
  { id: 'START_DATE_DESC', name: 'Newest First' },
  { id: 'FAVOURITES_DESC', name: 'Most Favorites' },
  { id: 'EPISODES_DESC', name: 'Most Episodes' }
];

function Toolbar({ onSearch }) {
  const { state, actions } = useApp();
  const { currentSection, currentViewMode, currentSort, filters } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const years = getYearRange(1950);

  // Get genres based on current section
  const currentGenres = useMemo(() => {
    switch (currentSection) {
      case 'anime':
        return animeGenres;
      case 'tvshows':
        return tvGenres;
      case 'movies':
      default:
        return movieGenres;
    }
  }, [currentSection]);

  // Check if we're in anime section
  const isAnimeSection = currentSection === 'anime';

  // Reset filters when section changes
  useEffect(() => {
    actions.setFilters({
      genre: '',
      year: '',
      rating: '',
      status: '',
      format: '',
      sort: ''
    });
  }, [currentSection]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  };

  const handleFilterChange = (filterName, value) => {
    console.log('Filter changed:', filterName, value);
    actions.setFilters({ [filterName]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    actions.setFilters({
      genre: '',
      year: '',
      rating: '',
      status: '',
      format: '',
      sort: ''
    });
    actions.addNotification('Filters cleared', 'info');
  };

  // Check if any filters are active
  const hasActiveFilters = filters.genre || filters.year || filters.rating || 
                           filters.status || filters.format || filters.sort;

  return (
    <div className="elegant-toolbar">
      {/* View Mode */}
      <div className="toolbar-section">
        <div className="view-modes">
          <button
            className={`tool-btn ${currentViewMode === 'grid' ? 'active' : ''}`}
            onClick={() => actions.setViewMode('grid')}
            title="Grid View"
          >
            <span className="btn-icon">▦</span>
          </button>
          <button
            className={`tool-btn ${currentViewMode === 'list' ? 'active' : ''}`}
            onClick={() => actions.setViewMode('list')}
            title="List View"
          >
            <span className="btn-icon">☰</span>
          </button>
          <button
            className={`tool-btn ${currentViewMode === 'compact' ? 'active' : ''}`}
            onClick={() => actions.setViewMode('compact')}
            title="Compact View"
          >
            <span className="btn-icon">▤</span>
          </button>
        </div>
      </div>

      {/* Sort - Different for Anime */}
      <div className="toolbar-section">
        <div className="elegant-select-wrapper">
          {isAnimeSection ? (
            <select
              className="elegant-select"
              value={filters.sort || ''}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="">Sort By</option>
              {animeSortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="elegant-select"
              value={currentSort}
              onChange={(e) => actions.setSort(e.target.value)}
            >
              <option value="default">Default Sort</option>
              <option value="title">Title A-Z</option>
              <option value="rating">Highest Rated</option>
              <option value="year">Newest First</option>
              <option value="dateAdded">Recently Added</option>
            </select>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="toolbar-section filter-group">
        {/* Genre Filter */}
        <div className="elegant-select-wrapper">
          <select
            className="elegant-select"
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
          >
            <option value="">All Genres</option>
            {currentGenres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="elegant-select-wrapper">
          <select
            className="elegant-select"
            value={filters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div className="elegant-select-wrapper">
          <select
            className="elegant-select"
            value={filters.rating || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="9">9+ ★</option>
            <option value="8">8+ ★</option>
            <option value="7">7+ ★</option>
            <option value="6">6+ ★</option>
            <option value="5">5+ ★</option>
          </select>
        </div>

        {/* Anime-specific: Format Filter */}
        {isAnimeSection && (
          <div className="elegant-select-wrapper">
            <select
              className="elegant-select"
              value={filters.format || ''}
              onChange={(e) => handleFilterChange('format', e.target.value)}
            >
              <option value="">All Formats</option>
              {animeFormats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Anime-specific: Status Filter */}
        {isAnimeSection && (
          <div className="elegant-select-wrapper">
            <select
              className="elegant-select"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              {animeStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
            title="Clear all filters"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="toolbar-section search-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder={isAnimeSection ? "Search anime..." : "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
          />
          <button className="search-btn" onClick={handleSearchClick}>
            🔍
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
