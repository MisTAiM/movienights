/* ========================================
   WatchlistsSection.jsx - Watchlists Section
   ======================================== */

import React, { useState, useMemo } from 'react';
import { useCollection } from '../../hooks/useCollection';
import ContentGrid from '../cards/ContentGrid';
import './Sections.css';

const watchlistConfig = [
  { id: 'favorites', label: 'Favorites', icon: '❤️' },
  { id: 'rewatchable', label: 'Rewatchable', icon: '🔄' },
  { id: 'priority', label: 'Priority', icon: '⭐' },
  { id: 'currentlyWatching', label: 'Currently Watching', icon: '▶️' }
];

function WatchlistsSection({ onPlay, onEdit }) {
  const { watchlists, collection, getWatchlistItems } = useCollection();
  const [activeList, setActiveList] = useState('favorites');

  // Get items for active watchlist
  const displayItems = useMemo(() => {
    return getWatchlistItems(activeList);
  }, [activeList, watchlists, collection, getWatchlistItems]);

  // Get counts for each watchlist
  const getCounts = () => {
    return watchlistConfig.map(config => ({
      ...config,
      count: watchlists[config.id]?.length || 0
    }));
  };

  const counts = getCounts();
  const activeConfig = watchlistConfig.find(c => c.id === activeList);

  return (
    <section className="section watchlists-section">
      <div className="section-header">
        <h2 className="section-title">📋 Watchlists</h2>
      </div>

      {/* Watchlist Tabs */}
      <div className="watchlist-tabs">
        {counts.map(config => (
          <button
            key={config.id}
            className={`watchlist-tab ${activeList === config.id ? 'active' : ''}`}
            onClick={() => setActiveList(config.id)}
          >
            <span className="tab-icon">{config.icon}</span>
            <span className="tab-label">{config.label}</span>
            <span className="tab-count">{config.count}</span>
          </button>
        ))}
      </div>

      {/* Active Watchlist Content */}
      <div className="watchlist-content">
        <h3 className="watchlist-title">
          {activeConfig?.icon} {activeConfig?.label}
        </h3>
        
        <ContentGrid
          items={displayItems}
          loading={false}
          onPlay={onPlay}
          onEdit={onEdit}
          emptyMessage={`No items in ${activeConfig?.label}. Add some from your collection!`}
        />
      </div>
    </section>
  );
}

export default WatchlistsSection;
