/* ========================================
   ContentGrid.jsx - Content Grid Layout Component
   ======================================== */

import React, { useRef, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ContentCard from '../cards/ContentCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './ContentGrid.css';

function ContentGrid({ 
  items = [], 
  loading = false, 
  onLoadMore, 
  hasMore = false,
  onPlay,
  onEdit,
  emptyMessage = 'No items found'
}) {
  const { state } = useApp();
  const { currentViewMode } = state;
  const observerRef = useRef();
  const loadMoreRef = useRef();

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        onLoadMore();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore, loading]);

  // Determine grid class based on view mode
  const getGridClass = () => {
    switch (currentViewMode) {
      case 'list':
        return 'content-grid list-layout';
      case 'compact':
        return 'content-grid compact-layout';
      default:
        return 'content-grid grid-layout';
    }
  };

  if (!loading && items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <p className="empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="content-grid-container">
      <div className={getGridClass()}>
        {items.map((item, index) => (
          <ContentCard
            key={`${item.id}-${item.type}`}
            item={item}
            index={index}
            onPlay={onPlay}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {loading && <LoadingSpinner size="small" />}
        </div>
      )}

      {/* Loading State */}
      {loading && items.length === 0 && (
        <LoadingSpinner text="Loading content..." />
      )}
    </div>
  );
}

export default ContentGrid;
