/* ========================================
   DiscoverSection.jsx - Discovery Hub with Smart Features
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import * as tmdbApi from '../../utils/tmdb';
import * as anilistApi from '../../utils/anilist';
import ContentGrid from '../cards/ContentGrid';
import LoadingSpinner from '../common/LoadingSpinner';
import './DiscoverSection.css';

// Mood categories with genre mappings
const MOOD_CATEGORIES = [
  {
    id: 'feel-good',
    name: 'Feel Good',
    icon: '😊',
    color: '#4ade80',
    description: 'Uplifting, heartwarming content',
    movieGenres: [35, 10751, 10402], // Comedy, Family, Music
    tvGenres: [35, 10751],
    animeGenres: ['Comedy', 'Slice of Life', 'Romance']
  },
  {
    id: 'thrilling',
    name: 'Thrilling',
    icon: '😱',
    color: '#ef4444',
    description: 'Edge-of-your-seat excitement',
    movieGenres: [28, 53, 80], // Action, Thriller, Crime
    tvGenres: [10759, 80, 9648],
    animeGenres: ['Action', 'Thriller', 'Mystery']
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: '😢',
    color: '#8b5cf6',
    description: 'Deep, moving stories',
    movieGenres: [18, 10749], // Drama, Romance
    tvGenres: [18],
    animeGenres: ['Drama', 'Romance', 'Psychological']
  },
  {
    id: 'mind-bending',
    name: 'Mind-Bending',
    icon: '🤯',
    color: '#3b82f6',
    description: 'Complex, thought-provoking',
    movieGenres: [878, 9648, 14], // Sci-Fi, Mystery, Fantasy
    tvGenres: [10765, 9648],
    animeGenres: ['Psychological', 'Sci-Fi', 'Mystery']
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: '🗺️',
    color: '#f59e0b',
    description: 'Epic journeys and exploration',
    movieGenres: [12, 14, 878], // Adventure, Fantasy, Sci-Fi
    tvGenres: [10759, 10765],
    animeGenres: ['Adventure', 'Fantasy', 'Action']
  },
  {
    id: 'scary',
    name: 'Scary',
    icon: '👻',
    color: '#1f2937',
    description: 'Horror and suspense',
    movieGenres: [27, 53], // Horror, Thriller
    tvGenres: [9648],
    animeGenres: ['Horror', 'Supernatural', 'Thriller']
  }
];

function DiscoverSection({ onPlay, onEdit, searchQuery }) {
  const { state, actions } = useApp();
  const collection = state?.collection || [];
  
  // Main state
  const [activeView, setActiveView] = useState('trending'); // trending, mood, surprise, similar
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mood browse state
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodContentType, setMoodContentType] = useState('all');
  
  // Surprise me state
  const [surpriseItem, setSurpriseItem] = useState(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [surpriseHistory, setSurpriseHistory] = useState([]);
  
  // Similar finder state
  const [similarQuery, setSimilarQuery] = useState('');
  const [similarResults, setSimilarResults] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [selectedSimilarItem, setSelectedSimilarItem] = useState(null);
  
  // Trending state
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  
  const mountedRef = useRef(true);

  // Load trending content
  const loadTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load movies
      const moviesData = await tmdbApi.getTrending('movie');
      const movies = (moviesData?.results || []).map(m => ({ ...m, type: 'movie' }));
      
      // Load TV
      const tvData = await tmdbApi.getTrending('tv');
      const tv = (tvData?.results || []).map(t => ({ 
        ...t, 
        type: 'tv',
        title: t.name 
      }));
      
      // Load Anime
      const animeData = await anilistApi.getTrendingAnime(1, 10);
      const anime = (animeData?.results || []).map(a => ({ ...a, type: 'anime' }));
      
      if (mountedRef.current) {
        setTrendingMovies(movies.slice(0, 10));
        setTrendingTV(tv.slice(0, 10));
        setTrendingAnime(anime);
        setItems([...movies.slice(0, 6), ...tv.slice(0, 6), ...anime.slice(0, 6)]);
      }
    } catch (err) {
      console.error('Error loading trending:', err);
      if (mountedRef.current) {
        setError('Failed to load trending content');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Load mood-based content
  const loadMoodContent = useCallback(async (mood) => {
    if (!mood) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const allResults = [];
      
      // Load movies
      if (moodContentType === 'all' || moodContentType === 'movie') {
        for (const genreId of mood.movieGenres.slice(0, 2)) {
          const data = await tmdbApi.getByGenre(genreId, 'movie');
          const movies = (data?.results || []).slice(0, 8).map(m => ({ ...m, type: 'movie' }));
          allResults.push(...movies);
        }
      }
      
      // Load TV
      if (moodContentType === 'all' || moodContentType === 'tv') {
        for (const genreId of mood.tvGenres.slice(0, 2)) {
          const data = await tmdbApi.getByGenre(genreId, 'tv');
          const shows = (data?.results || []).slice(0, 8).map(t => ({ 
            ...t, 
            type: 'tv',
            title: t.name 
          }));
          allResults.push(...shows);
        }
      }
      
      // Load Anime
      if (moodContentType === 'all' || moodContentType === 'anime') {
        for (const genre of mood.animeGenres.slice(0, 2)) {
          const data = await anilistApi.getPopularAnime(1, 8, { genre });
          const anime = (data?.results || []).map(a => ({ ...a, type: 'anime' }));
          allResults.push(...anime);
        }
      }
      
      // Shuffle results
      const shuffled = allResults.sort(() => Math.random() - 0.5);
      
      if (mountedRef.current) {
        setItems(shuffled);
      }
    } catch (err) {
      console.error('Error loading mood content:', err);
      if (mountedRef.current) {
        setError('Failed to load content for this mood');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [moodContentType]);

  // Surprise Me - Get random recommendation based on taste
  const handleSurpriseMe = useCallback(async () => {
    setSurpriseLoading(true);
    setSurpriseItem(null);
    
    try {
      // Analyze user's collection for taste profile
      const tasteProfile = analyzeUserTaste(collection);
      
      // Decide content type randomly, weighted by user preference
      const contentTypes = ['movie', 'tv', 'anime'];
      const weights = [
        tasteProfile.movieCount || 1,
        tasteProfile.tvCount || 1,
        tasteProfile.animeCount || 1
      ];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      let contentType = contentTypes[0];
      
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          contentType = contentTypes[i];
          break;
        }
      }
      
      let result = null;
      
      // Get random content based on type and preferred genres
      if (contentType === 'movie') {
        const genreId = tasteProfile.topMovieGenres[0] || 28;
        const data = await tmdbApi.getByGenre(genreId, 'movie');
        const movies = data?.results || [];
        // Filter out items already in collection
        const notInCollection = movies.filter(m => 
          !collection.some(c => c.id === m.id && c.type === 'movie')
        );
        if (notInCollection.length > 0) {
          const randomIndex = Math.floor(Math.random() * notInCollection.length);
          result = { ...notInCollection[randomIndex], type: 'movie' };
        }
      } else if (contentType === 'tv') {
        const genreId = tasteProfile.topTVGenres[0] || 10759;
        const data = await tmdbApi.getByGenre(genreId, 'tv');
        const shows = data?.results || [];
        const notInCollection = shows.filter(s => 
          !collection.some(c => c.id === s.id && c.type === 'tv')
        );
        if (notInCollection.length > 0) {
          const randomIndex = Math.floor(Math.random() * notInCollection.length);
          result = { ...notInCollection[randomIndex], type: 'tv', title: notInCollection[randomIndex].name };
        }
      } else {
        const genre = tasteProfile.topAnimeGenres[0] || 'Action';
        const data = await anilistApi.getPopularAnime(1, 20, { genre });
        const anime = data?.results || [];
        const notInCollection = anime.filter(a => 
          !collection.some(c => c.id === a.id && c.type === 'anime')
        );
        if (notInCollection.length > 0) {
          const randomIndex = Math.floor(Math.random() * notInCollection.length);
          result = { ...notInCollection[randomIndex], type: 'anime' };
        }
      }
      
      // Fallback to trending if no result
      if (!result) {
        const trendingData = await tmdbApi.getTrending('movie');
        const trending = trendingData?.results || [];
        if (trending.length > 0) {
          const randomIndex = Math.floor(Math.random() * trending.length);
          result = { ...trending[randomIndex], type: 'movie' };
        }
      }
      
      if (result) {
        setSurpriseItem(result);
        setSurpriseHistory(prev => [result, ...prev.slice(0, 9)]);
      }
      
    } catch (err) {
      console.error('Error getting surprise:', err);
      actions.addNotification('Oops! Try again for a surprise.', 'error');
    } finally {
      setSurpriseLoading(false);
    }
  }, [collection, actions]);

  // Analyze user's taste from collection
  const analyzeUserTaste = (collection) => {
    const profile = {
      movieCount: 0,
      tvCount: 0,
      animeCount: 0,
      topMovieGenres: [],
      topTVGenres: [],
      topAnimeGenres: [],
      avgRating: 0
    };
    
    const movieGenres = {};
    const tvGenres = {};
    const animeGenres = {};
    
    collection.forEach(item => {
      if (item.type === 'movie') {
        profile.movieCount++;
        (item.genre_ids || []).forEach(g => {
          movieGenres[g] = (movieGenres[g] || 0) + 1;
        });
      } else if (item.type === 'tv') {
        profile.tvCount++;
        (item.genre_ids || []).forEach(g => {
          tvGenres[g] = (tvGenres[g] || 0) + 1;
        });
      } else if (item.type === 'anime') {
        profile.animeCount++;
        (item.genres || []).forEach(g => {
          animeGenres[g] = (animeGenres[g] || 0) + 1;
        });
      }
    });
    
    profile.topMovieGenres = Object.entries(movieGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => parseInt(g));
    
    profile.topTVGenres = Object.entries(tvGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => parseInt(g));
    
    profile.topAnimeGenres = Object.entries(animeGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);
    
    // Defaults if no data
    if (profile.topMovieGenres.length === 0) profile.topMovieGenres = [28, 35, 18];
    if (profile.topTVGenres.length === 0) profile.topTVGenres = [10759, 18, 35];
    if (profile.topAnimeGenres.length === 0) profile.topAnimeGenres = ['Action', 'Comedy', 'Romance'];
    
    return profile;
  };

  // Search for similar content
  const searchSimilar = useCallback(async () => {
    if (!similarQuery.trim()) return;
    
    setSimilarLoading(true);
    setSimilarResults([]);
    setSelectedSimilarItem(null);
    
    try {
      // Search for the title first
      const searchResults = await tmdbApi.search(similarQuery, 'movie');
      const tvResults = await tmdbApi.search(similarQuery, 'tv');
      
      const combined = [
        ...(searchResults?.results || []).slice(0, 5).map(m => ({ ...m, type: 'movie' })),
        ...(tvResults?.results || []).slice(0, 5).map(t => ({ ...t, type: 'tv', title: t.name }))
      ];
      
      if (combined.length > 0) {
        setSimilarResults(combined);
      } else {
        actions.addNotification('No results found. Try another title.', 'info');
      }
      
    } catch (err) {
      console.error('Error searching similar:', err);
    } finally {
      setSimilarLoading(false);
    }
  }, [similarQuery, actions]);

  // Get similar content for selected item
  const loadSimilarContent = useCallback(async (item) => {
    setSelectedSimilarItem(item);
    setLoading(true);
    
    try {
      const type = item.type === 'tv' ? 'tv' : 'movie';
      const data = await tmdbApi.getSimilar(item.id, type);
      const similar = (data?.results || []).map(s => ({
        ...s,
        type,
        title: type === 'tv' ? s.name : s.title
      }));
      
      setItems(similar);
    } catch (err) {
      console.error('Error loading similar:', err);
      setError('Failed to load similar content');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    loadTrending();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadTrending]);

  // Handle mood selection
  useEffect(() => {
    if (selectedMood && activeView === 'mood') {
      loadMoodContent(selectedMood);
    }
  }, [selectedMood, activeView, loadMoodContent]);

  // Handle view change
  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedMood(null);
    setSurpriseItem(null);
    setSelectedSimilarItem(null);
    setSimilarResults([]);
    
    if (view === 'trending') {
      loadTrending();
    }
  };

  return (
    <section className="section discover-section">
      <div className="section-header">
        <h2 className="section-title">✨ Discover</h2>
        <p className="section-subtitle">Find your next favorite</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="discover-actions">
        <button 
          className={`discover-action-btn surprise-btn ${activeView === 'surprise' ? 'active' : ''}`}
          onClick={() => { handleViewChange('surprise'); handleSurpriseMe(); }}
        >
          <span className="action-icon">🎲</span>
          <span className="action-text">Surprise Me!</span>
        </button>
        
        <button 
          className={`discover-action-btn mood-btn ${activeView === 'mood' ? 'active' : ''}`}
          onClick={() => handleViewChange('mood')}
        >
          <span className="action-icon">🎭</span>
          <span className="action-text">Browse by Mood</span>
        </button>
        
        <button 
          className={`discover-action-btn similar-btn ${activeView === 'similar' ? 'active' : ''}`}
          onClick={() => handleViewChange('similar')}
        >
          <span className="action-icon">🔍</span>
          <span className="action-text">Find Similar</span>
        </button>
        
        <button 
          className={`discover-action-btn trending-btn ${activeView === 'trending' ? 'active' : ''}`}
          onClick={() => handleViewChange('trending')}
        >
          <span className="action-icon">🔥</span>
          <span className="action-text">Trending</span>
        </button>
      </div>

      {/* ========== SURPRISE ME VIEW ========== */}
      {activeView === 'surprise' && (
        <div className="surprise-container">
          <div className="surprise-header">
            <h3>🎲 Your Random Pick</h3>
            <p>Based on your taste profile</p>
          </div>
          
          {surpriseLoading ? (
            <div className="surprise-loading">
              <div className="dice-animation">🎲</div>
              <p>Rolling the dice...</p>
            </div>
          ) : surpriseItem ? (
            <div className="surprise-result">
              <div className="surprise-card" onClick={() => onPlay?.(surpriseItem)}>
                <div className="surprise-poster">
                  {surpriseItem.poster_path || surpriseItem.poster ? (
                    <img 
                      src={surpriseItem.poster || `https://image.tmdb.org/t/p/w500${surpriseItem.poster_path}`}
                      alt={surpriseItem.title}
                    />
                  ) : (
                    <div className="no-poster">🎬</div>
                  )}
                  <span className={`type-badge type-${surpriseItem.type}`}>
                    {surpriseItem.type === 'movie' && '🎬 Movie'}
                    {surpriseItem.type === 'tv' && '📺 TV'}
                    {surpriseItem.type === 'anime' && '🎌 Anime'}
                  </span>
                </div>
                <div className="surprise-info">
                  <h4>{surpriseItem.title || surpriseItem.name}</h4>
                  <p className="surprise-rating">
                    ⭐ {(surpriseItem.vote_average || surpriseItem.voteAverage || 0).toFixed(1)}/10
                  </p>
                  <p className="surprise-overview">
                    {surpriseItem.overview || surpriseItem.description || 'No description available'}
                  </p>
                  <button className="watch-btn" onClick={(e) => { e.stopPropagation(); onPlay?.(surpriseItem); }}>
                    ▶️ Watch Now
                  </button>
                </div>
              </div>
              
              <button className="reroll-btn" onClick={handleSurpriseMe}>
                🎲 Roll Again
              </button>
            </div>
          ) : (
            <div className="surprise-empty">
              <p>Click the button to get a random recommendation!</p>
              <button className="roll-btn" onClick={handleSurpriseMe}>
                🎲 Roll the Dice
              </button>
            </div>
          )}
          
          {/* Surprise History */}
          {surpriseHistory.length > 1 && (
            <div className="surprise-history">
              <h4>Previous Picks</h4>
              <div className="history-list">
                {surpriseHistory.slice(1, 6).map((item, idx) => (
                  <div 
                    key={`${item.id}-${idx}`} 
                    className="history-item"
                    onClick={() => onPlay?.(item)}
                  >
                    <span className="history-type">
                      {item.type === 'movie' && '🎬'}
                      {item.type === 'tv' && '📺'}
                      {item.type === 'anime' && '🎌'}
                    </span>
                    <span className="history-title">{item.title || item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== MOOD BROWSE VIEW ========== */}
      {activeView === 'mood' && (
        <div className="mood-container">
          {/* Mood Cards */}
          <div className="mood-grid">
            {MOOD_CATEGORIES.map((mood) => (
              <button
                key={mood.id}
                className={`mood-card ${selectedMood?.id === mood.id ? 'active' : ''}`}
                style={{ '--mood-color': mood.color }}
                onClick={() => setSelectedMood(mood)}
              >
                <span className="mood-icon">{mood.icon}</span>
                <span className="mood-name">{mood.name}</span>
                <span className="mood-desc">{mood.description}</span>
              </button>
            ))}
          </div>
          
          {/* Content Type Filter */}
          {selectedMood && (
            <div className="mood-filters">
              <span className="filter-label">Show:</span>
              <div className="filter-options">
                {['all', 'movie', 'tv', 'anime'].map((type) => (
                  <button
                    key={type}
                    className={`filter-option ${moodContentType === type ? 'active' : ''}`}
                    onClick={() => setMoodContentType(type)}
                  >
                    {type === 'all' && 'All'}
                    {type === 'movie' && '🎬 Movies'}
                    {type === 'tv' && '📺 TV'}
                    {type === 'anime' && '🎌 Anime'}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Results */}
          {selectedMood && (
            <div className="mood-results">
              <h3>
                {selectedMood.icon} {selectedMood.name} Content
              </h3>
              
              {loading ? (
                <LoadingSpinner text={`Finding ${selectedMood.name.toLowerCase()} content...`} />
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={() => loadMoodContent(selectedMood)}>Try Again</button>
                </div>
              ) : (
                <ContentGrid
                  items={items}
                  loading={false}
                  onPlay={onPlay}
                  onEdit={onEdit}
                  emptyMessage="No content found for this mood"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== SIMILAR FINDER VIEW ========== */}
      {activeView === 'similar' && (
        <div className="similar-container">
          <div className="similar-search">
            <h3>🔍 Find Movies & Shows Like...</h3>
            <div className="similar-input-group">
              <input
                type="text"
                className="similar-input"
                placeholder="Enter a movie or TV show title..."
                value={similarQuery}
                onChange={(e) => setSimilarQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchSimilar()}
              />
              <button className="similar-search-btn" onClick={searchSimilar}>
                Search
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {similarLoading && <LoadingSpinner text="Searching..." />}
          
          {similarResults.length > 0 && !selectedSimilarItem && (
            <div className="similar-results">
              <h4>Select a title to find similar content:</h4>
              <div className="similar-options">
                {similarResults.map((item) => (
                  <button
                    key={`${item.id}-${item.type}`}
                    className="similar-option"
                    onClick={() => loadSimilarContent(item)}
                  >
                    <span className="option-type">
                      {item.type === 'movie' && '🎬'}
                      {item.type === 'tv' && '📺'}
                    </span>
                    <span className="option-title">{item.title}</span>
                    <span className="option-year">
                      ({(item.release_date || item.first_air_date || '').split('-')[0] || 'N/A'})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Similar Content */}
          {selectedSimilarItem && (
            <div className="similar-content">
              <div className="similar-header">
                <h4>
                  Content similar to "{selectedSimilarItem.title}"
                </h4>
                <button 
                  className="clear-btn"
                  onClick={() => { setSelectedSimilarItem(null); setItems([]); }}
                >
                  ✕ Clear
                </button>
              </div>
              
              {loading ? (
                <LoadingSpinner text="Finding similar content..." />
              ) : (
                <ContentGrid
                  items={items}
                  loading={false}
                  onPlay={onPlay}
                  onEdit={onEdit}
                  emptyMessage="No similar content found"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== TRENDING VIEW ========== */}
      {activeView === 'trending' && (
        <div className="trending-container">
          {loading ? (
            <LoadingSpinner text="Loading trending content..." />
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadTrending}>Try Again</button>
            </div>
          ) : (
            <>
              {/* Trending Movies */}
              {trendingMovies.length > 0 && (
                <div className="trending-section">
                  <h3>🎬 Trending Movies</h3>
                  <ContentGrid
                    items={trendingMovies}
                    loading={false}
                    onPlay={onPlay}
                    onEdit={onEdit}
                  />
                </div>
              )}
              
              {/* Trending TV */}
              {trendingTV.length > 0 && (
                <div className="trending-section">
                  <h3>📺 Trending TV Shows</h3>
                  <ContentGrid
                    items={trendingTV}
                    loading={false}
                    onPlay={onPlay}
                    onEdit={onEdit}
                  />
                </div>
              )}
              
              {/* Trending Anime */}
              {trendingAnime.length > 0 && (
                <div className="trending-section">
                  <h3>🎌 Trending Anime</h3>
                  <ContentGrid
                    items={trendingAnime}
                    loading={false}
                    onPlay={onPlay}
                    onEdit={onEdit}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default DiscoverSection;
