/* ========================================
   HELPERS.JS - General Helper Functions
   ======================================== */

/**
 * Get streaming sources for movies/TV shows
 * @param {Object} item - Content item
 * @param {number} season - Season number (for TV)
 * @param {number} episode - Episode number (for TV)
 * @returns {Array} Array of streaming source objects
 */
export function getStreamingSources(item, season = null, episode = null) {
  const sources = [];
  
  if (item.type === 'movie') {
    sources.push(
      { name: 'Videasy', url: `https://player.videasy.net/movie/${item.id}?color=d4af37&overlay=true` },
      { name: 'VidSrc CC', url: `https://vidsrc.cc/v2/embed/movie/tmdb${item.id}` },
      { name: 'VidSrc ICU', url: `https://vidsrc.icu/embed/movie/${item.id}` },
      { name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/movie/${item.id}` },
      { name: '2Embed', url: `https://www.2embed.cc/embed/${item.id}` },
      { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${item.id}&tmdb=1` }
    );
  } else if (item.type === 'tv') {
    const s = season || 1;
    const e = episode || 1;
    
    sources.push(
      { name: 'Videasy', url: `https://player.videasy.net/tv/${item.id}/${s}/${e}?color=d4af37&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&overlay=true` },
      { name: 'VidSrc CC', url: `https://vidsrc.cc/v2/embed/tv/tmdb${item.id}/${s}/${e}` },
      { name: 'VidSrc ICU', url: `https://vidsrc.icu/embed/tv/${item.id}/${s}/${e}` },
      { name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/tv/${item.id}/${s}/${e}` },
      { name: '2Embed', url: `https://www.2embed.cc/embedtv/${item.id}?s=${s}&e=${e}` },
      { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${item.id}&tmdb=1&s=${s}&e=${e}` }
    );
  } else if (item.type === 'anime') {
    const ep = episode || 1;
    const isDub = item.language === 'dub';
    const anilistId = item.id; // AniList ID
    
    // These providers use AniList IDs - note the required prefixes!
    sources.push(
      // VidSrc.cc - REQUIRES 'ani' prefix for AniList IDs!
      // Format: https://vidsrc.cc/v2/embed/anime/ani{anilist_id}/{episode}/{sub|dub}
      { 
        name: 'VidSrc CC', 
        url: `https://vidsrc.cc/v2/embed/anime/ani${anilistId}/${ep}/${isDub ? 'dub' : 'sub'}` 
      },
      
      // VidSrc.icu - Uses AniList ID directly with 0=sub, 1=dub
      // Format: https://vidsrc.icu/embed/anime/{anilist_id}/{episode}/{0|1}
      { 
        name: 'VidSrc ICU', 
        url: `https://vidsrc.icu/embed/anime/${anilistId}/${ep}/${isDub ? '1' : '0'}` 
      },
      
      // VidPlus/VidSrc.co - Uses AniList ID directly
      // Format: https://player.vidplus.to/embed/anime/{anilist_id}/{episode}?dub={true|false}
      { 
        name: 'VidPlus', 
        url: `https://player.vidplus.to/embed/anime/${anilistId}/${ep}?dub=${isDub}` 
      },
      
      // Videasy Anime - Uses AniList ID
      { 
        name: 'Videasy', 
        url: `https://player.videasy.net/anime/${anilistId}/${ep}?${isDub ? 'dub=true&' : ''}color=d4af37&nextEpisode=true&autoplayNextEpisode=true&overlay=true` 
      },
      
      // 2Anime - Uses AniList ID
      { 
        name: '2Anime', 
        url: `https://2anime.xyz/embed/${anilistId}/${ep}${isDub ? '?dub=1' : ''}` 
      },
      
      // AnimeEmbed - Title-based fallback
      { 
        name: 'AnimeEmbed', 
        url: `https://anime.autoembed.cc/embed/${createTitleSlug(item.title || item.name)}-episode-${ep}` 
      }
    );
  }
  
  return sources;
}

/**
 * Create URL-friendly title slug
 */
function createTitleSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
  } catch {
    return dateString;
  }
}

/**
 * Format runtime to hours and minutes
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime
 */
export function formatRuntime(minutes) {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Calculate end time based on runtime
 * @param {number} runtime - Runtime in minutes
 * @returns {string} Formatted end time
 */
export function calculateEndTime(runtime) {
  if (!runtime) return '';
  
  const now = new Date();
  const endTime = new Date(now.getTime() + runtime * 60000);
  
  return endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get year range for filter
 * @param {number} startYear - Starting year
 * @returns {Array} Array of years
 */
export function getYearRange(startYear = 1990) {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }
  
  return years;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate room code for watch together
 * @param {number} length - Code length
 * @returns {string} Room code
 */
export function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Generate unique user ID for watch party
 * @returns {string} Unique user ID
 */
export function generateUserId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomPart}`;
}

/**
 * Create share link with collection data
 * @param {Object} data - Data to encode
 * @returns {string} Share URL
 */
export function createShareLink(data) {
  try {
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}${window.location.pathname}?import=${encoded}`;
  } catch (error) {
    console.error('Error creating share link:', error);
    return '';
  }
}

/**
 * Parse share link data
 * @param {string} encodedData - Base64 encoded data
 * @returns {Object|null} Parsed data or null
 */
export function parseShareLink(encodedData) {
  try {
    return JSON.parse(atob(encodedData));
  } catch (error) {
    console.error('Error parsing share link:', error);
    return null;
  }
}

/**
 * Generate simple QR code pattern on canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} url - URL to encode
 */
export function generateQRCode(canvas, url) {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  
  // White background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  
  // Generate pattern based on URL
  ctx.fillStyle = '#000';
  const encoded = btoa(url).split('').map(c => c.charCodeAt(0));
  const cellSize = 10;
  
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      if (encoded[(i * 20 + j) % encoded.length] % 2 === 0) {
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }
  
  // Add positioning patterns (corners)
  const drawPositionPattern = (x, y) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 70, 70);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 10, 50, 50);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 20, y + 20, 30, 30);
  };
  
  drawPositionPattern(0, 0);
  drawPositionPattern(130, 0);
  drawPositionPattern(0, 130);
}

/**
 * Sort items by various criteria
 * @param {Array} items - Items to sort
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted items
 */
export function sortItems(items, sortBy) {
  const sorted = [...items];
  
  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => 
        (a.title || a.name || '').localeCompare(b.title || b.name || '')
      );
    case 'rating':
      return sorted.sort((a, b) => 
        (b.vote_average || b.voteAverage || 0) - (a.vote_average || a.voteAverage || 0)
      );
    case 'year':
      return sorted.sort((a, b) => {
        const yearA = parseInt((a.release_date || a.releaseDate || '0').split('-')[0]);
        const yearB = parseInt((b.release_date || b.releaseDate || '0').split('-')[0]);
        return yearB - yearA;
      });
    case 'dateAdded':
      return sorted.sort((a, b) => 
        new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0)
      );
    case 'userRating':
      return sorted.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    default:
      return sorted;
  }
}

/**
 * Filter items by various criteria
 * @param {Array} items - Items to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered items
 */
export function filterItems(items, filters) {
  return items.filter(item => {
    // Genre filter
    if (filters.genre) {
      const itemGenres = item.genre_ids || item.genreIds || [];
      if (!itemGenres.includes(parseInt(filters.genre))) {
        return false;
      }
    }
    
    // Year filter
    if (filters.year) {
      const itemYear = (item.release_date || item.releaseDate || '').split('-')[0];
      if (itemYear !== filters.year) {
        return false;
      }
    }
    
    // Rating filter
    if (filters.rating) {
      const itemRating = item.vote_average || item.voteAverage || 0;
      const minRating = parseFloat(filters.rating);
      if (itemRating < minRating) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }
    
    return true;
  });
}

/**
 * Play "Elysium" - Luxury Cinematic Intro Sound v2
 * Total duration: 3.4 seconds
 * A sophisticated, multi-layered audio experience
 */
export function playIntroSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Handle browser autoplay restrictions
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const now = audioContext.currentTime;
    
    // Master output with compression for polish
    const masterGain = audioContext.createGain();
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    masterGain.gain.setValueAtTime(0.5, now);
    masterGain.connect(compressor);
    compressor.connect(audioContext.destination);
    
    // Create lush reverb using multiple delays (Valhalla Shimmer approximation)
    const createLushReverb = () => {
      const input = audioContext.createGain();
      const output = audioContext.createGain();
      output.gain.value = 0.6;
      
      const delays = [0.03, 0.07, 0.11, 0.17, 0.23, 0.31];
      const feedbacks = [0.5, 0.45, 0.4, 0.35, 0.3, 0.25];
      
      delays.forEach((time, i) => {
        const delay = audioContext.createDelay();
        const feedback = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        delay.delayTime.value = time;
        feedback.gain.value = feedbacks[i];
        filter.type = 'lowpass';
        filter.frequency.value = 4000 - (i * 400);
        
        input.connect(delay);
        delay.connect(filter);
        filter.connect(feedback);
        feedback.connect(delay);
        filter.connect(output);
      });
      
      return { input, output };
    };
    
    const reverb = createLushReverb();
    reverb.output.connect(masterGain);
    
    // ═══════════════════════════════════════════════════════════════
    // 1. SUB-BASS FOUNDATION (0.00–1.00s)
    // Black marble and velvet feeling
    // ═══════════════════════════════════════════════════════════════
    
    // Ultra-deep sub-bass (28-32 Hz) - felt in the chest
    const subBass = audioContext.createOscillator();
    const subBassGain = audioContext.createGain();
    const subBassFilter = audioContext.createBiquadFilter();
    
    subBass.type = 'sine';
    subBass.frequency.setValueAtTime(30, now);
    subBass.frequency.linearRampToValueAtTime(28, now + 1);
    
    subBassFilter.type = 'lowpass';
    subBassFilter.frequency.value = 60;
    
    subBassGain.gain.setValueAtTime(0, now);
    subBassGain.gain.linearRampToValueAtTime(0.7, now + 0.3);
    subBassGain.gain.setValueAtTime(0.7, now + 0.7);
    subBassGain.gain.linearRampToValueAtTime(0, now + 1.2);
    
    subBass.connect(subBassFilter);
    subBassFilter.connect(subBassGain);
    subBassGain.connect(masterGain);
    
    subBass.start(now);
    subBass.stop(now + 1.2);
    
    // Warm A1 (55 Hz) - felted grand piano with sustain pedal
    // Add harmonics for piano-like tone with soft attack
    const pianoHarmonics = [1, 2, 3, 4, 5, 6];
    const harmonicGains = [1, 0.5, 0.33, 0.25, 0.2, 0.15];
    
    pianoHarmonics.forEach((harmonic, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = 55 * harmonic;
      
      // Warm filter for felted piano
      filter.type = 'lowpass';
      filter.frequency.value = 300 + (i * 50);
      filter.Q.value = 0.5;
      
      // Soft attack, long blooming decay
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12 * harmonicGains[i], now + 0.2);
      gain.gain.setValueAtTime(0.12 * harmonicGains[i], now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      gain.connect(reverb.input);
      
      osc.start(now);
      osc.stop(now + 1.8);
    });
    
    // ═══════════════════════════════════════════════════════════════
    // 2. RISING LUMINARY SHIMMER (0.50–1.80s)
    // Liquid gold pouring upward
    // ═══════════════════════════════════════════════════════════════
    
    const shimmerNotes = [
      { freq: 2637.02, delay: 0, name: 'E7' },      // Glassy high E7 first
      { freq: 1108.73, delay: 0.25, name: 'C#6' },  // Then C#6
      { freq: 1760.00, delay: 0.45, name: 'A6' },   // Then A6
      { freq: 1318.51, delay: 0.65, name: 'E6' },   // Finally E6
    ];
    
    shimmerNotes.forEach(note => {
      const startTime = now + 0.5 + note.delay;
      
      // Main shimmer tone with lush reverb
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, startTime);
      
      filter.type = 'highpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.7;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.15);
      gain.gain.setValueAtTime(0.08, startTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.02, startTime + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      gain.connect(reverb.input);
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
      
      // Granulated diamond-like particles (reversed piano grains)
      for (let i = 0; i < 6; i++) {
        const sparkle = audioContext.createOscillator();
        const sparkleGain = audioContext.createGain();
        const sparkleFilter = audioContext.createBiquadFilter();
        
        const sparkleTime = startTime + 0.08 + (i * 0.1);
        const sparkleFreq = note.freq * (1.5 + Math.random() * 0.5);
        
        sparkle.type = 'sine';
        sparkle.frequency.value = sparkleFreq;
        
        sparkleFilter.type = 'bandpass';
        sparkleFilter.frequency.value = sparkleFreq;
        sparkleFilter.Q.value = 12;
        
        // Quick fade in (reversed grain feel)
        sparkleGain.gain.setValueAtTime(0, sparkleTime);
        sparkleGain.gain.linearRampToValueAtTime(0.025, sparkleTime + 0.015);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001, sparkleTime + 0.12);
        
        sparkle.connect(sparkleFilter);
        sparkleFilter.connect(sparkleGain);
        sparkleGain.connect(reverb.input);
        
        sparkle.start(sparkleTime);
        sparkle.stop(sparkleTime + 0.12);
      }
    });
    
    // ═══════════════════════════════════════════════════════════════
    // 3. SIGNATURE MOMENT – "THE CRYSTAL CROWN" (1.65s)
    // Like a knife through silk - the moment people remember forever
    // ═══════════════════════════════════════════════════════════════
    
    const crystalTime = now + 1.65;
    
    // Side-chain duck everything else
    masterGain.gain.setValueAtTime(0.5, crystalTime - 0.05);
    masterGain.gain.linearRampToValueAtTime(0.32, crystalTime);
    masterGain.gain.linearRampToValueAtTime(0.5, crystalTime + 0.35);
    
    // Main crystal bowl E6 - hand-blown glass armonica
    const crystal = audioContext.createOscillator();
    const crystalGain = audioContext.createGain();
    const crystalFilter = audioContext.createBiquadFilter();
    
    crystal.type = 'sine';
    crystal.frequency.setValueAtTime(1318.51, crystalTime);
    
    // Resonant peak for crystal clarity
    crystalFilter.type = 'peaking';
    crystalFilter.frequency.value = 1318.51;
    crystalFilter.Q.value = 8;
    crystalFilter.gain.value = 4;
    
    // 8ms attack - sharp but not harsh
    crystalGain.gain.setValueAtTime(0, crystalTime);
    crystalGain.gain.linearRampToValueAtTime(0.38, crystalTime + 0.008);
    crystalGain.gain.setValueAtTime(0.38, crystalTime + 0.12);
    crystalGain.gain.exponentialRampToValueAtTime(0.15, crystalTime + 0.5);
    crystalGain.gain.exponentialRampToValueAtTime(0.001, crystalTime + 1.6);
    
    crystal.connect(crystalFilter);
    crystalFilter.connect(crystalGain);
    crystalGain.connect(masterGain);
    crystalGain.connect(reverb.input);
    
    crystal.start(crystalTime);
    crystal.stop(crystalTime + 1.6);
    
    // E7 harmonic overtone
    const crystalOvertone = audioContext.createOscillator();
    const overtoneGain = audioContext.createGain();
    
    crystalOvertone.type = 'sine';
    crystalOvertone.frequency.value = 2637.02;
    
    overtoneGain.gain.setValueAtTime(0, crystalTime);
    overtoneGain.gain.linearRampToValueAtTime(0.14, crystalTime + 0.008);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, crystalTime + 1.1);
    
    crystalOvertone.connect(overtoneGain);
    overtoneGain.connect(masterGain);
    overtoneGain.connect(reverb.input);
    
    crystalOvertone.start(crystalTime);
    crystalOvertone.stop(crystalTime + 1.1);
    
    // Subtle 13th (C natural) for mystery and richness
    const mystery13th = audioContext.createOscillator();
    const mystery13thGain = audioContext.createGain();
    
    mystery13th.type = 'sine';
    mystery13th.frequency.value = 2093.00;
    
    mystery13thGain.gain.setValueAtTime(0, crystalTime + 0.04);
    mystery13thGain.gain.linearRampToValueAtTime(0.045, crystalTime + 0.1);
    mystery13thGain.gain.exponentialRampToValueAtTime(0.001, crystalTime + 0.9);
    
    mystery13th.connect(mystery13thGain);
    mystery13thGain.connect(reverb.input);
    
    mystery13th.start(crystalTime + 0.04);
    mystery13th.stop(crystalTime + 0.9);
    
    // Air band enhancement (10-16 kHz) - diamonds sparkling in sunlight
    for (let i = 0; i < 10; i++) {
      const air = audioContext.createOscillator();
      const airGain = audioContext.createGain();
      const airFilter = audioContext.createBiquadFilter();
      
      const airTime = crystalTime + (i * 0.025);
      air.type = 'sine';
      air.frequency.value = 10000 + Math.random() * 6000;
      
      airFilter.type = 'bandpass';
      airFilter.frequency.value = air.frequency.value;
      airFilter.Q.value = 25;
      
      airGain.gain.setValueAtTime(0, airTime);
      airGain.gain.linearRampToValueAtTime(0.012, airTime + 0.008);
      airGain.gain.exponentialRampToValueAtTime(0.001, airTime + 0.08);
      
      air.connect(airFilter);
      airFilter.connect(airGain);
      airGain.connect(masterGain);
      
      air.start(airTime);
      air.stop(airTime + 0.08);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 4. RESOLUTION & AFTERGLOW (2.10–3.40s)
    // Portal gently closing
    // ═══════════════════════════════════════════════════════════════
    
    const resolutionTime = now + 2.1;
    
    // E major 13(add9) voiced across 5 octaves
    // Vintage Fazioli grand piano tone
    const resolutionChord = [
      { freq: 82.41, vol: 0.14 },    // E2 - deep foundation
      { freq: 123.47, vol: 0.10 },   // B2
      { freq: 164.81, vol: 0.12 },   // E3
      { freq: 246.94, vol: 0.09 },   // B3
      { freq: 311.13, vol: 0.08 },   // D#4
      { freq: 369.99, vol: 0.07 },   // F#4 (add9)
      { freq: 440.00, vol: 0.06 },   // A4 (13th)
      { freq: 554.37, vol: 0.05 },   // C#5
      { freq: 659.25, vol: 0.04 },   // E5
      { freq: 987.77, vol: 0.03 },   // B5
      { freq: 1318.51, vol: 0.025 }, // E6
    ];
    
    resolutionChord.forEach((note, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, resolutionTime);
      // Pitch bend down 15 cents in final 0.8s (portal closing)
      osc.frequency.linearRampToValueAtTime(note.freq, resolutionTime + 0.5);
      osc.frequency.linearRampToValueAtTime(note.freq * 0.9914, resolutionTime + 1.3);
      
      filter.type = 'lowpass';
      filter.frequency.value = 1800 + (index * 180);
      
      const staggerDelay = index * 0.018;
      gain.gain.setValueAtTime(0, resolutionTime + staggerDelay);
      gain.gain.linearRampToValueAtTime(note.vol, resolutionTime + staggerDelay + 0.08);
      gain.gain.setValueAtTime(note.vol, resolutionTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(note.vol * 0.5, resolutionTime + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, resolutionTime + 1.3);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      gain.connect(reverb.input);
      
      osc.start(resolutionTime + staggerDelay);
      osc.stop(resolutionTime + 1.4);
    });
    
    // Ethereal choir - 8 female operatic sopranos "ah" (huge church, distant)
    const choirFreqs = [554.37, 659.25, 830.61, 987.77, 1108.73];
    
    choirFreqs.forEach((freq, i) => {
      const choirOsc = audioContext.createOscillator();
      const choirGain = audioContext.createGain();
      const choirFilter = audioContext.createBiquadFilter();
      const vibrato = audioContext.createOscillator();
      const vibratoGain = audioContext.createGain();
      
      // Subtle vibrato for vocal quality
      vibrato.frequency.value = 5.5;
      vibratoGain.gain.value = 4;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(choirOsc.frequency);
      
      choirOsc.type = 'sine';
      choirOsc.frequency.value = freq;
      
      // Formant filter for "ah" vowel
      choirFilter.type = 'bandpass';
      choirFilter.frequency.value = freq;
      choirFilter.Q.value = 6;
      
      const choirDelay = 0.08 + (i * 0.04);
      choirGain.gain.setValueAtTime(0, resolutionTime + choirDelay);
      choirGain.gain.linearRampToValueAtTime(0.022, resolutionTime + choirDelay + 0.18);
      choirGain.gain.setValueAtTime(0.022, resolutionTime + 0.6);
      choirGain.gain.exponentialRampToValueAtTime(0.001, resolutionTime + 1.25);
      
      choirOsc.connect(choirFilter);
      choirFilter.connect(choirGain);
      choirGain.connect(reverb.input);
      
      vibrato.start(resolutionTime + choirDelay);
      choirOsc.start(resolutionTime + choirDelay);
      vibrato.stop(resolutionTime + 1.3);
      choirOsc.stop(resolutionTime + 1.3);
    });
    
    // Reversed shimmer tail - time bending (pitch down 50 cents)
    const reversedShimmerTime = resolutionTime + 0.35;
    shimmerNotes.slice().reverse().forEach((note, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = note.freq * 0.9715; // -50 cents
      
      const delay = i * 0.07;
      gain.gain.setValueAtTime(0.028, reversedShimmerTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, reversedShimmerTime + delay + 0.35);
      
      osc.connect(gain);
      gain.connect(reverb.input);
      
      osc.start(reversedShimmerTime + delay);
      osc.stop(reversedShimmerTime + delay + 0.35);
    });
    
    // ═══════════════════════════════════════════════════════════════
    // 5. HIDDEN LUXURY DETAILS (entire duration, -28 LUFS)
    // Priceless analog warmth - subliminal
    // ═══════════════════════════════════════════════════════════════
    
    // Subtle vinyl crackle at -60dB (almost subliminal)
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3.4, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() > 0.9998 ? (Math.random() - 0.5) * 0.25 : 0;
    }
    
    const vinylNoise = audioContext.createBufferSource();
    const vinylGain = audioContext.createGain();
    const vinylFilter = audioContext.createBiquadFilter();
    
    vinylNoise.buffer = noiseBuffer;
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.value = 3500;
    vinylFilter.Q.value = 0.8;
    
    vinylGain.gain.value = 0.006;
    
    vinylNoise.connect(vinylFilter);
    vinylFilter.connect(vinylGain);
    vinylGain.connect(masterGain);
    
    vinylNoise.start(now);
    
    // Distant thunder rumble (subliminal)
    const thunderBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3.4, audioContext.sampleRate);
    const thunderData = thunderBuffer.getChannelData(0);
    for (let i = 0; i < thunderData.length; i++) {
      thunderData[i] = (Math.random() - 0.5) * 0.015;
    }
    
    const thunder = audioContext.createBufferSource();
    const thunderGain = audioContext.createGain();
    const thunderFilter = audioContext.createBiquadFilter();
    
    thunder.buffer = thunderBuffer;
    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.value = 80;
    
    thunderGain.gain.value = 0.012;
    
    thunder.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(masterGain);
    
    thunder.start(now);
    
    // Final breath - intimate female vocalist whisper (100ms)
    const breathTime = now + 3.3;
    const breathBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    const breathData = breathBuffer.getChannelData(0);
    for (let i = 0; i < breathData.length; i++) {
      const env = Math.sin((i / breathData.length) * Math.PI);
      breathData[i] = (Math.random() - 0.5) * env * 0.08;
    }
    
    const breath = audioContext.createBufferSource();
    const breathGain = audioContext.createGain();
    const breathFilter = audioContext.createBiquadFilter();
    
    breath.buffer = breathBuffer;
    breathFilter.type = 'bandpass';
    breathFilter.frequency.value = 2200;
    breathFilter.Q.value = 0.4;
    
    breathGain.gain.value = 0.025;
    
    breath.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(masterGain);
    
    breath.start(breathTime);
    
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}

/**
 * Detect device type and capabilities
 * @returns {Object} Device information
 */
export function detectDevice() {
  const userAgent = navigator.userAgent;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || 
    window.innerWidth < 768;
  
  const isTV = window.innerWidth >= 1921 || /TV|SMART|LG|Samsung|Roku|AppleTV/i.test(userAgent);
  
  const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth >= 768;
  
  let performance = 'high';
  if (navigator.deviceMemory) {
    if (navigator.deviceMemory <= 2) performance = 'low';
    else if (navigator.deviceMemory <= 4) performance = 'medium';
  }
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    performance = 'low';
  }
  if (isMobile && performance === 'high') performance = 'medium';
  
  return {
    isMobile,
    isTV,
    isTablet,
    isDesktop: !isMobile && !isTV && !isTablet,
    performance,
    memory: navigator.deviceMemory || 'unknown',
    cores: navigator.hardwareConcurrency || 'unknown',
    connection: navigator.connection?.effectiveType || 'unknown'
  };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} offset - Offset in pixels
 * @returns {boolean} Is in viewport
 */
export function isInViewport(element, offset = 0) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
}

export default {
  getStreamingSources,
  formatDate,
  formatRuntime,
  calculateEndTime,
  getYearRange,
  debounce,
  throttle,
  generateId,
  generateRoomCode,
  createShareLink,
  parseShareLink,
  generateQRCode,
  sortItems,
  filterItems,
  playIntroSound,
  detectDevice,
  isInViewport
};
