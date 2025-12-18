/* ========================================
   GamesSection.jsx - Ultimate Gaming Hub v2.0
   Features: Trailers, Achievements, Similar Games, 
   Tag Browser, Release Calendar, Full Game Details
   ======================================== */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  rawgService,
  cheapSharkService,
  priceService,
  freeGamesService,
  userGameDataService,
  gameUtils,
  PLATFORMS,
  GENRES,
  POPULAR_TAGS,
} from '../../services/gameService';
import './GamesSection.css';

// Tab definitions
const TABS = {
  DISCOVER: 'discover',
  LIBRARY: 'library',
  DEALS: 'deals',
  WISHLIST: 'wishlist',
  FREE: 'free',
  CALENDAR: 'calendar',
  TAGS: 'tags',
};

// Library status
const LIBRARY_STATUS = {
  ALL: 'all',
  PLAYING: 'playing',
  BACKLOG: 'backlog',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
};

function GamesSection() {
  // Core state
  const [activeTab, setActiveTab] = useState(TABS.DISCOVER);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Discover state
  const [discoverCategory, setDiscoverCategory] = useState('trending');
  const [discoverGames, setDiscoverGames] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Library state
  const [library, setLibrary] = useState([]);
  const [libraryFilter, setLibraryFilter] = useState(LIBRARY_STATUS.ALL);
  const [librarySort, setLibrarySort] = useState('recent');

  // Deals state
  const [deals, setDeals] = useState([]);
  const [maxPrice, setMaxPrice] = useState(30);

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Free games state
  const [freeGames, setFreeGames] = useState({ epic: { current: [], upcoming: [] } });

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarGames, setCalendarGames] = useState([]);

  // Tags state
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagGames, setTagGames] = useState([]);

  // Game detail modal state
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameModalTab, setGameModalTab] = useState('overview');
  const [similarGames, setSimilarGames] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Trailer modal state
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState(null);

  // Price modal state
  const [gamePrices, setGamePrices] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertGame, setAlertGame] = useState(null);

  // Refs
  const searchTimeoutRef = useRef(null);

  // Initialize
  useEffect(() => {
    loadDiscoverGames();
    loadLibrary();
    loadWishlist();
  }, []);

  // Load discover games
  const loadDiscoverGames = async (category = discoverCategory) => {
    setIsLoading(true);
    try {
      let result;
      switch (category) {
        case 'trending':
          result = await rawgService.getTrending(1, 24);
          break;
        case 'upcoming':
          result = await rawgService.getUpcoming(1, 24);
          break;
        case 'toprated':
          result = await rawgService.getTopRated(1, 24);
          break;
        case 'newreleases':
          result = await rawgService.getNewReleases(1, 24);
          break;
        default:
          result = await rawgService.getTrending(1, 24);
      }
      if (result.success) {
        setDiscoverGames(result.data);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load calendar games
  const loadCalendarGames = async (date = calendarDate) => {
    setIsLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const result = await rawgService.getReleasesForMonth(year, month, 50);
      if (result.success) {
        setCalendarGames(result.data);
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load games by tag
  const loadTagGames = async (tagSlug) => {
    setIsLoading(true);
    try {
      const result = await rawgService.getByTag(tagSlug, 1, 24);
      if (result.success) {
        setTagGames(result.data);
      }
    } catch (error) {
      console.error('Error loading tag games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load library
  const loadLibrary = () => {
    setLibrary(userGameDataService.getLibrary());
  };

  // Load wishlist
  const loadWishlist = () => {
    setWishlist(userGameDataService.getWishlist());
  };

  // Load deals
  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const result = await cheapSharkService.getTopDeals(0, 30, null, maxPrice);
      if (result.success) {
        setDeals(result.data);
      }
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load free games
  const loadFreeGames = async () => {
    setIsLoading(true);
    try {
      const result = await freeGamesService.getAllFreeGames();
      if (result.success) {
        setFreeGames(result.data);
      }
    } catch (error) {
      console.error('Error loading free games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open game details modal
  const openGameDetails = async (game) => {
    setSelectedGame(game);
    setShowGameModal(true);
    setGameModalTab('overview');
    setDetailsLoading(true);
    setGameDetails(null);
    setSimilarGames([]);

    try {
      // Load full game details
      const [detailsResult, similarResult] = await Promise.all([
        rawgService.getGameDetails(game.id),
        rawgService.getSimilarGames(game.id, 8)
      ]);

      if (detailsResult.success) {
        setGameDetails(detailsResult.data);
      }
      if (similarResult.success) {
        setSimilarGames(similarResult.data);
      }
    } catch (error) {
      console.error('Error loading game details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Play trailer
  const playTrailer = (trailer) => {
    setCurrentTrailer(trailer);
    setShowTrailerModal(true);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchResults([]);

    if (tab === TABS.DEALS && deals.length === 0) {
      loadDeals();
    } else if (tab === TABS.FREE) {
      loadFreeGames();
    } else if (tab === TABS.CALENDAR) {
      loadCalendarGames();
    }
  };

  // Handle search
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await rawgService.searchGames(query, 1, 20);
      if (result.success) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => handleSearch(query), 500);
  };

  // Library actions
  const handleAddToLibrary = (game, status = 'backlog') => {
    const updated = userGameDataService.addToLibrary(game, status);
    setLibrary(updated);
  };

  const handleRemoveFromLibrary = (gameId) => {
    const updated = userGameDataService.removeFromLibrary(gameId);
    setLibrary(updated);
  };

  const handleUpdateStatus = (gameId, status) => {
    const updated = userGameDataService.updateGameStatus(gameId, status);
    setLibrary(updated);
  };

  // Wishlist actions
  const handleAddToWishlist = (game) => {
    const updated = userGameDataService.addToWishlist(game);
    setWishlist(updated);
  };

  const handleRemoveFromWishlist = (gameId) => {
    const updated = userGameDataService.removeFromWishlist(gameId);
    setWishlist(updated);
  };

  // Check status
  const isInLibrary = (gameId) => library.some(g => g.id === gameId);
  const isInWishlist = (gameId) => wishlist.some(g => g.id === gameId);

  // Show prices
  const handleShowPrices = async (game) => {
    setSelectedGame(game);
    setShowPriceModal(true);
    setPriceLoading(true);
    setGamePrices(null);

    try {
      const result = await priceService.getAllPrices(game.name);
      if (result.success) {
        setGamePrices(result.data);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  // Price alert
  const handleSetPriceAlert = (game) => {
    setAlertGame(game);
    setAlertTargetPrice('');
    setShowAlertModal(true);
  };

  const handleSavePriceAlert = () => {
    if (!alertTargetPrice || !alertGame) return;
    userGameDataService.setPriceAlert(alertGame, parseFloat(alertTargetPrice));
    setShowAlertModal(false);
  };

  // Filter library
  const filteredLibrary = useMemo(() => {
    let filtered = [...library];
    if (libraryFilter !== LIBRARY_STATUS.ALL) {
      filtered = filtered.filter(g => g.status === libraryFilter);
    }
    switch (librarySort) {
      case 'recent': filtered.sort((a, b) => b.addedAt - a.addedAt); break;
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': filtered.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0)); break;
      default: break;
    }
    return filtered;
  }, [library, libraryFilter, librarySort]);

  // Library stats
  const libraryStats = useMemo(() => ({
    total: library.length,
    playing: library.filter(g => g.status === 'playing').length,
    backlog: library.filter(g => g.status === 'backlog').length,
    completed: library.filter(g => g.status === 'completed').length,
    dropped: library.filter(g => g.status === 'dropped').length,
  }), [library]);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarDate]);

  const getGamesForDay = (day) => {
    if (!day) return [];
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarGames.filter(g => g.released === dateStr);
  };

  // ========== RENDER GAME CARD ==========
  const renderGameCard = (game, options = {}) => {
    const { showStatus = false, showActions = true, compact = false } = options;
    const inLibrary = isInLibrary(game.id);
    const inWishlist = isInWishlist(game.id);

    return (
      <div
        key={game.id}
        className={`game-card ${compact ? 'compact' : ''}`}
        onClick={() => openGameDetails(game)}
      >
        <div className="game-card-image">
          {game.background_image ? (
            <img src={game.background_image} alt={game.name} loading="lazy" />
          ) : (
            <div className="game-card-placeholder"><span>🎮</span></div>
          )}
          {game.metacritic && (
            <div className={`metacritic-badge ${gameUtils.getMetacriticClass(game.metacritic)}`}>
              {game.metacritic}
            </div>
          )}
          {showStatus && game.status && (
            <div className={`status-badge status-${game.status}`}>
              {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
            </div>
          )}
        </div>

        <div className="game-card-content">
          <h3 className="game-card-title">{game.name}</h3>
          <div className="game-card-meta">
            {game.released && <span className="game-release">{new Date(game.released).getFullYear()}</span>}
            {game.genres?.[0] && <span className="game-genre">{game.genres[0].name}</span>}
          </div>
          {game.platforms && (
            <div className="game-platforms">
              {game.platforms.slice(0, 4).map((p, i) => (
                <span key={i} className="platform-icon" title={p.platform?.name}>
                  {gameUtils.getPlatformIcon(p.platform?.name)}
                </span>
              ))}
            </div>
          )}
          {showActions && (
            <div className="game-card-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`action-btn ${inLibrary ? 'active' : ''}`}
                onClick={() => inLibrary ? handleRemoveFromLibrary(game.id) : handleAddToLibrary(game)}
                title={inLibrary ? 'In Library' : 'Add to Library'}
              >
                {inLibrary ? '✓' : '+'}
              </button>
              <button
                className={`action-btn wishlist ${inWishlist ? 'active' : ''}`}
                onClick={() => inWishlist ? handleRemoveFromWishlist(game.id) : handleAddToWishlist(game)}
                title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              >
                {inWishlist ? '❤️' : '🤍'}
              </button>
              <button className="action-btn price" onClick={() => handleShowPrices(game)} title="Compare Prices">
                💰
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ========== RENDER DEAL CARD ==========
  const renderDealCard = (deal) => {
    const discount = Math.round((1 - deal.salePrice / deal.normalPrice) * 100);
    return (
      <div key={deal.dealID} className="deal-card">
        <div className="deal-card-image">
          <img src={deal.thumb} alt={deal.title} loading="lazy" />
          <div className="discount-badge">-{discount}%</div>
        </div>
        <div className="deal-card-content">
          <h3 className="deal-title">{deal.title}</h3>
          <div className="deal-prices">
            <span className="deal-original">${deal.normalPrice}</span>
            <span className="deal-sale">${deal.salePrice}</span>
          </div>
          <div className="deal-store">
            <span className="store-name">{cheapSharkService.getStoreName(deal.storeID)}</span>
            {deal.dealRating && <span className="deal-rating">⭐ {deal.dealRating}</span>}
          </div>
          <a href={cheapSharkService.getRedirectUrl(deal.dealID)} target="_blank" rel="noopener noreferrer" className="deal-buy-btn">
            View Deal →
          </a>
        </div>
      </div>
    );
  };

  // ========== RENDER DISCOVER TAB ==========
  const renderDiscoverTab = () => (
    <div className="games-section-content discover-content">
      <div className="discover-categories">
        {[
          { id: 'trending', label: '🔥 Trending', },
          { id: 'newreleases', label: '🆕 New Releases' },
          { id: 'upcoming', label: '📅 Upcoming' },
          { id: 'toprated', label: '⭐ Top Rated' },
        ].map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${discoverCategory === cat.id ? 'active' : ''}`}
            onClick={() => { setDiscoverCategory(cat.id); loadDiscoverGames(cat.id); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Platform:</label>
          <select value={selectedPlatform || ''} onChange={(e) => setSelectedPlatform(e.target.value || null)}>
            <option value="">All Platforms</option>
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <option key={key} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Genre:</label>
          <select value={selectedGenre || ''} onChange={(e) => setSelectedGenre(e.target.value || null)}>
            <option value="">All Genres</option>
            {GENRES.map(g => <option key={g.id} value={g.slug}>{g.icon} {g.name}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="loading-spinner"></div><p>Loading games...</p></div>
      ) : (
        <div className="games-grid">
          {discoverGames.map(game => renderGameCard(game))}
        </div>
      )}
    </div>
  );

  // ========== RENDER LIBRARY TAB ==========
  const renderLibraryTab = () => (
    <div className="games-section-content library-content">
      <div className="library-stats">
        <div className="stat-card total"><span className="stat-value">{libraryStats.total}</span><span className="stat-label">Total</span></div>
        <div className="stat-card playing"><span className="stat-value">{libraryStats.playing}</span><span className="stat-label">Playing</span></div>
        <div className="stat-card backlog"><span className="stat-value">{libraryStats.backlog}</span><span className="stat-label">Backlog</span></div>
        <div className="stat-card completed"><span className="stat-value">{libraryStats.completed}</span><span className="stat-label">Completed</span></div>
        <div className="stat-card dropped"><span className="stat-value">{libraryStats.dropped}</span><span className="stat-label">Dropped</span></div>
      </div>

      <div className="library-filters">
        <div className="status-filters">
          {Object.entries(LIBRARY_STATUS).map(([key, value]) => (
            <button key={key} className={`filter-btn ${libraryFilter === value ? 'active' : ''}`} onClick={() => setLibraryFilter(value)}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="sort-dropdown">
          <label>Sort:</label>
          <select value={librarySort} onChange={(e) => setLibrarySort(e.target.value)}>
            <option value="recent">Recently Added</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {filteredLibrary.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <h3>Your library is empty</h3>
          <p>Start adding games from the Discover tab!</p>
          <button className="primary-btn" onClick={() => setActiveTab(TABS.DISCOVER)}>Browse Games</button>
        </div>
      ) : (
        <div className="games-grid">
          {filteredLibrary.map(game => (
            <div key={game.id} className="library-game-card">
              {renderGameCard(game, { showStatus: true })}
              <div className="library-card-controls">
                <select value={game.status} onChange={(e) => handleUpdateStatus(game.id, e.target.value)} className="status-select">
                  <option value="backlog">📋 Backlog</option>
                  <option value="playing">🎮 Playing</option>
                  <option value="completed">✅ Completed</option>
                  <option value="dropped">❌ Dropped</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== RENDER DEALS TAB ==========
  const renderDealsTab = () => (
    <div className="games-section-content deals-content">
      <div className="deals-header">
        <h3>🔥 Current Deals</h3>
        <div className="deals-filters">
          <div className="filter-group">
            <label>Max: ${maxPrice}</label>
            <input type="range" min="5" max="60" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} onMouseUp={loadDeals} onTouchEnd={loadDeals} />
          </div>
          <button className="refresh-btn" onClick={loadDeals}>🔄 Refresh</button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="loading-spinner"></div><p>Loading deals...</p></div>
      ) : (
        <div className="deals-grid">{deals.map(deal => renderDealCard(deal))}</div>
      )}

      <div className="gray-market-disclaimer">
        <h4>⚠️ About Key Resellers</h4>
        <p>Some stores are "gray market" resellers. Official retailers (Steam, GOG, Humble) directly support developers and guarantee key validity.</p>
      </div>
    </div>
  );

  // ========== RENDER WISHLIST TAB ==========
  const renderWishlistTab = () => (
    <div className="games-section-content wishlist-content">
      <div className="wishlist-header">
        <h3>💝 Your Wishlist</h3>
        <span className="wishlist-count">{wishlist.length} games</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💝</span>
          <h3>Your wishlist is empty</h3>
          <p>Add games to track their prices!</p>
          <button className="primary-btn" onClick={() => setActiveTab(TABS.DISCOVER)}>Browse Games</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(game => (
            <div key={game.id} className="wishlist-game-card">
              {renderGameCard(game, { showActions: false })}
              <div className="wishlist-card-actions">
                <button className="price-check-btn" onClick={() => handleShowPrices(game)}>💰 Check Prices</button>
                <button className="alert-btn" onClick={() => handleSetPriceAlert(game)}>🔔 Set Alert</button>
                <button className="remove-btn" onClick={() => handleRemoveFromWishlist(game.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== RENDER FREE GAMES TAB ==========
  const renderFreeGamesTab = () => (
    <div className="games-section-content free-games-content">
      <div className="free-games-header">
        <h3>🎁 Free Games</h3>
        <button className="refresh-btn" onClick={loadFreeGames}>🔄 Refresh</button>
      </div>

      <div className="free-games-section">
        <div className="section-title">
          <span className="store-logo">🎯</span>
          <h4>Epic Games Store</h4>
          <span className="update-info">Updates every Thursday</span>
        </div>
        {freeGames.epic?.current?.length > 0 ? (
          <div className="free-games-row">
            {freeGames.epic.current.map((game, idx) => (
              <div key={idx} className="free-game-card">
                <div className="free-game-image">
                  {game.keyImages?.[0] && <img src={game.keyImages[0].url} alt={game.title} />}
                  <div className="free-badge">FREE</div>
                </div>
                <div className="free-game-info">
                  <h5>{game.title}</h5>
                  {game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0] && (
                    <span className="free-until">Until {new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate).toLocaleDateString()}</span>
                  )}
                </div>
                <a href={`https://store.epicgames.com/en-US/p/${game.productSlug || game.urlSlug}`} target="_blank" rel="noopener noreferrer" className="claim-btn">Claim Now →</a>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-free-games"><p>Check back Thursday for new free games!</p></div>
        )}
      </div>

      <div className="free-games-info-grid">
        <div className="info-card prime"><span className="info-icon">👑</span><h4>Prime Gaming</h4><p>Free games with Amazon Prime</p><a href="https://gaming.amazon.com" target="_blank" rel="noopener noreferrer">Check →</a></div>
        <div className="info-card psplus"><span className="info-icon">🎮</span><h4>PlayStation Plus</h4><p>Monthly games for subscribers</p><a href="https://www.playstation.com/en-us/ps-plus/" target="_blank" rel="noopener noreferrer">Check →</a></div>
        <div className="info-card gamepass"><span className="info-icon">🟢</span><h4>Xbox Game Pass</h4><p>Hundreds of games</p><a href="https://www.xbox.com/en-US/xbox-game-pass" target="_blank" rel="noopener noreferrer">Check →</a></div>
        <div className="info-card steam"><span className="info-icon">🎮</span><h4>Steam Free Weekends</h4><p>Try games free</p><a href="https://store.steampowered.com/genre/Free%20to%20Play/" target="_blank" rel="noopener noreferrer">Check →</a></div>
      </div>
    </div>
  );

  // ========== RENDER CALENDAR TAB ==========
  const renderCalendarTab = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return (
      <div className="games-section-content calendar-content">
        <div className="calendar-header">
          <button className="calendar-nav" onClick={() => {
            const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1);
            setCalendarDate(newDate);
            loadCalendarGames(newDate);
          }}>←</button>
          <h3>📅 {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
          <button className="calendar-nav" onClick={() => {
            const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1);
            setCalendarDate(newDate);
            loadCalendarGames(newDate);
          }}>→</button>
        </div>

        {isLoading ? (
          <div className="loading-state"><div className="loading-spinner"></div><p>Loading releases...</p></div>
        ) : (
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="weekday">{d}</div>)}
            </div>
            <div className="calendar-days">
              {calendarDays.map((day, idx) => {
                const gamesOnDay = getGamesForDay(day);
                const isToday = day === new Date().getDate() && 
                  calendarDate.getMonth() === new Date().getMonth() && 
                  calendarDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div key={idx} className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${gamesOnDay.length > 0 ? 'has-games' : ''}`}>
                    {day && (
                      <>
                        <span className="day-number">{day}</span>
                        {gamesOnDay.length > 0 && (
                          <div className="day-games">
                            {gamesOnDay.slice(0, 3).map(game => (
                              <div key={game.id} className="day-game" onClick={() => openGameDetails(game)} title={game.name}>
                                {game.background_image ? (
                                  <img src={game.background_image} alt={game.name} />
                                ) : (
                                  <span className="day-game-icon">🎮</span>
                                )}
                              </div>
                            ))}
                            {gamesOnDay.length > 3 && <span className="more-games">+{gamesOnDay.length - 3}</span>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {calendarGames.length > 0 && (
          <div className="calendar-upcoming">
            <h4>🎮 All Releases This Month ({calendarGames.length})</h4>
            <div className="upcoming-list">
              {calendarGames.slice(0, 20).map(game => (
                <div key={game.id} className="upcoming-item" onClick={() => openGameDetails(game)}>
                  <div className="upcoming-date">{new Date(game.released).getDate()}</div>
                  <div className="upcoming-image">
                    {game.background_image && <img src={game.background_image} alt={game.name} />}
                  </div>
                  <div className="upcoming-info">
                    <h5>{game.name}</h5>
                    <div className="upcoming-platforms">
                      {game.platforms?.slice(0, 4).map((p, i) => (
                        <span key={i}>{gameUtils.getPlatformIcon(p.platform?.name)}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== RENDER TAGS TAB ==========
  const renderTagsTab = () => (
    <div className="games-section-content tags-content">
      <div className="tags-header">
        <h3>🏷️ Browse by Tag</h3>
        {selectedTag && (
          <button className="clear-tag-btn" onClick={() => { setSelectedTag(null); setTagGames([]); }}>
            ✕ Clear: {selectedTag.name}
          </button>
        )}
      </div>

      <div className="tags-cloud">
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag.id}
            className={`tag-btn ${selectedTag?.id === tag.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedTag(tag);
              loadTagGames(tag.slug);
            }}
          >
            {tag.icon} {tag.name}
          </button>
        ))}
      </div>

      {selectedTag && (
        <>
          {isLoading ? (
            <div className="loading-state"><div className="loading-spinner"></div><p>Loading {selectedTag.name} games...</p></div>
          ) : tagGames.length > 0 ? (
            <>
              <h4 className="tag-results-title">{selectedTag.icon} {selectedTag.name} Games</h4>
              <div className="games-grid">{tagGames.map(game => renderGameCard(game))}</div>
            </>
          ) : (
            <div className="empty-state"><p>No games found for this tag.</p></div>
          )}
        </>
      )}

      {!selectedTag && (
        <div className="tags-intro">
          <span className="tags-intro-icon">👆</span>
          <p>Select a tag above to browse games</p>
        </div>
      )}
    </div>
  );

  // ========== RENDER GAME DETAIL MODAL ==========
  const renderGameModal = () => {
    if (!showGameModal || !selectedGame) return null;
    const game = gameDetails || selectedGame;

    return (
      <div className="modal-overlay game-detail-overlay" onClick={() => setShowGameModal(false)}>
        <div className="game-detail-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowGameModal(false)}>×</button>

          {/* Hero Section */}
          <div className="game-detail-hero" style={{ backgroundImage: `url(${game.background_image})` }}>
            <div className="hero-overlay">
              <div className="hero-content">
                <h1>{game.name}</h1>
                <div className="hero-meta">
                  {game.released && <span className="hero-date">📅 {gameUtils.formatDate(game.released)}</span>}
                  {game.metacritic && (
                    <span className={`hero-score ${gameUtils.getMetacriticClass(game.metacritic)}`}>
                      ⭐ {game.metacritic}
                    </span>
                  )}
                  {game.playtime > 0 && <span className="hero-playtime">⏱️ {game.playtime}h avg</span>}
                </div>
                <div className="hero-actions">
                  <button 
                    className={`hero-btn primary ${isInLibrary(game.id) ? 'in-library' : ''}`}
                    onClick={() => isInLibrary(game.id) ? handleRemoveFromLibrary(game.id) : handleAddToLibrary(game)}
                  >
                    {isInLibrary(game.id) ? '✓ In Library' : '+ Add to Library'}
                  </button>
                  <button 
                    className={`hero-btn ${isInWishlist(game.id) ? 'in-wishlist' : ''}`}
                    onClick={() => isInWishlist(game.id) ? handleRemoveFromWishlist(game.id) : handleAddToWishlist(game)}
                  >
                    {isInWishlist(game.id) ? '❤️ Wishlisted' : '🤍 Wishlist'}
                  </button>
                  <button className="hero-btn price-btn" onClick={() => handleShowPrices(game)}>
                    💰 Compare Prices
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="game-detail-tabs">
            {[
              { id: 'overview', label: '📋 Overview' },
              { id: 'media', label: '🎬 Media' },
              { id: 'achievements', label: '🏆 Achievements' },
              { id: 'similar', label: '🎯 Similar' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`detail-tab ${gameModalTab === tab.id ? 'active' : ''}`}
                onClick={() => setGameModalTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="game-detail-content">
            {detailsLoading ? (
              <div className="loading-state"><div className="loading-spinner"></div><p>Loading details...</p></div>
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {gameModalTab === 'overview' && (
                  <div className="detail-overview">
                    {/* Description */}
                    {game.description_raw && (
                      <div className="detail-section">
                        <h3>About</h3>
                        <p className="game-description">{game.description_raw.slice(0, 800)}{game.description_raw.length > 800 ? '...' : ''}</p>
                      </div>
                    )}

                    <div className="detail-info-grid">
                      {/* Platforms */}
                      {game.platforms && (
                        <div className="detail-info-card">
                          <h4>Platforms</h4>
                          <div className="info-tags">
                            {game.platforms.map((p, i) => (
                              <span key={i} className="info-tag platform">
                                {gameUtils.getPlatformIcon(p.platform?.name)} {p.platform?.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Genres */}
                      {game.genres && (
                        <div className="detail-info-card">
                          <h4>Genres</h4>
                          <div className="info-tags">
                            {game.genres.map(g => <span key={g.id} className="info-tag genre">{g.name}</span>)}
                          </div>
                        </div>
                      )}

                      {/* Developers */}
                      {game.developers && (
                        <div className="detail-info-card">
                          <h4>Developers</h4>
                          <div className="info-tags">
                            {game.developers.map(d => <span key={d.id} className="info-tag dev">{d.name}</span>)}
                          </div>
                        </div>
                      )}

                      {/* Publishers */}
                      {game.publishers && (
                        <div className="detail-info-card">
                          <h4>Publishers</h4>
                          <div className="info-tags">
                            {game.publishers.map(p => <span key={p.id} className="info-tag pub">{p.name}</span>)}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {game.tags && (
                        <div className="detail-info-card full-width">
                          <h4>Tags</h4>
                          <div className="info-tags">
                            {game.tags.slice(0, 15).map(t => <span key={t.id} className="info-tag">{t.name}</span>)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PC Requirements */}
                    {game.platforms?.find(p => p.platform?.slug === 'pc')?.requirements && (
                      <div className="detail-section pc-requirements">
                        <h3>💻 PC Requirements</h3>
                        <div className="requirements-grid">
                          {game.platforms.find(p => p.platform?.slug === 'pc').requirements.minimum && (
                            <div className="requirement-card">
                              <h5>Minimum</h5>
                              <div dangerouslySetInnerHTML={{ __html: game.platforms.find(p => p.platform?.slug === 'pc').requirements.minimum }} />
                            </div>
                          )}
                          {game.platforms.find(p => p.platform?.slug === 'pc').requirements.recommended && (
                            <div className="requirement-card">
                              <h5>Recommended</h5>
                              <div dangerouslySetInnerHTML={{ __html: game.platforms.find(p => p.platform?.slug === 'pc').requirements.recommended }} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* DLC */}
                    {gameDetails?.dlc?.length > 0 && (
                      <div className="detail-section">
                        <h3>📦 DLC & Editions ({gameDetails.dlcCount || gameDetails.dlc.length})</h3>
                        <div className="dlc-grid">
                          {gameDetails.dlc.slice(0, 6).map(dlc => (
                            <div key={dlc.id} className="dlc-card" onClick={() => openGameDetails(dlc)}>
                              {dlc.background_image && <img src={dlc.background_image} alt={dlc.name} />}
                              <span>{dlc.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Series */}
                    {gameDetails?.series?.length > 0 && (
                      <div className="detail-section">
                        <h3>🎮 In This Series</h3>
                        <div className="series-grid">
                          {gameDetails.series.slice(0, 6).map(s => (
                            <div key={s.id} className="series-card" onClick={() => openGameDetails(s)}>
                              {s.background_image && <img src={s.background_image} alt={s.name} />}
                              <span>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MEDIA TAB */}
                {gameModalTab === 'media' && (
                  <div className="detail-media">
                    {/* Trailers */}
                    {gameDetails?.trailers?.length > 0 && (
                      <div className="detail-section">
                        <h3>🎬 Trailers</h3>
                        <div className="trailers-grid">
                          {gameDetails.trailers.map(trailer => (
                            <div key={trailer.id} className="trailer-card" onClick={() => playTrailer(trailer)}>
                              <img src={trailer.preview} alt={trailer.name} />
                              <div className="play-overlay">▶</div>
                              <span className="trailer-name">{trailer.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Screenshots */}
                    {gameDetails?.screenshots?.length > 0 && (
                      <div className="detail-section">
                        <h3>📸 Screenshots ({gameDetails.screenshots.length})</h3>
                        <div className="screenshots-grid">
                          {gameDetails.screenshots.map(ss => (
                            <div key={ss.id} className="screenshot-card">
                              <img src={ss.image} alt="Screenshot" loading="lazy" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!gameDetails?.trailers?.length && !gameDetails?.screenshots?.length && (
                      <div className="empty-state"><p>No media available for this game.</p></div>
                    )}
                  </div>
                )}

                {/* ACHIEVEMENTS TAB */}
                {gameModalTab === 'achievements' && (
                  <div className="detail-achievements">
                    {gameDetails?.achievements?.length > 0 ? (
                      <>
                        <h3>🏆 Achievements ({gameDetails.achievementCount || gameDetails.achievements.length})</h3>
                        <div className="achievements-grid">
                          {gameDetails.achievements.map(ach => (
                            <div key={ach.id} className="achievement-card">
                              <img src={ach.image} alt={ach.name} className="achievement-icon" />
                              <div className="achievement-info">
                                <h5>{ach.name}</h5>
                                <p>{ach.description}</p>
                                <span className="achievement-percent">{ach.percent}% unlocked</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="empty-state"><span className="empty-icon">🏆</span><p>No achievements available for this game.</p></div>
                    )}
                  </div>
                )}

                {/* SIMILAR TAB */}
                {gameModalTab === 'similar' && (
                  <div className="detail-similar">
                    {similarGames.length > 0 ? (
                      <>
                        <h3>🎯 You Might Also Like</h3>
                        <div className="similar-games-grid">
                          {similarGames.map(sg => (
                            <div key={sg.id} className="similar-game-card" onClick={() => openGameDetails(sg)}>
                              <div className="similar-game-image">
                                {sg.background_image && <img src={sg.background_image} alt={sg.name} />}
                                {sg.metacritic && (
                                  <span className={`similar-score ${gameUtils.getMetacriticClass(sg.metacritic)}`}>{sg.metacritic}</span>
                                )}
                              </div>
                              <div className="similar-game-info">
                                <h5>{sg.name}</h5>
                                <div className="similar-game-meta">
                                  {sg.released && <span>{new Date(sg.released).getFullYear()}</span>}
                                  {sg.genres?.[0] && <span>{sg.genres[0].name}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="empty-state"><p>No similar games found.</p></div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER TRAILER MODAL ==========
  const renderTrailerModal = () => {
    if (!showTrailerModal || !currentTrailer) return null;

    return (
      <div className="modal-overlay trailer-overlay" onClick={() => setShowTrailerModal(false)}>
        <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowTrailerModal(false)}>×</button>
          <h3>{currentTrailer.name}</h3>
          <div className="trailer-video">
            <video controls autoPlay src={currentTrailer.data?.max || currentTrailer.data?.['480']}>
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER PRICE MODAL ==========
  const renderPriceModal = () => {
    if (!showPriceModal || !selectedGame) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
        <div className="price-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowPriceModal(false)}>×</button>

          <div className="modal-header">
            <div className="modal-game-info">
              {selectedGame.background_image && <img src={selectedGame.background_image} alt={selectedGame.name} className="modal-game-image" />}
              <div>
                <h2>{selectedGame.name}</h2>
                {selectedGame.metacritic && <span className={`metacritic-badge ${gameUtils.getMetacriticClass(selectedGame.metacritic)}`}>{selectedGame.metacritic}</span>}
              </div>
            </div>
          </div>

          <div className="modal-content">
            {priceLoading ? (
              <div className="loading-state"><div className="loading-spinner"></div><p>Finding best prices...</p></div>
            ) : gamePrices ? (
              <>
                {gamePrices.lowestPrice && (
                  <div className="best-price-highlight">
                    <span className="best-label">🏆 BEST PRICE</span>
                    <div className="best-price-info">
                      <span className="best-store">{gamePrices.lowestPrice.storeName}</span>
                      <span className="best-price">${gamePrices.lowestPrice.price}</span>
                      {gamePrices.lowestPrice.discount > 0 && <span className="best-discount">-{gamePrices.lowestPrice.discount}%</span>}
                    </div>
                    <a href={gamePrices.lowestPrice.url} target="_blank" rel="noopener noreferrer" className="buy-now-btn">Buy Now →</a>
                  </div>
                )}

                <div className="price-section">
                  <h3>✅ Official Retailers</h3>
                  <div className="price-list">
                    {gamePrices.official?.length > 0 ? gamePrices.official.map((price, i) => (
                      <div key={i} className="price-row official">
                        <span className="store-name">{price.storeName}</span>
                        <div className="price-info">
                          {price.discount > 0 && <span className="original-price">${price.originalPrice}</span>}
                          <span className="current-price">${price.price}</span>
                          {price.discount > 0 && <span className="discount-tag">-{price.discount}%</span>}
                        </div>
                        <a href={price.url} target="_blank" rel="noopener noreferrer" className="store-link">View →</a>
                      </div>
                    )) : <p className="no-prices">No official prices found</p>}
                  </div>
                </div>

                <div className="price-section gray-market">
                  <h3>⚠️ Marketplace / Key Resellers</h3>
                  <p className="gray-warning">Keys may come from unknown sources. Use at your own risk.</p>
                  <div className="price-list">
                    {gamePrices.gray?.map((price, i) => (
                      <div key={i} className="price-row gray">
                        <span className="store-name">{price.storeName} <span className="gray-badge">⚠️</span></span>
                        <div className="price-info">
                          <span className="current-price">${price.price}</span>
                          {price.discount > 0 && <span className="discount-tag">-{price.discount}%</span>}
                        </div>
                        <a href={price.url} target="_blank" rel="noopener noreferrer" className="store-link gray">View →</a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="action-btn-large wishlist" onClick={() => { handleAddToWishlist(selectedGame); setShowPriceModal(false); }}>❤️ Add to Wishlist</button>
                  <button className="action-btn-large alert" onClick={() => { handleSetPriceAlert(selectedGame); setShowPriceModal(false); }}>🔔 Set Price Alert</button>
                </div>
              </>
            ) : (
              <div className="empty-state"><p>Unable to load prices.</p></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER ALERT MODAL ==========
  const renderAlertModal = () => {
    if (!showAlertModal || !alertGame) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
        <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowAlertModal(false)}>×</button>
          <h2>🔔 Set Price Alert</h2>
          <p>Get notified when <strong>{alertGame.name}</strong> drops to your target price.</p>
          <div className="alert-form">
            <label>Target Price (USD)</label>
            <div className="price-input-wrapper">
              <span className="currency">$</span>
              <input type="number" value={alertTargetPrice} onChange={(e) => setAlertTargetPrice(e.target.value)} placeholder="29.99" min="0" step="0.01" />
            </div>
          </div>
          <div className="alert-modal-actions">
            <button className="cancel-btn" onClick={() => setShowAlertModal(false)}>Cancel</button>
            <button className="save-btn" onClick={handleSavePriceAlert} disabled={!alertTargetPrice}>Set Alert</button>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  const renderContent = () => {
    if (searchQuery && searchResults.length > 0) {
      return (
        <div className="games-section-content">
          <div className="search-results-header">
            <h3>Search Results for "{searchQuery}"</h3>
            <span className="results-count">{searchResults.length} games</span>
          </div>
          <div className="games-grid">{searchResults.map(game => renderGameCard(game))}</div>
        </div>
      );
    }

    switch (activeTab) {
      case TABS.DISCOVER: return renderDiscoverTab();
      case TABS.LIBRARY: return renderLibraryTab();
      case TABS.DEALS: return renderDealsTab();
      case TABS.WISHLIST: return renderWishlistTab();
      case TABS.FREE: return renderFreeGamesTab();
      case TABS.CALENDAR: return renderCalendarTab();
      case TABS.TAGS: return renderTagsTab();
      default: return renderDiscoverTab();
    }
  };

  return (
    <section className="section games-section">
      {/* Header */}
      <div className="games-header">
        <div className="header-title">
          <h2>🎮 Games</h2>
          <p className="header-subtitle">Your Ultimate Gaming Hub</p>
        </div>
        <div className="games-search">
          <input type="text" placeholder="Search games..." value={searchQuery} onChange={handleSearchInput} className="search-input" />
          {searchQuery && <button className="clear-search" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>×</button>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="games-tabs">
        {[
          { id: TABS.DISCOVER, icon: '🔍', label: 'Discover' },
          { id: TABS.LIBRARY, icon: '📚', label: 'Library', badge: library.length },
          { id: TABS.DEALS, icon: '🔥', label: 'Deals' },
          { id: TABS.WISHLIST, icon: '💝', label: 'Wishlist', badge: wishlist.length },
          { id: TABS.FREE, icon: '🎁', label: 'Free' },
          { id: TABS.CALENDAR, icon: '📅', label: 'Calendar' },
          { id: TABS.TAGS, icon: '🏷️', label: 'Tags' },
        ].map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => handleTabChange(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      {renderGameModal()}
      {renderTrailerModal()}
      {renderPriceModal()}
      {renderAlertModal()}
    </section>
  );
}

export default GamesSection;
