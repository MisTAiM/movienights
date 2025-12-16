/* ========================================
   TMDB.JS - TMDB API Utilities
   ======================================== */

// API Configuration - decode from base64 like original
const getApiKey = () => {
  // Check for environment variable first
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TMDB_KEY) {
    return import.meta.env.VITE_TMDB_KEY;
  }
  // Fallback to decoded key (same as original HTML)
  try {
    const encoded = 'MTVkMmVhNmQwZGMxZDQ3NmVmYmNhM2ViYTJiOWJiZmI=';
    return atob(encoded);
  } catch {
    return '15d2ea6d0dc1d476efbca3eba2b9bbfb';
  }
};

const TMDB_API_KEY = getApiKey();
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// Log API key status (first 8 chars only for security)
console.log('TMDB API Key loaded:', TMDB_API_KEY ? `${TMDB_API_KEY.substring(0, 8)}...` : 'MISSING');

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response data
 */
async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  
  console.log('TMDB Fetch:', endpoint);
  
  try {
    const response = await fetch(url.toString());
    
    console.log('TMDB Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API Error Response:', errorText);
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('TMDB Data received:', endpoint, data?.results?.length || 'no results array');
    return data;
  } catch (error) {
    console.error('TMDB fetch error for', endpoint, ':', error.message);
    throw error;
  }
}

/**
 * Get trending content
 * @param {string} mediaType - 'all', 'movie', 'tv', 'person'
 * @param {string} timeWindow - 'day' or 'week'
 * @param {number} page - Page number
 * @returns {Promise<Object>} Trending results
 */
export async function getTrending(mediaType = 'all', timeWindow = 'week', page = 1) {
  const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`, { page });
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item))
  };
}

/**
 * Get popular movies
 * @param {number} page - Page number
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Movie results
 */
export async function getPopularMovies(page = 1, filters = {}) {
  const params = {
    page,
    sort_by: 'popularity.desc'
  };
  
  // Genre filter
  if (filters?.genre) {
    params.with_genres = filters.genre;
  }
  
  // Year filter - single year
  if (filters?.year) {
    params['primary_release_date.gte'] = `${filters.year}-01-01`;
    params['primary_release_date.lte'] = `${filters.year}-12-31`;
  }
  
  // Rating filter - minimum rating
  if (filters?.rating) {
    params['vote_average.gte'] = parseFloat(filters.rating);
    params['vote_count.gte'] = 100; // Ensure enough votes for meaningful rating
  }
  
  // Language filter - filter by original language
  if (filters?.language) {
    params.with_original_language = filters.language;
  }
  
  console.log('TMDB getPopularMovies params:', params);
  
  const data = await tmdbFetch('/discover/movie', params);
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item, 'movie'))
  };
}

/**
 * Get popular TV shows
 * @param {number} page - Page number
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} TV show results
 */
export async function getPopularTVShows(page = 1, filters = {}) {
  const params = {
    page,
    sort_by: 'popularity.desc'
  };
  
  // Genre filter
  if (filters?.genre) {
    params.with_genres = filters.genre;
  }
  
  // Year filter - single year
  if (filters?.year) {
    params['first_air_date.gte'] = `${filters.year}-01-01`;
    params['first_air_date.lte'] = `${filters.year}-12-31`;
  }
  
  // Rating filter - minimum rating
  if (filters?.rating) {
    params['vote_average.gte'] = parseFloat(filters.rating);
    params['vote_count.gte'] = 50;
  }
  
  // Language filter - filter by original language
  if (filters?.language) {
    params.with_original_language = filters.language;
  }
  
  console.log('TMDB getPopularTVShows params:', params);
  
  const data = await tmdbFetch('/discover/tv', params);
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item, 'tv'))
  };
}

/**
 * Search for movies, TV shows, or multi
 * @param {string} query - Search query
 * @param {string} type - 'movie', 'tv', or 'multi'
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */
export async function search(query, type = 'multi', page = 1) {
  const data = await tmdbFetch(`/search/${type}`, { query, page });
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item, type === 'multi' ? item.media_type : type))
  };
}

/**
 * Get movie details
 * @param {number} id - Movie ID
 * @returns {Promise<Object>} Movie details
 */
export async function getMovieDetails(id) {
  const data = await tmdbFetch(`/movie/${id}`, {
    append_to_response: 'credits,videos,recommendations'
  });
  return normalizeItem(data, 'movie');
}

/**
 * Get TV show details
 * @param {number} id - TV show ID
 * @returns {Promise<Object>} TV show details
 */
export async function getTVShowDetails(id) {
  const data = await tmdbFetch(`/tv/${id}`, {
    append_to_response: 'credits,videos,recommendations'
  });
  return normalizeItem(data, 'tv');
}

/**
 * Get TV show seasons
 * @param {number} id - TV show ID
 * @returns {Promise<Object>} TV show with seasons data
 */
export async function getTVShowSeasons(id) {
  const data = await tmdbFetch(`/tv/${id}`);
  return {
    id: data?.id,
    name: data?.name,
    numberOfSeasons: data?.number_of_seasons || 0,
    seasons: (data?.seasons || []).filter(s => s.season_number > 0).map(s => ({
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      airDate: s.air_date,
      poster: s.poster_path ? `${TMDB_IMG_URL}${s.poster_path}` : null
    }))
  };
}

/**
 * Get TV season episodes
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @returns {Promise<Array>} Episodes array
 */
export async function getSeasonEpisodes(tvId, seasonNumber) {
  const data = await tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
  return (data?.episodes || []).map(ep => ({
    episodeNumber: ep.episode_number,
    name: ep.name,
    overview: ep.overview,
    airDate: ep.air_date,
    runtime: ep.runtime,
    still: ep.still_path ? `${TMDB_IMG_URL}${ep.still_path}` : null
  }));
}

/**
 * Get movie runtime
 * @param {number} id - Movie ID
 * @returns {Promise<number>} Runtime in minutes
 */
export async function getMovieRuntime(id) {
  const data = await tmdbFetch(`/movie/${id}`);
  return data.runtime || 0;
}

/**
 * Get trailer for movie or TV show
 * @param {number} id - Content ID
 * @param {string} type - 'movie' or 'tv'
 * @returns {Promise<string|null>} YouTube video key or null
 */
export async function getTrailer(id, type = 'movie') {
  const data = await tmdbFetch(`/${type}/${id}/videos`);
  const results = data?.results || [];
  const trailer = results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  ) || results.find(
    v => v.site === 'YouTube'
  );
  return trailer ? trailer.key : null;
}

/**
 * Get cast and crew
 * @param {number} id - Content ID
 * @param {string} type - 'movie' or 'tv'
 * @returns {Promise<Object>} Cast and crew data
 */
export async function getCredits(id, type = 'movie') {
  const data = await tmdbFetch(`/${type}/${id}/credits`);
  const cast = data?.cast || [];
  const crew = data?.crew || [];
  return {
    cast: cast.slice(0, 12).map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile: actor.profile_path ? `${TMDB_IMG_URL}${actor.profile_path}` : null
    })),
    crew: crew
      .filter(c => ['Director', 'Writer', 'Screenplay', 'Producer', 'Executive Producer'].includes(c.job))
      .reduce((acc, c) => {
        if (!acc[c.job]) acc[c.job] = [];
        acc[c.job].push(c.name);
        return acc;
      }, {})
  };
}

/**
 * Get recommendations
 * @param {number} id - Content ID
 * @param {string} type - 'movie' or 'tv'
 * @param {number} page - Page number
 * @returns {Promise<Array>} Recommended items
 */
export async function getRecommendations(id, type = 'movie', page = 1) {
  const data = await tmdbFetch(`/${type}/${id}/recommendations`, { page });
  return data.results.slice(0, 6).map(item => normalizeItem(item, type));
}

/**
 * Get genre list
 * @param {string} type - 'movie' or 'tv'
 * @returns {Promise<Array>} Genre list
 */
export async function getGenres(type = 'movie') {
  const data = await tmdbFetch(`/genre/${type}/list`);
  return data.genres;
}

/**
 * Normalize item data to consistent format
 * @param {Object} item - Raw API item
 * @param {string} type - Media type
 * @returns {Object} Normalized item
 */
function normalizeItem(item, type = null) {
  const mediaType = type || item.media_type || 'movie';
  
  return {
    id: item.id,
    type: mediaType,
    title: item.title || item.name,
    originalTitle: item.original_title || item.original_name,
    overview: item.overview || 'No description available',
    posterPath: item.poster_path,
    poster: item.poster_path ? `${TMDB_IMG_URL}${item.poster_path}` : null,
    backdropPath: item.backdrop_path,
    backdrop: item.backdrop_path ? `${TMDB_IMG_ORIGINAL}${item.backdrop_path}` : null,
    releaseDate: item.release_date || item.first_air_date,
    year: (item.release_date || item.first_air_date || '').split('-')[0],
    voteAverage: item.vote_average || 0,
    voteCount: item.vote_count || 0,
    popularity: item.popularity || 0,
    genreIds: item.genre_ids || [],
    genres: item.genres || [],
    runtime: item.runtime || null,
    numberOfSeasons: item.number_of_seasons || null,
    numberOfEpisodes: item.number_of_episodes || null,
    status: item.status || null,
    // Keep original for compatibility
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: item.release_date || item.first_air_date
  };
}

/**
 * Get poster URL from path
 * @param {string} path - Poster path
 * @param {string} size - Image size (w500, original, etc.)
 * @returns {string} Full poster URL
 */
export function getPosterUrl(path, size = 'w500') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Get upcoming movies within a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} page - Page number
 * @returns {Promise<Object>} Upcoming movies
 */
export async function getUpcomingMovies(startDate, endDate, page = 1) {
  const params = {
    page,
    sort_by: 'primary_release_date.asc',
    'primary_release_date.gte': startDate,
    'primary_release_date.lte': endDate,
    'vote_count.gte': 0
  };
  
  const data = await tmdbFetch('/discover/movie', params);
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item, 'movie'))
  };
}

/**
 * Get upcoming TV shows within a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} page - Page number
 * @returns {Promise<Object>} Upcoming TV shows
 */
export async function getUpcomingTV(startDate, endDate, page = 1) {
  const params = {
    page,
    sort_by: 'first_air_date.asc',
    'first_air_date.gte': startDate,
    'first_air_date.lte': endDate
  };
  
  const data = await tmdbFetch('/discover/tv', params);
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item, 'tv'))
  };
}

/**
 * Get content by genre
 * @param {number} genreId - Genre ID
 * @param {string} type - 'movie' or 'tv'
 * @param {number} page - Page number
 * @returns {Promise<Object>} Content by genre
 */
export async function getByGenre(genreId, type = 'movie', page = 1) {
  const endpoint = `/discover/${type}`;
  const params = {
    page,
    sort_by: 'popularity.desc',
    with_genres: genreId,
    'vote_count.gte': 50
  };
  
  const data = await tmdbFetch(endpoint, params);
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item, type))
  };
}

/**
 * Get similar content
 * @param {number} id - Content ID
 * @param {string} type - 'movie' or 'tv'
 * @param {number} page - Page number
 * @returns {Promise<Object>} Similar content
 */
export async function getSimilar(id, type = 'movie', page = 1) {
  const data = await tmdbFetch(`/${type}/${id}/similar`, { page });
  return {
    ...data,
    results: (data?.results || []).map(item => normalizeItem(item, type))
  };
}

export default {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  search,
  getMovieDetails,
  getTVShowDetails,
  getTVShowSeasons,
  getSeasonEpisodes,
  getMovieRuntime,
  getTrailer,
  getCredits,
  getRecommendations,
  getGenres,
  getPosterUrl,
  getUpcomingMovies,
  getUpcomingTV,
  getByGenre,
  getSimilar,
  TMDB_IMG_URL,
  TMDB_IMG_ORIGINAL
};
