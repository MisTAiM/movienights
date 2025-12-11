/* ========================================
   STORAGE.JS - LocalStorage Utilities
   ======================================== */

/**
 * Get item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save item to localStorage with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all MovieNights data from localStorage
 */
export function clearAllMovieNightsData() {
  const keysToRemove = [
    'movieNightsCollection',
    'movieNightsWatchlists',
    'movieNightsCustomLists',
    'movieNightsWatchHistory',
    'movieNightsResumeProgress',
    'movieNightsAchievements',
    'movieNightsTheme',
    'movieNightsViewMode',
    'pipPosition',
    'pipSize',
    'clockPosition'
  ];
  
  keysToRemove.forEach(key => removeFromStorage(key));
}

/**
 * Get storage usage info
 * @returns {Object} Storage usage information
 */
export function getStorageInfo() {
  let totalSize = 0;
  const items = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('movieNights') || ['pipPosition', 'pipSize', 'clockPosition'].includes(key)) {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      items[key] = size;
      totalSize += size;
    }
  }
  
  return {
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    items
  };
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Export all data as JSON string
 * @returns {string} JSON string of all data
 */
export function exportAllData() {
  const data = {
    collection: getFromStorage('movieNightsCollection', []),
    watchlists: getFromStorage('movieNightsWatchlists', {}),
    customLists: getFromStorage('movieNightsCustomLists', []),
    watchHistory: getFromStorage('movieNightsWatchHistory', []),
    achievements: getFromStorage('movieNightsAchievements', {}),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 * @param {string} jsonString - JSON string to import
 * @returns {Object} Result with success status and message
 */
export function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.collection) {
      saveToStorage('movieNightsCollection', data.collection);
    }
    if (data.watchlists) {
      saveToStorage('movieNightsWatchlists', data.watchlists);
    }
    if (data.customLists) {
      saveToStorage('movieNightsCustomLists', data.customLists);
    }
    if (data.watchHistory) {
      saveToStorage('movieNightsWatchHistory', data.watchHistory);
    }
    if (data.achievements) {
      saveToStorage('movieNightsAchievements', data.achievements);
    }
    
    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    return { success: false, message: `Import failed: ${error.message}` };
  }
}

export default {
  get: getFromStorage,
  save: saveToStorage,
  remove: removeFromStorage,
  clearAll: clearAllMovieNightsData,
  getInfo: getStorageInfo,
  export: exportAllData,
  import: importAllData
};
