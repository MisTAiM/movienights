/* ========================================
   SettingsModal.jsx - Edit Item Modal Component
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import ModalBackdrop, { ModalContent, ModalHeader, ModalBody, ModalFooter } from '../common/ModalBackdrop';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, item }) {
  const { actions } = useApp();
  const { updateItem, removeFromCollection, toggleWatchlist, isInWatchlist, getItemKey } = useCollection();
  
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [watchlistStates, setWatchlistStates] = useState({
    favorites: false,
    rewatchable: false,
    priority: false,
    currentlyWatching: false
  });

  // Initialize form with item data
  useEffect(() => {
    if (isOpen && item) {
      setRating(item.userRating || 0);
      setStatus(item.status || '');
      setNote(item.personalNote || '');
      setCurrentSeason(item.currentSeason || 1);
      setCurrentEpisode(item.currentEpisode || 1);
      
      const itemKey = getItemKey(item);
      setWatchlistStates({
        favorites: isInWatchlist(itemKey, 'favorites'),
        rewatchable: isInWatchlist(itemKey, 'rewatchable'),
        priority: isInWatchlist(itemKey, 'priority'),
        currentlyWatching: isInWatchlist(itemKey, 'currentlyWatching')
      });
    }
  }, [isOpen, item]);

  const handleStarClick = (starIndex) => {
    setRating(starIndex + 1);
  };

  const handleWatchlistToggle = (listName) => {
    setWatchlistStates(prev => ({
      ...prev,
      [listName]: !prev[listName]
    }));
  };

  const handleSave = () => {
    if (!item) return;

    // Update item data
    updateItem(item.id, item.type, {
      userRating: rating,
      status,
      personalNote: note,
      currentSeason: parseInt(currentSeason),
      currentEpisode: parseInt(currentEpisode)
    });

    // Update watchlists
    const itemKey = getItemKey(item);
    Object.entries(watchlistStates).forEach(([listName, shouldBeIn]) => {
      const currentlyIn = isInWatchlist(itemKey, listName);
      if (shouldBeIn !== currentlyIn) {
        toggleWatchlist(itemKey, listName);
      }
    });

    actions.addNotification('Changes saved!', 'success');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${item.title || item.name}" from your collection?`)) {
      removeFromCollection(item.id, item.type);
      onClose();
    }
  };

  if (!item) return null;

  const title = item.title || item.name;
  const isSeriesType = item.type === 'tv' || item.type === 'anime';

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <ModalContent maxWidth="500px">
        <ModalHeader onClose={onClose}>
          <h2>Edit: {title}</h2>
        </ModalHeader>

        <ModalBody>
          {/* Star Rating */}
          <div className="form-group">
            <label>Your Rating</label>
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`star ${i < rating ? 'filled' : ''}`}
                  onClick={() => handleStarClick(i)}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <button 
                  type="button" 
                  className="clear-rating"
                  onClick={() => setRating(0)}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Watch Status */}
          <div className="form-group">
            <label>Watch Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              <option value="">Select Status</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="plan">Plan to Watch</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          {/* Episode Progress (TV/Anime only) */}
          {isSeriesType && (
            <div className="form-group">
              <label>Current Progress</label>
              <div className="progress-inputs">
                <div className="progress-input">
                  <span>Season</span>
                  <input
                    type="number"
                    min="1"
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(e.target.value)}
                    className="form-input small"
                  />
                </div>
                <div className="progress-input">
                  <span>Episode</span>
                  <input
                    type="number"
                    min="1"
                    value={currentEpisode}
                    onChange={(e) => setCurrentEpisode(e.target.value)}
                    className="form-input small"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Watchlists */}
          <div className="form-group">
            <label>Add to Watchlists</label>
            <div className="watchlist-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={watchlistStates.favorites}
                  onChange={() => handleWatchlistToggle('favorites')}
                />
                <span className="checkbox-text">❤️ Favorites</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={watchlistStates.rewatchable}
                  onChange={() => handleWatchlistToggle('rewatchable')}
                />
                <span className="checkbox-text">🔄 Rewatchable</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={watchlistStates.priority}
                  onChange={() => handleWatchlistToggle('priority')}
                />
                <span className="checkbox-text">⭐ Priority</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={watchlistStates.currentlyWatching}
                  onChange={() => handleWatchlistToggle('currentlyWatching')}
                />
                <span className="checkbox-text">▶️ Currently Watching</span>
              </label>
            </div>
          </div>

          {/* Personal Note */}
          <div className="form-group">
            <label>Personal Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your thoughts, review, or notes..."
              className="form-textarea"
              rows="3"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ Remove
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Save Changes
          </button>
        </ModalFooter>
      </ModalContent>
    </ModalBackdrop>
  );
}

export default SettingsModal;
