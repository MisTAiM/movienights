/* ========================================
   MusicSection.jsx - Music Hub
   Search shows list of results first
   ======================================== */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// ============================================
// VERIFIED YOUTUBE VIDEO IDS - Curated Songs
// Large library for when API search fails
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
  { id: '9', title: 'In My Feelings', artist: 'Drake', ytId: 'DRS_PpOrUZ4', genre: 'hiphop' },
  { id: '10a', title: 'Hotline Bling', artist: 'Drake', ytId: 'uxpDa-c-4Mc', genre: 'hiphop' },
  { id: '10b', title: 'One Dance', artist: 'Drake ft. Wizkid', ytId: 'iAbnEUA0wpA', genre: 'hiphop' },
  { id: '10c', title: 'Money Trees', artist: 'Kendrick Lamar', ytId: 'smqhSl0u_sI', genre: 'hiphop' },
  { id: '10d', title: 'Goosebumps', artist: 'Travis Scott ft. Kendrick', ytId: 'Dst9gZkq1a8', genre: 'hiphop' },
  { id: '10e', title: 'Highest In The Room', artist: 'Travis Scott', ytId: 'tfSS1e3kYeo', genre: 'hiphop' },
  { id: '10f', title: 'Robbery', artist: 'Juice WRLD', ytId: 'iI34LYmJ1Fs', genre: 'hiphop' },
  { id: '10g', title: 'All Girls Are The Same', artist: 'Juice WRLD', ytId: 'h3EJICKwITw', genre: 'hiphop' },
  
  // Pop
  { id: '10', title: 'Blinding Lights', artist: 'The Weeknd', ytId: '4NRXx6U8ABQ', genre: 'pop' },
  { id: '11', title: 'Shape of You', artist: 'Ed Sheeran', ytId: 'JGwWNGJdvx8', genre: 'pop' },
  { id: '12', title: 'Uptown Funk', artist: 'Bruno Mars', ytId: 'OPf0YbXqDm0', genre: 'pop' },
  { id: '13', title: 'Bad Guy', artist: 'Billie Eilish', ytId: 'DyDfgMOUjCI', genre: 'pop' },
  { id: '14', title: 'Levitating', artist: 'Dua Lipa', ytId: 'TUVcZfQe-Kw', genre: 'pop' },
  { id: '15', title: 'Stay', artist: 'Kid LAROI & Justin Bieber', ytId: 'kTJczUoc26U', genre: 'pop' },
  { id: '16', title: 'Circles', artist: 'Post Malone', ytId: 'wXhTHyIgQ_U', genre: 'pop' },
  { id: '17', title: 'Sunflower', artist: 'Post Malone & Swae Lee', ytId: 'ApXoWvfEYVU', genre: 'pop' },
  { id: '17a', title: 'Peaches', artist: 'Justin Bieber', ytId: 'tQ0yjYUFKAE', genre: 'pop' },
  { id: '17b', title: 'Sorry', artist: 'Justin Bieber', ytId: 'fRh_vgS2dFE', genre: 'pop' },
  { id: '17c', title: 'What Do You Mean', artist: 'Justin Bieber', ytId: 'DK_0jXPuIr0', genre: 'pop' },
  { id: '17d', title: 'Perfect', artist: 'Ed Sheeran', ytId: '2Vv-BfVoq4g', genre: 'pop' },
  { id: '17e', title: 'Thinking Out Loud', artist: 'Ed Sheeran', ytId: 'lp-EO5I60KA', genre: 'pop' },
  { id: '17f', title: 'Photograph', artist: 'Ed Sheeran', ytId: 'nSDgHBxUbVQ', genre: 'pop' },
  { id: '17g', title: 'Anti-Hero', artist: 'Taylor Swift', ytId: 'b1kbLwvqugk', genre: 'pop' },
  { id: '17h', title: 'Shake It Off', artist: 'Taylor Swift', ytId: 'nfWlot6h_JM', genre: 'pop' },
  { id: '17i', title: 'Blank Space', artist: 'Taylor Swift', ytId: 'e-ORhEE9VVg', genre: 'pop' },
  { id: '17j', title: 'Love Story', artist: 'Taylor Swift', ytId: '8xg3vE8Ie_E', genre: 'pop' },
  { id: '17k', title: 'Flowers', artist: 'Miley Cyrus', ytId: 'G7KNmW9a75Y', genre: 'pop' },
  { id: '17l', title: 'Wrecking Ball', artist: 'Miley Cyrus', ytId: 'My2FRPA3Gf8', genre: 'pop' },
  { id: '17m', title: 'As It Was', artist: 'Harry Styles', ytId: 'H5v3kku4y6Q', genre: 'pop' },
  { id: '17n', title: 'Watermelon Sugar', artist: 'Harry Styles', ytId: 'E07s5ZYygMg', genre: 'pop' },
  
  // Electronic / EDM
  { id: '20', title: 'Faded', artist: 'Alan Walker', ytId: '60ItHLz5WEA', genre: 'electronic' },
  { id: '21', title: 'Alone', artist: 'Marshmello', ytId: 'ALZHF5UqnU4', genre: 'electronic' },
  { id: '22', title: 'Animals', artist: 'Martin Garrix', ytId: 'gCYcHz2k5x0', genre: 'electronic' },
  { id: '23', title: 'Titanium', artist: 'David Guetta ft. Sia', ytId: 'JRfuAukYTKg', genre: 'electronic' },
  { id: '24', title: 'Wake Me Up', artist: 'Avicii', ytId: 'IcrbM1l_BoI', genre: 'electronic' },
  { id: '25', title: 'Lean On', artist: 'Major Lazer & DJ Snake', ytId: 'YqeW9_5kURI', genre: 'electronic' },
  { id: '26', title: 'Closer', artist: 'The Chainsmokers ft. Halsey', ytId: 'PT2_F-1esPk', genre: 'electronic' },
  { id: '27', title: 'Something Just Like This', artist: 'Chainsmokers & Coldplay', ytId: 'FM7MFYoylVs', genre: 'electronic' },
  { id: '27a', title: 'Levels', artist: 'Avicii', ytId: '_ovdm2yX4MA', genre: 'electronic' },
  { id: '27b', title: 'The Nights', artist: 'Avicii', ytId: 'UtF6Jej8yb4', genre: 'electronic' },
  { id: '27c', title: 'Happier', artist: 'Marshmello ft. Bastille', ytId: 'm7Bc3pLyij0', genre: 'electronic' },
  { id: '27d', title: 'Silence', artist: 'Marshmello ft. Khalid', ytId: 'Tx1sqYc3qas', genre: 'electronic' },
  { id: '27e', title: 'Roses', artist: 'SAINt JHN (Imanbek Remix)', ytId: 'ele2DMU49Jk', genre: 'electronic' },
  { id: '27f', title: 'Don\'t Let Me Down', artist: 'The Chainsmokers', ytId: 'Io0fBr1XBUA', genre: 'electronic' },
  
  // R&B
  { id: '30', title: 'Save Your Tears', artist: 'The Weeknd', ytId: 'XXYlFuWEuKI', genre: 'rnb' },
  { id: '31', title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', ytId: '34Na4j8AVgA', genre: 'rnb' },
  { id: '32', title: 'Call Out My Name', artist: 'The Weeknd', ytId: 'M4ZoCHID9GI', genre: 'rnb' },
  { id: '33', title: 'Good Days', artist: 'SZA', ytId: '2p3zZoraK9g', genre: 'rnb' },
  { id: '34', title: 'Location', artist: 'Khalid', ytId: 'by3yRdlQvzs', genre: 'rnb' },
  { id: '35', title: 'Young Dumb & Broke', artist: 'Khalid', ytId: 'IPfJnp1guPc', genre: 'rnb' },
  { id: '35a', title: 'Die For You', artist: 'The Weeknd', ytId: 'mTLQhPFx2nM', genre: 'rnb' },
  { id: '35b', title: 'The Hills', artist: 'The Weeknd', ytId: 'yzTuBuRdAyA', genre: 'rnb' },
  { id: '35c', title: 'Can\'t Feel My Face', artist: 'The Weeknd', ytId: 'KEI4qSrkPAs', genre: 'rnb' },
  { id: '35d', title: 'Kill Bill', artist: 'SZA', ytId: 'hFBPE-ub69Q', genre: 'rnb' },
  { id: '35e', title: 'Kiss Me More', artist: 'Doja Cat ft. SZA', ytId: '0EVVKs6DQLo', genre: 'rnb' },
  { id: '35f', title: 'Say So', artist: 'Doja Cat', ytId: 'pok8H_KF1FA', genre: 'rnb' },
  { id: '35g', title: 'Best Part', artist: 'Daniel Caesar ft. H.E.R.', ytId: 'vBy7FaapGRo', genre: 'rnb' },
  
  // Rock / Alternative
  { id: '40', title: 'Believer', artist: 'Imagine Dragons', ytId: '7wtfhZwyrcc', genre: 'rock' },
  { id: '41', title: 'Thunder', artist: 'Imagine Dragons', ytId: 'fKopy74weus', genre: 'rock' },
  { id: '42', title: 'Radioactive', artist: 'Imagine Dragons', ytId: 'ktvTqknDobU', genre: 'rock' },
  { id: '43', title: 'Counting Stars', artist: 'OneRepublic', ytId: 'hT_nvWreIhg', genre: 'rock' },
  { id: '44', title: 'Heathens', artist: 'Twenty One Pilots', ytId: 'UprcpdwuwCg', genre: 'rock' },
  { id: '45', title: 'Stressed Out', artist: 'Twenty One Pilots', ytId: 'pXRviuL6vMY', genre: 'rock' },
  { id: '45a', title: 'Demons', artist: 'Imagine Dragons', ytId: 'mWRsgZuwf_8', genre: 'rock' },
  { id: '45b', title: 'Natural', artist: 'Imagine Dragons', ytId: '0I647GU3Jsc', genre: 'rock' },
  { id: '45c', title: 'Ride', artist: 'Twenty One Pilots', ytId: 'Pw-0pbY9JeU', genre: 'rock' },
  { id: '45d', title: 'Smells Like Teen Spirit', artist: 'Nirvana', ytId: 'hTWKbfoikeg', genre: 'rock' },
  { id: '45e', title: 'Bohemian Rhapsody', artist: 'Queen', ytId: 'fJ9rUzIMcZQ', genre: 'rock' },
  { id: '45f', title: 'Mr. Brightside', artist: 'The Killers', ytId: 'gGdGFtwCNBE', genre: 'rock' },
  { id: '45g', title: 'Viva La Vida', artist: 'Coldplay', ytId: 'dvgZkm1xWPE', genre: 'rock' },
  { id: '45h', title: 'The Scientist', artist: 'Coldplay', ytId: 'RB-RcX5DS5A', genre: 'rock' },
  { id: '45i', title: 'Fix You', artist: 'Coldplay', ytId: 'k4V3Mo61fJM', genre: 'rock' },
  
  // Latin
  { id: '50', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', ytId: 'kJQP7kiw5Fk', genre: 'latin' },
  { id: '51', title: 'Mi Gente', artist: 'J Balvin & Willy William', ytId: 'wnJ6LuUFpMo', genre: 'latin' },
  { id: '52', title: 'Dákiti', artist: 'Bad Bunny & Jhay Cortez', ytId: 'TmKh7lAwnBI', genre: 'latin' },
  { id: '53', title: 'Tusa', artist: 'Karol G & Nicki Minaj', ytId: 'tbneQDc-II4', genre: 'latin' },
  { id: '53a', title: 'Callaita', artist: 'Bad Bunny', ytId: 'FxlFmKnfgzs', genre: 'latin' },
  { id: '53b', title: 'Me Porto Bonito', artist: 'Bad Bunny & Chencho', ytId: 'fOxnSIUJ64c', genre: 'latin' },
  { id: '53c', title: 'Efecto', artist: 'Bad Bunny', ytId: 'XcJxGLdFb_I', genre: 'latin' },
  { id: '53d', title: 'La Canción', artist: 'J Balvin & Bad Bunny', ytId: '18nCOxQ-ons', genre: 'latin' },
  { id: '53e', title: 'Con Calma', artist: 'Daddy Yankee', ytId: 'DiItGE3eAyQ', genre: 'latin' },
  { id: '53f', title: 'Hawái', artist: 'Maluma', ytId: 'eMP-g5ms2Mo', genre: 'latin' },
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

// Piped API instances (more reliable than Invidious)
const API_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://pipedapi.moomoo.me',
  'https://pipedapi.syncpundit.io',
  'https://api-piped.mha.fi',
];

function MusicSection() {
  const { actions } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('all');
  const [currentSong, setCurrentSong] = useState(null);
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter curated songs
  const filteredSongs = useMemo(() => {
    return SONGS.filter(song => {
      const matchesGenre = activeGenre === 'all' || song.genre === activeGenre;
      return matchesGenre;
    });
  }, [activeGenre]);

  // Format duration from seconds
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Search using Piped API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setCurrentSong(null);

    // First, search local library
    const localResults = searchLocalLibrary(searchQuery);
    if (localResults.length >= 3) {
      // Good local results, use them
      setSearchResults(localResults.map(s => ({
        ...s,
        thumbnail: `https://i.ytimg.com/vi/${s.ytId}/mqdefault.jpg`,
        duration: '',
      })));
      setIsSearching(false);
      actions.addNotification(`Found ${localResults.length} songs`, 'success');
      return;
    }

    // Not enough local results, try API
    const query = `${searchQuery} music song`;

    // Try each API instance
    for (const instance of API_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
          `${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`,
          { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.log(`${instance} returned ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data && data.items && data.items.length > 0) {
          const results = data.items
            .filter(item => item.type === 'stream')
            .slice(0, 20)
            .map(item => ({
              id: item.url?.split('?v=')[1] || item.url,
              ytId: item.url?.split('?v=')[1] || item.url?.replace('/watch?v=', ''),
              title: item.title || 'Unknown',
              artist: item.uploaderName || item.uploader || 'Unknown',
              duration: formatDuration(item.duration),
              thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.url?.split('?v=')[1]}/mqdefault.jpg`,
            }));

          if (results.length > 0) {
            setSearchResults(results);
            setIsSearching(false);
            actions.addNotification(`Found ${results.length} results`, 'success');
            return;
          }
        }
      } catch (err) {
        console.log(`API ${instance} failed:`, err.message);
        continue;
      }
    }

    // API failed - try fallback with videos filter
    for (const instance of API_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
          `${instance}/search?q=${encodeURIComponent(query)}&filter=videos`,
          { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();

        if (data && data.items && data.items.length > 0) {
          const results = data.items
            .filter(item => item.type === 'stream')
            .slice(0, 20)
            .map(item => ({
              id: item.url?.split('?v=')[1] || item.url,
              ytId: item.url?.split('?v=')[1] || item.url?.replace('/watch?v=', ''),
              title: item.title || 'Unknown',
              artist: item.uploaderName || item.uploader || 'Unknown',
              duration: formatDuration(item.duration),
              thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.url?.split('?v=')[1]}/mqdefault.jpg`,
            }));

          if (results.length > 0) {
            setSearchResults(results);
            setIsSearching(false);
            actions.addNotification(`Found ${results.length} results`, 'success');
            return;
          }
        }
      } catch (err) {
        continue;
      }
    }

    // All APIs failed - show local results if any
    if (localResults.length > 0) {
      setSearchResults(localResults.map(s => ({
        ...s,
        thumbnail: `https://i.ytimg.com/vi/${s.ytId}/mqdefault.jpg`,
        duration: '',
      })));
      setIsSearching(false);
      actions.addNotification(`Found ${localResults.length} songs in library`, 'success');
      return;
    }

    // Nothing found
    setSearchError('No results found. Try a different search term.');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setHasSearched(false);
    setSearchError(null);
  };

  // Search local library first
  const searchLocalLibrary = (query) => {
    const q = query.toLowerCase();
    return SONGS.filter(song => 
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q)
    );
  };

  // Play a song
  const playSong = (song) => {
    setCurrentSong(song);
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

      {/* Search Form */}
      <form className="music-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search any song or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <div className="search-results-section">
          <div className="search-results-header">
            <h2>Results for "{searchQuery}"</h2>
            <button className="clear-btn" onClick={clearSearch}>✕ Clear</button>
          </div>

          {/* Loading */}
          {isSearching && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Searching...</p>
            </div>
          )}

          {/* Error */}
          {searchError && !isSearching && (
            <div className="search-error">
              <p>{searchError}</p>
              <button onClick={handleSearch}>Try Again</button>
            </div>
          )}

          {/* Results List */}
          {!isSearching && searchResults.length > 0 && (
            <div className="results-list">
              {searchResults.map((song, idx) => (
                <div
                  key={song.id}
                  className={`result-row ${currentSong?.ytId === song.ytId ? 'playing' : ''}`}
                  onClick={() => playSong(song)}
                >
                  <span className="result-num">{idx + 1}</span>
                  <img 
                    src={song.thumbnail} 
                    alt="" 
                    className="result-thumb"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="result-info">
                    <span className="result-title">{song.title}</span>
                    <span className="result-artist">{song.artist}</span>
                  </div>
                  <span className="result-duration">{song.duration}</span>
                  <span className="play-icon">▶</span>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isSearching && !searchError && searchResults.length === 0 && (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Browse Section - only show when not searching */}
      {!hasSearched && (
        <>
          {/* Genre Tabs */}
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

          {/* Curated Songs List */}
          <div className="songs-list">
            {filteredSongs.map((song, idx) => (
              <div
                key={song.id}
                className={`song-row ${currentSong?.ytId === song.ytId ? 'playing' : ''}`}
                onClick={() => playSong(song)}
              >
                <span className="song-num">{idx + 1}</span>
                <div className="song-info">
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">{song.artist}</span>
                </div>
                <span className="play-icon">▶</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Player */}
      {currentSong && (
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
