/* ========================================
   MusicSection.jsx - Music Hub
   SoundCloud-based - FULL SONGS play!
   No account needed, no redirects
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// ============================================
// SOUNDCLOUD PLAYLISTS & TRACKS
// All play FULL songs - no 30 second limit!
// ============================================

const FEATURED_PLAYLISTS = [
  {
    id: 'top50',
    name: 'Top 50 Charts',
    icon: '🔥',
    desc: 'Most played songs right now',
    url: 'https://soundcloud.com/soundcloud-the-peak/sets/the-peak'
  },
  {
    id: 'newmusic',
    name: 'New Music Now',
    icon: '✨',
    desc: 'Fresh releases this week',
    url: 'https://soundcloud.com/soundcloud-new-music/sets/new-music-now'
  },
  {
    id: 'hiphop',
    name: 'Hip Hop Central',
    icon: '🎤',
    desc: 'Top hip hop & rap tracks',
    url: 'https://soundcloud.com/soundcloud-hip-hop/sets/hip-hop-central'
  },
  {
    id: 'electronic',
    name: 'Electronic',
    icon: '🎧',
    desc: 'Best electronic & EDM',
    url: 'https://soundcloud.com/soundcloud-electronic/sets/electronic-essentials'
  },
  {
    id: 'rnb',
    name: 'R&B & Soul',
    icon: '💜',
    desc: 'Smooth R&B vibes',
    url: 'https://soundcloud.com/soundcloud-r-b/sets/r-b-essentials'
  },
  {
    id: 'pop',
    name: 'Pop Hits',
    icon: '⭐',
    desc: 'Today\'s biggest pop songs',
    url: 'https://soundcloud.com/soundcloud-pop/sets/pop-essentials'
  },
  {
    id: 'rock',
    name: 'Rock',
    icon: '🎸',
    desc: 'Rock anthems & classics',
    url: 'https://soundcloud.com/soundcloud-rock/sets/rock-essentials'
  },
  {
    id: 'indie',
    name: 'Indie',
    icon: '🌻',
    desc: 'Indie & alternative',
    url: 'https://soundcloud.com/soundcloud-indie/sets/indie-essentials'
  },
];

const MOOD_PLAYLISTS = [
  {
    id: 'chill',
    name: 'Chill Vibes',
    icon: '😌',
    desc: 'Relax and unwind',
    url: 'https://soundcloud.com/soundcloud-the-chillout/sets/chill-tracks'
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Beats',
    icon: '📚',
    desc: 'Study & focus music',
    url: 'https://soundcloud.com/chaborabbit/sets/lo-fi-hiphop'
  },
  {
    id: 'workout',
    name: 'Workout',
    icon: '💪',
    desc: 'High energy gym music',
    url: 'https://soundcloud.com/workout-music-service/sets/workout-music-2024'
  },
  {
    id: 'party',
    name: 'Party Mix',
    icon: '🎉',
    desc: 'Get the party started',
    url: 'https://soundcloud.com/clubmusicmixes/sets/party-music-2024'
  },
  {
    id: 'sleep',
    name: 'Sleep & Relax',
    icon: '🌙',
    desc: 'Peaceful sleep sounds',
    url: 'https://soundcloud.com/relaxdaily/sets/relaxdaily-sleep'
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: '🧠',
    desc: 'Concentration music',
    url: 'https://soundcloud.com/focusmusic/sets/deep-focus'
  },
];

const POPULAR_ARTISTS = [
  { name: 'Drake', url: 'https://soundcloud.com/octobersveryown', icon: '🦉' },
  { name: 'Post Malone', url: 'https://soundcloud.com/postmalone', icon: '🍺' },
  { name: 'Doja Cat', url: 'https://soundcloud.com/dojacat', icon: '🐱' },
  { name: 'The Weeknd', url: 'https://soundcloud.com/theweeknd', icon: '🌟' },
  { name: 'Travis Scott', url: 'https://soundcloud.com/travisscott-2', icon: '🌵' },
  { name: 'Billie Eilish', url: 'https://soundcloud.com/billieeilish', icon: '🖤' },
  { name: 'Juice WRLD', url: 'https://soundcloud.com/ulofrbrunn', icon: '🧃' },
  { name: 'Lil Uzi Vert', url: 'https://soundcloud.com/liluzivert', icon: '🛸' },
  { name: 'XXXTentacion', url: 'https://soundcloud.com/jahseh-onfroy', icon: '🕊️' },
  { name: 'SZA', url: 'https://soundcloud.com/sikiofficial', icon: '🦋' },
  { name: 'Future', url: 'https://soundcloud.com/fuaborat', icon: '🚀' },
  { name: 'Kendrick Lamar', url: 'https://soundcloud.com/kendrick-lamar-music', icon: '👑' },
];

// Categories
const CATEGORIES = [
  { id: 'search', name: 'Search', icon: '🔍' },
  { id: 'charts', name: 'Charts', icon: '📊' },
  { id: 'moods', name: 'Moods', icon: '💫' },
  { id: 'artists', name: 'Artists', icon: '🎤' },
];

function MusicSection() {
  const { actions } = useApp();
  
  // State
  const [activeCategory, setActiveCategory] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load saved data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mn_music_favorites');
      const searches = localStorage.getItem('mn_music_searches');
      if (saved) setFavorites(JSON.parse(saved));
      if (searches) setRecentSearches(JSON.parse(searches));
    } catch (e) {}
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchSubmitted(searchQuery.trim());
      
      // Save to recent searches
      const newSearches = [
        searchQuery.trim(),
        ...recentSearches.filter(s => s.toLowerCase() !== searchQuery.trim().toLowerCase())
      ].slice(0, 10);
      setRecentSearches(newSearches);
      localStorage.setItem('mn_music_searches', JSON.stringify(newSearches));
      
      actions.addNotification(`Searching for "${searchQuery}"`, 'info');
    }
  };

  // Quick search
  const quickSearch = (term) => {
    setSearchQuery(term);
    setSearchSubmitted(term);
    setActiveCategory('search');
  };

  // Play a playlist/track
  const playTrack = (track) => {
    setCurrentTrack(track);
    actions.addNotification(`Now playing: ${track.name}`, 'success');
  };

  // Close player
  const closePlayer = () => {
    setCurrentTrack(null);
  };

  // Get SoundCloud embed URL
  const getSoundCloudEmbed = (url, autoplay = true) => {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d4af37&auto_play=${autoplay}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  };

  // Get SoundCloud search widget
  const getSearchEmbed = (query) => {
    // SoundCloud search URL
    return `https://w.soundcloud.com/player/?url=https://soundcloud.com/search?q=${encodeURIComponent(query)}&color=%23d4af37&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  };

  // Popular search terms
  const popularSearches = [
    'Drake', 'Taylor Swift', 'The Weeknd', 'Bad Bunny', 
    'Doja Cat', 'Post Malone', 'Travis Scott', 'SZA',
    'Kendrick Lamar', 'Billie Eilish', 'Future', 'Lil Baby'
  ];

  return (
    <div className={`music-section ${currentTrack ? 'player-open' : ''}`}>
      <h2 className="section-title">🎵 Music Hub</h2>
      <p className="section-subtitle">Full songs play directly here - no account needed!</p>

      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="music-content">
        
        {/* Search Tab */}
        {activeCategory === 'search' && (
          <div className="search-section">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search any song, artist, or album..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="popular-searches">
              <h4>🔥 Popular Searches</h4>
              <div className="search-tags">
                {popularSearches.map(term => (
                  <button
                    key={term}
                    className="search-tag"
                    onClick={() => quickSearch(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="recent-searches">
                <h4>🕐 Recent Searches</h4>
                <div className="search-tags">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      className="search-tag recent"
                      onClick={() => quickSearch(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchSubmitted && (
              <div className="search-results">
                <h3>Results for "{searchSubmitted}"</h3>
                <p className="results-note">Click any song below to play the full track:</p>
                <div className="soundcloud-search-embed">
                  <iframe
                    title={`Search: ${searchSubmitted}`}
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=https://soundcloud.com/search/sounds?q=${encodeURIComponent(searchSubmitted)}&color=%23d4af37&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                  />
                </div>
                <div className="direct-search-links">
                  <p>Or browse directly on SoundCloud:</p>
                  <a 
                    href={`https://soundcloud.com/search/sounds?q=${encodeURIComponent(searchSubmitted)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sc-link"
                  >
                    🟠 Open Full Search on SoundCloud
                  </a>
                </div>
              </div>
            )}

            {/* No Search Yet */}
            {!searchSubmitted && (
              <div className="search-prompt">
                <div className="prompt-icon">🎵</div>
                <h3>Search for any song</h3>
                <p>Type an artist name, song title, or album above</p>
                <p className="highlight">✓ Full songs play - not 30 second previews!</p>
              </div>
            )}
          </div>
        )}

        {/* Charts Tab */}
        {activeCategory === 'charts' && (
          <div className="charts-section">
            <h3>📊 Top Charts & Genres</h3>
            <p className="section-note">Click to play full playlists</p>
            <div className="playlist-grid">
              {FEATURED_PLAYLISTS.map(playlist => (
                <div 
                  key={playlist.id}
                  className={`playlist-card ${currentTrack?.id === playlist.id ? 'playing' : ''}`}
                  onClick={() => playTrack(playlist)}
                >
                  <span className="card-icon">{playlist.icon}</span>
                  <div className="card-info">
                    <h4>{playlist.name}</h4>
                    <p>{playlist.desc}</p>
                  </div>
                  {currentTrack?.id === playlist.id && (
                    <span className="now-playing-badge">▶ Playing</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moods Tab */}
        {activeCategory === 'moods' && (
          <div className="moods-section">
            <h3>💫 Moods & Activities</h3>
            <p className="section-note">Music for every moment</p>
            <div className="playlist-grid">
              {MOOD_PLAYLISTS.map(playlist => (
                <div 
                  key={playlist.id}
                  className={`playlist-card ${currentTrack?.id === playlist.id ? 'playing' : ''}`}
                  onClick={() => playTrack(playlist)}
                >
                  <span className="card-icon">{playlist.icon}</span>
                  <div className="card-info">
                    <h4>{playlist.name}</h4>
                    <p>{playlist.desc}</p>
                  </div>
                  {currentTrack?.id === playlist.id && (
                    <span className="now-playing-badge">▶ Playing</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artists Tab */}
        {activeCategory === 'artists' && (
          <div className="artists-section">
            <h3>🎤 Popular Artists</h3>
            <p className="section-note">Click to see their music</p>
            <div className="artist-grid">
              {POPULAR_ARTISTS.map(artist => (
                <div 
                  key={artist.name}
                  className="artist-card"
                  onClick={() => playTrack({ ...artist, id: artist.name, desc: 'Artist profile' })}
                >
                  <span className="artist-icon">{artist.icon}</span>
                  <span className="artist-name">{artist.name}</span>
                </div>
              ))}
            </div>

            {/* Quick Artist Search */}
            <div className="artist-search">
              <h4>🔍 Search for more artists</h4>
              <div className="quick-search-grid">
                {['Ariana Grande', 'Ed Sheeran', 'BTS', 'Dua Lipa', 'Bad Bunny', 'Rihanna'].map(name => (
                  <button 
                    key={name}
                    className="quick-search-btn"
                    onClick={() => quickSearch(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Width Music Player */}
      {currentTrack && (
        <div className="music-player-bar">
          <div className="player-header">
            <div className="now-playing-info">
              <span className="np-icon">{currentTrack.icon}</span>
              <div className="np-text">
                <span className="np-name">{currentTrack.name}</span>
                <span className="np-desc">{currentTrack.desc}</span>
              </div>
            </div>
            <div className="player-controls">
              <span className="full-song-badge">🎵 Full Songs</span>
              <button className="close-btn" onClick={closePlayer}>✕ Close</button>
            </div>
          </div>
          
          <div className="player-embed">
            <iframe
              title={currentTrack.name}
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={getSoundCloudEmbed(currentTrack.url, true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicSection;
