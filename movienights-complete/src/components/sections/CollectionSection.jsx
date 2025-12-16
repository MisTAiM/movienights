/* ========================================
   CollectionSection.jsx - User Collection Section
   ======================================== */

import React, { useState, useMemo } from 'react';
import { useCollection } from '../../hooks/useCollection';
import { useApp } from '../../context/AppContext';
import ContentGrid from '../cards/ContentGrid';
import { sortItems, filterItems } from '../../utils/helpers';
import './Sections.css';

function CollectionSection({ onPlay, onEdit }) {
  const { state } = useApp();
  const { collection, stats, getRandomPick } = useCollection();
  const { currentSort, filters, currentViewMode } = state;
  
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter and sort collection
  const displayItems = useMemo(() => {
    let filtered = [...collection];

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Apply additional filters
    filtered = filterItems(filtered, filters);

    // Sort
    filtered = sortItems(filtered, currentSort);

    return filtered;
  }, [collection, typeFilter, filters, currentSort]);

  // Handle random pick
  const handleRandomPick = () => {
    const pick = getRandomPick(typeFilter === 'all' ? null : typeFilter);
    if (pick) {
      onPlay?.(pick);
    }
  };

  return (
    <section className="section collection-section">
      <div className="section-header">
        <div className="section-title-row">
          <h2 className="section-title">📚 My Collection</h2>
          <span className="collection-count">{collection.length} items</span>
        </div>
        
        <div className="section-controls">
          <div className="type-filters">
            <button
              className={`type-filter ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All ({stats.total})
            </button>
            <button
              className={`type-filter ${typeFilter === 'movie' ? 'active' : ''}`}
              onClick={() => setTypeFilter('movie')}
            >
              🎬 Movies ({stats.movies})
            </button>
            <button
              className={`type-filter ${typeFilter === 'tv' ? 'active' : ''}`}
              onClick={() => setTypeFilter('tv')}
            >
              📺 TV ({stats.tvShows})
            </button>
            <button
              className={`type-filter ${typeFilter === 'anime' ? 'active' : ''}`}
              onClick={() => setTypeFilter('anime')}
            >
              🎌 Anime ({stats.anime})
            </button>
          </div>

          <button className="random-pick-btn" onClick={handleRandomPick}>
            🎲 Random Pick
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="collection-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.watching}</span>
          <span className="stat-label">Watching</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.planToWatch}</span>
          <span className="stat-label">Plan to Watch</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.avgRating}</span>
          <span className="stat-label">Avg Rating</span>
        </div>
      </div>

      <ContentGrid
        items={displayItems}
        loading={false}
        onPlay={onPlay}
        onEdit={onEdit}
        emptyMessage="Your collection is empty. Add some titles to get started!"
      />
    </section>
  );
}

export default CollectionSection;
