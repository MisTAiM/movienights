/* ========================================
   MusicSection.jsx - Music Hub with Working Search
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// ============================================
// VERIFIED WORKING YOUTUBE VIDEO IDS
// ============================================

// Live 24/7 Radio Streams (verified working)
const RADIO_STREAMS = [
  { id: 'lofi-girl', name: 'Lofi Girl', icon: '👧', videoId: 'jfKfPfyJRdk', desc: 'Beats to study/relax to', live: true },
  { id: 'lofi-girl-sleep', name: 'Lofi Sleep', icon: '😴', videoId: 'rUxyKA_-grg', desc: 'Calm sleep music', live: true },
  { id: 'chillhop', name: 'Chillhop', icon: '🎵', videoId: '5yx6BWlEVcY', desc: 'Chillhop Radio', live: true },
  { id: 'jazz', name: 'Coffee Jazz', icon: '☕', videoId: '-5KAN9_CzSA', desc: 'Relaxing jazz', live: true },
  { id: 'classical', name: 'Classical', icon: '🎻', videoId: 'jgpJVI3tDbY', desc: 'Classical music radio', live: true },
  { id: 'synthwave', name: 'Synthwave', icon: '🌆', videoId: '4xDzrJKXOOY', desc: '80s retro vibes', live: true },
];

// Curated Playlists (verified working video IDs)
const PLAYLISTS = [
  { id: 'study', name: 'Study Music', icon: '📚', videoId: 'lTRiuFIWV54', desc: '3 hours focus music' },
  { id: 'workout', name: 'Workout Mix', icon: '💪', videoId: 'gDa1su1pNeM', desc: 'High energy hits' },
  { id: 'chill', name: 'Chill Vibes', icon: '🌴', videoId: 'lP26UCnoH9s', desc: 'Relaxing music mix' },
  { id: 'piano', name: 'Piano', icon: '🎹', videoId: '77ZozI0rw7w', desc: 'Beautiful piano music' },
  { id: 'ambient', name: 'Ambient', icon: '🌙', videoId: 'S_MOd40zlYU', desc: 'Atmospheric sounds' },
  { id: 'nature', name: 'Nature Sounds', icon: '🌿', videoId: 'eKFTSSKCzWA', desc: 'Rain, forest, ocean' },
  { id: 'gaming', name: 'Gaming Music', icon: '🎮', videoId: 'NmCCQxVBfyM', desc: 'Epic game soundtracks' },
  { id: 'meditation', name: 'Meditation', icon: '🧘', videoId: '1ZYbU82GVz4', desc: 'Peaceful meditation' },
];

// Genre Quick Search
const GENRES = [
  { id: 'pop', name: 'Pop', icon: '🎤', search: 'pop music 2024 hits' },
  { id: 'hiphop', name: 'Hip Hop', icon: '🎧', search: 'hip hop rap music mix' },
  { id: 'rock', name: 'Rock', icon: '🎸', search: 'rock music playlist' },
  { id: 'edm', name: 'EDM', icon: '🎹', search: 'edm electronic dance music' },
  { id: 'rnb', name: 'R&B', icon: '💜', search: 'rnb soul music' },
  { id: 'country', name: 'Country', icon: '🤠', search: 'country music hits' },
  { id: 'latin', name: 'Latin', icon: '💃', search: 'latin reggaeton music' },
  { id: 'kpop', name: 'K-Pop', icon: '🇰🇷', search: 'kpop music playlist' },
  { id: 'jazz', name: 'Jazz', icon: '🎷', search: 'jazz music relaxing' },
  { id: 'classical', name: 'Classical', icon: '🎻', search: 'classical music' },
  { id: 'indie', name: 'Indie', icon: '🎵', search: 'indie music playlist' },
  { id: 'metal', name: 'Metal', icon: '🤘', search: 'metal rock music' },
];

// External Music Platforms
const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', icon: '💚', url: 'https://open.spotify.com/' },
  { id: 'apple', name: 'Apple Music', icon: '🍎', url: 'https://music.apple.com/' },
  { id: 'ytmusic', name: 'YouTube Music', icon: '🔴', url: 'https://music.youtube.com/' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '🔶', url: 'https://soundcloud.com/' },
  { id: 'bandcamp', name: 'Bandcamp', icon: '💙', url: 'https://bandcamp.com/' },
  { id: 'deezer', name: 'Deezer', icon: '💎', url: 'https://www.deezer.com/' },
];

function MusicSection() {
  const { actions } = useApp();
  
  // State
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = no search, string = search term
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentPlays, setRecentPlays] = useState([]);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Refs
  const playerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('mn_music_favorites');
      const savedRecent = localStorage.getItem('mn_music_recent');
      const savedVolume = localStorage.getItem('mn_music_volume');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedRecent) setRecentPlays(JSON.parse(savedRecent));
      if (savedVolume) setVolume(parseInt(savedVolume));
    } catch (e) {}
  }, []);

  // Load YouTube API
  useEffect(() => {
    if (window.YT) return;
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchResults(searchQuery.trim());
      setActiveTab('search');
      actions.addNotification(`Searching: ${searchQuery}`, 'info');
    }
  };

  // Quick genre search
  const searchGenre = (genre) => {
    setSearchQuery(genre.search);
    setSearchResults(genre.search);
    setActiveTab('search');
  };

  // Play track
  const playTrack = useCallback((track) => {
    // Add to recent
    const newRecent = [
      { ...track, playedAt: Date.now() },
      ...recentPlays.filter(r => r.id !== track.id)
    ].slice(0, 20);
    setRecentPlays(newRecent);
    localStorage.setItem('mn_music_recent', JSON.stringify(newRecent));
    
    setCurrentTrack(track);
    setShowPlayer(true);
    setIsPlaying(true);
    actions.addNotification(`Now Playing: ${track.name}`, 'success');
  }, [recentPlays, actions]);

  // Toggle favorite
  const toggleFavorite = useCallback((track) => {
    const exists = favorites.find(f => f.id === track.id);
    const newFavs = exists
      ? favorites.filter(f => f.id !== track.id)
      : [...favorites, track];
    setFavorites(newFavs);
    localStorage.setItem('mn_music_favorites', JSON.stringify(newFavs));
  }, [favorites]);

  // Player controls
  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        playerRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    localStorage.setItem('mn_music_volume', newVolume.toString());
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  // Get YouTube embed URL
  const getEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`;
  };

  return (
    <div className="music-section">
      <h2 className="section-title">🎵 Music Hub</h2>

      {/* Search Bar */}
      <form className="music-search" onSubmit={handleSearch}>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" disabled={!searchQuery.trim()}>Search</button>
        </div>
      </form>

      {/* Genre Quick Search */}
      <div className="genre-pills">
        {GENRES.map(genre => (
          <button
            key={genre.id}
            className="genre-pill"
            onClick={() => searchGenre(genre)}
          >
            <span>{genre.icon}</span>
            <span>{genre.name}</span>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="music-tabs">
        <button 
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveTab('home'); setSearchResults(null); }}
        >
          <span>🏠</span> Home
        </button>
        <button 
          className={`tab ${activeTab === 'radio' ? 'active' : ''}`}
          onClick={() => setActiveTab('radio')}
        >
          <span>📻</span> Radio
        </button>
        <button 
          className={`tab ${activeTab === 'platforms' ? 'active' : ''}`}
          onClick={() => setActiveTab('platforms')}
        >
          <span>🎧</span> Platforms
        </button>
        <button 
          className={`tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <span>💼</span> Library
        </button>
        {searchResults && (
          <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            <span>🔍</span> Results
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="music-content">
        
        {/* Search Results Tab */}
        {activeTab === 'search' && searchResults && (
          <div className="search-tab">
            <div className="search-header">
              <h3>🔍 Results for "{searchResults}"</h3>
              <button className="clear-search" onClick={() => { setSearchResults(null); setActiveTab('home'); }}>
                ✕ Clear
              </button>
            </div>
            
            {/* Search Options */}
            <div className="search-options">
              <a 
                href={`https://music.youtube.com/search?q=${encodeURIComponent(searchResults)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="search-link primary"
              >
                <span>🔴</span>
                <span>Open in YouTube Music</span>
                <span className="arrow">↗</span>
              </a>
              <a 
                href={`https://open.spotify.com/search/${encodeURIComponent(searchResults)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="search-link"
              >
                <span>💚</span>
                <span>Open in Spotify</span>
                <span className="arrow">↗</span>
              </a>
              <a 
                href={`https://soundcloud.com/search?q=${encodeURIComponent(searchResults)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="search-link"
              >
                <span>🔶</span>
                <span>Open in SoundCloud</span>
                <span className="arrow">↗</span>
              </a>
            </div>

            {/* Embedded YouTube Search Player */}
            <div className="search-player">
              <h4>▶ Quick Play from YouTube</h4>
              <p className="search-hint">Playing top result for "{searchResults}"</p>
              <div className="search-embed">
                <iframe
                  src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchResults + ' music')}`}
                  title="Search Results"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="home-tab">
            {/* Recent Plays */}
            {recentPlays.length > 0 && (
              <section className="section">
                <h3>🕐 Recently Played</h3>
                <div className="scroll-row">
                  {recentPlays.slice(0, 8).map((track, idx) => (
                    <button key={idx} className="recent-card" onClick={() => playTrack(track)}>
                      <span className="recent-icon">{track.icon}</span>
                      <span className="recent-name">{track.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            <section className="section">
              <h3>🎭 Mood & Activity</h3>
              <div className="cards-grid">
                {PLAYLISTS.map(item => (
                  <div key={item.id} className="music-card">
                    <div className="card-main" onClick={() => playTrack(item)}>
                      <span className="card-icon">{item.icon}</span>
                      <div className="card-info">
                        <h4>{item.name}</h4>
                        <p>{item.desc}</p>
                      </div>
                      <span className="play-btn">▶</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => toggleFavorite(item)}
                        className={favorites.find(f => f.id === item.id) ? 'fav-active' : ''}
                      >
                        {favorites.find(f => f.id === item.id) ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Radio */}
            <section className="section">
              <h3>📻 Live Radio</h3>
              <div className="radio-row">
                {RADIO_STREAMS.slice(0, 4).map(station => (
                  <button key={station.id} className="radio-card-small" onClick={() => playTrack(station)}>
                    <span className="radio-icon">{station.icon}</span>
                    <div className="radio-info">
                      <span className="radio-name">{station.name}</span>
                      {station.live && <span className="live-badge">LIVE</span>}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Radio Tab */}
        {activeTab === 'radio' && (
          <div className="radio-tab">
            <section className="section">
              <h3>📻 24/7 Live Radio Streams</h3>
              <p className="section-desc">Click to tune in - these streams run 24/7!</p>
              <div className="radio-grid">
                {RADIO_STREAMS.map(station => (
                  <div 
                    key={station.id} 
                    className={`radio-card ${currentTrack?.id === station.id ? 'playing' : ''}`}
                  >
                    <div className="radio-main" onClick={() => playTrack(station)}>
                      <div className="radio-visual">
                        <span className="radio-big-icon">{station.icon}</span>
                        {station.live && <span className="live-indicator">● LIVE</span>}
                      </div>
                      <div className="radio-details">
                        <h4>{station.name}</h4>
                        <p>{station.desc}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => toggleFavorite(station)}
                        className={favorites.find(f => f.id === station.id) ? 'fav-active' : ''}
                      >
                        {favorites.find(f => f.id === station.id) ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="platforms-tab">
            <section className="section">
              <h3>🎧 Music Streaming Services</h3>
              <p className="section-desc">Open your favorite music platform</p>
              <div className="platforms-grid">
                {PLATFORMS.map(platform => (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="platform-card"
                  >
                    <span className="platform-icon">{platform.icon}</span>
                    <span className="platform-name">{platform.name}</span>
                    <span className="external">↗</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="library-tab">
            <section className="section">
              <h3>⭐ Favorites ({favorites.length})</h3>
              {favorites.length > 0 ? (
                <div className="cards-grid">
                  {favorites.map(item => (
                    <div key={item.id} className="music-card">
                      <div className="card-main" onClick={() => playTrack(item)}>
                        <span className="card-icon">{item.icon}</span>
                        <div className="card-info">
                          <h4>{item.name}</h4>
                          <p>{item.desc}</p>
                        </div>
                        <span className="play-btn">▶</span>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => toggleFavorite(item)} className="fav-active">★</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No favorites yet</p>
                  <p className="hint">Click ☆ on any track to save it here</p>
                </div>
              )}
            </section>

            <section className="section">
              <h3>🕐 History ({recentPlays.length})</h3>
              {recentPlays.length > 0 ? (
                <div className="history-list">
                  {recentPlays.map((item, idx) => (
                    <button key={idx} className="history-item" onClick={() => playTrack(item)}>
                      <span className="history-icon">{item.icon}</span>
                      <span className="history-name">{item.name}</span>
                      <span className="history-date">
                        {new Date(item.playedAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No listening history yet</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {showPlayer && currentTrack && (
        <div className="audio-player">
          {/* Hidden YouTube Player for Audio */}
          <iframe
            ref={playerRef}
            className="youtube-audio"
            src={getEmbedUrl(currentTrack.videoId)}
            title={currentTrack.name}
            allow="autoplay; encrypted-media"
          />

          {/* Visible Player Bar */}
          <div className="player-bar">
            <div className="player-track">
              <span className="player-icon">{currentTrack.icon}</span>
              <div className="player-info">
                <span className="player-name">{currentTrack.name}</span>
                <span className="player-desc">{currentTrack.desc}</span>
              </div>
            </div>

            <div className="player-controls">
              <button className="ctrl-btn" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
            </div>

            <div className="player-right">
              <div className="volume-control">
                <button className="ctrl-btn small" onClick={toggleMute}>
                  {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
              <button 
                className={`ctrl-btn small ${favorites.find(f => f.id === currentTrack.id) ? 'fav' : ''}`}
                onClick={() => toggleFavorite(currentTrack)}
              >
                {favorites.find(f => f.id === currentTrack.id) ? '★' : '☆'}
              </button>
              <button className="ctrl-btn small close" onClick={closePlayer}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicSection;
