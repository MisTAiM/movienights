/* ========================================
   ContentCard.jsx - Content Card Component
   ======================================== */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import { TMDB_IMG_URL } from '../../utils/tmdb';
import './ContentCard.css';

function ContentCard({ item, onPlay, onEdit, index = 0 }) {
  const { state } = useApp();
  const { currentViewMode } = state;
  const { isInCollection, toggleCollection, getCollectionItem } = useCollection();
  
  const inCollection = isInCollection(item.id, item.type);
  const collectionItem = inCollection ? getCollectionItem(item.id, item.type) : null;
  
  // Get poster URL - handle different sources
  const getPosterUrl = () => {
    // Anime with coverImage from AniList
    if (item.coverImage?.large) return item.coverImage.large;
    if (item.coverImage?.medium) return item.coverImage.medium;
    
    // Direct poster property (already full URL)
    if (item.poster && item.poster.startsWith('http')) return item.poster;
    
    // TMDB poster_path
    if (item.poster_path) {
      if (item.poster_path.startsWith('http')) return item.poster_path;
      return `${TMDB_IMG_URL}${item.poster_path}`;
    }
    
    // posterPath (normalized format)
    if (item.posterPath) {
      if (item.posterPath.startsWith('http')) return item.posterPath;
      return `${TMDB_IMG_URL}${item.posterPath}`;
    }
    
    // Fallback
    return 'https://via.placeholder.com/300x450/1a1a1a/d4af37?text=No+Image';
  };
  
  const posterUrl = getPosterUrl();
  
  // Get year
  const year = item.year || (item.release_date || item.releaseDate || '').split('-')[0];
  
  // Get rating
  const rating = (item.vote_average || item.voteAverage || 0).toFixed(1);
  
  // Get title
  const title = item.title || item.name;
  
  // Get description/overview - full description
  const description = item.overview || item.description || '';
  
  // User data from collection
  const userRating = collectionItem?.userRating;
  const watchStatus = collectionItem?.status;
  const personalNote = collectionItem?.personalNote;
  const currentSeason = collectionItem?.currentSeason;
  const currentEpisode = collectionItem?.currentEpisode;

  const handleCardClick = () => {
    onPlay?.(item);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    toggleCollection(item);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(item);
  };

  return (
    <div 
      className={`content-card ${currentViewMode}-view animate-card-stagger`}
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Card Shine Effect */}
      <div className="card-shine"></div>
      
      {/* Poster */}
      <div className="card-poster">
        <img 
          src={posterUrl} 
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />
        
        {/* Status Badge */}
        {watchStatus && (
          <span className={`watch-status status-${watchStatus}`}>
            {watchStatus === 'watching' && '▶ Watching'}
            {watchStatus === 'completed' && '✓ Completed'}
            {watchStatus === 'plan' && '📋 Plan to Watch'}
            {watchStatus === 'dropped' && '✕ Dropped'}
          </span>
        )}
        
        {/* Progress Badge */}
        {(currentSeason || currentEpisode) && (
          <span className="progress-badge">
            S{currentSeason || 1}E{currentEpisode || 1}
          </span>
        )}
        
        {/* Type Badge */}
        <span className={`type-badge type-${item.type}`}>
          {item.type === 'movie' && '🎬'}
          {item.type === 'tv' && '📺'}
          {item.type === 'anime' && '🎌'}
        </span>
      </div>
      
      {/* Card Info */}
      <div className="card-info">
        <h3 className="card-title" title={title}>{title}</h3>
        
        <div className="card-meta">
          <span className="card-year">{year || 'N/A'}</span>
          <span className="card-rating">
            ★ {rating}
          </span>
        </div>
        
        {/* Description - show full description in grid and list view */}
        {description && currentViewMode !== 'compact' && (
          <p className="card-description">{description}</p>
        )}
        
        {/* User Rating */}
        {userRating && (
          <div className="user-rating">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < userRating ? 'star filled' : 'star'}>
                ★
              </span>
            ))}
          </div>
        )}
        
        {/* Personal Note */}
        {personalNote && currentViewMode !== 'compact' && (
          <p className="personal-note">{personalNote}</p>
        )}
        
        {/* Card Actions */}
        <div className="card-actions">
          <button 
            className={`action-btn ${inCollection ? 'in-collection' : ''}`}
            onClick={handleAddClick}
            title={inCollection ? 'Remove from Collection' : 'Add to Collection'}
          >
            {inCollection ? '✓' : '+'}
          </button>
          
          {inCollection && (
            <button 
              className="action-btn edit-btn"
              onClick={handleEditClick}
              title="Edit"
            >
              ✎
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentCard;
