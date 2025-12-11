/* ========================================
   MusicSection.jsx - Music & Radio Hub
   ======================================== */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// Radio station categories
const RADIO_STATIONS = {
  lofi: {
    name: '🎵 Lo-Fi & Chill',
    stations: [
      { id: 'lofi-girl', name: 'Lofi Girl', icon: '🎧', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1', type: 'youtube', live: true },
      { id: 'chillhop', name: 'Chillhop Radio', icon: '☕', url: 'https://www.youtube.com/embed/5yx6BWlEVcY?autoplay=1', type: 'youtube', live: true },
      { id: 'college-music', name: 'College Music', icon: '📚', url: 'https://www.youtube.com/embed/fEvM-OUbaKs?autoplay=1', type: 'youtube', live: true },
      { id: 'the-bootleg-boy', name: 'Bootleg Boy', icon: '🌙', url: 'https://www.youtube.com/embed/p1fjU1sQkvw?autoplay=1', type: 'youtube', live: true },
      { id: 'lofi-loft', name: 'Lofi Loft', icon: '🏠', url: 'https://www.youtube.com/embed/jrTMMG0zJyI?autoplay=1', type: 'youtube', live: true }
    ]
  },
  ambient: {
    name: '🌊 Ambient & Nature',
    stations: [
      { id: 'relaxing-nature', name: 'Nature Sounds', icon: '🌲', url: 'https://www.youtube.com/embed/eKFTSSKCzWA?autoplay=1', type: 'youtube', live: true },
      { id: 'rain-sounds', name: 'Rain Sounds', icon: '🌧️', url: 'https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1', type: 'youtube', live: true },
      { id: 'ocean-waves', name: 'Ocean Waves', icon: '🌊', url: 'https://www.youtube.com/embed/WHPEKLQID4U?autoplay=1', type: 'youtube', live: true },
      { id: 'fireplace', name: 'Fireplace', icon: '🔥', url: 'https://www.youtube.com/embed/UgHKb_7884o?autoplay=1', type: 'youtube', live: true },
      { id: 'thunderstorm', name: 'Thunderstorm', icon: '⛈️', url: 'https://www.youtube.com/embed/gVKEM4K8J8A?autoplay=1', type: 'youtube', live: true }
    ]
  },
  jazz: {
    name: '🎷 Jazz & Blues',
    stations: [
      { id: 'jazz-radio', name: 'Jazz Radio', icon: '🎷', url: 'https://www.youtube.com/embed/Dx5qFachd3A?autoplay=1', type: 'youtube', live: true },
      { id: 'cafe-jazz', name: 'Coffee Shop Jazz', icon: '☕', url: 'https://www.youtube.com/embed/fEvM-OUbaKs?autoplay=1', type: 'youtube', live: true },
      { id: 'smooth-jazz', name: 'Smooth Jazz', icon: '🎺', url: 'https://www.youtube.com/embed/RBkbiSxkHaU?autoplay=1', type: 'youtube', live: true },
      { id: 'blues-radio', name: 'Blues Radio', icon: '🎸', url: 'https://www.youtube.com/embed/9hT-t19CJ4E?autoplay=1', type: 'youtube', live: true }
    ]
  },
  electronic: {
    name: '🎹 Electronic & EDM',
    stations: [
      { id: 'monstercat', name: 'Monstercat', icon: '🐱', url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1', type: 'youtube', live: true },
      { id: 'mrsuicidesheep', name: 'MrSuicideSheep', icon: '🐑', url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1', type: 'youtube', live: true },
      { id: 'trap-nation', name: 'Trap Nation', icon: '🔊', url: 'https://www.youtube.com/embed/79dP7T2OOLs?autoplay=1', type: 'youtube', live: true },
      { id: 'bass-nation', name: 'Bass Nation', icon: '🔉', url: 'https://www.youtube.com/embed/aJoo79OwZEI?autoplay=1', type: 'youtube', live: true }
    ]
  },
  classical: {
    name: '🎻 Classical',
    stations: [
      { id: 'classical-radio', name: 'Classical Radio', icon: '🎻', url: 'https://www.youtube.com/embed/mIYzp5rcTvU?autoplay=1', type: 'youtube', live: true },
      { id: 'piano', name: 'Piano Music', icon: '🎹', url: 'https://www.youtube.com/embed/HSOtku1j600?autoplay=1', type: 'youtube', live: true },
      { id: 'orchestra', name: 'Orchestra', icon: '🎼', url: 'https://www.youtube.com/embed/jgpJVI3tDbY?autoplay=1', type: 'youtube', live: true }
    ]
  },
  world: {
    name: '🌍 World Radio',
    stations: [
      { id: 'bbc-radio1', name: 'BBC Radio 1', icon: '🇬🇧', url: 'https://www.bbc.co.uk/sounds/play/live:bbc_radio_one', type: 'external' },
      { id: 'nts', name: 'NTS Radio', icon: '📻', url: 'https://www.nts.live/', type: 'external' },
      { id: 'kexp', name: 'KEXP Seattle', icon: '🇺🇸', url: 'https://www.kexp.org/', type: 'external' },
      { id: 'triple-j', name: 'Triple J', icon: '🇦🇺', url: 'https://www.abc.net.au/triplej/', type: 'external' },
      { id: 'fip', name: 'FIP Radio', icon: '🇫🇷', url: 'https://www.radiofrance.fr/fip', type: 'external' }
    ]
  },
  anime: {
    name: '🎌 Anime & Game OST',
    stations: [
      { id: 'anime-radio', name: 'Anime Radio', icon: '🎌', url: 'https://www.youtube.com/embed/WDXPJWIgX-o?autoplay=1', type: 'youtube', live: true },
      { id: 'game-ost', name: 'Game OST Radio', icon: '🎮', url: 'https://www.youtube.com/embed/GDflVhOpS4E?autoplay=1', type: 'youtube', live: true },
      { id: 'nintendo', name: 'Nintendo Music', icon: '🍄', url: 'https://www.youtube.com/embed/GDflVhOpS4E?autoplay=1', type: 'youtube', live: true },
      { id: 'final-fantasy', name: 'Final Fantasy', icon: '⚔️', url: 'https://www.youtube.com/embed/ELkT1QBfpLY?autoplay=1', type: 'youtube', live: true }
    ]
  }
};

// Music streaming services
const MUSIC_SERVICES = [
  { id: 'spotify', name: 'Spotify', icon: '💚', url: 'https://open.spotify.com/', color: '#1DB954' },
  { id: 'youtube-music', name: 'YouTube Music', icon: '🔴', url: 'https://music.youtube.com/', color: '#FF0000' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '🟠', url: 'https://soundcloud.com/', color: '#FF5500' },
  { id: 'bandcamp', name: 'Bandcamp', icon: '💙', url: 'https://bandcamp.com/', color: '#1DA0C3' },
  { id: 'deezer', name: 'Deezer', icon: '🟣', url: 'https://www.deezer.com/', color: '#A238FF' },
  { id: 'tidal', name: 'Tidal', icon: '⬛', url: 'https://tidal.com/', color: '#000000' }
];

// Podcast platforms
const PODCAST_PLATFORMS = [
  { id: 'spotify-podcasts', name: 'Spotify Podcasts', icon: '🎙️', url: 'https://open.spotify.com/genre/podcasts-web' },
  { id: 'apple-podcasts', name: 'Apple Podcasts', icon: '🍎', url: 'https://podcasts.apple.com/' },
  { id: 'pocket-casts', name: 'Pocket Casts', icon: '📱', url: 'https://pocketcasts.com/' },
  { id: 'overcast', name: 'Overcast', icon: '☁️', url: 'https://overcast.fm/' }
];

function MusicSection() {
  const { actions } = useApp();
  const [activeCategory, setActiveCategory] = useState('lofi');
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentStations, setRecentStations] = useState([]);
  const [volume, setVolume] = useState(80);
  const [isMinimized, setIsMinimized] = useState(false);
  const playerRef = useRef(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('movienights_radio_favorites');
      const savedRecent = localStorage.getItem('movienights_recent_stations');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedRecent) setRecentStations(JSON.parse(savedRecent));
    } catch (e) {
      console.error('Error loading radio data:', e);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = (station) => {
    const newFavorites = favorites.includes(station.id)
      ? favorites.filter(f => f !== station.id)
      : [...favorites, station.id];
    
    setFavorites(newFavorites);
    localStorage.setItem('movienights_radio_favorites', JSON.stringify(newFavorites));
  };

  // Play station
  const playStation = (station) => {
    if (station.type === 'external') {
      window.open(station.url, '_blank');
      return;
    }
    
    setCurrentStation(station);
    setIsPlaying(true);
    
    // Add to recent
    const newRecent = [
      station,
      ...recentStations.filter(s => s.id !== station.id)
    ].slice(0, 5);
    setRecentStations(newRecent);
    localStorage.setItem('movienights_recent_stations', JSON.stringify(newRecent));
    
    actions.addNotification(`🎵 Now playing: ${station.name}`, 'info');
  };

  // Stop playing
  const stopPlaying = () => {
    setCurrentStation(null);
    setIsPlaying(false);
  };

  // Open external service
  const openService = (url) => {
    window.open(url, '_blank');
  };

  // Get all favorite stations
  const getFavoriteStations = () => {
    const allStations = Object.values(RADIO_STATIONS).flatMap(cat => cat.stations);
    return allStations.filter(s => favorites.includes(s.id));
  };

  return (
    <div className="music-section">
      <h2 className="section-title">🎵 Music & Radio</h2>

      {/* Now Playing Bar */}
      {currentStation && (
        <div className={`now-playing-bar ${isMinimized ? 'minimized' : ''}`}>
          <div className="now-playing-info">
            <span className="now-playing-icon">{currentStation.icon}</span>
            <div className="now-playing-details">
              <span className="now-playing-name">{currentStation.name}</span>
              {currentStation.live && <span className="live-badge">● LIVE</span>}
            </div>
          </div>
          <div className="now-playing-controls">
            <button 
              className="control-btn"
              onClick={() => toggleFavorite(currentStation)}
              title="Favorite"
            >
              {favorites.includes(currentStation.id) ? '⭐' : '☆'}
            </button>
            <button 
              className="control-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '⬆️' : '⬇️'}
            </button>
            <button 
              className="control-btn stop-btn"
              onClick={stopPlaying}
              title="Stop"
            >
              ⏹️
            </button>
          </div>
          {!isMinimized && (
            <div className="player-embed">
              <iframe
                ref={playerRef}
                src={currentStation.url}
                title={currentStation.name}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {/* Recent Stations */}
      {recentStations.length > 0 && !currentStation && (
        <div className="recent-stations">
          <h3>🕐 Recently Played</h3>
          <div className="recent-scroll">
            {recentStations.map((station) => (
              <button
                key={station.id}
                className="recent-station-btn"
                onClick={() => playStation(station)}
              >
                <span>{station.icon}</span>
                <span>{station.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favorites */}
      {getFavoriteStations().length > 0 && (
        <div className="favorite-stations">
          <h3>⭐ Your Favorites</h3>
          <div className="stations-grid small">
            {getFavoriteStations().map((station) => (
              <div
                key={station.id}
                className="station-card"
                onClick={() => playStation(station)}
              >
                <span className="station-icon">{station.icon}</span>
                <span className="station-name">{station.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="category-tabs">
        {Object.entries(RADIO_STATIONS).map(([key, category]) => (
          <button
            key={key}
            className={`category-tab ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Stations Grid */}
      <div className="stations-section">
        <h3>{RADIO_STATIONS[activeCategory].name}</h3>
        <div className="stations-grid">
          {RADIO_STATIONS[activeCategory].stations.map((station) => (
            <div
              key={station.id}
              className={`station-card ${currentStation?.id === station.id ? 'playing' : ''}`}
              onClick={() => playStation(station)}
            >
              <div className="station-icon-wrapper">
                <span className="station-icon">{station.icon}</span>
                {station.live && <span className="live-dot"></span>}
              </div>
              <div className="station-info">
                <span className="station-name">{station.name}</span>
                {station.type === 'external' && (
                  <span className="external-badge">Opens in new tab ↗</span>
                )}
              </div>
              <button
                className={`favorite-btn ${favorites.includes(station.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(station);
                }}
              >
                {favorites.includes(station.id) ? '⭐' : '☆'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Music Services */}
      <div className="services-section">
        <h3>🎧 Music Services</h3>
        <div className="services-grid">
          {MUSIC_SERVICES.map((service) => (
            <button
              key={service.id}
              className="service-card"
              onClick={() => openService(service.url)}
              style={{ '--service-color': service.color }}
            >
              <span className="service-icon">{service.icon}</span>
              <span className="service-name">{service.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Podcasts */}
      <div className="podcasts-section">
        <h3>🎙️ Podcasts</h3>
        <div className="services-grid">
          {PODCAST_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              className="service-card podcast-card"
              onClick={() => openService(platform.url)}
            >
              <span className="service-icon">{platform.icon}</span>
              <span className="service-name">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h3>🔗 More Music</h3>
        <div className="quick-links-grid">
          <a href="https://www.internet-radio.com/" target="_blank" rel="noopener noreferrer">Internet Radio</a>
          <a href="https://radio.garden/" target="_blank" rel="noopener noreferrer">Radio Garden</a>
          <a href="https://somafm.com/" target="_blank" rel="noopener noreferrer">SomaFM</a>
          <a href="https://www.di.fm/" target="_blank" rel="noopener noreferrer">DI.FM</a>
          <a href="https://8tracks.com/" target="_blank" rel="noopener noreferrer">8tracks</a>
          <a href="https://poolside.fm/" target="_blank" rel="noopener noreferrer">Poolside FM</a>
        </div>
      </div>
    </div>
  );
}

export default MusicSection;
