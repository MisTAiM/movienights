/* ========================================
   LiveTVSection.jsx - Live TV with Channel Guide
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import CastButton from '../ui/CastButton';
import './LiveTVSection.css';

// Channel data organized by category
// Using DaddyLive embed format: https://dlhd.dad/stream/stream-{id}.php
const CHANNELS = {
  news: [
    { id: 'abc-news', name: 'ABC News Live', logo: '📺', source: 'https://dlhd.dad/stream/stream-85.php' },
    { id: 'cbs-news', name: 'CBS News', logo: '📺', source: 'https://dlhd.dad/stream/stream-86.php' },
    { id: 'nbc-news', name: 'NBC News NOW', logo: '📺', source: 'https://dlhd.dad/stream/stream-87.php' },
    { id: 'cnn', name: 'CNN', logo: '🔴', source: 'https://dlhd.dad/stream/stream-88.php' },
    { id: 'fox-news', name: 'Fox News', logo: '🦊', source: 'https://dlhd.dad/stream/stream-91.php' },
    { id: 'msnbc', name: 'MSNBC', logo: '📰', source: 'https://dlhd.dad/stream/stream-92.php' },
    { id: 'cnbc', name: 'CNBC', logo: '💹', source: 'https://dlhd.dad/stream/stream-93.php' },
    { id: 'bbc-news', name: 'BBC News', logo: '🇬🇧', source: 'https://dlhd.dad/stream/stream-225.php' },
    { id: 'sky-news', name: 'Sky News', logo: '☁️', source: 'https://dlhd.dad/stream/stream-233.php' },
    { id: 'bloomberg', name: 'Bloomberg TV', logo: '📊', source: 'https://dlhd.dad/stream/stream-94.php' },
    { id: 'newsmax', name: 'Newsmax', logo: '📡', source: 'https://dlhd.dad/stream/stream-95.php' },
    { id: 'cspan', name: 'C-SPAN', logo: '🏛️', source: 'https://dlhd.dad/stream/stream-96.php' },
  ],
  sports: [
    { id: 'espn', name: 'ESPN', logo: '🏈', source: 'https://dlhd.dad/stream/stream-1.php' },
    { id: 'espn2', name: 'ESPN 2', logo: '🏀', source: 'https://dlhd.dad/stream/stream-2.php' },
    { id: 'espnu', name: 'ESPN U', logo: '🎓', source: 'https://dlhd.dad/stream/stream-3.php' },
    { id: 'espnews', name: 'ESPN News', logo: '📰', source: 'https://dlhd.dad/stream/stream-4.php' },
    { id: 'fox-sports-1', name: 'Fox Sports 1', logo: '⚽', source: 'https://dlhd.dad/stream/stream-5.php' },
    { id: 'fox-sports-2', name: 'Fox Sports 2', logo: '🎾', source: 'https://dlhd.dad/stream/stream-6.php' },
    { id: 'nfl-network', name: 'NFL Network', logo: '🏈', source: 'https://dlhd.dad/stream/stream-7.php' },
    { id: 'nba-tv', name: 'NBA TV', logo: '🏀', source: 'https://dlhd.dad/stream/stream-8.php' },
    { id: 'mlb-network', name: 'MLB Network', logo: '⚾', source: 'https://dlhd.dad/stream/stream-9.php' },
    { id: 'nhl-network', name: 'NHL Network', logo: '🏒', source: 'https://dlhd.dad/stream/stream-10.php' },
    { id: 'cbs-sports', name: 'CBS Sports', logo: '🏆', source: 'https://dlhd.dad/stream/stream-11.php' },
    { id: 'tnt-sports', name: 'TNT Sports', logo: '💥', source: 'https://dlhd.dad/stream/stream-12.php' },
    { id: 'golf-channel', name: 'Golf Channel', logo: '⛳', source: 'https://dlhd.dad/stream/stream-13.php' },
    { id: 'tennis-channel', name: 'Tennis Channel', logo: '🎾', source: 'https://dlhd.dad/stream/stream-14.php' },
    { id: 'bein-sports', name: 'beIN Sports', logo: '⚽', source: 'https://dlhd.dad/stream/stream-15.php' },
    { id: 'acc-network', name: 'ACC Network', logo: '🎓', source: 'https://dlhd.dad/stream/stream-16.php' },
    { id: 'sec-network', name: 'SEC Network', logo: '🏈', source: 'https://dlhd.dad/stream/stream-17.php' },
    { id: 'big-ten', name: 'Big Ten Network', logo: '🏀', source: 'https://dlhd.dad/stream/stream-18.php' },
  ],
  entertainment: [
    { id: 'tnt', name: 'TNT', logo: '💥', source: 'https://dlhd.dad/stream/stream-56.php' },
    { id: 'tbs', name: 'TBS', logo: '😂', source: 'https://dlhd.dad/stream/stream-57.php' },
    { id: 'usa-network', name: 'USA Network', logo: '🇺🇸', source: 'https://dlhd.dad/stream/stream-58.php' },
    { id: 'fx', name: 'FX', logo: '🎬', source: 'https://dlhd.dad/stream/stream-59.php' },
    { id: 'fxx', name: 'FXX', logo: '🎭', source: 'https://dlhd.dad/stream/stream-60.php' },
    { id: 'amc', name: 'AMC', logo: '🎥', source: 'https://dlhd.dad/stream/stream-61.php' },
    { id: 'bravo', name: 'Bravo', logo: '👏', source: 'https://dlhd.dad/stream/stream-62.php' },
    { id: 'e-entertainment', name: 'E!', logo: '⭐', source: 'https://dlhd.dad/stream/stream-63.php' },
    { id: 'comedy-central', name: 'Comedy Central', logo: '🤣', source: 'https://dlhd.dad/stream/stream-64.php' },
    { id: 'mtv', name: 'MTV', logo: '🎸', source: 'https://dlhd.dad/stream/stream-65.php' },
    { id: 'vh1', name: 'VH1', logo: '🎵', source: 'https://dlhd.dad/stream/stream-66.php' },
    { id: 'bet', name: 'BET', logo: '🎤', source: 'https://dlhd.dad/stream/stream-67.php' },
    { id: 'syfy', name: 'Syfy', logo: '👽', source: 'https://dlhd.dad/stream/stream-68.php' },
    { id: 'paramount', name: 'Paramount', logo: '⛰️', source: 'https://dlhd.dad/stream/stream-69.php' },
    { id: 'lifetime', name: 'Lifetime', logo: '💝', source: 'https://dlhd.dad/stream/stream-70.php' },
    { id: 'hallmark', name: 'Hallmark', logo: '💌', source: 'https://dlhd.dad/stream/stream-71.php' },
  ],
  broadcast: [
    { id: 'abc', name: 'ABC', logo: '🔵', source: 'https://dlhd.dad/stream/stream-51.php' },
    { id: 'cbs', name: 'CBS', logo: '👁️', source: 'https://dlhd.dad/stream/stream-52.php' },
    { id: 'nbc', name: 'NBC', logo: '🦚', source: 'https://dlhd.dad/stream/stream-53.php' },
    { id: 'fox', name: 'FOX', logo: '🦊', source: 'https://dlhd.dad/stream/stream-54.php' },
    { id: 'cw', name: 'The CW', logo: '📺', source: 'https://dlhd.dad/stream/stream-55.php' },
    { id: 'pbs', name: 'PBS', logo: '🎓', source: 'https://dlhd.dad/stream/stream-97.php' },
  ],
  movies: [
    { id: 'hbo', name: 'HBO', logo: '🎬', source: 'https://dlhd.dad/stream/stream-72.php' },
    { id: 'hbo2', name: 'HBO 2', logo: '🎬', source: 'https://dlhd.dad/stream/stream-73.php' },
    { id: 'showtime', name: 'Showtime', logo: '🎭', source: 'https://dlhd.dad/stream/stream-74.php' },
    { id: 'starz', name: 'Starz', logo: '⭐', source: 'https://dlhd.dad/stream/stream-75.php' },
    { id: 'cinemax', name: 'Cinemax', logo: '🎞️', source: 'https://dlhd.dad/stream/stream-76.php' },
    { id: 'tcm', name: 'TCM', logo: '🎩', source: 'https://dlhd.dad/stream/stream-77.php' },
    { id: 'fxm', name: 'FXM', logo: '📽️', source: 'https://dlhd.dad/stream/stream-78.php' },
    { id: 'ifc', name: 'IFC', logo: '🎬', source: 'https://dlhd.dad/stream/stream-79.php' },
    { id: 'epix', name: 'MGM+', logo: '🦁', source: 'https://dlhd.dad/stream/stream-80.php' },
  ],
  kids: [
    { id: 'cartoon-network', name: 'Cartoon Network', logo: '🎨', source: 'https://dlhd.dad/stream/stream-98.php' },
    { id: 'nickelodeon', name: 'Nickelodeon', logo: '🧽', source: 'https://dlhd.dad/stream/stream-99.php' },
    { id: 'disney-channel', name: 'Disney Channel', logo: '🏰', source: 'https://dlhd.dad/stream/stream-100.php' },
    { id: 'disney-xd', name: 'Disney XD', logo: '🦸', source: 'https://dlhd.dad/stream/stream-101.php' },
    { id: 'disney-junior', name: 'Disney Junior', logo: '👶', source: 'https://dlhd.dad/stream/stream-102.php' },
    { id: 'nick-jr', name: 'Nick Jr', logo: '🧸', source: 'https://dlhd.dad/stream/stream-103.php' },
    { id: 'boomerang', name: 'Boomerang', logo: '🪃', source: 'https://dlhd.dad/stream/stream-104.php' },
    { id: 'pbs-kids', name: 'PBS Kids', logo: '🐸', source: 'https://dlhd.dad/stream/stream-105.php' },
    { id: 'nicktoons', name: 'Nicktoons', logo: '🎪', source: 'https://dlhd.dad/stream/stream-106.php' },
  ],
  documentary: [
    { id: 'discovery', name: 'Discovery', logo: '🌍', source: 'https://dlhd.dad/stream/stream-107.php' },
    { id: 'national-geographic', name: 'Nat Geo', logo: '🦁', source: 'https://dlhd.dad/stream/stream-108.php' },
    { id: 'history', name: 'History', logo: '📜', source: 'https://dlhd.dad/stream/stream-109.php' },
    { id: 'animal-planet', name: 'Animal Planet', logo: '🐘', source: 'https://dlhd.dad/stream/stream-110.php' },
    { id: 'science-channel', name: 'Science', logo: '🔬', source: 'https://dlhd.dad/stream/stream-111.php' },
    { id: 'smithsonian', name: 'Smithsonian', logo: '🏛️', source: 'https://dlhd.dad/stream/stream-112.php' },
    { id: 'tlc', name: 'TLC', logo: '💡', source: 'https://dlhd.dad/stream/stream-113.php' },
    { id: 'a&e', name: 'A&E', logo: '🎭', source: 'https://dlhd.dad/stream/stream-114.php' },
    { id: 'travel-channel', name: 'Travel', logo: '✈️', source: 'https://dlhd.dad/stream/stream-115.php' },
    { id: 'food-network', name: 'Food Network', logo: '🍳', source: 'https://dlhd.dad/stream/stream-116.php' },
    { id: 'hgtv', name: 'HGTV', logo: '🏠', source: 'https://dlhd.dad/stream/stream-117.php' },
    { id: 'investigation-discovery', name: 'ID', logo: '🔍', source: 'https://dlhd.dad/stream/stream-118.php' },
  ],
};

const CATEGORIES = [
  { id: 'news', name: 'News', icon: '📰' },
  { id: 'sports', name: 'Sports', icon: '🏆' },
  { id: 'broadcast', name: 'Broadcast', icon: '📺' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
  { id: 'movies', name: 'Movies', icon: '🎬' },
  { id: 'kids', name: 'Kids', icon: '👶' },
  { id: 'documentary', name: 'Documentary', icon: '🌍' },
];

function LiveTVSection() {
  const { actions } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('news');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showGuide, setShowGuide] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('livetv_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
    
    // Select first channel on load
    if (CHANNELS[selectedCategory]?.length > 0) {
      setSelectedChannel(CHANNELS[selectedCategory][0]);
    }
  }, []);

  // Update selected channel when category changes
  useEffect(() => {
    if (CHANNELS[selectedCategory]?.length > 0 && !selectedChannel) {
      setSelectedChannel(CHANNELS[selectedCategory][0]);
    }
  }, [selectedCategory]);

  const toggleFavorite = (channel) => {
    let newFavorites;
    if (favorites.some(f => f.id === channel.id)) {
      newFavorites = favorites.filter(f => f.id !== channel.id);
      actions.addNotification(`Removed ${channel.name} from favorites`, 'info');
    } else {
      newFavorites = [...favorites, channel];
      actions.addNotification(`Added ${channel.name} to favorites`, 'success');
    }
    setFavorites(newFavorites);
    localStorage.setItem('livetv_favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (channelId) => favorites.some(f => f.id === channelId);

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    actions.addNotification(`Now watching: ${channel.name}`, 'info');
  };

  const handlePrevChannel = () => {
    const channels = CHANNELS[selectedCategory];
    const currentIndex = channels.findIndex(c => c.id === selectedChannel?.id);
    const prevIndex = currentIndex <= 0 ? channels.length - 1 : currentIndex - 1;
    handleChannelChange(channels[prevIndex]);
  };

  const handleNextChannel = () => {
    const channels = CHANNELS[selectedCategory];
    const currentIndex = channels.findIndex(c => c.id === selectedChannel?.id);
    const nextIndex = currentIndex >= channels.length - 1 ? 0 : currentIndex + 1;
    handleChannelChange(channels[nextIndex]);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevChannel();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextChannel();
      } else if (e.key === 'g' || e.key === 'G') {
        setShowGuide(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChannel, selectedCategory]);

  const currentChannels = selectedCategory === 'favorites' 
    ? favorites 
    : CHANNELS[selectedCategory] || [];

  return (
    <div className={`live-tv-section ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="live-tv-header">
        <h2>📺 Live TV</h2>
        <div className="live-tv-controls">
          <button 
            className={`control-btn ${showGuide ? 'active' : ''}`}
            onClick={() => setShowGuide(!showGuide)}
            title="Toggle Guide (G)"
          >
            📋 Guide
          </button>
          <button 
            className="control-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? '⬜ Exit' : '⬛ Fullscreen'}
          </button>
        </div>
      </div>

      <div className="live-tv-container">
        {/* Channel Guide */}
        {showGuide && (
          <div className="channel-guide">
            {/* Category Tabs */}
            <div className="category-tabs">
              <button
                className={`category-tab ${selectedCategory === 'favorites' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('favorites')}
              >
                ⭐ Favorites
                {favorites.length > 0 && <span className="count">{favorites.length}</span>}
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Channel List */}
            <div className="channel-list">
              {currentChannels.length === 0 ? (
                <div className="no-channels">
                  {selectedCategory === 'favorites' 
                    ? 'No favorite channels yet. Click ⭐ on a channel to add it!'
                    : 'No channels available'}
                </div>
              ) : (
                currentChannels.map((channel, index) => (
                  <div
                    key={channel.id}
                    className={`channel-item ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                    onClick={() => handleChannelChange(channel)}
                  >
                    <span className="channel-number">{index + 1}</span>
                    <span className="channel-logo">{channel.logo}</span>
                    <span className="channel-name">{channel.name}</span>
                    <button
                      className={`favorite-btn ${isFavorite(channel.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(channel);
                      }}
                    >
                      {isFavorite(channel.id) ? '⭐' : '☆'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Controls */}
            <div className="guide-footer">
              <span className="hint">↑↓ Change Channel</span>
              <span className="hint">G Toggle Guide</span>
              <span className="hint">F Fullscreen</span>
            </div>
          </div>
        )}

        {/* Player Area */}
        <div className="live-player-area">
          {/* Now Playing Bar */}
          <div className="now-playing-bar">
            <button className="channel-nav-btn" onClick={handlePrevChannel}>
              ◀ Prev
            </button>
            <div className="now-playing-info">
              {selectedChannel ? (
                <>
                  <span className="live-badge">🔴 LIVE</span>
                  <span className="current-channel-logo">{selectedChannel.logo}</span>
                  <span className="current-channel-name">{selectedChannel.name}</span>
                  <button
                    className={`favorite-btn-large ${isFavorite(selectedChannel.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedChannel)}
                  >
                    {isFavorite(selectedChannel.id) ? '⭐' : '☆'}
                  </button>
                </>
              ) : (
                <span>Select a channel to watch</span>
              )}
            </div>
            
            {/* Cast Button */}
            {selectedChannel && (
              <CastButton 
                currentSource={selectedChannel.source} 
                title={selectedChannel.name}
                isLiveTV={true}
              />
            )}
            
            <button className="channel-nav-btn" onClick={handleNextChannel}>
              Next ▶
            </button>
          </div>

          {/* Video Player */}
          <div className="live-player-container">
            {selectedChannel ? (
              <>
                <iframe
                  key={selectedChannel.id}
                  src={selectedChannel.source}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={selectedChannel.name}
                />
                <a 
                  href={selectedChannel.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-external-btn"
                  title="Open in new tab if video doesn't load"
                >
                  🔗 Open External
                </a>
              </>
            ) : (
              <div className="no-channel-selected">
                <div className="tv-static">
                  <span className="static-icon">📺</span>
                  <p>Select a channel from the guide</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveTVSection;
