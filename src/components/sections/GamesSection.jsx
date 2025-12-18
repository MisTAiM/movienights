/* ========================================
   GamesSection.jsx - Complete Gaming Hub
   Features: Library, Discovery, Deals, Price Comparison, Wishlist
   ======================================== */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  rawgService,
  cheapSharkService,
  priceService,
  freeGamesService,
  userGameDataService,
  gameUtils,
  PLATFORMS,
  GENRES,
  STORES,
} from '../../services/gameService';
import './GamesSection.css';

// Tab definitions
const TABS = {
  DISCOVER: 'discover',
  LIBRARY: 'library',
  DEALS: 'deals',
  WISHLIST: 'wishlist',
  FREE: 'free',
};

// Library status filters
const LIBRARY_STATUS = {
  ALL: 'all',
  PLAYING: 'playing',
  BACKLOG: 'backlog',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
};

function GamesSection() {
  const { state, actions } = useApp();

  // Main state
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
  const [dealsFilter, setDealsFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(30);

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Free games state
  const [freeGames, setFreeGames] = useState({ epic: [], prime: [], psplus: [], gamepass: [] });

  // Game detail modal state
  const [selectedGame, setSelectedGame] = useState(null);
  const [gamePrices, setGamePrices] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  // Price alert state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertGame, setAlertGame] = useState(null);

  // Refs
  const searchTimeoutRef = useRef(null);

  // Load initial data
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
        default:
          result = await rawgService.getTrending(1, 24);
      }
      if (result.success) {
        setDiscoverGames(result.data);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      actions.addNotification('Failed to load games', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load library from localStorage
  const loadLibrary = () => {
    const savedLibrary = userGameDataService.getLibrary();
    setLibrary(savedLibrary);
  };

  // Load wishlist from localStorage
  const loadWishlist = () => {
    const savedWishlist = userGameDataService.getWishlist();
    setWishlist(savedWishlist);
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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchResults([]);

    if (tab === TABS.DEALS && deals.length === 0) {
      loadDeals();
    } else if (tab === TABS.FREE) {
      loadFreeGames();
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

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  // Add to library
  const handleAddToLibrary = (game, status = 'backlog') => {
    const updatedLibrary = userGameDataService.addToLibrary(game, status);
    setLibrary(updatedLibrary);
    actions.addNotification(`${game.name} added to library`, 'success');
  };

  // Remove from library
  const handleRemoveFromLibrary = (gameId) => {
    const updatedLibrary = userGameDataService.removeFromLibrary(gameId);
    setLibrary(updatedLibrary);
    actions.addNotification('Game removed from library', 'info');
  };

  // Update game status
  const handleUpdateStatus = (gameId, status) => {
    const updatedLibrary = userGameDataService.updateGameStatus(gameId, status);
    setLibrary(updatedLibrary);
  };

  // Add to wishlist
  const handleAddToWishlist = (game) => {
    const updatedWishlist = userGameDataService.addToWishlist(game);
    setWishlist(updatedWishlist);
    actions.addNotification(`${game.name} added to wishlist`, 'success');
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = (gameId) => {
    const updatedWishlist = userGameDataService.removeFromWishlist(gameId);
    setWishlist(updatedWishlist);
    actions.addNotification('Game removed from wishlist', 'info');
  };

  // Check if game is in library
  const isInLibrary = (gameId) => {
    return library.some(g => g.id === gameId);
  };

  // Check if game is in wishlist
  const isInWishlist = (gameId) => {
    return wishlist.some(g => g.id === gameId);
  };

  // Open price comparison modal
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
      actions.addNotification('Failed to load prices', 'error');
    } finally {
      setPriceLoading(false);
    }
  };

  // Open price alert modal
  const handleSetPriceAlert = (game) => {
    setAlertGame(game);
    setAlertTargetPrice('');
    setShowAlertModal(true);
  };

  // Save price alert
  const handleSavePriceAlert = () => {
    if (!alertTargetPrice || !alertGame) return;

    userGameDataService.setPriceAlert(alertGame, parseFloat(alertTargetPrice));
    actions.addNotification(`Price alert set for ${alertGame.name} at $${alertTargetPrice}`, 'success');
    setShowAlertModal(false);
    setAlertGame(null);
    setAlertTargetPrice('');
  };

  // Filter and sort library
  const filteredLibrary = useMemo(() => {
    let filtered = [...library];

    // Apply status filter
    if (libraryFilter !== LIBRARY_STATUS.ALL) {
      filtered = filtered.filter(g => g.status === libraryFilter);
    }

    // Apply sort
    switch (librarySort) {
      case 'recent':
        filtered.sort((a, b) => b.addedAt - a.addedAt);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
        break;
      case 'playtime':
        filtered.sort((a, b) => (b.playtime || 0) - (a.playtime || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [library, libraryFilter, librarySort]);

  // Get library stats
  const libraryStats = useMemo(() => {
    return {
      total: library.length,
      playing: library.filter(g => g.status === 'playing').length,
      backlog: library.filter(g => g.status === 'backlog').length,
      completed: library.filter(g => g.status === 'completed').length,
      dropped: library.filter(g => g.status === 'dropped').length,
    };
  }, [library]);

  // Render game card
  const renderGameCard = (game, options = {}) => {
    const { showStatus = false, showActions = true, compact = false } = options;
    const inLibrary = isInLibrary(game.id);
    const inWishlist = isInWishlist(game.id);

    return (
      <div
        key={game.id}
        className={`game-card ${compact ? 'compact' : ''}`}
        onClick={() => !compact && handleShowPrices(game)}
      >
        <div className="game-card-image">
          {game.background_image ? (
            <img src={game.background_image} alt={game.name} loading="lazy" />
          ) : (
            <div className="game-card-placeholder">
              <span>🎮</span>
            </div>
          )}
          {game.metacritic && (
            <div className={`metacritic-badge ${getMetacriticClass(game.metacritic)}`}>
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
            {game.released && (
              <span className="game-release">{new Date(game.released).getFullYear()}</span>
            )}
            {game.genres && game.genres.length > 0 && (
              <span className="game-genre">{game.genres[0].name}</span>
            )}
          </div>

          {game.platforms && (
            <div className="game-platforms">
              {game.platforms.slice(0, 4).map((p, i) => (
                <span key={i} className="platform-icon" title={p.platform?.name}>
                  {getPlatformIcon(p.platform?.name)}
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
              <button
                className="action-btn price"
                onClick={() => handleShowPrices(game)}
                title="Compare Prices"
              >
                💰
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render deal card
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
            <span className="store-name">{getStoreNameById(deal.storeID)}</span>
            {deal.dealRating && (
              <span className="deal-rating">⭐ {deal.dealRating}</span>
            )}
          </div>

          <a
            href={cheapSharkService.getRedirectUrl(deal.dealID)}
            target="_blank"
            rel="noopener noreferrer"
            className="deal-buy-btn"
          >
            View Deal →
          </a>
        </div>
      </div>
    );
  };

  // Render main content based on active tab
  const renderContent = () => {
    // If searching, show search results
    if (searchQuery && searchResults.length > 0) {
      return (
        <div className="games-section-content">
          <div className="search-results-header">
            <h3>Search Results for "{searchQuery}"</h3>
            <span className="results-count">{searchResults.length} games found</span>
          </div>
          <div className="games-grid">
            {searchResults.map(game => renderGameCard(game))}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case TABS.DISCOVER:
        return renderDiscoverTab();
      case TABS.LIBRARY:
        return renderLibraryTab();
      case TABS.DEALS:
        return renderDealsTab();
      case TABS.WISHLIST:
        return renderWishlistTab();
      case TABS.FREE:
        return renderFreeGamesTab();
      default:
        return renderDiscoverTab();
    }
  };

  // Render Discover Tab
  const renderDiscoverTab = () => (
    <div className="games-section-content discover-content">
      {/* Category Selector */}
      <div className="discover-categories">
        <button
          className={`category-btn ${discoverCategory === 'trending' ? 'active' : ''}`}
          onClick={() => {
            setDiscoverCategory('trending');
            loadDiscoverGames('trending');
          }}
        >
          🔥 Trending
        </button>
        <button
          className={`category-btn ${discoverCategory === 'upcoming' ? 'active' : ''}`}
          onClick={() => {
            setDiscoverCategory('upcoming');
            loadDiscoverGames('upcoming');
          }}
        >
          📅 Upcoming
        </button>
        <button
          className={`category-btn ${discoverCategory === 'toprated' ? 'active' : ''}`}
          onClick={() => {
            setDiscoverCategory('toprated');
            loadDiscoverGames('toprated');
          }}
        >
          ⭐ Top Rated
        </button>
      </div>

      {/* Platform Filter */}
      <div className="filter-row">
        <div className="filter-group">
          <label>Platform:</label>
          <select
            value={selectedPlatform || ''}
            onChange={(e) => setSelectedPlatform(e.target.value || null)}
          >
            <option value="">All Platforms</option>
            {Object.entries(PLATFORMS).map(([key, platform]) => (
              <option key={key} value={platform.id}>{platform.icon} {platform.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Genre:</label>
          <select
            value={selectedGenre || ''}
            onChange={(e) => setSelectedGenre(e.target.value || null)}
          >
            <option value="">All Genres</option>
            {GENRES.map(genre => (
              <option key={genre.id} value={genre.slug}>{genre.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Games Grid */}
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading games...</p>
        </div>
      ) : (
        <div className="games-grid">
          {discoverGames.map(game => renderGameCard(game))}
        </div>
      )}
    </div>
  );

  // Render Library Tab
  const renderLibraryTab = () => (
    <div className="games-section-content library-content">
      {/* Library Stats */}
      <div className="library-stats">
        <div className="stat-card total">
          <span className="stat-value">{libraryStats.total}</span>
          <span className="stat-label">Total Games</span>
        </div>
        <div className="stat-card playing">
          <span className="stat-value">{libraryStats.playing}</span>
          <span className="stat-label">Playing</span>
        </div>
        <div className="stat-card backlog">
          <span className="stat-value">{libraryStats.backlog}</span>
          <span className="stat-label">Backlog</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-value">{libraryStats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card dropped">
          <span className="stat-value">{libraryStats.dropped}</span>
          <span className="stat-label">Dropped</span>
        </div>
      </div>

      {/* Library Filters */}
      <div className="library-filters">
        <div className="status-filters">
          {Object.entries(LIBRARY_STATUS).map(([key, value]) => (
            <button
              key={key}
              className={`filter-btn ${libraryFilter === value ? 'active' : ''}`}
              onClick={() => setLibraryFilter(value)}
            >
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="sort-dropdown">
          <label>Sort by:</label>
          <select value={librarySort} onChange={(e) => setLibrarySort(e.target.value)}>
            <option value="recent">Recently Added</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="playtime">Playtime</option>
          </select>
        </div>
      </div>

      {/* Library Grid */}
      {filteredLibrary.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <h3>Your library is empty</h3>
          <p>Start adding games from the Discover tab!</p>
          <button className="primary-btn" onClick={() => setActiveTab(TABS.DISCOVER)}>
            Browse Games
          </button>
        </div>
      ) : (
        <div className="games-grid">
          {filteredLibrary.map(game => (
            <div key={game.id} className="library-game-card">
              {renderGameCard(game, { showStatus: true })}
              <div className="library-card-controls">
                <select
                  value={game.status}
                  onChange={(e) => handleUpdateStatus(game.id, e.target.value)}
                  className="status-select"
                >
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

  // Render Deals Tab
  const renderDealsTab = () => (
    <div className="games-section-content deals-content">
      {/* Deals Header */}
      <div className="deals-header">
        <h3>🔥 Current Deals</h3>
        <div className="deals-filters">
          <div className="filter-group">
            <label>Max Price: ${maxPrice}</label>
            <input
              type="range"
              min="5"
              max="60"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              onMouseUp={loadDeals}
              onTouchEnd={loadDeals}
            />
          </div>
          <button className="refresh-btn" onClick={loadDeals}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Store Filters */}
      <div className="store-filters">
        <button
          className={`store-btn ${dealsFilter === 'all' ? 'active' : ''}`}
          onClick={() => setDealsFilter('all')}
        >
          All Stores
        </button>
        <button
          className={`store-btn ${dealsFilter === 'official' ? 'active' : ''}`}
          onClick={() => setDealsFilter('official')}
        >
          ✅ Official Only
        </button>
      </div>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading deals...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏷️</span>
          <h3>No deals found</h3>
          <p>Try adjusting your filters or check back later!</p>
        </div>
      ) : (
        <div className="deals-grid">
          {deals.map(deal => renderDealCard(deal))}
        </div>
      )}

      {/* Gray Market Disclaimer */}
      <div className="gray-market-disclaimer">
        <h4>⚠️ About Key Resellers</h4>
        <p>
          Some stores listed are "gray market" resellers. While often cheaper, keys may come from 
          unknown sources. Official retailers (Steam, GOG, Humble) directly support developers 
          and guarantee key validity.
        </p>
      </div>
    </div>
  );

  // Render Wishlist Tab
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
          <p>Add games you're interested in to track their prices!</p>
          <button className="primary-btn" onClick={() => setActiveTab(TABS.DISCOVER)}>
            Browse Games
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(game => (
            <div key={game.id} className="wishlist-game-card">
              {renderGameCard(game, { showActions: false })}
              <div className="wishlist-card-actions">
                <button
                  className="price-check-btn"
                  onClick={() => handleShowPrices(game)}
                >
                  💰 Check Prices
                </button>
                <button
                  className="alert-btn"
                  onClick={() => handleSetPriceAlert(game)}
                >
                  🔔 Set Alert
                </button>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFromWishlist(game.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Free Games Tab
  const renderFreeGamesTab = () => (
    <div className="games-section-content free-games-content">
      <div className="free-games-header">
        <h3>🎁 Free Games</h3>
        <button className="refresh-btn" onClick={loadFreeGames}>
          🔄 Refresh
        </button>
      </div>

      {/* Epic Games Free */}
      <div className="free-games-section">
        <div className="section-title">
          <span className="store-logo">🎯</span>
          <h4>Epic Games Store</h4>
          <span className="update-info">Updates every Thursday</span>
        </div>
        {freeGames.epic && freeGames.epic.length > 0 ? (
          <div className="free-games-row">
            {freeGames.epic.map((game, index) => (
              <div key={index} className="free-game-card">
                <div className="free-game-image">
                  {game.keyImages && game.keyImages[0] && (
                    <img src={game.keyImages[0].url} alt={game.title} />
                  )}
                  <div className="free-badge">FREE</div>
                </div>
                <div className="free-game-info">
                  <h5>{game.title}</h5>
                  {game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0] && (
                    <span className="free-until">
                      Free until {new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <a
                  href={`https://store.epicgames.com/en-US/p/${game.productSlug || game.urlSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="claim-btn"
                >
                  Claim Now →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-free-games">
            <p>Check back Thursday for new free games!</p>
          </div>
        )}
      </div>

      {/* Other Free Games Sources Info */}
      <div className="free-games-info-grid">
        <div className="info-card prime">
          <span className="info-icon">👑</span>
          <h4>Prime Gaming</h4>
          <p>Free games monthly with Amazon Prime</p>
          <a href="https://gaming.amazon.com" target="_blank" rel="noopener noreferrer">
            Check Prime Gaming →
          </a>
        </div>

        <div className="info-card psplus">
          <span className="info-icon">🎮</span>
          <h4>PlayStation Plus</h4>
          <p>Monthly free games for subscribers</p>
          <a href="https://www.playstation.com/en-us/ps-plus/" target="_blank" rel="noopener noreferrer">
            Check PS Plus →
          </a>
        </div>

        <div className="info-card gamepass">
          <span className="info-icon">🟢</span>
          <h4>Xbox Game Pass</h4>
          <p>Hundreds of games with subscription</p>
          <a href="https://www.xbox.com/en-US/xbox-game-pass" target="_blank" rel="noopener noreferrer">
            Check Game Pass →
          </a>
        </div>

        <div className="info-card steam">
          <span className="info-icon">🎯</span>
          <h4>Steam Free Weekends</h4>
          <p>Try games free every weekend</p>
          <a href="https://store.steampowered.com/genre/Free%20to%20Play/" target="_blank" rel="noopener noreferrer">
            Check Steam →
          </a>
        </div>
      </div>
    </div>
  );

  // Render Price Comparison Modal
  const renderPriceModal = () => {
    if (!showPriceModal || !selectedGame) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
        <div className="price-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowPriceModal(false)}>×</button>

          <div className="modal-header">
            <div className="modal-game-info">
              {selectedGame.background_image && (
                <img src={selectedGame.background_image} alt={selectedGame.name} className="modal-game-image" />
              )}
              <div>
                <h2>{selectedGame.name}</h2>
                {selectedGame.metacritic && (
                  <span className={`metacritic-badge ${getMetacriticClass(selectedGame.metacritic)}`}>
                    {selectedGame.metacritic}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-content">
            {priceLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Finding best prices...</p>
              </div>
            ) : gamePrices ? (
              <>
                {/* Best Price Highlight */}
                {gamePrices.lowestPrice && (
                  <div className="best-price-highlight">
                    <span className="best-label">🏆 BEST PRICE</span>
                    <div className="best-price-info">
                      <span className="best-store">{gamePrices.lowestPrice.storeName}</span>
                      <span className="best-price">${gamePrices.lowestPrice.price}</span>
                      {gamePrices.lowestPrice.discount > 0 && (
                        <span className="best-discount">-{gamePrices.lowestPrice.discount}%</span>
                      )}
                    </div>
                    <a
                      href={gamePrices.lowestPrice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="buy-now-btn"
                    >
                      Buy Now →
                    </a>
                  </div>
                )}

                {/* Official Retailers */}
                <div className="price-section">
                  <h3>✅ Official Retailers</h3>
                  <div className="price-list">
                    {gamePrices.official && gamePrices.official.length > 0 ? (
                      gamePrices.official.map((price, index) => (
                        <div key={index} className="price-row official">
                          <span className="store-name">{price.storeName}</span>
                          <div className="price-info">
                            {price.discount > 0 && (
                              <span className="original-price">${price.originalPrice}</span>
                            )}
                            <span className="current-price">${price.price}</span>
                            {price.discount > 0 && (
                              <span className="discount-tag">-{price.discount}%</span>
                            )}
                          </div>
                          <a
                            href={price.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="store-link"
                          >
                            View →
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="no-prices">No official prices found</p>
                    )}
                  </div>
                </div>

                {/* Gray Market */}
                <div className="price-section gray-market">
                  <h3>⚠️ Marketplace / Key Resellers</h3>
                  <p className="gray-warning">
                    These stores sell keys from various sources. Prices may be lower but carry some risk.
                  </p>
                  <div className="price-list">
                    {gamePrices.gray && gamePrices.gray.length > 0 ? (
                      gamePrices.gray.map((price, index) => (
                        <div key={index} className="price-row gray">
                          <span className="store-name">
                            {price.storeName}
                            <span className="gray-badge">⚠️</span>
                          </span>
                          <div className="price-info">
                            <span className="current-price">${price.price}</span>
                            {price.discount > 0 && (
                              <span className="discount-tag">-{price.discount}%</span>
                            )}
                          </div>
                          <a
                            href={price.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="store-link gray"
                          >
                            View →
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="no-prices">No marketplace prices found</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button
                    className="action-btn-large wishlist"
                    onClick={() => {
                      handleAddToWishlist(selectedGame);
                      setShowPriceModal(false);
                    }}
                  >
                    ❤️ Add to Wishlist
                  </button>
                  <button
                    className="action-btn-large alert"
                    onClick={() => {
                      handleSetPriceAlert(selectedGame);
                      setShowPriceModal(false);
                    }}
                  >
                    🔔 Set Price Alert
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>Unable to load prices. Try again later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Price Alert Modal
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
              <input
                type="number"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                placeholder="29.99"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="alert-modal-actions">
            <button className="cancel-btn" onClick={() => setShowAlertModal(false)}>
              Cancel
            </button>
            <button
              className="save-btn"
              onClick={handleSavePriceAlert}
              disabled={!alertTargetPrice}
            >
              Set Alert
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="section games-section">
      {/* Header */}
      <div className="games-header">
        <div className="header-title">
          <h2>🎮 Games</h2>
          <p className="header-subtitle">Your Ultimate Gaming Hub</p>
        </div>

        {/* Search Bar */}
        <div className="games-search">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={handleSearchInput}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="games-tabs">
        <button
          className={`tab-btn ${activeTab === TABS.DISCOVER ? 'active' : ''}`}
          onClick={() => handleTabChange(TABS.DISCOVER)}
        >
          <span className="tab-icon">🔍</span>
          <span className="tab-label">Discover</span>
        </button>
        <button
          className={`tab-btn ${activeTab === TABS.LIBRARY ? 'active' : ''}`}
          onClick={() => handleTabChange(TABS.LIBRARY)}
        >
          <span className="tab-icon">📚</span>
          <span className="tab-label">Library</span>
          {library.length > 0 && <span className="tab-badge">{library.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === TABS.DEALS ? 'active' : ''}`}
          onClick={() => handleTabChange(TABS.DEALS)}
        >
          <span className="tab-icon">🔥</span>
          <span className="tab-label">Deals</span>
        </button>
        <button
          className={`tab-btn ${activeTab === TABS.WISHLIST ? 'active' : ''}`}
          onClick={() => handleTabChange(TABS.WISHLIST)}
        >
          <span className="tab-icon">💝</span>
          <span className="tab-label">Wishlist</span>
          {wishlist.length > 0 && <span className="tab-badge">{wishlist.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === TABS.FREE ? 'active' : ''}`}
          onClick={() => handleTabChange(TABS.FREE)}
        >
          <span className="tab-icon">🎁</span>
          <span className="tab-label">Free Games</span>
        </button>
      </div>

      {/* Main Content */}
      {renderContent()}

      {/* Modals */}
      {renderPriceModal()}
      {renderAlertModal()}
    </section>
  );
}

// Helper functions
function getMetacriticClass(score) {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

function getPlatformIcon(platformName) {
  if (!platformName) return '🎮';
  const name = platformName.toLowerCase();
  if (name.includes('pc') || name.includes('windows')) return '🖥️';
  if (name.includes('playstation') || name.includes('ps')) return '🎮';
  if (name.includes('xbox')) return '🟢';
  if (name.includes('nintendo') || name.includes('switch')) return '🔴';
  if (name.includes('ios') || name.includes('iphone')) return '📱';
  if (name.includes('android')) return '🤖';
  if (name.includes('mac') || name.includes('apple')) return '🍎';
  if (name.includes('linux')) return '🐧';
  return '🎮';
}

function getStoreNameById(storeId) {
  const stores = {
    '1': 'Steam',
    '2': 'GamersGate',
    '3': 'GreenManGaming',
    '7': 'GOG',
    '8': 'Origin',
    '11': 'Humble Bundle',
    '13': 'Uplay',
    '15': 'Fanatical',
    '25': 'Epic Games',
    '27': 'Gamesplanet',
    '30': 'IndieGala',
  };
  return stores[storeId] || `Store ${storeId}`;
}

export default GamesSection;
