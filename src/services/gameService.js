/* ========================================
   gameService.js - Game API Integrations
   Handles RAWG, CheapShark, and Price Comparison
   MovieNights Ultimate - Games Hub
   ======================================== */

// API Configuration - YOUR KEYS
const RAWG_API_KEY = '9765e7f6ae22433794b8596b7a487cff'; // Your RAWG API Key
const RAWG_BASE_URL = 'https://api.rawg.io/api';
const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';

// Store metadata for price comparison
export const STORES = {
  // Official Retailers
  steam: { id: '1', name: 'Steam', logo: '🎮', type: 'official', color: '#1b2838', url: 'https://store.steampowered.com' },
  gog: { id: '7', name: 'GOG', logo: '🦅', type: 'official', color: '#86328a', url: 'https://www.gog.com' },
  humble: { id: '11', name: 'Humble Bundle', logo: '📦', type: 'official', color: '#cc4e4e', url: 'https://www.humblebundle.com' },
  epic: { id: '25', name: 'Epic Games', logo: '🎯', type: 'official', color: '#2a2a2a', url: 'https://store.epicgames.com' },
  gmg: { id: '23', name: 'Green Man Gaming', logo: '🟢', type: 'official', color: '#4ca64c', url: 'https://www.greenmangaming.com' },
  fanatical: { id: '15', name: 'Fanatical', logo: '⭐', type: 'official', color: '#ff6600', url: 'https://www.fanatical.com' },
  gamesplanet: { id: '27', name: 'Gamesplanet', logo: '🌍', type: 'official', color: '#e85d04', url: 'https://www.gamesplanet.com' },
  origin: { id: '8', name: 'EA App', logo: '🔶', type: 'official', color: '#f56c2d', url: 'https://www.ea.com' },
  uplay: { id: '13', name: 'Ubisoft', logo: '🔷', type: 'official', color: '#0070ff', url: 'https://store.ubisoft.com' },
  battlenet: { id: '31', name: 'Battle.net', logo: '🌀', type: 'official', color: '#00ceff', url: 'https://shop.battle.net' },
  
  // Gray Market
  g2a: { id: 'g2a', name: 'G2A', logo: '🔑', type: 'gray', color: '#f26522', url: 'https://www.g2a.com' },
  kinguin: { id: 'kinguin', name: 'Kinguin', logo: '👑', type: 'gray', color: '#00a8e8', url: 'https://www.kinguin.net' },
  cdkeys: { id: 'cdkeys', name: 'CDKeys', logo: '💿', type: 'gray', color: '#00b4d8', url: 'https://www.cdkeys.com' },
  eneba: { id: 'eneba', name: 'Eneba', logo: '🎪', type: 'gray', color: '#fa7921', url: 'https://www.eneba.com' },
  gamivo: { id: 'gamivo', name: 'GAMIVO', logo: '🎲', type: 'gray', color: '#7209b7', url: 'https://www.gamivo.com' },
};

// Platform definitions
export const PLATFORMS = {
  pc: { id: 4, name: 'PC', icon: '🖥️', color: '#00d4ff', slug: 'pc' },
  playstation: { id: 187, name: 'PlayStation 5', icon: '🎮', color: '#003791', slug: 'playstation5' },
  playstation4: { id: 18, name: 'PlayStation 4', icon: '🎮', color: '#003791', slug: 'playstation4' },
  xbox: { id: 186, name: 'Xbox Series X', icon: '🟢', color: '#107c10', slug: 'xbox-series-x' },
  xboxone: { id: 1, name: 'Xbox One', icon: '🟢', color: '#107c10', slug: 'xbox-one' },
  nintendo: { id: 7, name: 'Nintendo Switch', icon: '🔴', color: '#e60012', slug: 'nintendo-switch' },
  ios: { id: 3, name: 'iOS', icon: '📱', color: '#a2aaad', slug: 'ios' },
  android: { id: 21, name: 'Android', icon: '🤖', color: '#3ddc84', slug: 'android' },
};

// Genre definitions
export const GENRES = [
  { id: 4, name: 'Action', slug: 'action', icon: '⚔️' },
  { id: 51, name: 'Indie', slug: 'indie', icon: '🎨' },
  { id: 3, name: 'Adventure', slug: 'adventure', icon: '🗺️' },
  { id: 5, name: 'RPG', slug: 'role-playing-games-rpg', icon: '🧙' },
  { id: 10, name: 'Strategy', slug: 'strategy', icon: '♟️' },
  { id: 2, name: 'Shooter', slug: 'shooter', icon: '🔫' },
  { id: 40, name: 'Casual', slug: 'casual', icon: '🎈' },
  { id: 14, name: 'Simulation', slug: 'simulation', icon: '🏗️' },
  { id: 7, name: 'Puzzle', slug: 'puzzle', icon: '🧩' },
  { id: 11, name: 'Arcade', slug: 'arcade', icon: '👾' },
  { id: 83, name: 'Platformer', slug: 'platformer', icon: '🏃' },
  { id: 1, name: 'Racing', slug: 'racing', icon: '🏎️' },
  { id: 59, name: 'MMO', slug: 'massively-multiplayer', icon: '🌐' },
  { id: 15, name: 'Sports', slug: 'sports', icon: '⚽' },
  { id: 6, name: 'Fighting', slug: 'fighting', icon: '🥊' },
  { id: 19, name: 'Family', slug: 'family', icon: '👨‍👩‍👧‍👦' },
  { id: 28, name: 'Board Games', slug: 'board-games', icon: '🎲' },
  { id: 34, name: 'Educational', slug: 'educational', icon: '📚' },
];

// CheapShark store ID mapping
const CHEAPSHARK_STORES = {
  '1': 'Steam',
  '2': 'GamersGate', 
  '3': 'GreenManGaming',
  '4': 'Amazon',
  '5': 'GameStop',
  '6': 'Direct2Drive',
  '7': 'GOG',
  '8': 'Origin',
  '9': 'Get Games',
  '10': 'Shiny Loot',
  '11': 'Humble Store',
  '12': 'Desura',
  '13': 'Uplay',
  '14': 'IndieGameStand',
  '15': 'Fanatical',
  '16': 'Gamesrocket',
  '17': 'Games Republic',
  '18': 'SilaGames',
  '19': 'Playfield',
  '20': 'ImperialGames',
  '21': 'WinGameStore',
  '22': 'FunStock',
  '23': 'GameBillet',
  '24': 'Voidu',
  '25': 'Epic Games Store',
  '26': 'Razer Game Store',
  '27': 'Gamesplanet',
  '28': 'Gamesload',
  '29': '2Game',
  '30': 'IndieGala',
  '31': 'Blizzard Shop',
  '32': 'AllYouPlay',
  '33': 'DLGamer',
  '34': 'Noctre',
  '35': 'DreamGame',
};

/* ========================================
   RAWG API - Game Database (800,000+ games)
   ======================================== */

export const rawgService = {
  // Search games by title
  searchGames: async (query, page = 1, pageSize = 20) => {
    try {
      console.log(`🔍 RAWG: Searching for "${query}"`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&search_precise=true`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      console.log(`✅ RAWG: Found ${data.count} games`);
      return { success: true, data: data.results, count: data.count, next: data.next };
    } catch (error) {
      console.error('❌ RAWG search error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get trending/popular games (last year, sorted by popularity)
  getTrending: async (page = 1, pageSize = 24) => {
    try {
      console.log('🔥 RAWG: Fetching trending games');
      const currentDate = new Date().toISOString().split('T')[0];
      const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${lastYear},${currentDate}&ordering=-added&page=${page}&page_size=${pageSize}&metacritic=70,100`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      console.log(`✅ RAWG: Loaded ${data.results.length} trending games`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ RAWG trending error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get upcoming games
  getUpcoming: async (page = 1, pageSize = 24) => {
    try {
      console.log('📅 RAWG: Fetching upcoming games');
      const currentDate = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${currentDate},${futureDate}&ordering=-added&page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      console.log(`✅ RAWG: Loaded ${data.results.length} upcoming games`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ RAWG upcoming error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get top rated games of all time
  getTopRated: async (page = 1, pageSize = 24) => {
    try {
      console.log('⭐ RAWG: Fetching top rated games');
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&ordering=-metacritic&metacritic=85,100&page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      console.log(`✅ RAWG: Loaded ${data.results.length} top rated games`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ RAWG top rated error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get new releases
  getNewReleases: async (page = 1, pageSize = 24) => {
    try {
      console.log('🆕 RAWG: Fetching new releases');
      const currentDate = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${lastMonth},${currentDate}&ordering=-released&page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      console.log(`✅ RAWG: Loaded ${data.results.length} new releases`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ RAWG new releases error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game details with screenshots and trailers
  getGameDetails: async (gameId) => {
    try {
      console.log(`📋 RAWG: Fetching details for game ${gameId}`);
      const [gameRes, screenshotsRes, trailersRes, achievementsRes] = await Promise.all([
        fetch(`${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/screenshots?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/movies?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/achievements?key=${RAWG_API_KEY}`)
      ]);
      
      const game = await gameRes.json();
      const screenshots = await screenshotsRes.json();
      const trailers = await trailersRes.json();
      const achievements = await achievementsRes.json();
      
      console.log(`✅ RAWG: Game details loaded`);
      return { 
        success: true, 
        data: { 
          ...game, 
          screenshots: screenshots.results || [],
          trailers: trailers.results || [],
          achievements: achievements.results || []
        } 
      };
    } catch (error) {
      console.error('❌ RAWG game details error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get games by genre
  getByGenre: async (genreSlug, page = 1, pageSize = 24) => {
    try {
      console.log(`🎯 RAWG: Fetching ${genreSlug} games`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&genres=${genreSlug}&ordering=-metacritic&page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ RAWG genre error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get games by platform
  getByPlatform: async (platformId, page = 1, pageSize = 24) => {
    try {
      console.log(`🎮 RAWG: Fetching platform ${platformId} games`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&platforms=${platformId}&ordering=-metacritic&page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ RAWG platform error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get games by multiple filters
  getFiltered: async (filters = {}, page = 1, pageSize = 24) => {
    try {
      let url = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&page=${page}&page_size=${pageSize}`;
      
      if (filters.platforms) url += `&platforms=${filters.platforms}`;
      if (filters.genres) url += `&genres=${filters.genres}`;
      if (filters.ordering) url += `&ordering=${filters.ordering}`;
      if (filters.metacritic) url += `&metacritic=${filters.metacritic}`;
      if (filters.dates) url += `&dates=${filters.dates}`;
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ RAWG filter error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game series/DLC
  getGameSeries: async (gameId) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/game-series?key=${RAWG_API_KEY}`
      );
      
      if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);
      
      const data = await response.json();
      return { success: true, data: data.results };
    } catch (error) {
      console.error('❌ RAWG series error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },
};

/* ========================================
   CheapShark API - Price Comparison (FREE, No Key Required)
   ======================================== */

export const cheapSharkService = {
  // Get list of all stores
  getStores: async () => {
    try {
      const response = await fetch(`${CHEAPSHARK_BASE_URL}/stores`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('CheapShark stores error:', error);
      return { success: false, error: error.message };
    }
  },

  // Search for deals by game title
  searchDeals: async (title, limit = 20, sortBy = 'Deal Rating') => {
    try {
      console.log(`💰 CheapShark: Searching deals for "${title}"`);
      const response = await fetch(
        `${CHEAPSHARK_BASE_URL}/deals?title=${encodeURIComponent(title)}&pageSize=${limit}&sortBy=${encodeURIComponent(sortBy)}`
      );
      const data = await response.json();
      console.log(`✅ CheapShark: Found ${data.length} deals`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ CheapShark search error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get current top deals across all stores
  getTopDeals: async (pageNumber = 0, pageSize = 30, storeID = null, upperPrice = 50, lowerPrice = 0, onSale = 1) => {
    try {
      console.log('🔥 CheapShark: Fetching top deals');
      let url = `${CHEAPSHARK_BASE_URL}/deals?pageNumber=${pageNumber}&pageSize=${pageSize}&upperPrice=${upperPrice}&lowerPrice=${lowerPrice}&onSale=${onSale}&sortBy=Deal%20Rating`;
      if (storeID) url += `&storeID=${storeID}`;
      
      const response = await fetch(url);
      const data = await response.json();
      console.log(`✅ CheapShark: Loaded ${data.length} deals`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ CheapShark deals error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get deal details by deal ID
  getDealDetails: async (dealID) => {
    try {
      const response = await fetch(`${CHEAPSHARK_BASE_URL}/deals?id=${dealID}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('CheapShark deal details error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get game prices from all stores by CheapShark game ID
  getGamePrices: async (gameId) => {
    try {
      const response = await fetch(`${CHEAPSHARK_BASE_URL}/games?id=${gameId}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('CheapShark game prices error:', error);
      return { success: false, error: error.message };
    }
  },

  // Search games to get their IDs
  searchGames: async (title, limit = 10) => {
    try {
      const response = await fetch(
        `${CHEAPSHARK_BASE_URL}/games?title=${encodeURIComponent(title)}&limit=${limit}`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('CheapShark game search error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Set a price alert (uses CheapShark's alert system)
  setPriceAlert: async (email, gameId, targetPrice) => {
    try {
      const response = await fetch(
        `${CHEAPSHARK_BASE_URL}/alerts?action=set&email=${encodeURIComponent(email)}&gameID=${gameId}&price=${targetPrice}`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('CheapShark alert error:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate direct purchase URL
  getRedirectUrl: (dealID) => {
    return `https://www.cheapshark.com/redirect?dealID=${dealID}`;
  },

  // Get store name from ID
  getStoreName: (storeId) => {
    return CHEAPSHARK_STORES[storeId] || `Store ${storeId}`;
  },
};

/* ========================================
   Gray Market Price Service
   Note: These return simulated data - replace with actual APIs for production
   ======================================== */

export const grayMarketService = {
  // Get prices from gray market stores
  getPrices: async (gameTitle) => {
    // Simulated response - in production, integrate with actual G2A/Kinguin/etc APIs
    // G2A API: https://www.g2a.com/integration
    // Kinguin API: https://www.kinguin.net/integration
    
    // Base the simulated price on a hash of the game title for consistency
    const hashCode = gameTitle.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const basePrice = 30 + (Math.abs(hashCode) % 40); // $30-70 range
    
    return {
      success: true,
      data: [
        {
          store: 'g2a',
          storeName: 'G2A',
          price: (basePrice * 0.62).toFixed(2),
          originalPrice: basePrice.toFixed(2),
          discount: 38,
          url: `https://www.g2a.com/search?query=${encodeURIComponent(gameTitle)}`,
          inStock: true,
          rating: 4.2,
          reviews: 12453,
          type: 'gray'
        },
        {
          store: 'kinguin',
          storeName: 'Kinguin',
          price: (basePrice * 0.65).toFixed(2),
          originalPrice: basePrice.toFixed(2),
          discount: 35,
          url: `https://www.kinguin.net/catalogsearch/result?q=${encodeURIComponent(gameTitle)}`,
          inStock: true,
          rating: 4.0,
          reviews: 8762,
          type: 'gray'
        },
        {
          store: 'cdkeys',
          storeName: 'CDKeys',
          price: (basePrice * 0.67).toFixed(2),
          originalPrice: basePrice.toFixed(2),
          discount: 33,
          url: `https://www.cdkeys.com/catalogsearch/result?q=${encodeURIComponent(gameTitle)}`,
          inStock: true,
          rating: 4.4,
          reviews: 15234,
          type: 'gray'
        },
        {
          store: 'eneba',
          storeName: 'Eneba',
          price: (basePrice * 0.60).toFixed(2),
          originalPrice: basePrice.toFixed(2),
          discount: 40,
          url: `https://www.eneba.com/store?text=${encodeURIComponent(gameTitle)}`,
          inStock: true,
          rating: 4.1,
          reviews: 6543,
          type: 'gray'
        },
        {
          store: 'gamivo',
          storeName: 'GAMIVO',
          price: (basePrice * 0.64).toFixed(2),
          originalPrice: basePrice.toFixed(2),
          discount: 36,
          url: `https://www.gamivo.com/search/${encodeURIComponent(gameTitle)}`,
          inStock: true,
          rating: 4.0,
          reviews: 4321,
          type: 'gray'
        },
      ]
    };
  },
};

/* ========================================
   Epic Games Free Games Tracker
   ======================================== */

export const freeGamesService = {
  // Get current Epic Games free games
  getEpicFreeGames: async () => {
    try {
      console.log('🎁 Fetching Epic Games free games');
      const response = await fetch(
        'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US'
      );
      const data = await response.json();
      
      const games = data?.data?.Catalog?.searchStore?.elements || [];
      
      // Filter to currently free and upcoming free
      const freeNow = games.filter(game => {
        const promos = game.promotions?.promotionalOffers;
        return promos && promos.length > 0 && promos[0].promotionalOffers?.length > 0;
      });
      
      const upcoming = games.filter(game => {
        const promos = game.promotions?.upcomingPromotionalOffers;
        return promos && promos.length > 0 && promos[0].promotionalOffers?.length > 0;
      });
      
      console.log(`✅ Found ${freeNow.length} free now, ${upcoming.length} upcoming`);
      
      return { 
        success: true, 
        data: {
          current: freeNow,
          upcoming: upcoming
        }
      };
    } catch (error) {
      console.error('❌ Epic free games error:', error);
      return { 
        success: false, 
        data: { current: [], upcoming: [] },
        error: error.message 
      };
    }
  },

  // Get all free games info
  getAllFreeGames: async () => {
    const epicGames = await freeGamesService.getEpicFreeGames();
    
    return {
      success: true,
      data: {
        epic: epicGames.data || { current: [], upcoming: [] },
        // These would be fetched from respective sources in production
        primeGaming: {
          url: 'https://gaming.amazon.com/home',
          description: 'Free games with Amazon Prime'
        },
        psPlus: {
          url: 'https://www.playstation.com/en-us/ps-plus/',
          description: 'Monthly free games for subscribers'
        },
        xboxGamePass: {
          url: 'https://www.xbox.com/en-US/xbox-game-pass',
          description: 'Hundreds of games with subscription'
        },
        steamFreeWeekends: {
          url: 'https://store.steampowered.com/genre/Free%20to%20Play/',
          description: 'Try games free every weekend'
        }
      }
    };
  },
};

/* ========================================
   Combined Price Aggregation Service
   ======================================== */

export const priceService = {
  // Get all prices for a game from all sources
  getAllPrices: async (gameTitle) => {
    try {
      console.log(`💰 Fetching all prices for "${gameTitle}"`);
      
      const [cheapSharkResult, grayMarketResult] = await Promise.all([
        cheapSharkService.searchDeals(gameTitle, 15),
        grayMarketService.getPrices(gameTitle),
      ]);

      // Process CheapShark results (official stores)
      const officialPrices = (cheapSharkResult.data || []).map(deal => ({
        store: deal.storeID,
        storeName: cheapSharkService.getStoreName(deal.storeID),
        price: parseFloat(deal.salePrice),
        originalPrice: parseFloat(deal.normalPrice),
        discount: Math.round((1 - deal.salePrice / deal.normalPrice) * 100),
        url: cheapSharkService.getRedirectUrl(deal.dealID),
        dealId: deal.dealID,
        rating: parseFloat(deal.dealRating) || 0,
        type: 'official',
        thumb: deal.thumb,
        title: deal.title,
        metacritic: deal.metacriticScore,
        steamRating: deal.steamRatingPercent,
      }));

      // Get gray market prices
      const grayPrices = (grayMarketResult.data || []).map(price => ({
        ...price,
        price: parseFloat(price.price),
        originalPrice: parseFloat(price.originalPrice),
      }));

      // Combine and sort by price
      const allPrices = [...officialPrices, ...grayPrices]
        .sort((a, b) => a.price - b.price);

      // Find best prices
      const lowestPrice = allPrices[0] || null;
      const lowestOfficial = officialPrices.sort((a, b) => a.price - b.price)[0] || null;
      const lowestGray = grayPrices.sort((a, b) => a.price - b.price)[0] || null;

      console.log(`✅ Found ${allPrices.length} total prices`);

      return {
        success: true,
        data: {
          all: allPrices,
          official: officialPrices.sort((a, b) => a.price - b.price),
          gray: grayPrices.sort((a, b) => a.price - b.price),
          lowestPrice,
          lowestOfficial,
          lowestGray,
          savings: lowestOfficial && lowestGray ? 
            (lowestOfficial.price - lowestGray.price).toFixed(2) : 0
        }
      };
    } catch (error) {
      console.error('❌ Price aggregation error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Get price history for a game (would need IsThereAnyDeal API for real data)
  getPriceHistory: async (gameTitle) => {
    // Simulated - integrate with IsThereAnyDeal API for real history
    return {
      success: true,
      data: {
        historicalLow: {
          price: 9.99,
          store: 'Steam',
          date: '2024-06-15'
        },
        averagePrice: 29.99,
        currentPrice: 39.99,
      }
    };
  },
};

/* ========================================
   Local Storage Service for User Data
   ======================================== */

export const userGameDataService = {
  // ===== LIBRARY MANAGEMENT =====
  
  getLibrary: () => {
    try {
      const library = localStorage.getItem('movieNights_gameLibrary');
      return library ? JSON.parse(library) : [];
    } catch {
      return [];
    }
  },

  addToLibrary: (game, status = 'backlog', platform = 'pc') => {
    const library = userGameDataService.getLibrary();
    const existingIndex = library.findIndex(g => g.id === game.id);
    
    const gameEntry = {
      id: game.id,
      name: game.name,
      slug: game.slug,
      background_image: game.background_image,
      metacritic: game.metacritic,
      released: game.released,
      genres: game.genres || [],
      platforms: game.platforms || [],
      status,
      platform,
      addedAt: Date.now(),
      updatedAt: Date.now(),
      playtime: 0,
      rating: null,
      notes: '',
      completedAt: null,
    };

    if (existingIndex >= 0) {
      library[existingIndex] = { ...library[existingIndex], ...gameEntry, addedAt: library[existingIndex].addedAt };
    } else {
      library.push(gameEntry);
    }

    localStorage.setItem('movieNights_gameLibrary', JSON.stringify(library));
    console.log(`📚 Added "${game.name}" to library as ${status}`);
    return library;
  },

  removeFromLibrary: (gameId) => {
    const library = userGameDataService.getLibrary();
    const filtered = library.filter(g => g.id !== gameId);
    localStorage.setItem('movieNights_gameLibrary', JSON.stringify(filtered));
    console.log(`🗑️ Removed game ${gameId} from library`);
    return filtered;
  },

  updateGameStatus: (gameId, status) => {
    const library = userGameDataService.getLibrary();
    const game = library.find(g => g.id === gameId);
    if (game) {
      game.status = status;
      game.updatedAt = Date.now();
      if (status === 'completed') {
        game.completedAt = Date.now();
      }
      localStorage.setItem('movieNights_gameLibrary', JSON.stringify(library));
      console.log(`📝 Updated game ${gameId} status to ${status}`);
    }
    return library;
  },

  updateGameData: (gameId, updates) => {
    const library = userGameDataService.getLibrary();
    const game = library.find(g => g.id === gameId);
    if (game) {
      Object.assign(game, updates, { updatedAt: Date.now() });
      localStorage.setItem('movieNights_gameLibrary', JSON.stringify(library));
    }
    return library;
  },

  getLibraryStats: () => {
    const library = userGameDataService.getLibrary();
    return {
      total: library.length,
      playing: library.filter(g => g.status === 'playing').length,
      backlog: library.filter(g => g.status === 'backlog').length,
      completed: library.filter(g => g.status === 'completed').length,
      dropped: library.filter(g => g.status === 'dropped').length,
      totalPlaytime: library.reduce((sum, g) => sum + (g.playtime || 0), 0),
    };
  },

  // ===== WISHLIST MANAGEMENT =====

  getWishlist: () => {
    try {
      const wishlist = localStorage.getItem('movieNights_gameWishlist');
      return wishlist ? JSON.parse(wishlist) : [];
    } catch {
      return [];
    }
  },

  addToWishlist: (game, targetPrice = null) => {
    const wishlist = userGameDataService.getWishlist();
    const existingIndex = wishlist.findIndex(g => g.id === game.id);

    const wishlistEntry = {
      id: game.id,
      name: game.name,
      slug: game.slug,
      background_image: game.background_image,
      metacritic: game.metacritic,
      released: game.released,
      targetPrice,
      addedAt: Date.now(),
      lastCheckedPrice: null,
      lowestSeenPrice: null,
      notified: false,
    };

    if (existingIndex >= 0) {
      wishlist[existingIndex] = { ...wishlist[existingIndex], ...wishlistEntry, addedAt: wishlist[existingIndex].addedAt };
    } else {
      wishlist.push(wishlistEntry);
    }

    localStorage.setItem('movieNights_gameWishlist', JSON.stringify(wishlist));
    console.log(`💝 Added "${game.name}" to wishlist`);
    return wishlist;
  },

  removeFromWishlist: (gameId) => {
    const wishlist = userGameDataService.getWishlist();
    const filtered = wishlist.filter(g => g.id !== gameId);
    localStorage.setItem('movieNights_gameWishlist', JSON.stringify(filtered));
    console.log(`🗑️ Removed game ${gameId} from wishlist`);
    return filtered;
  },

  updateWishlistTargetPrice: (gameId, targetPrice) => {
    const wishlist = userGameDataService.getWishlist();
    const game = wishlist.find(g => g.id === gameId);
    if (game) {
      game.targetPrice = targetPrice;
      localStorage.setItem('movieNights_gameWishlist', JSON.stringify(wishlist));
    }
    return wishlist;
  },

  // ===== PRICE ALERTS =====

  getPriceAlerts: () => {
    try {
      const alerts = localStorage.getItem('movieNights_gamePriceAlerts');
      return alerts ? JSON.parse(alerts) : [];
    } catch {
      return [];
    }
  },

  setPriceAlert: (game, targetPrice) => {
    const alerts = userGameDataService.getPriceAlerts();
    const existingIndex = alerts.findIndex(a => a.gameId === game.id);

    const alert = {
      gameId: game.id,
      gameName: game.name,
      gameSlug: game.slug,
      gameImage: game.background_image,
      targetPrice: parseFloat(targetPrice),
      createdAt: Date.now(),
      triggered: false,
      lastChecked: null,
    };

    if (existingIndex >= 0) {
      alerts[existingIndex] = alert;
    } else {
      alerts.push(alert);
    }

    localStorage.setItem('movieNights_gamePriceAlerts', JSON.stringify(alerts));
    console.log(`🔔 Price alert set for "${game.name}" at $${targetPrice}`);
    return alerts;
  },

  removePriceAlert: (gameId) => {
    const alerts = userGameDataService.getPriceAlerts();
    const filtered = alerts.filter(a => a.gameId !== gameId);
    localStorage.setItem('movieNights_gamePriceAlerts', JSON.stringify(filtered));
    return filtered;
  },

  // ===== RECENT SEARCHES =====

  getRecentSearches: () => {
    try {
      const searches = localStorage.getItem('movieNights_gameRecentSearches');
      return searches ? JSON.parse(searches) : [];
    } catch {
      return [];
    }
  },

  addRecentSearch: (query) => {
    const searches = userGameDataService.getRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    filtered.unshift(query);
    const limited = filtered.slice(0, 10); // Keep only 10 recent searches
    localStorage.setItem('movieNights_gameRecentSearches', JSON.stringify(limited));
    return limited;
  },

  clearRecentSearches: () => {
    localStorage.removeItem('movieNights_gameRecentSearches');
    return [];
  },

  // ===== DATA EXPORT/IMPORT =====

  exportData: () => {
    return {
      library: userGameDataService.getLibrary(),
      wishlist: userGameDataService.getWishlist(),
      priceAlerts: userGameDataService.getPriceAlerts(),
      exportedAt: Date.now(),
    };
  },

  importData: (data) => {
    if (data.library) {
      localStorage.setItem('movieNights_gameLibrary', JSON.stringify(data.library));
    }
    if (data.wishlist) {
      localStorage.setItem('movieNights_gameWishlist', JSON.stringify(data.wishlist));
    }
    if (data.priceAlerts) {
      localStorage.setItem('movieNights_gamePriceAlerts', JSON.stringify(data.priceAlerts));
    }
    console.log('📥 Game data imported successfully');
    return true;
  },

  clearAllData: () => {
    localStorage.removeItem('movieNights_gameLibrary');
    localStorage.removeItem('movieNights_gameWishlist');
    localStorage.removeItem('movieNights_gamePriceAlerts');
    localStorage.removeItem('movieNights_gameRecentSearches');
    console.log('🗑️ All game data cleared');
    return true;
  },
};

/* ========================================
   Utility Functions
   ======================================== */

export const gameUtils = {
  // Get platform icon
  getPlatformIcon: (platformName) => {
    if (!platformName) return '🎮';
    const name = platformName.toLowerCase();
    if (name.includes('pc') || name.includes('windows')) return '🖥️';
    if (name.includes('playstation') || name.includes('ps5') || name.includes('ps4')) return '🎮';
    if (name.includes('xbox')) return '🟢';
    if (name.includes('nintendo') || name.includes('switch')) return '🔴';
    if (name.includes('ios') || name.includes('iphone') || name.includes('ipad')) return '📱';
    if (name.includes('android')) return '🤖';
    if (name.includes('mac') || name.includes('macos')) return '🍎';
    if (name.includes('linux')) return '🐧';
    return '🎮';
  },

  // Get metacritic color class
  getMetacriticClass: (score) => {
    if (!score) return 'none';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  },

  // Format playtime
  formatPlaytime: (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  },

  // Format date
  formatDate: (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Format price
  formatPrice: (price) => {
    if (price === null || price === undefined) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  },

  // Calculate discount percentage
  calculateDiscount: (original, sale) => {
    if (!original || !sale || original <= sale) return 0;
    return Math.round((1 - sale / original) * 100);
  },
};

// Default export
export default {
  rawgService,
  cheapSharkService,
  grayMarketService,
  freeGamesService,
  priceService,
  userGameDataService,
  gameUtils,
  STORES,
  PLATFORMS,
  GENRES,
};
