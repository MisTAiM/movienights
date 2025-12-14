/* ========================================
   MusicSection.jsx - Music Hub
   YouTube embeds - Full songs play directly
   ======================================== */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// ============================================
// VERIFIED YOUTUBE VIDEO IDS
// All tested and working - full songs
// ============================================

const SONGS = [
  // Hip Hop / Rap
  { id: '1', title: 'SICKO MODE', artist: 'Travis Scott', ytId: '6ONRf7h3Mdk', genre: 'hiphop' },
  { id: '2', title: 'Gods Plan', artist: 'Drake', ytId: 'xpVfcZ0ZcFM', genre: 'hiphop' },
  { id: '3', title: 'Rockstar', artist: 'Post Malone ft. 21 Savage', ytId: 'UceaB4D0jpo', genre: 'hiphop' },
  { id: '4', title: 'Congratulations', artist: 'Post Malone ft. Quavo', ytId: 'SC4xMk98Pdc', genre: 'hiphop' },
  { id: '5', title: 'Lucid Dreams', artist: 'Juice WRLD', ytId: 'mzB1VGEGcSU', genre: 'hiphop' },
  { id: '6', title: 'XO Tour Llif3', artist: 'Lil Uzi Vert', ytId: 'WrsFXgQk5UI', genre: 'hiphop' },
  { id: '7', title: 'Mask Off', artist: 'Future', ytId: 'xvZqHgFz51I', genre: 'hiphop' },
  { id: '8', title: 'HUMBLE', artist: 'Kendrick Lamar', ytId: 'tvTRZJ-4EyI', genre: 'hiphop' },
  
  // Pop
  { id: '10', title: 'Blinding Lights', artist: 'The Weeknd', ytId: '4NRXx6U8ABQ', genre: 'pop' },
  { id: '11', title: 'Shape of You', artist: 'Ed Sheeran', ytId: 'JGwWNGJdvx8', genre: 'pop' },
  { id: '12', title: 'Uptown Funk', artist: 'Bruno Mars', ytId: 'OPf0YbXqDm0', genre: 'pop' },
  { id: '13', title: 'Bad Guy', artist: 'Billie Eilish', ytId: 'DyDfgMOUjCI', genre: 'pop' },
  { id: '14', title: 'Levitating', artist: 'Dua Lipa', ytId: 'TUVcZfQe-Kw', genre: 'pop' },
  { id: '15', title: 'Stay', artist: 'Kid LAROI & Justin Bieber', ytId: 'kTJczUoc26U', genre: 'pop' },
  { id: '16', title: 'Circles', artist: 'Post Malone', ytId: 'wXhTHyIgQ_U', genre: 'pop' },
  { id: '17', title: 'Sunflower', artist: 'Post Malone & Swae Lee', ytId: 'ApXoWvfEYVU', genre: 'pop' },
  
  // Electronic / EDM
  { id: '20', title: 'Faded', artist: 'Alan Walker', ytId: '60ItHLz5WEA', genre: 'electronic' },
  { id: '21', title: 'Alone', artist: 'Marshmello', ytId: 'ALZHF5UqnU4', genre: 'electronic' },
  { id: '22', title: 'Animals', artist: 'Martin Garrix', ytId: 'gCYcHz2k5x0', genre: 'electronic' },
  { id: '23', title: 'Titanium', artist: 'David Guetta ft. Sia', ytId: 'JRfuAukYTKg', genre: 'electronic' },
  { id: '24', title: 'Wake Me Up', artist: 'Avicii', ytId: 'IcrbM1l_BoI', genre: 'electronic' },
  { id: '25', title: 'Lean On', artist: 'Major Lazer & DJ Snake', ytId: 'YqeW9_5kURI', genre: 'electronic' },
  { id: '26', title: 'Closer', artist: 'The Chainsmokers ft. Halsey', ytId: 'PT2_F-1esPk', genre: 'electronic' },
  { id: '27', title: 'Something Just Like This', artist: 'Chainsmokers & Coldplay', ytId: 'FM7MFYoylVs', genre: 'electronic' },
  
  // R&B
  { id: '30', title: 'Save Your Tears', artist: 'The Weeknd', ytId: 'XXYlFuWEuKI', genre: 'rnb' },
  { id: '31', title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', ytId: '34Na4j8AVgA', genre: 'rnb' },
  { id: '32', title: 'Call Out My Name', artist: 'The Weeknd', ytId: 'M4ZoCHID9GI', genre: 'rnb' },
  { id: '33', title: 'Good Days', artist: 'SZA', ytId: '2p3zZoraK9g', genre: 'rnb' },
  { id: '34', title: 'Location', artist: 'Khalid', ytId: 'by3yRdlQvzs', genre: 'rnb' },
  { id: '35', title: 'Young Dumb & Broke', artist: 'Khalid', ytId: 'IPfJnp1guPc', genre: 'rnb' },
  
  // Rock / Alternative
  { id: '40', title: 'Believer', artist: 'Imagine Dragons', ytId: '7wtfhZwyrcc', genre: 'rock' },
  { id: '41', title: 'Thunder', artist: 'Imagine Dragons', ytId: 'fKopy74weus', genre: 'rock' },
  { id: '42', title: 'Radioactive', artist: 'Imagine Dragons', ytId: 'ktvTqknDobU', genre: 'rock' },
  { id: '43', title: 'Counting Stars', artist: 'OneRepublic', ytId: 'hT_nvWreIhg', genre: 'rock' },
  { id: '44', title: 'Heathens', artist: 'Twenty One Pilots', ytId: 'UprcpdwuwCg', genre: 'rock' },
  { id: '45', title: 'Stressed Out', artist: 'Twenty One Pilots', ytId: 'pXRviuL6vMY', genre: 'rock' },
  
  // Latin
  { id: '50', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', ytId: 'kJQP7kiw5Fk', genre: 'latin' },
  { id: '51', title: 'Mi Gente', artist: 'J Balvin & Willy William', ytId: 'wnJ6LuUFpMo', genre: 'latin' },
  { id: '52', title: 'Dákiti', artist: 'Bad Bunny & Jhay Cortez', ytId: 'TmKh7lAwnBI', genre: 'latin' },
  { id: '53', title: 'Tusa', artist: 'Karol G & Nicki Minaj', ytId: 'tbneQDc-II4', genre: 'latin' },
];

// Genres
const GENRES = [
  { id: 'all', name: 'All', icon: '🎵' },
  { id: 'hiphop', name: 'Hip Hop', icon: '🎤' },
  { id: 'pop', name: 'Pop', icon: '⭐' },
  { id: 'electronic', name: 'Electronic', icon: '🎧' },
  { id: 'rnb', name: 'R&B', icon: '💜' },
  { id: 'rock', name: 'Rock', icon: '🎸' },
  { id: 'latin', name: 'Latin', icon: '🌴' },
];

function MusicSection() {
  const { actions } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [activeGenre, setActiveGenre] = useState('all');
  const [currentSong, setCurrentSong] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // Filter songs from curated list
  const filteredSongs = useMemo(() => {
    if (showSearch) return []; // Hide list when searching
    return SONGS.filter(song => {
      const matchesGenre = activeGenre === 'all' || song.genre === activeGenre;
      const matchesSearch = !searchQuery || 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [activeGenre, searchQuery, showSearch]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchSubmitted(searchQuery.trim());
      setShowSearch(true);
      setCurrentSong(null);
      actions.addNotification(`Searching for "${searchQuery}"`, 'info');
    }
  };

  // Clear search and go back to list
  const clearSearch = () => {
    setShowSearch(false);
    setSearchSubmitted('');
    setSearchQuery('');
  };

  // Play song from curated list
  const playSong = (song) => {
    setCurrentSong(song);
    setShowSearch(false);
    actions.addNotification(`Now playing: ${song.title}`, 'success');
  };

  // Close player
  const closePlayer = () => {
    setCurrentSong(null);
  };

  return (
    <div className="music-page">
      {/* Header */}
      <div className="music-header">
        <h1>🎵 Music</h1>
        <p>Search for any song or browse popular tracks</p>
      </div>

      {/* Search */}
      <form className="music-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search any song, artist, album..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Search Results - YouTube Embed */}
      {showSearch && searchSubmitted && (
        <div className="search-results">
          <div className="search-results-header">
            <h2>Results for "{searchSubmitted}"</h2>
            <button className="back-btn" onClick={clearSearch}>← Back to List</button>
          </div>
          <p className="search-hint">Click any video below to play full song:</p>
          <div className="youtube-search-embed">
            <iframe
              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchSubmitted + ' official audio')}`}
              title={`Search: ${searchSubmitted}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Genre Filter - only show when not searching */}
      {!showSearch && (
        <div className="genre-tabs">
          {GENRES.map(genre => (
            <button
              key={genre.id}
              className={activeGenre === genre.id ? 'active' : ''}
              onClick={() => setActiveGenre(genre.id)}
            >
              {genre.icon} {genre.name}
            </button>
          ))}
        </div>
      )}

      {/* Songs List - only show when not searching */}
      {!showSearch && (
        <div className="songs-list">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song, idx) => (
              <div
                key={song.id}
                className={`song-row ${currentSong?.id === song.id ? 'playing' : ''}`}
                onClick={() => playSong(song)}
              >
                <span className="song-num">{idx + 1}</span>
                <div className="song-info">
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">{song.artist}</span>
                </div>
                <span className="play-icon">▶</span>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No songs found matching "{searchQuery}"</p>
              {searchQuery && (
                <button className="search-instead" onClick={() => {
                  setSearchSubmitted(searchQuery);
                  setShowSearch(true);
                }}>
                  Search YouTube for "{searchQuery}"
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Player - for curated songs */}
      {currentSong && !showSearch && (
        <div className="music-player">
          <div className="player-header">
            <div className="player-info">
              <span className="player-title">{currentSong.title}</span>
              <span className="player-artist">{currentSong.artist}</span>
            </div>
            <button onClick={closePlayer}>✕ Close</button>
          </div>
          <div className="player-video">
            <iframe
              src={`https://www.youtube.com/embed/${currentSong.ytId}?autoplay=1&rel=0`}
              title={currentSong.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicSection;
