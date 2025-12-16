/* ========================================
   ReleaseCalendarSection.jsx - Upcoming Releases Calendar
   ======================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import * as tmdbApi from '../../utils/tmdb';
import * as anilistApi from '../../utils/anilist';
import LoadingSpinner from '../common/LoadingSpinner';
import './ReleaseCalendarSection.css';

// Get today's date in YYYY-MM-DD format
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get date X days from now
const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Get days until release
const getDaysUntil = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const releaseDate = new Date(dateStr);
  releaseDate.setHours(0, 0, 0, 0);
  const diffTime = releaseDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get release status badge
const getReleaseBadge = (dateStr) => {
  const days = getDaysUntil(dateStr);
  if (days === null) return { text: 'TBA', class: 'tba' };
  if (days < 0) return { text: 'Released', class: 'released' };
  if (days === 0) return { text: 'Today! 🎉', class: 'today' };
  if (days === 1) return { text: 'Tomorrow', class: 'tomorrow' };
  if (days <= 7) return { text: `${days} days`, class: 'this-week' };
  if (days <= 30) return { text: `${days} days`, class: 'this-month' };
  return { text: `${days} days`, class: 'later' };
};

function ReleaseCalendarSection() {
  const { state, actions } = useApp();
  
  const [activeTab, setActiveTab] = useState('all');
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifiedItems, setNotifiedItems] = useState(() => {
    const saved = localStorage.getItem('release_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Load upcoming releases
  const loadReleases = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const today = getToday();
    const endDate = timeRange === 'week' ? getFutureDate(7) : 
                    timeRange === 'month' ? getFutureDate(30) : 
                    getFutureDate(90);
    
    try {
      const allReleases = [];
      
      // Load movies if tab is all or movies
      if (activeTab === 'all' || activeTab === 'movies') {
        try {
          const movieData = await tmdbApi.getUpcomingMovies(today, endDate);
          const movies = (movieData?.results || []).map(m => ({
            ...m,
            type: 'movie',
            releaseDate: m.release_date,
            title: m.title,
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : null
          }));
          allReleases.push(...movies);
        } catch (e) {
          console.error('Error loading movies:', e);
        }
      }
      
      // Load TV shows if tab is all or tv
      if (activeTab === 'all' || activeTab === 'tv') {
        try {
          const tvData = await tmdbApi.getUpcomingTV(today, endDate);
          const shows = (tvData?.results || []).map(s => ({
            ...s,
            type: 'tv',
            releaseDate: s.first_air_date,
            title: s.name,
            poster: s.poster_path ? `https://image.tmdb.org/t/p/w300${s.poster_path}` : null
          }));
          allReleases.push(...shows);
        } catch (e) {
          console.error('Error loading TV:', e);
        }
      }
      
      // Load anime if tab is all or anime
      if (activeTab === 'all' || activeTab === 'anime') {
        try {
          const animeData = await anilistApi.getUpcomingAnime();
          const anime = (animeData?.results || []).map(a => ({
            ...a,
            type: 'anime',
            releaseDate: a.startDate || a.releaseDate,
            title: a.title,
            poster: a.poster || a.coverImage?.large
          }));
          allReleases.push(...anime);
        } catch (e) {
          console.error('Error loading anime:', e);
        }
      }
      
      // Filter to only future releases and sort by date
      const futureReleases = allReleases
        .filter(item => {
          if (!item.releaseDate) return true; // Include TBA items
          return getDaysUntil(item.releaseDate) >= 0;
        })
        .sort((a, b) => {
          if (!a.releaseDate) return 1;
          if (!b.releaseDate) return -1;
          return new Date(a.releaseDate) - new Date(b.releaseDate);
        });
      
      setReleases(futureReleases);
      
      // Check for releases today and notify
      checkTodayReleases(futureReleases);
      
    } catch (err) {
      console.error('Error loading releases:', err);
      setError('Failed to load upcoming releases');
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeRange]);

  // Check for releases today
  const checkTodayReleases = (items) => {
    const todayReleases = items.filter(item => getDaysUntil(item.releaseDate) === 0);
    
    todayReleases.forEach(item => {
      const notifKey = `${item.id}-${item.type}`;
      if (!notifiedItems.includes(notifKey)) {
        actions.addNotification(`🎉 "${item.title}" releases today!`, 'success');
      }
    });
  };

  // Toggle notification for an item
  const toggleNotification = (item) => {
    const notifKey = `${item.id}-${item.type}`;
    let updated;
    
    if (notifiedItems.includes(notifKey)) {
      updated = notifiedItems.filter(k => k !== notifKey);
      actions.addNotification(`Notification removed for "${item.title}"`, 'info');
    } else {
      updated = [...notifiedItems, notifKey];
      actions.addNotification(`You'll be notified when "${item.title}" releases!`, 'success');
    }
    
    setNotifiedItems(updated);
    localStorage.setItem('release_notifications', JSON.stringify(updated));
  };

  // Check if item has notification
  const hasNotification = (item) => {
    return notifiedItems.includes(`${item.id}-${item.type}`);
  };

  // Load on mount and when filters change
  useEffect(() => {
    loadReleases();
  }, [loadReleases]);

  // Group releases by time period
  const groupReleases = () => {
    const groups = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      later: [],
      tba: []
    };
    
    releases.forEach(item => {
      const days = getDaysUntil(item.releaseDate);
      if (days === null) groups.tba.push(item);
      else if (days === 0) groups.today.push(item);
      else if (days <= 7) groups.thisWeek.push(item);
      else if (days <= 30) groups.thisMonth.push(item);
      else groups.later.push(item);
    });
    
    return groups;
  };

  const groupedReleases = groupReleases();

  return (
    <section className="section release-calendar-section">
      <div className="section-header">
        <h2 className="section-title">📅 Release Calendar</h2>
        <p className="section-subtitle">Upcoming movies, TV shows, and anime</p>
      </div>

      {/* Filters */}
      <div className="calendar-filters">
        {/* Content Type Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            🎬 Movies
          </button>
          <button 
            className={`filter-tab ${activeTab === 'tv' ? 'active' : ''}`}
            onClick={() => setActiveTab('tv')}
          >
            📺 TV Shows
          </button>
          <button 
            className={`filter-tab ${activeTab === 'anime' ? 'active' : ''}`}
            onClick={() => setActiveTab('anime')}
          >
            🎌 Anime
          </button>
        </div>

        {/* Time Range */}
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </button>
          <button 
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
          <button 
            className={`range-btn ${timeRange === 'quarter' ? 'active' : ''}`}
            onClick={() => setTimeRange('quarter')}
          >
            Next 3 Months
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text="Loading upcoming releases..." />}

      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadReleases}>Try Again</button>
        </div>
      )}

      {/* Releases */}
      {!loading && !error && (
        <div className="releases-container">
          {/* Today's Releases */}
          {groupedReleases.today.length > 0 && (
            <div className="release-group today-group">
              <h3 className="group-title">
                <span className="group-icon">🎉</span>
                Releasing Today!
                <span className="group-count">{groupedReleases.today.length}</span>
              </h3>
              <div className="releases-grid">
                {groupedReleases.today.map(item => (
                  <ReleaseCard 
                    key={`${item.id}-${item.type}`} 
                    item={item}
                    hasNotification={hasNotification(item)}
                    onToggleNotification={() => toggleNotification(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Week */}
          {groupedReleases.thisWeek.length > 0 && (
            <div className="release-group this-week-group">
              <h3 className="group-title">
                <span className="group-icon">📆</span>
                This Week
                <span className="group-count">{groupedReleases.thisWeek.length}</span>
              </h3>
              <div className="releases-grid">
                {groupedReleases.thisWeek.map(item => (
                  <ReleaseCard 
                    key={`${item.id}-${item.type}`} 
                    item={item}
                    hasNotification={hasNotification(item)}
                    onToggleNotification={() => toggleNotification(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Month */}
          {groupedReleases.thisMonth.length > 0 && (
            <div className="release-group this-month-group">
              <h3 className="group-title">
                <span className="group-icon">📅</span>
                This Month
                <span className="group-count">{groupedReleases.thisMonth.length}</span>
              </h3>
              <div className="releases-grid">
                {groupedReleases.thisMonth.map(item => (
                  <ReleaseCard 
                    key={`${item.id}-${item.type}`} 
                    item={item}
                    hasNotification={hasNotification(item)}
                    onToggleNotification={() => toggleNotification(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Later */}
          {groupedReleases.later.length > 0 && (
            <div className="release-group later-group">
              <h3 className="group-title">
                <span className="group-icon">🔮</span>
                Coming Soon
                <span className="group-count">{groupedReleases.later.length}</span>
              </h3>
              <div className="releases-grid">
                {groupedReleases.later.map(item => (
                  <ReleaseCard 
                    key={`${item.id}-${item.type}`} 
                    item={item}
                    hasNotification={hasNotification(item)}
                    onToggleNotification={() => toggleNotification(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TBA */}
          {groupedReleases.tba.length > 0 && (
            <div className="release-group tba-group">
              <h3 className="group-title">
                <span className="group-icon">❓</span>
                To Be Announced
                <span className="group-count">{groupedReleases.tba.length}</span>
              </h3>
              <div className="releases-grid">
                {groupedReleases.tba.map(item => (
                  <ReleaseCard 
                    key={`${item.id}-${item.type}`} 
                    item={item}
                    hasNotification={hasNotification(item)}
                    onToggleNotification={() => toggleNotification(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {releases.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No upcoming releases found for this time period.</p>
              <button onClick={() => setTimeRange('quarter')}>Show Next 3 Months</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Release Card Component
function ReleaseCard({ item, hasNotification, onToggleNotification }) {
  const badge = getReleaseBadge(item.releaseDate);
  
  return (
    <div className={`release-card ${badge.class}`}>
      {/* Poster */}
      <div className="release-poster">
        {item.poster ? (
          <img src={item.poster} alt={item.title} loading="lazy" />
        ) : (
          <div className="no-poster">
            <span>🎬</span>
          </div>
        )}
        
        {/* Type Badge */}
        <span className={`type-badge type-${item.type}`}>
          {item.type === 'movie' && '🎬'}
          {item.type === 'tv' && '📺'}
          {item.type === 'anime' && '🎌'}
        </span>
        
        {/* Release Badge */}
        <span className={`release-badge ${badge.class}`}>
          {badge.text}
        </span>
      </div>
      
      {/* Info */}
      <div className="release-info">
        <h4 className="release-title">{item.title}</h4>
        <p className="release-date">
          📅 {formatDate(item.releaseDate)}
        </p>
        
        {/* Notification Toggle */}
        <button 
          className={`notify-btn ${hasNotification ? 'active' : ''}`}
          onClick={onToggleNotification}
          title={hasNotification ? 'Remove notification' : 'Notify me'}
        >
          {hasNotification ? '🔔' : '🔕'}
          <span>{hasNotification ? 'Notifying' : 'Notify Me'}</span>
        </button>
      </div>
    </div>
  );
}

export default ReleaseCalendarSection;
