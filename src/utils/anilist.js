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
        relations {
          edges {
            relationType
            node {
              id
              idMal
              title {
                romaji
                english
              }
              coverImage {
                large
              }
              episodes
              format
              status
              seasonYear
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
    studios: anime.studios?.nodes?.map(s => s.name) || [],
    nextAiringEpisode: anime.nextAiringEpisode || null,
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
    nextAiringEpisode: anime.nextAiringEpisode,
    relations: anime.relations?.edges || []
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
  const malId = anime.malId || anime.idMal;
  
  // Create clean title slug for fallback
  const titleSlug = (anime.title || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const sources = [
    // Videasy - Best quality, auto next episode
    {
      name: '▶ Videasy',
      url: `https://player.videasy.net/anime/${anilistId}/${episode}?${isDub ? 'dub=true&' : ''}color=d4af37&nextEpisode=true&autoplayNextEpisode=true&overlay=true`
    },
    // VidSrc.cc - REQUIRES 'ani' prefix for AniList IDs
    {
      name: 'VidSrc CC',
      url: `https://vidsrc.cc/v2/embed/anime/ani${anilistId}/${episode}/${isDub ? 'dub' : 'sub'}`
    },
    // VidSrc.icu - Uses AniList ID directly with 0=sub, 1=dub
    {
      name: 'VidSrc ICU',
      url: `https://vidsrc.icu/embed/anime/${anilistId}/${episode}/${isDub ? '1' : '0'}`
    },
    // VidPlus - Uses AniList ID
    {
      name: 'VidPlus',
      url: `https://player.vidplus.to/embed/anime/${anilistId}/${episode}?dub=${isDub}`
    },
    // 2Anime 
    {
      name: '2Anime',
      url: `https://2anime.xyz/embed/${anilistId}/${episode}${isDub ? '?dub=1' : ''}`
    },
    // VidSrc.net - Uses AniList with ani prefix
    {
      name: 'VidSrc Net',
      url: `https://vidsrc.net/embed/anime/ani${anilistId}/${episode}/${isDub ? 'dub' : 'sub'}`
    },
    // Embed.su - anime support with AniList ID
    {
      name: 'Embed SU',
      url: `https://embed.su/embed/anime/ani${anilistId}/${episode}`
    },
    // VidLink - anime support
    {
      name: 'VidLink',
      url: `https://vidlink.pro/anime/${anilistId}/${episode}?primaryColor=d4af37&autoplay=true`
    },
    // AnimeEmbed - Title-based fallback (works for most anime)
    {
      name: 'AnimeEmbed',
      url: `https://anime.autoembed.cc/embed/${titleSlug}-episode-${episode}`
    },
    // AnyEmbed - Uses title slug
    {
      name: 'AnyEmbed',
      url: `https://anyembed.xyz/embed/anime/${titleSlug}-episode-${episode}`
    },
    // SuperEmbed - Uses TMDB/MAL with anime flag
    ...(malId ? [{
      name: 'SuperEmbed',
      url: `https://multiembed.mov/?video_id=${malId}&mal=1&anime=1&e=${episode}`
    }] : []),
    // 2Embed anime via MAL
    ...(malId ? [{
      name: '2Embed',
      url: `https://www.2embed.cc/embedanime/${malId}?ep=${episode}`
    }] : [])
  ];
  
  return sources;
}

/**
 * Fetch minimal relation data for an anime (used in chain traversal)
 * @param {number} id - AniList anime ID
 * @returns {Promise<Object>} Minimal anime data with relations
 */
async function fetchAnimeRelations(id) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title { romaji english }
        episodes
        format
        status
        seasonYear
        duration
        coverImage { large }
        relations {
          edges {
            relationType
            node {
              id idMal
              title { romaji english }
              episodes format status seasonYear duration
              coverImage { large }
            }
          }
        }
      }
    }
  `;
  const data = await graphqlFetch(query, { id });
  return data.Media;
}

/**
 * Build the complete season chain for an anime by traversing PREQUEL/SEQUEL relations.
 * This resolves the full franchise order regardless of which season the user clicked on.
 * 
 * @param {number} animeId - AniList ID of any anime in the franchise
 * @param {Object} [existingDetails] - If we already have full details with relations, pass them to save an API call
 * @returns {Promise<Array>} Complete ordered season chain
 *   Each entry: { seasonNumber, anilistId, malId, title, episodeCount, duration, format, status, year, poster }
 */
export async function getAnimeSeasonChain(animeId, existingDetails = null) {
  const visited = new Set();
  const chainMap = new Map(); // id -> anime data
  
  // Recursive traversal function
  async function traverse(id) {
    if (visited.has(id)) return;
    visited.add(id);
    
    let anime;
    
    // Use existing details if this is the starting anime and we have them
    if (id === animeId && existingDetails && existingDetails.relations) {
      anime = existingDetails;
    } else {
      try {
        anime = await fetchAnimeRelations(id);
      } catch (e) {
        console.error(`Failed to fetch relations for anime ${id}:`, e);
        return;
      }
    }
    
    if (!anime) return;
    
    chainMap.set(id, {
      id: anime.id,
      malId: anime.idMal,
      title: anime.title?.english || anime.title?.romaji || `Season`,
      episodes: anime.episodes,
      format: anime.format,
      status: anime.status,
      year: anime.seasonYear,
      duration: anime.duration,
      poster: anime.coverImage?.large
    });
    
    // Find PREQUEL and SEQUEL TV entries
    const tvRelations = (anime.relations?.edges || anime.relations || [])
      .filter(edge => {
        const rel = edge.relationType;
        const fmt = edge.node?.format;
        return (rel === 'SEQUEL' || rel === 'PREQUEL') && (fmt === 'TV' || fmt === 'TV_SHORT');
      });
    
    // Traverse each related entry
    for (const edge of tvRelations) {
      if (edge.node?.id && !visited.has(edge.node.id)) {
        // Store the node data we already have to potentially skip an API call
        chainMap.set(edge.node.id, {
          id: edge.node.id,
          malId: edge.node.idMal,
          title: edge.node.title?.english || edge.node.title?.romaji || `Season`,
          episodes: edge.node.episodes,
          format: edge.node.format,
          status: edge.node.status,
          year: edge.node.seasonYear,
          duration: edge.node.duration,
          poster: edge.node.coverImage?.large
        });
        
        // Only traverse deeper if we need to find MORE relations
        // (limit depth to avoid infinite loops and excessive API calls)
        if (visited.size < 15) {
          await traverse(edge.node.id);
        }
      }
    }
  }
  
  // Start traversal from the given anime
  await traverse(animeId);
  
  // If only one entry found, no season chain exists
  if (chainMap.size <= 1) {
    const single = chainMap.get(animeId);
    if (!single) return [];
    return [{
      seasonNumber: 1,
      anilistId: single.id,
      malId: single.malId,
      title: single.title,
      episodeCount: single.episodes || 12,
      duration: single.duration,
      format: single.format,
      status: single.status,
      year: single.year,
      poster: single.poster,
      startEp: 1,
      endEp: single.episodes || 12
    }];
  }
  
  // Now we need to ORDER the chain. Sort by year, then by ID as tiebreaker.
  // The earliest year = Season 1.
  const entries = Array.from(chainMap.values());
  entries.sort((a, b) => {
    // Sort by year first
    if (a.year && b.year && a.year !== b.year) return a.year - b.year;
    // Then by AniList ID (earlier entries tend to have lower IDs)
    return a.id - b.id;
  });
  
  // Build final season array
  return entries.map((entry, index) => ({
    seasonNumber: index + 1,
    anilistId: entry.id,
    malId: entry.malId,
    title: entry.title,
    episodeCount: entry.episodes || 12,
    duration: entry.duration,
    format: entry.format,
    status: entry.status,
    year: entry.year,
    poster: entry.poster,
    startEp: 1,
    endEp: entry.episodes || 12
  }));
}

/**
 * Get upcoming anime (not yet released or releasing soon)
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Upcoming anime
 */
export async function getUpcomingAnime(page = 1, perPage = 24) {
  // Get current season and year for upcoming content
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Determine next season
  let nextSeason, seasonYear;
  if (currentMonth <= 3) {
    nextSeason = 'SPRING';
    seasonYear = currentYear;
  } else if (currentMonth <= 6) {
    nextSeason = 'SUMMER';
    seasonYear = currentYear;
  } else if (currentMonth <= 9) {
    nextSeason = 'FALL';
    seasonYear = currentYear;
  } else {
    nextSeason = 'WINTER';
    seasonYear = currentYear + 1;
  }

  const query = `
    query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          hasNextPage
        }
        media(
          type: ANIME, 
          status_in: [NOT_YET_RELEASED, RELEASING],
          season: $season,
          seasonYear: $seasonYear,
          sort: [POPULARITY_DESC]
        ) {
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
          bannerImage
          averageScore
          seasonYear
          season
          description
          episodes
          format
          status
          genres
          startDate {
            year
            month
            day
          }
          airingSchedule(notYetAired: true, perPage: 1) {
            nodes {
              airingAt
              episode
            }
          }
        }
      }
    }
  `;
  
  const data = await graphqlFetch(query, { page, perPage, season: nextSeason, seasonYear });
  
  return {
    pageInfo: data.Page.pageInfo,
    results: data.Page.media.map(anime => {
      const normalized = normalizeAnime(anime);
      
      // Add start date if available
      if (anime.startDate?.year) {
        const month = String(anime.startDate.month || 1).padStart(2, '0');
        const day = String(anime.startDate.day || 1).padStart(2, '0');
        normalized.startDate = `${anime.startDate.year}-${month}-${day}`;
        normalized.releaseDate = normalized.startDate;
      }
      
      // Add next airing info
      if (anime.airingSchedule?.nodes?.[0]) {
        normalized.nextAiringAt = anime.airingSchedule.nodes[0].airingAt;
        normalized.nextEpisode = anime.airingSchedule.nodes[0].episode;
      }
      
      return normalized;
    })
  };
}

/**
 * Get the current anime season and year
 * @returns {Object} { season, year, label }
 */
export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (month <= 3) return { season: 'WINTER', year, label: `Winter ${year}` };
  if (month <= 6) return { season: 'SPRING', year, label: `Spring ${year}` };
  if (month <= 9) return { season: 'SUMMER', year, label: `Summer ${year}` };
  return { season: 'FALL', year, label: `Fall ${year}` };
}

/**
 * Get anime for a specific season (simulcast-style)
 * @param {string} season - WINTER | SPRING | SUMMER | FALL
 * @param {number} seasonYear - Year
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Season anime
 */
export async function getSeasonAnime(season, seasonYear, page = 1, perPage = 24) {
  const query = `
    query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage hasNextPage }
        media(
          type: ANIME, season: $season, seasonYear: $seasonYear,
          sort: [POPULARITY_DESC], format_in: [TV, TV_SHORT]
        ) {
          id idMal
          title { romaji english }
          coverImage { large extraLarge }
          bannerImage
          averageScore seasonYear season
          description episodes duration format status genres
          nextAiringEpisode { airingAt timeUntilAiring episode }
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `;
  const data = await graphqlFetch(query, { page, perPage, season, seasonYear });
  return {
    pageInfo: data.Page.pageInfo,
    results: data.Page.media.map(normalizeAnime)
  };
}

/**
 * Get top rated anime of all time
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Top rated anime
 */
export async function getTopRatedAnime(page = 1, perPage = 24) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage hasNextPage }
        media(type: ANIME, sort: [SCORE_DESC], format_in: [TV, TV_SHORT, MOVIE], averageScore_greater: 75) {
          id idMal
          title { romaji english }
          coverImage { large extraLarge }
          bannerImage
          averageScore seasonYear season
          description episodes duration format status genres
          studios(isMain: true) { nodes { name } }
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
 * Get recently updated / newly added anime
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Recently updated anime
 */
export async function getRecentlyUpdatedAnime(page = 1, perPage = 24) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage hasNextPage }
        media(type: ANIME, sort: [UPDATED_AT_DESC], status: RELEASING, format_in: [TV, TV_SHORT]) {
          id idMal
          title { romaji english }
          coverImage { large extraLarge }
          bannerImage
          averageScore seasonYear season
          description episodes duration format status genres
          nextAiringEpisode { airingAt timeUntilAiring episode }
          studios(isMain: true) { nodes { name } }
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
 * Get anime by genre
 * @param {string} genre - Genre name
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Genre anime
 */
export async function getAnimeByGenre(genre, page = 1, perPage = 24) {
  const query = `
    query ($page: Int, $perPage: Int, $genre: String) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage hasNextPage }
        media(type: ANIME, genre: $genre, sort: [POPULARITY_DESC], format_in: [TV, TV_SHORT, MOVIE]) {
          id idMal
          title { romaji english }
          coverImage { large extraLarge }
          bannerImage
          averageScore seasonYear season
          description episodes duration format status genres
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `;
  const data = await graphqlFetch(query, { page, perPage, genre });
  return {
    pageInfo: data.Page.pageInfo,
    results: data.Page.media.map(normalizeAnime)
  };
}

export default {
  getPopularAnime,
  searchAnime,
  getAnimeDetails,
  getTrendingAnime,
  getAnimeGenres,
  getStreamingSources,
  getUpcomingAnime,
  getCurrentSeason,
  getSeasonAnime,
  getTopRatedAnime,
  getRecentlyUpdatedAnime,
  getAnimeByGenre,
  getAnimeSeasonChain
};
