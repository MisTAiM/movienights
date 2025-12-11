import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';
import { defaultAchievements } from '../utils/achievements';

// Initial State
const initialState = {
  // Navigation
  currentSection: 'discover',
  
  // Collection & Watchlists
  collection: [],
  watchlists: {
    favorites: [],
    rewatchable: [],
    priority: [],
    currentlyWatching: []
  },
  customLists: [],
  watchHistory: [],
  resumeProgress: {},
  
  // UI State
  currentViewMode: 'grid',
  currentSort: 'default',
  filters: {
    genre: '',
    year: '',
    rating: '',
    status: ''
  },
  theme: 'dark',
  
  // Achievements
  achievements: defaultAchievements,
  
  // Player State
  currentPlayingItem: null,
  isPlayerModalOpen: false,
  
  // App State
  isLoading: false,
  isIntroComplete: false,
  isMobile: false,
  isTV: false,
  devicePerformance: 'high',
  
  // Notifications
  notifications: []
};

// Action Types
const ActionTypes = {
  SET_SECTION: 'SET_SECTION',
  SET_COLLECTION: 'SET_COLLECTION',
  ADD_TO_COLLECTION: 'ADD_TO_COLLECTION',
  REMOVE_FROM_COLLECTION: 'REMOVE_FROM_COLLECTION',
  UPDATE_COLLECTION_ITEM: 'UPDATE_COLLECTION_ITEM',
  SET_WATCHLISTS: 'SET_WATCHLISTS',
  UPDATE_WATCHLIST: 'UPDATE_WATCHLIST',
  SET_CUSTOM_LISTS: 'SET_CUSTOM_LISTS',
  ADD_CUSTOM_LIST: 'ADD_CUSTOM_LIST',
  SET_WATCH_HISTORY: 'SET_WATCH_HISTORY',
  SET_RESUME_PROGRESS: 'SET_RESUME_PROGRESS',
  UPDATE_RESUME_PROGRESS: 'UPDATE_RESUME_PROGRESS',
  CLEAR_RESUME_PROGRESS: 'CLEAR_RESUME_PROGRESS',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_SORT: 'SET_SORT',
  SET_FILTERS: 'SET_FILTERS',
  SET_THEME: 'SET_THEME',
  SET_ACHIEVEMENTS: 'SET_ACHIEVEMENTS',
  UNLOCK_ACHIEVEMENT: 'UNLOCK_ACHIEVEMENT',
  SET_CURRENT_PLAYING: 'SET_CURRENT_PLAYING',
  SET_PLAYER_MODAL: 'SET_PLAYER_MODAL',
  SET_LOADING: 'SET_LOADING',
  SET_INTRO_COMPLETE: 'SET_INTRO_COMPLETE',
  SET_DEVICE_INFO: 'SET_DEVICE_INFO',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  IMPORT_DATA: 'IMPORT_DATA'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SECTION:
      return { ...state, currentSection: action.payload };
      
    case ActionTypes.SET_COLLECTION:
      return { ...state, collection: action.payload };
      
    case ActionTypes.ADD_TO_COLLECTION: {
      const newItem = {
        ...action.payload,
        dateAdded: new Date().toISOString()
      };
      return { ...state, collection: [...state.collection, newItem] };
    }
    
    case ActionTypes.REMOVE_FROM_COLLECTION: {
      const { id, type } = action.payload;
      return {
        ...state,
        collection: state.collection.filter(
          item => !(item.id === id && item.type === type)
        )
      };
    }
    
    case ActionTypes.UPDATE_COLLECTION_ITEM: {
      const { id, type, updates } = action.payload;
      return {
        ...state,
        collection: state.collection.map(item =>
          item.id === id && item.type === type
            ? { ...item, ...updates }
            : item
        )
      };
    }
    
    case ActionTypes.SET_WATCHLISTS:
      return { ...state, watchlists: action.payload };
      
    case ActionTypes.UPDATE_WATCHLIST: {
      const { listName, items } = action.payload;
      return {
        ...state,
        watchlists: { ...state.watchlists, [listName]: items }
      };
    }
    
    case ActionTypes.SET_CUSTOM_LISTS:
      return { ...state, customLists: action.payload };
      
    case ActionTypes.ADD_CUSTOM_LIST:
      return { ...state, customLists: [...state.customLists, action.payload] };
      
    case ActionTypes.SET_WATCH_HISTORY:
      return { ...state, watchHistory: action.payload };
      
    case ActionTypes.SET_RESUME_PROGRESS:
      return { ...state, resumeProgress: action.payload };
      
    case ActionTypes.UPDATE_RESUME_PROGRESS: {
      const { key, progress } = action.payload;
      return {
        ...state,
        resumeProgress: { ...state.resumeProgress, [key]: progress }
      };
    }
    
    case ActionTypes.CLEAR_RESUME_PROGRESS:
      return { ...state, resumeProgress: {} };
      
    case ActionTypes.SET_VIEW_MODE:
      return { ...state, currentViewMode: action.payload };
      
    case ActionTypes.SET_SORT:
      return { ...state, currentSort: action.payload };
      
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
      
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
      
    case ActionTypes.SET_ACHIEVEMENTS:
      return { ...state, achievements: action.payload };
      
    case ActionTypes.UNLOCK_ACHIEVEMENT: {
      const achievementId = action.payload;
      const achievement = state.achievements[achievementId];
      if (!achievement || achievement.unlocked) return state;
      
      return {
        ...state,
        achievements: {
          ...state.achievements,
          [achievementId]: {
            ...achievement,
            unlocked: true,
            progress: achievement.goal
          }
        }
      };
    }
    
    case ActionTypes.SET_CURRENT_PLAYING:
      return { ...state, currentPlayingItem: action.payload };
      
    case ActionTypes.SET_PLAYER_MODAL:
      return { ...state, isPlayerModalOpen: action.payload };
      
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ActionTypes.SET_INTRO_COMPLETE:
      return { ...state, isIntroComplete: action.payload };
      
    case ActionTypes.SET_DEVICE_INFO:
      return {
        ...state,
        isMobile: action.payload.isMobile,
        isTV: action.payload.isTV,
        devicePerformance: action.payload.performance
      };
      
    case ActionTypes.ADD_NOTIFICATION: {
      const notification = {
        id: Date.now(),
        ...action.payload
      };
      return {
        ...state,
        notifications: [...state.notifications, notification]
      };
    }
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case ActionTypes.IMPORT_DATA:
      return {
        ...state,
        collection: action.payload.collection || state.collection,
        watchlists: action.payload.watchlists || state.watchlists,
        customLists: action.payload.customLists || state.customLists
      };
      
    default:
      return state;
  }
}

// Create Context
const AppContext = createContext(null);

// Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const collection = getFromStorage('movieNightsCollection', []);
    const watchlists = getFromStorage('movieNightsWatchlists', initialState.watchlists);
    const customLists = getFromStorage('movieNightsCustomLists', []);
    const watchHistory = getFromStorage('movieNightsWatchHistory', []);
    const resumeProgress = getFromStorage('movieNightsResumeProgress', {});
    const achievements = getFromStorage('movieNightsAchievements', defaultAchievements);
    const theme = getFromStorage('movieNightsTheme', 'dark');
    const viewMode = getFromStorage('movieNightsViewMode', 'grid');
    
    dispatch({ type: ActionTypes.SET_COLLECTION, payload: collection });
    dispatch({ type: ActionTypes.SET_WATCHLISTS, payload: watchlists });
    dispatch({ type: ActionTypes.SET_CUSTOM_LISTS, payload: customLists });
    dispatch({ type: ActionTypes.SET_WATCH_HISTORY, payload: watchHistory });
    dispatch({ type: ActionTypes.SET_RESUME_PROGRESS, payload: resumeProgress });
    dispatch({ type: ActionTypes.SET_ACHIEVEMENTS, payload: achievements });
    dispatch({ type: ActionTypes.SET_THEME, payload: theme });
    dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: viewMode });
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Detect device
    detectDevice();
  }, []);
  
  // Save collection to localStorage when it changes
  useEffect(() => {
    if (state.collection.length > 0 || getFromStorage('movieNightsCollection', null)) {
      saveToStorage('movieNightsCollection', state.collection);
    }
  }, [state.collection]);
  
  // Save watchlists to localStorage when they change
  useEffect(() => {
    saveToStorage('movieNightsWatchlists', state.watchlists);
  }, [state.watchlists]);
  
  // Save custom lists to localStorage
  useEffect(() => {
    saveToStorage('movieNightsCustomLists', state.customLists);
  }, [state.customLists]);
  
  // Save achievements to localStorage
  useEffect(() => {
    saveToStorage('movieNightsAchievements', state.achievements);
  }, [state.achievements]);
  
  // Save resume progress to localStorage
  useEffect(() => {
    saveToStorage('movieNightsResumeProgress', state.resumeProgress);
  }, [state.resumeProgress]);
  
  // Detect device capabilities
  const detectDevice = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;
    
    const isTV = window.innerWidth >= 1921 || /TV|SMART|LG|Samsung|Roku/i.test(navigator.userAgent);
    
    let performance = 'high';
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory <= 2) performance = 'low';
      else if (navigator.deviceMemory <= 4) performance = 'medium';
    }
    if (isMobile) performance = 'medium';
    
    dispatch({
      type: ActionTypes.SET_DEVICE_INFO,
      payload: { isMobile, isTV, performance }
    });
  }, []);
  
  // Action creators
  const actions = {
    setSection: (section) => dispatch({ type: ActionTypes.SET_SECTION, payload: section }),
    
    addToCollection: (item) => dispatch({ type: ActionTypes.ADD_TO_COLLECTION, payload: item }),
    
    removeFromCollection: (id, type) => dispatch({
      type: ActionTypes.REMOVE_FROM_COLLECTION,
      payload: { id, type }
    }),
    
    updateCollectionItem: (id, type, updates) => dispatch({
      type: ActionTypes.UPDATE_COLLECTION_ITEM,
      payload: { id, type, updates }
    }),
    
    updateWatchlist: (listName, items) => dispatch({
      type: ActionTypes.UPDATE_WATCHLIST,
      payload: { listName, items }
    }),
    
    addCustomList: (list) => dispatch({ type: ActionTypes.ADD_CUSTOM_LIST, payload: list }),
    
    updateResumeProgress: (key, progress) => dispatch({
      type: ActionTypes.UPDATE_RESUME_PROGRESS,
      payload: { key, progress }
    }),
    
    clearResumeProgress: () => dispatch({ type: ActionTypes.CLEAR_RESUME_PROGRESS }),
    
    setViewMode: (mode) => {
      dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: mode });
      saveToStorage('movieNightsViewMode', mode);
    },
    
    setSort: (sort) => dispatch({ type: ActionTypes.SET_SORT, payload: sort }),
    
    setFilters: (filters) => dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
    
    setTheme: (theme) => {
      dispatch({ type: ActionTypes.SET_THEME, payload: theme });
      document.documentElement.setAttribute('data-theme', theme);
      saveToStorage('movieNightsTheme', theme);
    },
    
    toggleTheme: () => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      actions.setTheme(newTheme);
    },
    
    unlockAchievement: (achievementId) => dispatch({
      type: ActionTypes.UNLOCK_ACHIEVEMENT,
      payload: achievementId
    }),
    
    setCurrentPlaying: (item) => dispatch({ type: ActionTypes.SET_CURRENT_PLAYING, payload: item }),
    
    setPlayerModal: (isOpen) => dispatch({ type: ActionTypes.SET_PLAYER_MODAL, payload: isOpen }),
    
    setLoading: (isLoading) => dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading }),
    
    setIntroComplete: (complete) => dispatch({ type: ActionTypes.SET_INTRO_COMPLETE, payload: complete }),
    
    addNotification: (message, type = 'info') => {
      const id = Date.now();
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: { id, message, type } });
      setTimeout(() => {
        dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
      }, 3000);
      return id;
    },
    
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    
    importData: (data) => dispatch({ type: ActionTypes.IMPORT_DATA, payload: data }),
    
    exportData: () => {
      const exportData = {
        collection: state.collection,
        watchlists: state.watchlists,
        customLists: state.customLists,
        achievements: state.achievements,
        exportDate: new Date().toISOString()
      };
      return exportData;
    },
    
    clearAllData: () => {
      if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem('movieNightsCollection');
        localStorage.removeItem('movieNightsWatchlists');
        localStorage.removeItem('movieNightsCustomLists');
        localStorage.removeItem('movieNightsWatchHistory');
        localStorage.removeItem('movieNightsResumeProgress');
        localStorage.removeItem('movieNightsAchievements');
        window.location.reload();
      }
    }
  };
  
  // Helper functions
  const helpers = {
    isInCollection: (id, type) => {
      return state.collection.some(item => item.id === id && item.type === type);
    },
    
    getCollectionItem: (id, type) => {
      return state.collection.find(item => item.id === id && item.type === type);
    },
    
    isInWatchlist: (itemKey, listName) => {
      return state.watchlists[listName]?.includes(itemKey) || false;
    },
    
    getItemKey: (item) => `${item.id}-${item.type}`
  };
  
  return (
    <AppContext.Provider value={{ state, dispatch, actions, helpers }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { ActionTypes };
export default AppContext;
