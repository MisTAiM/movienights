/* ========================================
   ACHIEVEMENTS.JS - Achievement System
   ======================================== */

// Default achievements structure
export const defaultAchievements = {
  // General Achievements
  firstAdd: { name: 'First Steps', description: 'Add your first item to collection', icon: '🎬', goal: 1, progress: 0, unlocked: false, category: 'General' },
  collector10: { name: 'Casual Viewer', description: 'Add 10 items to collection', icon: '📺', goal: 10, progress: 0, unlocked: false, category: 'General' },
  collector50: { name: 'Movie Buff', description: 'Add 50 items to collection', icon: '🎥', goal: 50, progress: 0, unlocked: false, category: 'General' },
  collector100: { name: 'Cinephile', description: 'Add 100 items to collection', icon: '🏆', goal: 100, progress: 0, unlocked: false, category: 'General' },
  collector500: { name: 'Ultimate Collector', description: 'Add 500 items to collection', icon: '👑', goal: 500, progress: 0, unlocked: false, category: 'General' },
  bingeMaster: { name: 'Binge Master', description: 'Watch 5 episodes in one day', icon: '🔥', goal: 5, progress: 0, unlocked: false, category: 'General' },
  nightOwl: { name: 'Night Owl', description: 'Watch something after midnight', icon: '🦉', goal: 1, progress: 0, unlocked: false, category: 'General' },
  earlyBird: { name: 'Early Bird', description: 'Watch something before 6 AM', icon: '🌅', goal: 1, progress: 0, unlocked: false, category: 'General' },
  weekendWarrior: { name: 'Weekend Warrior', description: 'Watch 10 hours on a weekend', icon: '⚔️', goal: 10, progress: 0, unlocked: false, category: 'General' },
  marathoner: { name: 'Marathoner', description: 'Watch for 4 hours straight', icon: '🏃', goal: 4, progress: 0, unlocked: false, category: 'General' },
  genreExplorer: { name: 'Genre Explorer', description: 'Watch 10 different genres', icon: '🧭', goal: 10, progress: 0, unlocked: false, category: 'General' },
  globalViewer: { name: 'Global Viewer', description: 'Watch content from 5 different countries', icon: '🌍', goal: 5, progress: 0, unlocked: false, category: 'General' },
  critic: { name: 'Critic', description: 'Rate 25 items', icon: '⭐', goal: 25, progress: 0, unlocked: false, category: 'General' },
  harshCritic: { name: 'Harsh Critic', description: 'Give 10 items 1 star', icon: '👎', goal: 10, progress: 0, unlocked: false, category: 'General' },
  easyPleaser: { name: 'Easy Pleaser', description: 'Give 10 items 5 stars', icon: '👍', goal: 10, progress: 0, unlocked: false, category: 'General' },
  listMaker: { name: 'List Maker', description: 'Create 5 custom lists', icon: '📝', goal: 5, progress: 0, unlocked: false, category: 'General' },
  socialButterfly: { name: 'Social Butterfly', description: 'Share your collection', icon: '🦋', goal: 1, progress: 0, unlocked: false, category: 'General' },
  importMaster: { name: 'Import Master', description: 'Import a shared collection', icon: '📥', goal: 1, progress: 0, unlocked: false, category: 'General' },
  
  // Stranger Things
  stS1: { name: 'The Vanishing', description: 'Complete Stranger Things Season 1', icon: '🔦', goal: 8, progress: 0, unlocked: false, category: 'Stranger Things' },
  stS2: { name: 'The Gate', description: 'Complete Stranger Things Season 2', icon: '🚪', goal: 9, progress: 0, unlocked: false, category: 'Stranger Things' },
  stS3: { name: 'The Battle of Starcourt', description: 'Complete Stranger Things Season 3', icon: '🛒', goal: 8, progress: 0, unlocked: false, category: 'Stranger Things' },
  stS4: { name: 'The Piggyback', description: 'Complete Stranger Things Season 4', icon: '⚡', goal: 9, progress: 0, unlocked: false, category: 'Stranger Things' },
  stComplete: { name: 'Hawkins Resident', description: 'Complete all Stranger Things', icon: '🏠', goal: 34, progress: 0, unlocked: false, category: 'Stranger Things' },
  
  // Breaking Bad
  bbS1: { name: 'Pilot', description: 'Complete Breaking Bad Season 1', icon: '🧪', goal: 7, progress: 0, unlocked: false, category: 'Breaking Bad' },
  bbS2: { name: 'ABQ', description: 'Complete Breaking Bad Season 2', icon: '✈️', goal: 13, progress: 0, unlocked: false, category: 'Breaking Bad' },
  bbS3: { name: 'Full Measure', description: 'Complete Breaking Bad Season 3', icon: '🔬', goal: 13, progress: 0, unlocked: false, category: 'Breaking Bad' },
  bbS4: { name: 'Face Off', description: 'Complete Breaking Bad Season 4', icon: '💀', goal: 13, progress: 0, unlocked: false, category: 'Breaking Bad' },
  bbS5: { name: 'Felina', description: 'Complete Breaking Bad Season 5', icon: '👑', goal: 16, progress: 0, unlocked: false, category: 'Breaking Bad' },
  bbComplete: { name: 'Say My Name', description: 'Complete all Breaking Bad', icon: '💎', goal: 62, progress: 0, unlocked: false, category: 'Breaking Bad' },
  
  // Black Mirror
  bmS1: { name: 'National Anthem', description: 'Complete Black Mirror Season 1', icon: '🐷', goal: 3, progress: 0, unlocked: false, category: 'Black Mirror' },
  bmS2: { name: 'White Bear', description: 'Complete Black Mirror Season 2', icon: '🐻', goal: 4, progress: 0, unlocked: false, category: 'Black Mirror' },
  bmS3: { name: 'San Junipero', description: 'Complete Black Mirror Season 3', icon: '🌴', goal: 6, progress: 0, unlocked: false, category: 'Black Mirror' },
  bmS4: { name: 'USS Callister', description: 'Complete Black Mirror Season 4', icon: '🚀', goal: 6, progress: 0, unlocked: false, category: 'Black Mirror' },
  bmS5: { name: 'Striking Vipers', description: 'Complete Black Mirror Season 5', icon: '🎮', goal: 3, progress: 0, unlocked: false, category: 'Black Mirror' },
  bmComplete: { name: 'Five Star', description: 'Complete all Black Mirror', icon: '⭐', goal: 22, progress: 0, unlocked: false, category: 'Black Mirror' },
  
  // Game of Thrones
  gotS1: { name: 'Winter Is Coming', description: 'Complete Game of Thrones Season 1', icon: '❄️', goal: 10, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotS2: { name: 'Blackwater', description: 'Complete Game of Thrones Season 2', icon: '🔥', goal: 10, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotS3: { name: 'The Rains of Castamere', description: 'Complete Game of Thrones Season 3', icon: '🦁', goal: 10, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotS4: { name: 'The Mountain and the Viper', description: 'Complete Game of Thrones Season 4', icon: '⚔️', goal: 10, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotS5: { name: 'Hardhome', description: 'Complete Game of Thrones Season 5', icon: '💀', goal: 10, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotS6: { name: 'Battle of the Bastards', description: 'Complete Game of Thrones Season 6', icon: '🐺', goal: 10, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotS7: { name: 'The Dragon and the Wolf', description: 'Complete Game of Thrones Season 7', icon: '🐉', goal: 7, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotS8: { name: 'The Iron Throne', description: 'Complete Game of Thrones Season 8', icon: '👑', goal: 6, progress: 0, unlocked: false, category: 'Game of Thrones' },
  gotComplete: { name: 'Ruler of the Seven Kingdoms', description: 'Complete all Game of Thrones', icon: '🏰', goal: 73, progress: 0, unlocked: false, category: 'Game of Thrones' },
  
  // The Office
  officeS1: { name: 'Diversity Day', description: 'Complete The Office Season 1', icon: '📋', goal: 6, progress: 0, unlocked: false, category: 'The Office' },
  officeS2: { name: 'Casino Night', description: 'Complete The Office Season 2', icon: '🎰', goal: 22, progress: 0, unlocked: false, category: 'The Office' },
  officeS3: { name: 'Beach Games', description: 'Complete The Office Season 3', icon: '🏖️', goal: 25, progress: 0, unlocked: false, category: 'The Office' },
  officeComplete: { name: 'World\'s Best Boss', description: 'Complete all The Office', icon: '☕', goal: 201, progress: 0, unlocked: false, category: 'The Office' },
  
  // Friends
  friendsS1: { name: 'The One Where It All Began', description: 'Complete Friends Season 1', icon: '☕', goal: 24, progress: 0, unlocked: false, category: 'Friends' },
  friendsS2: { name: 'The One With the List', description: 'Complete Friends Season 2', icon: '📝', goal: 24, progress: 0, unlocked: false, category: 'Friends' },
  friendsComplete: { name: 'Central Perk Regular', description: 'Complete all Friends', icon: '🛋️', goal: 236, progress: 0, unlocked: false, category: 'Friends' },
  
  // Naruto
  narutoLandOfWaves: { name: 'Land of Waves', description: 'Complete Naruto Land of Waves Arc', icon: '🌊', goal: 19, progress: 0, unlocked: false, category: 'Naruto' },
  narutoChuninExams: { name: 'Chunin Exams', description: 'Complete Naruto Chunin Exams Arc', icon: '📜', goal: 42, progress: 0, unlocked: false, category: 'Naruto' },
  narutoSasuke: { name: 'Sasuke Retrieval', description: 'Complete Sasuke Retrieval Arc', icon: '⚡', goal: 30, progress: 0, unlocked: false, category: 'Naruto' },
  narutoComplete: { name: 'Hokage', description: 'Complete all Naruto', icon: '🍥', goal: 220, progress: 0, unlocked: false, category: 'Naruto' },
  shippudenPain: { name: 'Pain\'s Assault', description: 'Complete Pain\'s Assault Arc', icon: '💫', goal: 30, progress: 0, unlocked: false, category: 'Naruto Shippuden' },
  shippudenWar: { name: 'Fourth Great Ninja War', description: 'Complete the War Arc', icon: '⚔️', goal: 100, progress: 0, unlocked: false, category: 'Naruto Shippuden' },
  shippudenComplete: { name: 'Sage of Six Paths', description: 'Complete all Shippuden', icon: '🌀', goal: 500, progress: 0, unlocked: false, category: 'Naruto Shippuden' },
  
  // One Piece
  opEastBlue: { name: 'East Blue Saga', description: 'Complete East Blue Saga', icon: '⛵', goal: 61, progress: 0, unlocked: false, category: 'One Piece' },
  opAlabasta: { name: 'Alabasta Saga', description: 'Complete Alabasta Saga', icon: '🏜️', goal: 92, progress: 0, unlocked: false, category: 'One Piece' },
  opSkypiea: { name: 'Skypiea Saga', description: 'Complete Skypiea Saga', icon: '☁️', goal: 89, progress: 0, unlocked: false, category: 'One Piece' },
  opEniesLobby: { name: 'Enies Lobby Saga', description: 'Complete Enies Lobby Saga', icon: '⚖️', goal: 118, progress: 0, unlocked: false, category: 'One Piece' },
  opMarineford: { name: 'Marineford Saga', description: 'Complete Marineford Saga', icon: '⚓', goal: 108, progress: 0, unlocked: false, category: 'One Piece' },
  opDressrosa: { name: 'Dressrosa Saga', description: 'Complete Dressrosa Saga', icon: '🎭', goal: 118, progress: 0, unlocked: false, category: 'One Piece' },
  opWano: { name: 'Wano Country Saga', description: 'Complete Wano Saga', icon: '⚔️', goal: 150, progress: 0, unlocked: false, category: 'One Piece' },
  opComplete: { name: 'King of the Pirates', description: 'Complete all One Piece', icon: '👑', goal: 1000, progress: 0, unlocked: false, category: 'One Piece' },
  
  // Attack on Titan
  aotS1: { name: 'The Fall of Shiganshina', description: 'Complete Attack on Titan Season 1', icon: '🏰', goal: 25, progress: 0, unlocked: false, category: 'Attack on Titan' },
  aotS2: { name: 'Clash of the Titans', description: 'Complete Attack on Titan Season 2', icon: '⚔️', goal: 12, progress: 0, unlocked: false, category: 'Attack on Titan' },
  aotS3: { name: 'The Basement', description: 'Complete Attack on Titan Season 3', icon: '📖', goal: 22, progress: 0, unlocked: false, category: 'Attack on Titan' },
  aotS4: { name: 'The Final Season', description: 'Complete Attack on Titan Final Season', icon: '💀', goal: 28, progress: 0, unlocked: false, category: 'Attack on Titan' },
  aotComplete: { name: 'Freedom', description: 'Complete all Attack on Titan', icon: '🦅', goal: 87, progress: 0, unlocked: false, category: 'Attack on Titan' },
  
  // Dragon Ball Z
  dbzSaiyan: { name: 'Saiyan Saga', description: 'Complete the Saiyan Saga', icon: '👊', goal: 35, progress: 0, unlocked: false, category: 'Dragon Ball Z' },
  dbzFrieza: { name: 'Frieza Saga', description: 'Complete the Frieza Saga', icon: '💎', goal: 107, progress: 0, unlocked: false, category: 'Dragon Ball Z' },
  dbzCell: { name: 'Cell Saga', description: 'Complete the Cell Saga', icon: '🐛', goal: 75, progress: 0, unlocked: false, category: 'Dragon Ball Z' },
  dbzBuu: { name: 'Buu Saga', description: 'Complete the Buu Saga', icon: '🍬', goal: 74, progress: 0, unlocked: false, category: 'Dragon Ball Z' },
  dbzComplete: { name: 'Super Saiyan', description: 'Complete all Dragon Ball Z', icon: '⚡', goal: 291, progress: 0, unlocked: false, category: 'Dragon Ball Z' },
  dbsComplete: { name: 'Ultra Instinct', description: 'Complete all Dragon Ball Super', icon: '🌟', goal: 131, progress: 0, unlocked: false, category: 'Dragon Ball Super' },
  
  // Death Note
  dnL: { name: 'L', description: 'Complete Death Note Part 1', icon: '🍰', goal: 25, progress: 0, unlocked: false, category: 'Death Note' },
  dnNear: { name: 'Near', description: 'Complete Death Note Part 2', icon: '🧩', goal: 12, progress: 0, unlocked: false, category: 'Death Note' },
  dnComplete: { name: 'God of the New World', description: 'Complete all Death Note', icon: '📓', goal: 37, progress: 0, unlocked: false, category: 'Death Note' },
  
  // Fullmetal Alchemist
  fmaComplete: { name: 'Philosopher\'s Stone', description: 'Complete Fullmetal Alchemist', icon: '💎', goal: 51, progress: 0, unlocked: false, category: 'Fullmetal Alchemist' },
  fmabComplete: { name: 'Equivalent Exchange', description: 'Complete FMA: Brotherhood', icon: '⚗️', goal: 64, progress: 0, unlocked: false, category: 'Fullmetal Alchemist' },
  
  // Star Wars
  swMandoS1: { name: 'The Child', description: 'Complete The Mandalorian Season 1', icon: '👶', goal: 8, progress: 0, unlocked: false, category: 'Star Wars' },
  swMandoS2: { name: 'The Rescue', description: 'Complete The Mandalorian Season 2', icon: '⚔️', goal: 8, progress: 0, unlocked: false, category: 'Star Wars' },
  swMandoS3: { name: 'The Return', description: 'Complete The Mandalorian Season 3', icon: '🪖', goal: 8, progress: 0, unlocked: false, category: 'Star Wars' },
  swMandoComplete: { name: 'This Is The Way', description: 'Complete all The Mandalorian', icon: '🚀', goal: 24, progress: 0, unlocked: false, category: 'Star Wars' },
  
  // Watch Time Achievements
  watchTime1: { name: 'Getting Started', description: 'Watch for 1 hour total', icon: '⏱️', goal: 1, progress: 0, unlocked: false, category: 'Watch Time' },
  watchTime10: { name: 'Dedicated Viewer', description: 'Watch for 10 hours total', icon: '📺', goal: 10, progress: 0, unlocked: false, category: 'Watch Time' },
  watchTime50: { name: 'Serious Watcher', description: 'Watch for 50 hours total', icon: '🎬', goal: 50, progress: 0, unlocked: false, category: 'Watch Time' },
  watchTime100: { name: 'Century Club', description: 'Watch for 100 hours total', icon: '💯', goal: 100, progress: 0, unlocked: false, category: 'Watch Time' },
  watchTime500: { name: 'Legendary Viewer', description: 'Watch for 500 hours total', icon: '👑', goal: 500, progress: 0, unlocked: false, category: 'Watch Time' },
  episodeWatcher10: { name: 'Episode Explorer', description: 'Watch 10 episodes', icon: '📺', goal: 10, progress: 0, unlocked: false, category: 'Watch Time' },
  episodeWatcher50: { name: 'Episode Enthusiast', description: 'Watch 50 episodes', icon: '📡', goal: 50, progress: 0, unlocked: false, category: 'Watch Time' },
  episodeWatcher100: { name: 'Episode Expert', description: 'Watch 100 episodes', icon: '🎛️', goal: 100, progress: 0, unlocked: false, category: 'Watch Time' },
  movieWatcher10: { name: 'Movie Goer', description: 'Watch 10 movies', icon: '🎬', goal: 10, progress: 0, unlocked: false, category: 'Watch Time' },
  movieWatcher50: { name: 'Film Fanatic', description: 'Watch 50 movies', icon: '🍿', goal: 50, progress: 0, unlocked: false, category: 'Watch Time' },
  movieWatcher100: { name: 'Film Aficionado', description: 'Watch 100 movies', icon: '🎥', goal: 100, progress: 0, unlocked: false, category: 'Watch Time' },
  streakWeek: { name: 'Week Streak', description: 'Watch something 7 days in a row', icon: '🔥', goal: 7, progress: 0, unlocked: false, category: 'Watch Time' },
  streakMonth: { name: 'Month Streak', description: 'Watch something 30 days in a row', icon: '🌟', goal: 30, progress: 0, unlocked: false, category: 'Watch Time' },
  
  // Anime General
  animeStarter: { name: 'Anime Starter', description: 'Add 5 anime to collection', icon: '🎌', goal: 5, progress: 0, unlocked: false, category: 'Anime' },
  animeEnthusiast: { name: 'Anime Enthusiast', description: 'Add 25 anime to collection', icon: '🗾', goal: 25, progress: 0, unlocked: false, category: 'Anime' },
  animeOtaku: { name: 'Otaku', description: 'Add 100 anime to collection', icon: '⛩️', goal: 100, progress: 0, unlocked: false, category: 'Anime' },
  
  // Movie General
  movieStarter: { name: 'Movie Starter', description: 'Add 10 movies to collection', icon: '🎬', goal: 10, progress: 0, unlocked: false, category: 'Movies' },
  movieLover: { name: 'Movie Lover', description: 'Add 50 movies to collection', icon: '🍿', goal: 50, progress: 0, unlocked: false, category: 'Movies' },
  movieMaster: { name: 'Movie Master', description: 'Add 200 movies to collection', icon: '🎥', goal: 200, progress: 0, unlocked: false, category: 'Movies' },
  
  // TV Shows
  tvStarter: { name: 'TV Starter', description: 'Add 5 TV shows to collection', icon: '📺', goal: 5, progress: 0, unlocked: false, category: 'TV Shows' },
  tvAddict: { name: 'TV Addict', description: 'Add 25 TV shows to collection', icon: '📡', goal: 25, progress: 0, unlocked: false, category: 'TV Shows' },
  tvMaster: { name: 'TV Master', description: 'Add 100 TV shows to collection', icon: '🎛️', goal: 100, progress: 0, unlocked: false, category: 'TV Shows' }
};

/**
 * Get achievements grouped by category
 * @param {Object} achievements - Achievements object
 * @returns {Object} Achievements grouped by category
 */
export function getAchievementsByCategory(achievements) {
  const categories = {};
  
  Object.entries(achievements).forEach(([key, achievement]) => {
    const category = achievement.category || 'General';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ key, ...achievement });
  });
  
  return categories;
}

/**
 * Get achievement statistics
 * @param {Object} achievements - Achievements object
 * @returns {Object} Achievement stats
 */
export function getAchievementStats(achievements) {
  const total = Object.keys(achievements).length;
  const unlocked = Object.values(achievements).filter(a => a.unlocked).length;
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  
  return {
    total,
    unlocked,
    locked: total - unlocked,
    percentage
  };
}

/**
 * Check and unlock achievements based on collection state and watch stats
 * @param {Object} params - Check parameters
 * @param {Array} params.collection - User's collection
 * @param {Object} params.achievements - Current achievements
 * @param {Object} params.watchStats - Watch statistics (optional)
 * @param {Function} params.onUnlock - Callback when achievement is unlocked
 * @returns {Object} Updated achievements
 */
export function checkAchievements({ collection, achievements, watchStats, onUnlock }) {
  const updated = { ...achievements };
  const collectionCount = collection.length;
  
  // Collection count achievements
  const countAchievements = [
    { key: 'firstAdd', goal: 1 },
    { key: 'collector10', goal: 10 },
    { key: 'collector50', goal: 50 },
    { key: 'collector100', goal: 100 },
    { key: 'collector500', goal: 500 }
  ];
  
  countAchievements.forEach(({ key, goal }) => {
    if (updated[key] && !updated[key].unlocked && collectionCount >= goal) {
      updated[key] = { ...updated[key], unlocked: true, progress: goal };
      onUnlock?.(updated[key]);
    } else if (updated[key] && !updated[key].unlocked) {
      updated[key] = { ...updated[key], progress: collectionCount };
    }
  });
  
  // Type-specific achievements
  const animeCount = collection.filter(i => i.type === 'anime').length;
  const movieCount = collection.filter(i => i.type === 'movie').length;
  const tvCount = collection.filter(i => i.type === 'tv').length;
  
  // Anime achievements
  if (updated.animeStarter && !updated.animeStarter.unlocked && animeCount >= 5) {
    updated.animeStarter = { ...updated.animeStarter, unlocked: true, progress: 5 };
    onUnlock?.(updated.animeStarter);
  }
  if (updated.animeEnthusiast && !updated.animeEnthusiast.unlocked && animeCount >= 25) {
    updated.animeEnthusiast = { ...updated.animeEnthusiast, unlocked: true, progress: 25 };
    onUnlock?.(updated.animeEnthusiast);
  }
  if (updated.animeOtaku && !updated.animeOtaku.unlocked && animeCount >= 100) {
    updated.animeOtaku = { ...updated.animeOtaku, unlocked: true, progress: 100 };
    onUnlock?.(updated.animeOtaku);
  }
  
  // Movie achievements
  if (updated.movieStarter && !updated.movieStarter.unlocked && movieCount >= 10) {
    updated.movieStarter = { ...updated.movieStarter, unlocked: true, progress: 10 };
    onUnlock?.(updated.movieStarter);
  }
  if (updated.movieLover && !updated.movieLover.unlocked && movieCount >= 50) {
    updated.movieLover = { ...updated.movieLover, unlocked: true, progress: 50 };
    onUnlock?.(updated.movieLover);
  }
  if (updated.movieMaster && !updated.movieMaster.unlocked && movieCount >= 200) {
    updated.movieMaster = { ...updated.movieMaster, unlocked: true, progress: 200 };
    onUnlock?.(updated.movieMaster);
  }
  
  // TV achievements
  if (updated.tvStarter && !updated.tvStarter.unlocked && tvCount >= 5) {
    updated.tvStarter = { ...updated.tvStarter, unlocked: true, progress: 5 };
    onUnlock?.(updated.tvStarter);
  }
  if (updated.tvAddict && !updated.tvAddict.unlocked && tvCount >= 25) {
    updated.tvAddict = { ...updated.tvAddict, unlocked: true, progress: 25 };
    onUnlock?.(updated.tvAddict);
  }
  if (updated.tvMaster && !updated.tvMaster.unlocked && tvCount >= 100) {
    updated.tvMaster = { ...updated.tvMaster, unlocked: true, progress: 100 };
    onUnlock?.(updated.tvMaster);
  }
  
  // Rating achievements
  const ratedItems = collection.filter(i => i.userRating);
  const ratedCount = ratedItems.length;
  
  if (updated.critic && !updated.critic.unlocked && ratedCount >= 25) {
    updated.critic = { ...updated.critic, unlocked: true, progress: 25 };
    onUnlock?.(updated.critic);
  }
  
  const oneStarCount = ratedItems.filter(i => i.userRating === 1).length;
  if (updated.harshCritic && !updated.harshCritic.unlocked && oneStarCount >= 10) {
    updated.harshCritic = { ...updated.harshCritic, unlocked: true, progress: 10 };
    onUnlock?.(updated.harshCritic);
  }
  
  const fiveStarCount = ratedItems.filter(i => i.userRating === 5).length;
  if (updated.easyPleaser && !updated.easyPleaser.unlocked && fiveStarCount >= 10) {
    updated.easyPleaser = { ...updated.easyPleaser, unlocked: true, progress: 10 };
    onUnlock?.(updated.easyPleaser);
  }
  
  // Time-based achievements
  const currentHour = new Date().getHours();
  if (updated.nightOwl && !updated.nightOwl.unlocked && currentHour >= 0 && currentHour < 5) {
    updated.nightOwl = { ...updated.nightOwl, unlocked: true, progress: 1 };
    onUnlock?.(updated.nightOwl);
  }
  if (updated.earlyBird && !updated.earlyBird.unlocked && currentHour >= 4 && currentHour < 6) {
    updated.earlyBird = { ...updated.earlyBird, unlocked: true, progress: 1 };
    onUnlock?.(updated.earlyBird);
  }
  
  // Watch stats achievements (if provided)
  if (watchStats) {
    const totalHours = Math.round(watchStats.totalWatchTimeMinutes / 60);
    const episodesWatched = watchStats.totalEpisodesWatched || 0;
    const moviesWatched = watchStats.totalMoviesWatched || 0;
    const currentStreak = watchStats.currentStreakDays || 0;
    const todayMinutes = watchStats.dailyWatchTime?.[new Date().toISOString().split('T')[0]] || 0;
    const todayEpisodes = Math.floor(todayMinutes / 25);
    const longestSessionHours = (watchStats.longestSessionMinutes || 0) / 60;
    const weekendHours = watchStats.achievements?.weekendHours || 0;
    
    // Watch time achievements
    const watchTimeAchievements = [
      { key: 'watchTime1', goal: 1 },
      { key: 'watchTime10', goal: 10 },
      { key: 'watchTime50', goal: 50 },
      { key: 'watchTime100', goal: 100 },
      { key: 'watchTime500', goal: 500 }
    ];
    
    watchTimeAchievements.forEach(({ key, goal }) => {
      if (updated[key] && !updated[key].unlocked) {
        updated[key].progress = Math.min(totalHours, goal);
        if (totalHours >= goal) {
          updated[key] = { ...updated[key], unlocked: true, progress: goal };
          onUnlock?.(updated[key]);
        }
      }
    });
    
    // Episode watcher achievements
    const episodeAchievements = [
      { key: 'episodeWatcher10', goal: 10 },
      { key: 'episodeWatcher50', goal: 50 },
      { key: 'episodeWatcher100', goal: 100 }
    ];
    
    episodeAchievements.forEach(({ key, goal }) => {
      if (updated[key] && !updated[key].unlocked) {
        updated[key].progress = Math.min(episodesWatched, goal);
        if (episodesWatched >= goal) {
          updated[key] = { ...updated[key], unlocked: true, progress: goal };
          onUnlock?.(updated[key]);
        }
      }
    });
    
    // Movie watcher achievements
    const movieWatchAchievements = [
      { key: 'movieWatcher10', goal: 10 },
      { key: 'movieWatcher50', goal: 50 },
      { key: 'movieWatcher100', goal: 100 }
    ];
    
    movieWatchAchievements.forEach(({ key, goal }) => {
      if (updated[key] && !updated[key].unlocked) {
        updated[key].progress = Math.min(moviesWatched, goal);
        if (moviesWatched >= goal) {
          updated[key] = { ...updated[key], unlocked: true, progress: goal };
          onUnlock?.(updated[key]);
        }
      }
    });
    
    // Streak achievements
    if (updated.streakWeek && !updated.streakWeek.unlocked) {
      updated.streakWeek.progress = Math.min(currentStreak, 7);
      if (currentStreak >= 7) {
        updated.streakWeek = { ...updated.streakWeek, unlocked: true, progress: 7 };
        onUnlock?.(updated.streakWeek);
      }
    }
    
    if (updated.streakMonth && !updated.streakMonth.unlocked) {
      updated.streakMonth.progress = Math.min(currentStreak, 30);
      if (currentStreak >= 30) {
        updated.streakMonth = { ...updated.streakMonth, unlocked: true, progress: 30 };
        onUnlock?.(updated.streakMonth);
      }
    }
    
    // Binge Master - 5 episodes in one day
    if (updated.bingeMaster && !updated.bingeMaster.unlocked) {
      updated.bingeMaster.progress = Math.min(todayEpisodes, 5);
      if (todayEpisodes >= 5) {
        updated.bingeMaster = { ...updated.bingeMaster, unlocked: true, progress: 5 };
        onUnlock?.(updated.bingeMaster);
      }
    }
    
    // Marathoner - 4 hours straight
    if (updated.marathoner && !updated.marathoner.unlocked) {
      updated.marathoner.progress = Math.min(Math.round(longestSessionHours * 10) / 10, 4);
      if (longestSessionHours >= 4) {
        updated.marathoner = { ...updated.marathoner, unlocked: true, progress: 4 };
        onUnlock?.(updated.marathoner);
      }
    }
    
    // Weekend Warrior - 10 hours on weekends
    if (updated.weekendWarrior && !updated.weekendWarrior.unlocked) {
      updated.weekendWarrior.progress = Math.min(Math.round(weekendHours * 10) / 10, 10);
      if (weekendHours >= 10) {
        updated.weekendWarrior = { ...updated.weekendWarrior, unlocked: true, progress: 10 };
        onUnlock?.(updated.weekendWarrior);
      }
    }
    
    // Genre Explorer - 10 different genres
    const genresCount = watchStats.genresWatched?.length || 0;
    if (updated.genreExplorer && !updated.genreExplorer.unlocked) {
      updated.genreExplorer.progress = Math.min(genresCount, 10);
      if (genresCount >= 10) {
        updated.genreExplorer = { ...updated.genreExplorer, unlocked: true, progress: 10 };
        onUnlock?.(updated.genreExplorer);
      }
    }
  }
  
  return updated;
}

export default {
  defaultAchievements,
  getAchievementsByCategory,
  getAchievementStats,
  checkAchievements
};
