/* ========================================
   gameService.js - Enhanced Game API Integrations
   RAWG API + CheapShark + Full Feature Set
   MovieNights Ultimate - Games Hub 
   ======================================== */

// API Configuration - YOUR KEYS
const RAWG_API_KEY = '9765e7f6ae22433794b8596b7a487cff';
const RAWG_BASE_URL = 'https://api.rawg.io/api';
const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';

// Store metadata for price comparison
export const STORES = {
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
  g2a: { id: 'g2a', name: 'G2A', logo: '🔑', type: 'gray', color: '#f26522', url: 'https://www.g2a.com' },
  kinguin: { id: 'kinguin', name: 'Kinguin', logo: '👑', type: 'gray', color: '#00a8e8', url: 'https://www.kinguin.net' },
  cdkeys: { id: 'cdkeys', name: 'CDKeys', logo: '💿', type: 'gray', color: '#00b4d8', url: 'https://www.cdkeys.com' },
  eneba: { id: 'eneba', name: 'Eneba', logo: '🎪', type: 'gray', color: '#fa7921', url: 'https://www.eneba.com' },
  gamivo: { id: 'gamivo', name: 'GAMIVO', logo: '🎲', type: 'gray', color: '#7209b7', url: 'https://www.gamivo.com' },
};

// Platform definitions
export const PLATFORMS = {
  pc: { id: 4, name: 'PC', icon: '🖥️', color: '#00d4ff', slug: 'pc' },
  playstation5: { id: 187, name: 'PlayStation 5', icon: '🎮', color: '#003791', slug: 'playstation5' },
  playstation4: { id: 18, name: 'PlayStation 4', icon: '🎮', color: '#003791', slug: 'playstation4' },
  xboxsx: { id: 186, name: 'Xbox Series X', icon: '🟢', color: '#107c10', slug: 'xbox-series-x' },
  xboxone: { id: 1, name: 'Xbox One', icon: '🟢', color: '#107c10', slug: 'xbox-one' },
  switch: { id: 7, name: 'Nintendo Switch', icon: '🔴', color: '#e60012', slug: 'nintendo-switch' },
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
];

// Popular Tags for browsing
export const POPULAR_TAGS = [
  { id: 31, name: 'Singleplayer', slug: 'singleplayer', icon: '👤' },
  { id: 7, name: 'Multiplayer', slug: 'multiplayer', icon: '👥' },
  { id: 18, name: 'Co-op', slug: 'co-op', icon: '🤝' },
  { id: 411, name: 'Cooperative', slug: 'cooperative', icon: '🤝' },
  { id: 9, name: 'Online Co-Op', slug: 'online-co-op', icon: '🌐' },
  { id: 4, name: 'Open World', slug: 'open-world', icon: '🌍' },
  { id: 6, name: 'Exploration', slug: 'exploration', icon: '🧭' },
  { id: 149, name: 'Third Person', slug: 'third-person', icon: '👁️' },
  { id: 8, name: 'First-Person', slug: 'first-person', icon: '🎯' },
  { id: 32, name: 'Sci-fi', slug: 'sci-fi', icon: '🚀' },
  { id: 64, name: 'Fantasy', slug: 'fantasy', icon: '🐉' },
  { id: 34, name: 'Horror', slug: 'horror', icon: '👻' },
  { id: 17, name: 'Survival Horror', slug: 'survival-horror', icon: '😱' },
  { id: 1, name: 'Survival', slug: 'survival', icon: '🏕️' },
  { id: 15, name: 'Stealth', slug: 'stealth', icon: '🥷' },
  { id: 69, name: 'Action-Adventure', slug: 'action-adventure', icon: '⚔️' },
  { id: 166, name: 'Hack and Slash', slug: 'hack-and-slash', icon: '🗡️' },
  { id: 37, name: 'Sandbox', slug: 'sandbox', icon: '📦' },
  { id: 5, name: 'Replay Value', slug: 'replay-value', icon: '🔄' },
  { id: 42, name: 'Story Rich', slug: 'story-rich', icon: '📖' },
  { id: 118, name: 'Souls-like', slug: 'souls-like', icon: '💀' },
  { id: 639, name: 'Roguelike', slug: 'roguelike', icon: '🎲' },
  { id: 640, name: 'Roguelite', slug: 'roguelite', icon: '🎰' },
  { id: 50, name: 'Crafting', slug: 'crafting', icon: '🔨' },
  { id: 79, name: 'Free to Play', slug: 'free-to-play', icon: '🆓' },
  { id: 11, name: 'VR', slug: 'vr', icon: '🥽' },
  { id: 406, name: 'Controller Support', slug: 'controller', icon: '🎮' },
  { id: 45, name: '2D', slug: '2d', icon: '🖼️' },
  { id: 26, name: '3D', slug: '3d', icon: '🧊' },
  { id: 336, name: 'Pixel Graphics', slug: 'pixel-graphics', icon: '👾' },
];

// CheapShark store mapping
const CHEAPSHARK_STORES = {
  '1': 'Steam', '2': 'GamersGate', '3': 'GreenManGaming', '4': 'Amazon',
  '5': 'GameStop', '6': 'Direct2Drive', '7': 'GOG', '8': 'Origin',
  '11': 'Humble Store', '13': 'Uplay', '15': 'Fanatical', '21': 'WinGameStore',
  '23': 'GameBillet', '24': 'Voidu', '25': 'Epic Games Store', '27': 'Gamesplanet',
  '30': 'IndieGala', '31': 'Blizzard Shop', '33': 'DLGamer', '35': 'DreamGame',
};

/* ========================================
   RAWG API - Main Game Database
   ======================================== */

export const rawgService = {
  // Search games by title
  searchGames: async (query, page = 1, pageSize = 20) => {
    try {
      console.log(`🔍 Searching: "${query}"`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&search_precise=true`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Found ${data.count} games`);
      return { success: true, data: data.results, count: data.count, next: data.next };
    } catch (error) {
      console.error('❌ Search error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get trending/popular games - FIXED VERSION
  getTrending: async (page = 1, pageSize = 24) => {
    try {
      console.log('🔥 Fetching trending games');
      const currentDate = new Date().toISOString().split('T')[0];
      const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${lastYear},${currentDate}&ordering=-rating,-ratings_count&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Loaded ${data.results.length} trending games`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Trending error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get upcoming games
  getUpcoming: async (page = 1, pageSize = 24) => {
    try {
      console.log('📅 Fetching upcoming games');
      const currentDate = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${currentDate},${futureDate}&ordering=-added&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Loaded ${data.results.length} upcoming games`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Upcoming error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get top rated games of all time
  getTopRated: async (page = 1, pageSize = 24) => {
    try {
      console.log('⭐ Fetching top rated games');
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&ordering=-metacritic&metacritic=80,100&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Loaded ${data.results.length} top rated games`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Top rated error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get new releases (last 60 days)
  getNewReleases: async (page = 1, pageSize = 24) => {
    try {
      console.log('🆕 Fetching new releases');
      const currentDate = new Date().toISOString().split('T')[0];
      const pastDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${pastDate},${currentDate}&ordering=-released,-rating&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Loaded ${data.results.length} new releases`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ New releases error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get games releasing this month (for calendar)
  getReleasesForMonth: async (year, month, pageSize = 50) => {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      console.log(`📅 Fetching releases for ${year}-${month}`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&dates=${startDate},${endDate}&ordering=released&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Calendar error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get FULL game details with everything
  getGameDetails: async (gameId) => {
    try {
      console.log(`📋 Fetching full details for game ${gameId}`);
      
      const [gameRes, screenshotsRes, trailersRes, achievementsRes, seriesRes, additionsRes, redditRes] = await Promise.all([
        fetch(`${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/screenshots?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/movies?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/achievements?key=${RAWG_API_KEY}&page_size=20`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/game-series?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/additions?key=${RAWG_API_KEY}`),
        fetch(`${RAWG_BASE_URL}/games/${gameId}/reddit?key=${RAWG_API_KEY}`),
      ]);
      
      const game = await gameRes.json();
      const screenshots = await screenshotsRes.json();
      const trailers = await trailersRes.json();
      const achievements = await achievementsRes.json();
      const series = await seriesRes.json();
      const additions = await additionsRes.json();
      const reddit = await redditRes.json();
      
      console.log(`✅ Game details loaded: ${game.name}`);
      
      return { 
        success: true, 
        data: { 
          ...game, 
          screenshots: screenshots.results || [],
          trailers: trailers.results || [],
          achievements: achievements.results || [],
          achievementCount: achievements.count || 0,
          series: series.results || [],
          dlc: additions.results || [],
          dlcCount: additions.count || 0,
          redditPosts: reddit.results || [],
        } 
      };
    } catch (error) {
      console.error('❌ Game details error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get similar/suggested games
  getSimilarGames: async (gameId, pageSize = 12) => {
    try {
      console.log(`🎯 Fetching similar games for ${gameId}`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/suggested?key=${RAWG_API_KEY}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Found ${data.results.length} similar games`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Similar games error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game screenshots
  getScreenshots: async (gameId, pageSize = 20) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/screenshots?key=${RAWG_API_KEY}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results };
    } catch (error) {
      console.error('❌ Screenshots error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game trailers/videos
  getTrailers: async (gameId) => {
    try {
      console.log(`🎬 Fetching trailers for game ${gameId}`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/movies?key=${RAWG_API_KEY}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Found ${data.results.length} trailers`);
      return { success: true, data: data.results };
    } catch (error) {
      console.error('❌ Trailers error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game achievements
  getAchievements: async (gameId, page = 1, pageSize = 20) => {
    try {
      console.log(`🏆 Fetching achievements for game ${gameId}`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/achievements?key=${RAWG_API_KEY}&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Found ${data.count} achievements`);
      return { success: true, data: data.results, count: data.count, next: data.next };
    } catch (error) {
      console.error('❌ Achievements error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get games by genre
  getByGenre: async (genreSlug, page = 1, pageSize = 24) => {
    try {
      console.log(`🎯 Fetching ${genreSlug} games`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&genres=${genreSlug}&ordering=-rating&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Genre error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get games by platform
  getByPlatform: async (platformId, page = 1, pageSize = 24) => {
    try {
      console.log(`🎮 Fetching platform ${platformId} games`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&platforms=${platformId}&ordering=-rating&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Platform error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get games by tag
  getByTag: async (tagSlug, page = 1, pageSize = 24) => {
    try {
      console.log(`🏷️ Fetching games with tag: ${tagSlug}`);
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&tags=${tagSlug}&ordering=-rating&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`✅ Found ${data.count} games with tag ${tagSlug}`);
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Tag error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get all tags
  getTags: async (page = 1, pageSize = 40) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/tags?key=${RAWG_API_KEY}&page=${page}&page_size=${pageSize}&ordering=-games_count`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Tags error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get developer details
  getDeveloper: async (developerId) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/developers/${developerId}?key=${RAWG_API_KEY}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Developer error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get games by developer
  getGamesByDeveloper: async (developerId, page = 1, pageSize = 24) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&developers=${developerId}&ordering=-released&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Developer games error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get publisher details
  getPublisher: async (publisherId) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/publishers/${publisherId}?key=${RAWG_API_KEY}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Publisher error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get games by publisher
  getGamesByPublisher: async (publisherId, page = 1, pageSize = 24) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&publishers=${publisherId}&ordering=-released&page=${page}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Publisher games error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game DLC and editions
  getGameAdditions: async (gameId, pageSize = 20) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/additions?key=${RAWG_API_KEY}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ DLC error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game series (other games in franchise)
  getGameSeries: async (gameId, pageSize = 20) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/game-series?key=${RAWG_API_KEY}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Series error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get Reddit posts about game
  getRedditPosts: async (gameId) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/reddit?key=${RAWG_API_KEY}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results };
    } catch (error) {
      console.error('❌ Reddit error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get game stores/where to buy
  getGameStores: async (gameId) => {
    try {
      const response = await fetch(
        `${RAWG_BASE_URL}/games/${gameId}/stores?key=${RAWG_API_KEY}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results };
    } catch (error) {
      console.error('❌ Stores error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Advanced filtered search
  getFiltered: async (filters = {}, page = 1, pageSize = 24) => {
    try {
      let url = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&page=${page}&page_size=${pageSize}`;
      
      if (filters.platforms) url += `&platforms=${filters.platforms}`;
      if (filters.genres) url += `&genres=${filters.genres}`;
      if (filters.tags) url += `&tags=${filters.tags}`;
      if (filters.developers) url += `&developers=${filters.developers}`;
      if (filters.publishers) url += `&publishers=${filters.publishers}`;
      if (filters.ordering) url += `&ordering=${filters.ordering}`;
      if (filters.metacritic) url += `&metacritic=${filters.metacritic}`;
      if (filters.dates) url += `&dates=${filters.dates}`;
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.results, count: data.count };
    } catch (error) {
      console.error('❌ Filter error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },
};

/* ========================================
   CheapShark API - Price Comparison
   ======================================== */

export const cheapSharkService = {
  getStores: async () => {
    try {
      const response = await fetch(`${CHEAPSHARK_BASE_URL}/stores`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  searchDeals: async (title, limit = 20) => {
    try {
      console.log(`💰 Searching deals for "${title}"`);
      const response = await fetch(
        `${CHEAPSHARK_BASE_URL}/deals?title=${encodeURIComponent(title)}&pageSize=${limit}&sortBy=Deal%20Rating`
      );
      const data = await response.json();
      console.log(`✅ Found ${data.length} deals`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Deal search error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  getTopDeals: async (pageNumber = 0, pageSize = 30, storeID = null, upperPrice = 50) => {
    try {
      console.log('🔥 Fetching top deals');
      let url = `${CHEAPSHARK_BASE_URL}/deals?pageNumber=${pageNumber}&pageSize=${pageSize}&upperPrice=${upperPrice}&onSale=1&sortBy=Deal%20Rating`;
      if (storeID) url += `&storeID=${storeID}`;
      
      const response = await fetch(url);
      const data = await response.json();
      console.log(`✅ Loaded ${data.length} deals`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Deals error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  getRedirectUrl: (dealID) => `https://www.cheapshark.com/redirect?dealID=${dealID}`,
  
  getStoreName: (storeId) => CHEAPSHARK_STORES[storeId] || `Store ${storeId}`,
};

/* ========================================
   Gray Market Service (Simulated)
   ======================================== */

export const grayMarketService = {
  getPrices: async (gameTitle) => {
    const hashCode = gameTitle.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const basePrice = 30 + (Math.abs(hashCode) % 40);
    
    return {
      success: true,
      data: [
        { store: 'g2a', storeName: 'G2A', price: (basePrice * 0.62).toFixed(2), discount: 38, url: `https://www.g2a.com/search?query=${encodeURIComponent(gameTitle)}`, type: 'gray' },
        { store: 'kinguin', storeName: 'Kinguin', price: (basePrice * 0.65).toFixed(2), discount: 35, url: `https://www.kinguin.net/catalogsearch/result?q=${encodeURIComponent(gameTitle)}`, type: 'gray' },
        { store: 'cdkeys', storeName: 'CDKeys', price: (basePrice * 0.67).toFixed(2), discount: 33, url: `https://www.cdkeys.com/catalogsearch/result?q=${encodeURIComponent(gameTitle)}`, type: 'gray' },
        { store: 'eneba', storeName: 'Eneba', price: (basePrice * 0.60).toFixed(2), discount: 40, url: `https://www.eneba.com/store?text=${encodeURIComponent(gameTitle)}`, type: 'gray' },
      ]
    };
  },
};

/* ========================================
   Free Games Service
   ======================================== */

export const freeGamesService = {
  getEpicFreeGames: async () => {
    try {
      console.log('🎁 Fetching Epic Games free games');
      const response = await fetch(
        'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US'
      );
      const data = await response.json();
      const games = data?.data?.Catalog?.searchStore?.elements || [];
      
      const freeNow = games.filter(g => g.promotions?.promotionalOffers?.[0]?.promotionalOffers?.length > 0);
      const upcoming = games.filter(g => g.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.length > 0);
      
      console.log(`✅ Found ${freeNow.length} free now, ${upcoming.length} upcoming`);
      return { success: true, data: { current: freeNow, upcoming } };
    } catch (error) {
      console.error('❌ Epic free games error:', error);
      return { success: false, data: { current: [], upcoming: [] } };
    }
  },

  getAllFreeGames: async () => {
    const epicGames = await freeGamesService.getEpicFreeGames();
    return {
      success: true,
      data: {
        epic: epicGames.data || { current: [], upcoming: [] },
        primeGaming: { url: 'https://gaming.amazon.com/home', description: 'Free games with Amazon Prime' },
        psPlus: { url: 'https://www.playstation.com/en-us/ps-plus/', description: 'Monthly free games' },
        xboxGamePass: { url: 'https://www.xbox.com/en-US/xbox-game-pass', description: 'Hundreds of games' },
        steamFreeWeekends: { url: 'https://store.steampowered.com/genre/Free%20to%20Play/', description: 'Free weekends' }
      }
    };
  },
};

/* ========================================
   Price Aggregation Service
   ======================================== */

export const priceService = {
  getAllPrices: async (gameTitle) => {
    try {
      console.log(`💰 Aggregating prices for "${gameTitle}"`);
      
      const [cheapSharkResult, grayMarketResult] = await Promise.all([
        cheapSharkService.searchDeals(gameTitle, 15),
        grayMarketService.getPrices(gameTitle),
      ]);

      const officialPrices = (cheapSharkResult.data || []).map(deal => ({
        store: deal.storeID,
        storeName: cheapSharkService.getStoreName(deal.storeID),
        price: parseFloat(deal.salePrice),
        originalPrice: parseFloat(deal.normalPrice),
        discount: Math.round((1 - deal.salePrice / deal.normalPrice) * 100),
        url: cheapSharkService.getRedirectUrl(deal.dealID),
        type: 'official',
        thumb: deal.thumb,
        title: deal.title,
      }));

      const grayPrices = (grayMarketResult.data || []).map(p => ({ ...p, price: parseFloat(p.price) }));
      const allPrices = [...officialPrices, ...grayPrices].sort((a, b) => a.price - b.price);

      return {
        success: true,
        data: {
          all: allPrices,
          official: officialPrices.sort((a, b) => a.price - b.price),
          gray: grayPrices.sort((a, b) => a.price - b.price),
          lowestPrice: allPrices[0] || null,
          lowestOfficial: officialPrices[0] || null,
        }
      };
    } catch (error) {
      console.error('❌ Price aggregation error:', error);
      return { success: false, error: error.message, data: null };
    }
  },
};

/* ========================================
   Local Storage Service
   ======================================== */

export const userGameDataService = {
  getLibrary: () => {
    try {
      return JSON.parse(localStorage.getItem('movieNights_gameLibrary') || '[]');
    } catch { return []; }
  },

  addToLibrary: (game, status = 'backlog', platform = 'pc') => {
    const library = userGameDataService.getLibrary();
    const idx = library.findIndex(g => g.id === game.id);
    const entry = {
      id: game.id, name: game.name, slug: game.slug,
      background_image: game.background_image, metacritic: game.metacritic,
      released: game.released, genres: game.genres || [], platforms: game.platforms || [],
      status, platform, addedAt: Date.now(), updatedAt: Date.now(), playtime: 0, rating: null,
    };
    if (idx >= 0) library[idx] = { ...library[idx], ...entry, addedAt: library[idx].addedAt };
    else library.push(entry);
    localStorage.setItem('movieNights_gameLibrary', JSON.stringify(library));
    return library;
  },

  removeFromLibrary: (gameId) => {
    const library = userGameDataService.getLibrary().filter(g => g.id !== gameId);
    localStorage.setItem('movieNights_gameLibrary', JSON.stringify(library));
    return library;
  },

  updateGameStatus: (gameId, status) => {
    const library = userGameDataService.getLibrary();
    const game = library.find(g => g.id === gameId);
    if (game) { game.status = status; game.updatedAt = Date.now(); }
    localStorage.setItem('movieNights_gameLibrary', JSON.stringify(library));
    return library;
  },

  getWishlist: () => {
    try { return JSON.parse(localStorage.getItem('movieNights_gameWishlist') || '[]'); }
    catch { return []; }
  },

  addToWishlist: (game, targetPrice = null) => {
    const wishlist = userGameDataService.getWishlist();
    const idx = wishlist.findIndex(g => g.id === game.id);
    const entry = {
      id: game.id, name: game.name, slug: game.slug,
      background_image: game.background_image, metacritic: game.metacritic,
      targetPrice, addedAt: Date.now(),
    };
    if (idx >= 0) wishlist[idx] = { ...wishlist[idx], ...entry };
    else wishlist.push(entry);
    localStorage.setItem('movieNights_gameWishlist', JSON.stringify(wishlist));
    return wishlist;
  },

  removeFromWishlist: (gameId) => {
    const wishlist = userGameDataService.getWishlist().filter(g => g.id !== gameId);
    localStorage.setItem('movieNights_gameWishlist', JSON.stringify(wishlist));
    return wishlist;
  },

  getPriceAlerts: () => {
    try { return JSON.parse(localStorage.getItem('movieNights_gamePriceAlerts') || '[]'); }
    catch { return []; }
  },

  setPriceAlert: (game, targetPrice) => {
    const alerts = userGameDataService.getPriceAlerts();
    const idx = alerts.findIndex(a => a.gameId === game.id);
    const alert = { gameId: game.id, gameName: game.name, gameImage: game.background_image, targetPrice: parseFloat(targetPrice), createdAt: Date.now() };
    if (idx >= 0) alerts[idx] = alert;
    else alerts.push(alert);
    localStorage.setItem('movieNights_gamePriceAlerts', JSON.stringify(alerts));
    return alerts;
  },

  removePriceAlert: (gameId) => {
    const alerts = userGameDataService.getPriceAlerts().filter(a => a.gameId !== gameId);
    localStorage.setItem('movieNights_gamePriceAlerts', JSON.stringify(alerts));
    return alerts;
  },
};

/* ========================================
   Utility Functions
   ======================================== */

export const gameUtils = {
  getPlatformIcon: (name) => {
    if (!name) return '🎮';
    const n = name.toLowerCase();
    if (n.includes('pc') || n.includes('windows')) return '🖥️';
    if (n.includes('playstation')) return '🎮';
    if (n.includes('xbox')) return '🟢';
    if (n.includes('nintendo') || n.includes('switch')) return '🔴';
    if (n.includes('ios')) return '📱';
    if (n.includes('android')) return '🤖';
    if (n.includes('mac')) return '🍎';
    if (n.includes('linux')) return '🐧';
    return '🎮';
  },

  getMetacriticClass: (score) => {
    if (!score) return 'none';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  },

  formatDate: (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  formatPrice: (price) => price != null ? `$${parseFloat(price).toFixed(2)}` : 'N/A',
};

export default {
  rawgService, cheapSharkService, grayMarketService, freeGamesService,
  priceService, userGameDataService, gameUtils,
  STORES, PLATFORMS, GENRES, POPULAR_TAGS,
};
