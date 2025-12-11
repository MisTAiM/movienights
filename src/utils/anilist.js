/* ========================================
   ANILIST.JS - AniList GraphQL API Utilities
   ======================================== */

const ANILIST_API_URL = 'https://graphql.anilist.co';

/**
 * Execute GraphQL query
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} Query result
 */
async function graphqlFetch(query, variables = {}) {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }
    
    return data.data;
  } catch (error) {
    console.error('AniList fetch error:', error);
    throw error;
  }
}

/**
 * Get popular anime with filters
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Anime results
 */
export async function getPopularAnime(page = 1, perPage = 24, filters = {}) {
  console.log('AniList getPopularAnime called with filters:', filters);
  
  const query = `
    query (
      $page: Int, 
      $perPage: Int, 
      $sort: [MediaSort], 
      $genre: String, 
      $seasonYear: Int, 
      $averageScore_greater: Int,
      $format: MediaFormat,
      $status: MediaStatus
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(
          type: ANIME, 
          sort: $sort,
          genre: $genre,
          seasonYear: $seasonYear,
          averageScore_greater: $averageScore_greater,
          format: $format,
          status: $status
        ) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          averageScore
          seasonYear
          season
          description
          episodes
          duration
          format
          status
          genres
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    }
  `;
  
  // Build variables from filters
  const variables = {
    page,
    perPage,
    sort: getSortMapping(filters.sort)
  };
  
  // Genre filter - AniList uses genre name strings
  if (filters.genre) {
    variables.genre = filters.genre;
  }
  
  // Year filter
  if (filters.year) {
    variables.seasonYear = parseInt(filters.year);
  }
  
  // Rating filter - AniList uses 0-100 scale, we use 1-10
  if (filters.rating) {
    variables.averageScore_greater = parseInt(filters.rating) * 10;
  }
  
  // Format filter (TV, MOVIE, OVA, etc.)
  if (filters.format) {
    variables.format = filters.format;
  }
  
  // Status filter (RELEASING, FINISHED, etc.)
  if (filters.status) {
    variables.status = filters.status;
  }
  
  console.log('AniList query variables:', variables);
  
  const data = await graphqlFetch(query, variables);
  
  return {
    pageInfo: data.Page.pageInfo,
    results: data.Page.media.map(normalizeAnime)
  };
}

/**
 * Search anime
 * @param {string} searchQuery - Search query
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Search results
 */
export async function searchAnime(searchQuery, page = 1, perPage = 24) {
  const query = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(search: $search, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          averageScore
          seasonYear
          description
          episodes
          duration
          format
          status
          genres
        }
      }
    }
  `;
  
  const data = await graphqlFetch(query, { search: searchQuery, page, perPage });
  
  return {
    pageInfo: data.Page.pageInfo,
    results: data.Page.media.map(normalizeAnime)
  };
}

/**
 * Get anime details by ID
 * @param {number} id - AniList anime ID
 * @returns {Promise<Object>} Anime details
 */
export async function getAnimeDetails(id) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
        }
        bannerImage
        averageScore
        meanScore
        popularity
        favourites
        seasonYear
        season
        description
        episodes
        duration
        format
        status
        genres
        tags {
          name
          rank
        }
        studios(isMain: true) {
          nodes {
            name
          }
        }
        characters(sort: ROLE, perPage: 12) {
          nodes {
            name {
              full
            }
            image {
              large
            }
          }
          edges {
            role
            voiceActors(language: JAPANESE, sort: RELEVANCE) {
              name {
                full
              }
              image {
                large
              }
            }
          }
        }
        staff(perPage: 6) {
          nodes {
            name {
              full
            }
            image {
              large
            }
          }
          edges {
            role
          }
        }
        recommendations(perPage: 6) {
          nodes {
            mediaRecommendation {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
              }
              averageScore
              seasonYear
              episodes
              format
            }
          }
        }
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  `;
  
  const data = await graphqlFetch(query, { id });
  return normalizeAnimeDetails(data.Media);
}

/**
 * Get trending anime
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Trending anime
 */
export async function getTrendingAnime(page = 1, perPage = 24) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          hasNextPage
        }
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          idMal
          title {
            romaji
            english
          }
          coverImage {
            large
            extraLarge
          }
          averageScore
          seasonYear
          description
          episodes
          format
          status
          genres
        }
      }
    }
  `;
  
  const data = await graphqlFetch(query, { page, perPage });
  
  return {
    pageInfo: data.Page.pageInfo,
    results: data.Page.media.map(normalizeAnime)
  };
}

/**
 * Get anime genres
 * @returns {Promise<Array>} List of genres
 */
export async function getAnimeGenres() {
  const query = `
    query {
      GenreCollection
    }
  `;
  
  const data = await graphqlFetch(query);
  return data.GenreCollection;
}

/**
 * Normalize anime data to consistent format
 * @param {Object} anime - Raw AniList anime data
 * @returns {Object} Normalized anime object
 */
function normalizeAnime(anime) {
  return {
    id: anime.id,
    malId: anime.idMal,
    type: 'anime',
    title: anime.title.english || anime.title.romaji,
    originalTitle: anime.title.romaji,
    nativeTitle: anime.title.native,
    overview: anime.description ? anime.description.replace(/<[^>]*>/g, '') : 'No description available',
    poster: anime.coverImage.extraLarge || anime.coverImage.large,
    posterPath: anime.coverImage.extraLarge || anime.coverImage.large,
    backdrop: anime.bannerImage,
    voteAverage: anime.averageScore ? anime.averageScore / 10 : 0,
    year: anime.seasonYear,
    releaseDate: anime.seasonYear ? `${anime.seasonYear}` : null,
    episodes: anime.episodes || 12,
    duration: anime.duration,
    format: anime.format,
    status: anime.status,
    genres: anime.genres || [],
    // Keep original fields for compatibility
    poster_path: anime.coverImage.extraLarge || anime.coverImage.large,
    vote_average: anime.averageScore ? anime.averageScore / 10 : 0,
    release_date: anime.seasonYear ? `${anime.seasonYear}` : null
  };
}

/**
 * Normalize detailed anime data
 * @param {Object} anime - Raw AniList anime details
 * @returns {Object} Normalized anime details
 */
function normalizeAnimeDetails(anime) {
  const base = normalizeAnime(anime);
  
  return {
    ...base,
    meanScore: anime.meanScore,
    popularity: anime.popularity,
    favourites: anime.favourites,
    season: anime.season,
    tags: anime.tags?.slice(0, 10).map(t => t.name) || [],
    studios: anime.studios?.nodes?.map(s => s.name) || [],
    characters: anime.characters?.nodes?.map((char, index) => ({
      name: char.name.full,
      image: char.image?.large,
      role: anime.characters.edges[index]?.role,
      voiceActor: anime.characters.edges[index]?.voiceActors?.[0]?.name?.full
    })) || [],
    staff: anime.staff?.nodes?.map((person, index) => ({
      name: person.name.full,
      image: person.image?.large,
      role: anime.staff.edges[index]?.role
    })) || [],
    recommendations: anime.recommendations?.nodes
      ?.filter(r => r.mediaRecommendation)
      ?.map(r => normalizeAnime(r.mediaRecommendation)) || [],
    streamingEpisodes: anime.streamingEpisodes || [],
    nextAiringEpisode: anime.nextAiringEpisode
  };
}

/**
 * Map sort option to AniList sort enum
 * @param {string} sort - Sort option
 * @returns {Array} AniList sort array
 */
function getSortMapping(sort) {
  const sortMap = {
    '': ['POPULARITY_DESC'],
    'default': ['POPULARITY_DESC'],
    'POPULARITY_DESC': ['POPULARITY_DESC'],
    'SCORE_DESC': ['SCORE_DESC'],
    'TRENDING_DESC': ['TRENDING_DESC'],
    'START_DATE_DESC': ['START_DATE_DESC'],
    'FAVOURITES_DESC': ['FAVOURITES_DESC'],
    'EPISODES_DESC': ['EPISODES_DESC'],
    'title': ['TITLE_ROMAJI'],
    'rating': ['SCORE_DESC'],
    'year': ['START_DATE_DESC'],
    'trending': ['TRENDING_DESC'],
    'popularity': ['POPULARITY_DESC']
  };
  
  return sortMap[sort] || sortMap.default;
}

/**
 * Get streaming sources for anime
 * @param {Object} anime - Anime object with id, title, and malId
 * @param {number} episode - Episode number
 * @param {string} language - 'sub' or 'dub'
 * @returns {Array} Streaming sources
 */
export function getStreamingSources(anime, episode = 1, language = 'sub') {
  const isDub = language === 'dub';
  const anilistId = anime.id;
  
  // Create clean title slug for fallback
  const titleSlug = (anime.title || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return [
    // VidSrc.cc - REQUIRES 'ani' prefix for AniList IDs
    {
      name: 'VidSrc CC',
      url: `https://vidsrc.cc/v2/embed/anime/ani${anilistId}/${episode}/${isDub ? 'dub' : 'sub'}`
    },
    // VidSrc.icu - Uses AniList ID directly
    {
      name: 'VidSrc ICU',
      url: `https://vidsrc.icu/embed/anime/${anilistId}/${episode}/${isDub ? '1' : '0'}`
    },
    // VidPlus - Uses AniList ID directly
    {
      name: 'VidPlus',
      url: `https://player.vidplus.to/embed/anime/${anilistId}/${episode}?dub=${isDub}`
    },
    // Videasy
    {
      name: 'Videasy',
      url: `https://player.videasy.net/anime/${anilistId}/${episode}?${isDub ? 'dub=true&' : ''}color=d4af37&nextEpisode=true&autoplayNextEpisode=true&overlay=true`
    },
    // 2Anime
    {
      name: '2Anime',
      url: `https://2anime.xyz/embed/${anilistId}/${episode}${isDub ? '?dub=1' : ''}`
    },
    // AnimeEmbed - Title-based fallback
    {
      name: 'AnimeEmbed',
      url: `https://anime.autoembed.cc/embed/${titleSlug}-episode-${episode}`
    }
  ];
}

export default {
  getPopularAnime,
  searchAnime,
  getAnimeDetails,
  getTrendingAnime,
  getAnimeGenres,
  getStreamingSources
};
