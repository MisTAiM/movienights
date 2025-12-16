/* ========================================
   WATCHTRACKER.JS - Watch Time Tracking System
   ======================================== */

const WATCH_STATS_KEY = 'movienights_watch_stats';
const WATCH_HISTORY_KEY = 'movienights_watch_history';
const SESSION_KEY = 'movienights_current_session';

/**
 * Get default watch stats structure
 */
function getDefaultStats() {
  return {
    totalWatchTimeMinutes: 0,
    totalMoviesWatched: 0,
    totalEpisodesWatched: 0,
    totalAnimeEpisodesWatched: 0,
    longestSessionMinutes: 0,
    currentStreakDays: 0,
    lastWatchDate: null,
    dailyWatchTime: {}, // { '2024-01-15': 120 } minutes per day
    weeklyWatchTime: {}, // { '2024-W03': 300 } minutes per week
    genresWatched: [], // unique genres
    showProgress: {}, // { 'tv-12345': { watched: [1,2,3], total: 10 } }
    achievements: {
      marathonSessions: 0, // 4+ hour sessions
      bingeCount: 0, // 5+ episodes in a day
      lateNightSessions: 0,
      earlyMorningSessions: 0,
      weekendHours: 0
    }
  };
}

/**
 * Load watch stats from localStorage
 */
export function loadWatchStats() {
  try {
    const saved = localStorage.getItem(WATCH_STATS_KEY);
    if (saved) {
      return { ...getDefaultStats(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading watch stats:', e);
  }
  return getDefaultStats();
}

/**
 * Save watch stats to localStorage
 */
export function saveWatchStats(stats) {
  try {
    localStorage.setItem(WATCH_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving watch stats:', e);
  }
}

/**
 * Get current session data
 */
export function getCurrentSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return null;
}

/**
 * Start a new watch session
 */
export function startWatchSession(item, episode = null, season = null) {
  const session = {
    itemId: item.id,
    itemType: item.type,
    itemTitle: item.title,
    episode: episode,
    season: season,
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    accumulatedMinutes: 0,
    isPaused: false
  };
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error starting session:', e);
  }
  
  console.log('Watch session started:', session);
  return session;
}

/**
 * Update current session (call periodically while watching)
 */
export function updateWatchSession() {
  const session = getCurrentSession();
  if (!session || session.isPaused) return null;
  
  const now = Date.now();
  const elapsedMinutes = (now - session.lastUpdateTime) / 1000 / 60;
  
  // Only count if reasonable time elapsed (less than 5 minutes between updates)
  // This prevents counting time when user was away
  if (elapsedMinutes < 5) {
    session.accumulatedMinutes += elapsedMinutes;
  }
  
  session.lastUpdateTime = now;
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error updating session:', e);
  }
  
  return session;
}

/**
 * End watch session and update stats
 */
export function endWatchSession(markAsWatched = false) {
  const session = getCurrentSession();
  if (!session) return null;
  
  // Final update
  const now = Date.now();
  const elapsedMinutes = (now - session.lastUpdateTime) / 1000 / 60;
  if (elapsedMinutes < 5) {
    session.accumulatedMinutes += elapsedMinutes;
  }
  
  // Round to nearest minute
  const watchedMinutes = Math.round(session.accumulatedMinutes);
  
  // Update stats
  const stats = loadWatchStats();
  const today = new Date().toISOString().split('T')[0];
  const weekNum = getWeekNumber(new Date());
  const currentHour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  
  // Update total watch time
  stats.totalWatchTimeMinutes += watchedMinutes;
  
  // Update daily watch time
  stats.dailyWatchTime[today] = (stats.dailyWatchTime[today] || 0) + watchedMinutes;
  
  // Update weekly watch time
  stats.weeklyWatchTime[weekNum] = (stats.weeklyWatchTime[weekNum] || 0) + watchedMinutes;
  
  // Track longest session
  if (watchedMinutes > stats.longestSessionMinutes) {
    stats.longestSessionMinutes = watchedMinutes;
  }
  
  // Track marathon sessions (4+ hours)
  if (watchedMinutes >= 240) {
    stats.achievements.marathonSessions++;
  }
  
  // Track late night sessions (midnight - 5am)
  if (currentHour >= 0 && currentHour < 5) {
    stats.achievements.lateNightSessions++;
  }
  
  // Track early morning sessions (4am - 6am)
  if (currentHour >= 4 && currentHour < 6) {
    stats.achievements.earlyMorningSessions++;
  }
  
  // Track weekend hours
  if (isWeekend) {
    stats.achievements.weekendHours += watchedMinutes / 60;
  }
  
  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (stats.lastWatchDate === yesterdayStr || stats.lastWatchDate === today) {
    // Continue streak
    if (stats.lastWatchDate !== today) {
      stats.currentStreakDays++;
    }
  } else if (stats.lastWatchDate !== today) {
    // Streak broken, reset
    stats.currentStreakDays = 1;
  }
  stats.lastWatchDate = today;
  
  // Mark content as watched if requested
  if (markAsWatched) {
    if (session.itemType === 'movie') {
      stats.totalMoviesWatched++;
    } else if (session.itemType === 'anime') {
      stats.totalAnimeEpisodesWatched++;
      stats.totalEpisodesWatched++;
      
      // Track show progress
      const showKey = `anime-${session.itemId}`;
      if (!stats.showProgress[showKey]) {
        stats.showProgress[showKey] = { watched: [], title: session.itemTitle };
      }
      if (session.episode && !stats.showProgress[showKey].watched.includes(session.episode)) {
        stats.showProgress[showKey].watched.push(session.episode);
      }
    } else if (session.itemType === 'tv') {
      stats.totalEpisodesWatched++;
      
      // Track show progress
      const showKey = `tv-${session.itemId}`;
      if (!stats.showProgress[showKey]) {
        stats.showProgress[showKey] = { watched: [], title: session.itemTitle };
      }
      const epKey = `S${session.season}E${session.episode}`;
      if (!stats.showProgress[showKey].watched.includes(epKey)) {
        stats.showProgress[showKey].watched.push(epKey);
      }
    }
    
    // Check for binge watching (5+ episodes in a day)
    const todayEpisodes = Object.values(stats.showProgress).reduce((count, show) => {
      return count + show.watched.filter(ep => {
        // This is a simplified check - ideally we'd track when each was watched
        return true;
      }).length;
    }, 0);
    
    // Update binge count based on daily episodes
    const dailyEpisodeCount = stats.dailyWatchTime[today] ? 
      Math.floor(stats.dailyWatchTime[today] / 25) : 0; // ~25 min per episode
    if (dailyEpisodeCount >= 5) {
      stats.achievements.bingeCount = Math.max(stats.achievements.bingeCount, 1);
    }
  }
  
  saveWatchStats(stats);
  
  // Clear session
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Error clearing session:', e);
  }
  
  console.log('Watch session ended:', { watchedMinutes, stats });
  
  return { watchedMinutes, stats };
}

/**
 * Mark episode/movie as watched without tracking time
 */
export function markAsWatched(item, episode = null, season = null, estimatedMinutes = null) {
  const stats = loadWatchStats();
  const today = new Date().toISOString().split('T')[0];
  
  // Estimate runtime if not provided
  const runtime = estimatedMinutes || (item.type === 'movie' ? 120 : 45);
  
  // Update total watch time
  stats.totalWatchTimeMinutes += runtime;
  
  // Update daily watch time
  stats.dailyWatchTime[today] = (stats.dailyWatchTime[today] || 0) + runtime;
  
  // Update last watch date and streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (stats.lastWatchDate === yesterdayStr || stats.lastWatchDate === today) {
    if (stats.lastWatchDate !== today) {
      stats.currentStreakDays++;
    }
  } else if (stats.lastWatchDate !== today) {
    stats.currentStreakDays = 1;
  }
  stats.lastWatchDate = today;
  
  // Track what was watched
  if (item.type === 'movie') {
    stats.totalMoviesWatched++;
  } else if (item.type === 'anime') {
    stats.totalAnimeEpisodesWatched++;
    stats.totalEpisodesWatched++;
    
    const showKey = `anime-${item.id}`;
    if (!stats.showProgress[showKey]) {
      stats.showProgress[showKey] = { watched: [], title: item.title };
    }
    if (episode && !stats.showProgress[showKey].watched.includes(episode)) {
      stats.showProgress[showKey].watched.push(episode);
    }
  } else if (item.type === 'tv') {
    stats.totalEpisodesWatched++;
    
    const showKey = `tv-${item.id}`;
    if (!stats.showProgress[showKey]) {
      stats.showProgress[showKey] = { watched: [], title: item.title };
    }
    const epKey = season && episode ? `S${season}E${episode}` : `E${episode}`;
    if (!stats.showProgress[showKey].watched.includes(epKey)) {
      stats.showProgress[showKey].watched.push(epKey);
    }
  }
  
  // Track genres
  if (item.genres && Array.isArray(item.genres)) {
    item.genres.forEach(genre => {
      const genreName = typeof genre === 'string' ? genre : genre.name;
      if (genreName && !stats.genresWatched.includes(genreName)) {
        stats.genresWatched.push(genreName);
      }
    });
  }
  
  // Check for binge achievement
  const todayMinutes = stats.dailyWatchTime[today] || 0;
  const estimatedEpisodes = Math.floor(todayMinutes / 25);
  if (estimatedEpisodes >= 5) {
    stats.achievements.bingeCount = Math.max(stats.achievements.bingeCount, 1);
  }
  
  saveWatchStats(stats);
  
  console.log('Marked as watched:', { item: item.title, episode, runtime, stats });
  
  return stats;
}

/**
 * Get episodes watched today
 */
export function getEpisodesWatchedToday() {
  const stats = loadWatchStats();
  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = stats.dailyWatchTime[today] || 0;
  return Math.floor(todayMinutes / 25); // ~25 min per episode
}

/**
 * Get total watch time in hours
 */
export function getTotalWatchHours() {
  const stats = loadWatchStats();
  return Math.round(stats.totalWatchTimeMinutes / 60 * 10) / 10;
}

/**
 * Get watch time for today in minutes
 */
export function getTodayWatchMinutes() {
  const stats = loadWatchStats();
  const today = new Date().toISOString().split('T')[0];
  return stats.dailyWatchTime[today] || 0;
}

/**
 * Get weekend watch hours
 */
export function getWeekendWatchHours() {
  const stats = loadWatchStats();
  return Math.round(stats.achievements.weekendHours * 10) / 10;
}

/**
 * Check show-specific progress for achievements
 */
export function getShowProgress(showId, showType) {
  const stats = loadWatchStats();
  const showKey = `${showType}-${showId}`;
  return stats.showProgress[showKey] || { watched: [], title: '' };
}

/**
 * Get week number for date
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Check watch-related achievements
 */
export function checkWatchAchievements(currentAchievements, onUnlock) {
  const stats = loadWatchStats();
  const updated = { ...currentAchievements };
  const totalHours = stats.totalWatchTimeMinutes / 60;
  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = stats.dailyWatchTime[today] || 0;
  const todayEpisodes = Math.floor(todayMinutes / 25);
  const isWeekend = [0, 6].includes(new Date().getDay());
  const currentHour = new Date().getHours();
  
  // Binge Master - 5 episodes in one day
  if (updated.bingeMaster && !updated.bingeMaster.unlocked) {
    updated.bingeMaster.progress = todayEpisodes;
    if (todayEpisodes >= 5) {
      updated.bingeMaster = { ...updated.bingeMaster, unlocked: true, progress: 5 };
      onUnlock?.(updated.bingeMaster);
    }
  }
  
  // Marathoner - 4 hours straight
  if (updated.marathoner && !updated.marathoner.unlocked) {
    const sessionHours = stats.longestSessionMinutes / 60;
    updated.marathoner.progress = Math.min(Math.round(sessionHours * 10) / 10, 4);
    if (sessionHours >= 4) {
      updated.marathoner = { ...updated.marathoner, unlocked: true, progress: 4 };
      onUnlock?.(updated.marathoner);
    }
  }
  
  // Night Owl - watch after midnight
  if (updated.nightOwl && !updated.nightOwl.unlocked && currentHour >= 0 && currentHour < 5) {
    if (stats.achievements.lateNightSessions > 0) {
      updated.nightOwl = { ...updated.nightOwl, unlocked: true, progress: 1 };
      onUnlock?.(updated.nightOwl);
    }
  }
  
  // Early Bird - watch before 6 AM
  if (updated.earlyBird && !updated.earlyBird.unlocked && currentHour >= 4 && currentHour < 6) {
    if (stats.achievements.earlyMorningSessions > 0) {
      updated.earlyBird = { ...updated.earlyBird, unlocked: true, progress: 1 };
      onUnlock?.(updated.earlyBird);
    }
  }
  
  // Weekend Warrior - 10 hours on a weekend
  if (updated.weekendWarrior && !updated.weekendWarrior.unlocked) {
    updated.weekendWarrior.progress = Math.min(Math.round(stats.achievements.weekendHours * 10) / 10, 10);
    if (stats.achievements.weekendHours >= 10) {
      updated.weekendWarrior = { ...updated.weekendWarrior, unlocked: true, progress: 10 };
      onUnlock?.(updated.weekendWarrior);
    }
  }
  
  // Genre Explorer - 10 different genres
  if (updated.genreExplorer && !updated.genreExplorer.unlocked) {
    updated.genreExplorer.progress = stats.genresWatched.length;
    if (stats.genresWatched.length >= 10) {
      updated.genreExplorer = { ...updated.genreExplorer, unlocked: true, progress: 10 };
      onUnlock?.(updated.genreExplorer);
    }
  }
  
  return { updated, stats };
}

export default {
  loadWatchStats,
  saveWatchStats,
  startWatchSession,
  updateWatchSession,
  endWatchSession,
  markAsWatched,
  getEpisodesWatchedToday,
  getTotalWatchHours,
  getTodayWatchMinutes,
  getWeekendWatchHours,
  getShowProgress,
  checkWatchAchievements
};
