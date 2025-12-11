/* ========================================
   useCollection.js - Collection Management Hook
   ======================================== */

import { useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { checkAchievements } from '../utils/achievements';

/**
 * Custom hook for collection management operations
 * @returns {Object} Collection methods and computed values
 */
export function useCollection() {
  const { state, actions, helpers } = useApp();
  const { collection, watchlists, achievements } = state;

  // Add item to collection
  const addToCollection = useCallback((item) => {
    if (helpers.isInCollection(item.id, item.type)) {
      actions.addNotification('Already in collection', 'info');
      return false;
    }
    
    actions.addToCollection(item);
    actions.addNotification('Added to collection!', 'success');
    
    // Check achievements
    const updatedAchievements = checkAchievements({
      collection: [...collection, item],
      achievements,
      onUnlock: (achievement) => {
        actions.addNotification(`🏆 Achievement Unlocked: ${achievement.name}`, 'success');
      }
    });
    
    // Update achievements if any were unlocked
    Object.keys(updatedAchievements).forEach(key => {
      if (updatedAchievements[key].unlocked && !achievements[key].unlocked) {
        actions.unlockAchievement(key);
      }
    });
    
    return true;
  }, [collection, achievements, helpers, actions]);

  // Remove item from collection
  const removeFromCollection = useCallback((id, type) => {
    const itemKey = `${id}-${type}`;
    
    // Remove from all watchlists
    Object.keys(watchlists).forEach(listName => {
      if (watchlists[listName].includes(itemKey)) {
        actions.updateWatchlist(
          listName,
          watchlists[listName].filter(key => key !== itemKey)
        );
      }
    });
    
    actions.removeFromCollection(id, type);
    actions.addNotification('Removed from collection', 'info');
    return true;
  }, [watchlists, actions]);

  // Toggle item in collection
  const toggleCollection = useCallback((item) => {
    if (helpers.isInCollection(item.id, item.type)) {
      return removeFromCollection(item.id, item.type);
    } else {
      return addToCollection(item);
    }
  }, [helpers, addToCollection, removeFromCollection]);

  // Update item in collection
  const updateItem = useCallback((id, type, updates) => {
    actions.updateCollectionItem(id, type, updates);
    actions.addNotification('Updated successfully', 'success');
  }, [actions]);

  // Set user rating
  const setRating = useCallback((id, type, rating) => {
    actions.updateCollectionItem(id, type, { userRating: rating });
  }, [actions]);

  // Set watch status
  const setStatus = useCallback((id, type, status) => {
    actions.updateCollectionItem(id, type, { status });
  }, [actions]);

  // Update episode progress
  const updateProgress = useCallback((id, type, currentSeason, currentEpisode) => {
    actions.updateCollectionItem(id, type, { currentSeason, currentEpisode });
  }, [actions]);

  // Add/remove from watchlist
  const toggleWatchlist = useCallback((itemKey, listName) => {
    const currentList = watchlists[listName] || [];
    const isInList = currentList.includes(itemKey);
    
    if (isInList) {
      actions.updateWatchlist(listName, currentList.filter(key => key !== itemKey));
    } else {
      actions.updateWatchlist(listName, [...currentList, itemKey]);
    }
    
    return !isInList;
  }, [watchlists, actions]);

  // Get filtered collection
  const getFilteredCollection = useCallback((filters = {}, sortBy = 'default') => {
    let result = [...collection];
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(item => item.type === filters.type);
    }
    
    // Apply genre filter
    if (filters.genre) {
      result = result.filter(item => {
        const genres = item.genre_ids || item.genreIds || [];
        return genres.includes(parseInt(filters.genre));
      });
    }
    
    // Apply year filter
    if (filters.year) {
      result = result.filter(item => {
        const year = (item.release_date || item.releaseDate || '').split('-')[0];
        return year === filters.year;
      });
    }
    
    // Apply rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      result = result.filter(item => {
        const rating = item.vote_average || item.voteAverage || 0;
        return rating >= minRating;
      });
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(item => item.status === filters.status);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
        break;
      case 'rating':
        result.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'year':
        result.sort((a, b) => {
          const yearA = parseInt((a.release_date || '0').split('-')[0]);
          const yearB = parseInt((b.release_date || '0').split('-')[0]);
          return yearB - yearA;
        });
        break;
      case 'dateAdded':
        result.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
        break;
      case 'userRating':
        result.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
        break;
    }
    
    return result;
  }, [collection]);

  // Get watchlist items
  const getWatchlistItems = useCallback((listName) => {
    const itemKeys = watchlists[listName] || [];
    return collection.filter(item => 
      itemKeys.includes(`${item.id}-${item.type}`)
    );
  }, [collection, watchlists]);

  // Collection stats
  const stats = useMemo(() => {
    const movieCount = collection.filter(i => i.type === 'movie').length;
    const tvCount = collection.filter(i => i.type === 'tv').length;
    const animeCount = collection.filter(i => i.type === 'anime').length;
    
    const ratedItems = collection.filter(i => i.userRating);
    const avgRating = ratedItems.length > 0
      ? ratedItems.reduce((sum, i) => sum + i.userRating, 0) / ratedItems.length
      : 0;
    
    const watchingCount = collection.filter(i => i.status === 'watching').length;
    const completedCount = collection.filter(i => i.status === 'completed').length;
    const planToWatchCount = collection.filter(i => i.status === 'plan').length;
    
    return {
      total: collection.length,
      movies: movieCount,
      tvShows: tvCount,
      anime: animeCount,
      rated: ratedItems.length,
      avgRating: avgRating.toFixed(1),
      watching: watchingCount,
      completed: completedCount,
      planToWatch: planToWatchCount,
      favorites: watchlists.favorites?.length || 0,
      rewatchable: watchlists.rewatchable?.length || 0,
      priority: watchlists.priority?.length || 0
    };
  }, [collection, watchlists]);

  // Random pick from collection
  const getRandomPick = useCallback((filters = {}) => {
    const filtered = getFilteredCollection(filters);
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }, [getFilteredCollection]);

  return {
    // Data
    collection,
    watchlists,
    stats,
    
    // Methods
    addToCollection,
    removeFromCollection,
    toggleCollection,
    updateItem,
    setRating,
    setStatus,
    updateProgress,
    toggleWatchlist,
    getFilteredCollection,
    getWatchlistItems,
    getRandomPick,
    
    // Helpers
    isInCollection: helpers.isInCollection,
    getCollectionItem: helpers.getCollectionItem,
    isInWatchlist: helpers.isInWatchlist,
    getItemKey: helpers.getItemKey
  };
}

export default useCollection;
