/* ========================================
   AnimeSection.jsx - Crunchyroll-Inspired Anime Hub
   ======================================== */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as anilistApi from '../../utils/anilist';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import ContentGrid from '../cards/ContentGrid';
import LoadingSpinner from '../common/LoadingSpinner';
import './AnimeSection.css';

/* ============================================
   CONSTANTS
   ============================================ */

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mecha', 'Music', 'Mystery', 'Psychological',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
  'Supernatural', 'Thriller'
];

const NAV_TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'simulcast', label: 'Simulcasts', icon: '📡' },
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'top-rated', label: 'Top Rated', icon: '⭐' },
  { id: 'upcoming', label: 'Upcoming', icon: '📅' },
  { id: 'browse', label: 'Browse All', icon: '📚' },
];

function buildSeasonOptions() {
  const now = new Date();
  const year = now.getFullYear();
  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
  const labels = { WINTER: 'Winter', SPRING: 'Spring', SUMMER: 'Summer', FALL: 'Fall' };
  const opts = [];
  for (let y = year + 1; y >= year - 2; y--) {
    for (const s of seasons) {
      opts.push({ season: s, year: y, label: `${labels[s]} ${y}` });
    }
  }
  return opts;
}

/* ============================================
   SUB-COMPONENTS
   ============================================ */

/* ---- Hero Carousel ---- */
function HeroCarousel({ items, onPlay, onAddToCollection }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);
  const heroItems = items.slice(0, 6);

  const startAutoPlay = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % heroItems.length);
    }, 7000);
  }, [heroItems.length]);

  useEffect(() => {
    if (heroItems.length > 1) startAutoPlay();
    return () => clearInterval(intervalRef.current);
  }, [heroItems.length, startAutoPlay]);

  const goTo = (i) => { setActiveIndex(i); startAutoPlay(); };
  const prev = () => goTo((activeIndex - 1 + heroItems.length) % heroItems.length);
  const next = () => goTo((activeIndex + 1) % heroItems.length);

  if (heroItems.length === 0) return <div className="anime-hero-skeleton" />;

  return (
    <div className="anime-hero-carousel">
      {heroItems.map((item, i) => {
        const bg = item.backdrop || item.poster;
        return (
          <div key={item.id} className={`anime-hero-slide ${i === activeIndex ? 'active' : ''}`}>
            <div
              className="anime-hero-backdrop"
              style={{ backgroundImage: `url(${bg})` }}
            />
            {i === activeIndex && (
              <div className="anime-hero-info">
                <div className="anime-hero-badge">
                  {item.status === 'RELEASING' ? '📡 Simulcast' : '🎌 Anime'}
                </div>
                <h1 className="anime-hero-title">{item.title}</h1>
                <div className="anime-hero-meta">
                  {item.voteAverage > 0 && (
                    <span className="anime-hero-meta-item score">
                      ★ {(item.voteAverage).toFixed(1)}
                    </span>
                  )}
                  {item.voteAverage > 0 && item.year && <span className="anime-hero-meta-divider" />}
                  {item.year && <span className="anime-hero-meta-item">{item.year}</span>}
                  {item.episodes && (
                    <>
                      <span className="anime-hero-meta-divider" />
                      <span className="anime-hero-meta-item">{item.episodes} Episodes</span>
                    </>
                  )}
                  {item.format && (
                    <>
                      <span className="anime-hero-meta-divider" />
                      <span className="anime-hero-meta-item">{item.format}</span>
                    </>
                  )}
                </div>
                {item.genres?.length > 0 && (
                  <div className="anime-hero-genres">
                    {item.genres.slice(0, 4).map(g => (
                      <span key={g} className="anime-hero-genre-tag">{g}</span>
                    ))}
                  </div>
                )}
                {item.overview && (
                  <p className="anime-hero-description">{item.overview}</p>
                )}
                <div className="anime-hero-actions">
                  <button className="anime-hero-btn primary" onClick={() => onPlay(item)}>
                    ▶ Watch Now
                  </button>
                  <button className="anime-hero-btn secondary" onClick={() => onAddToCollection(item)}>
                    + My List
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {heroItems.length > 1 && (
        <>
          <button className="anime-hero-arrow prev" onClick={prev}>‹</button>
          <button className="anime-hero-arrow next" onClick={next}>›</button>
          <div className="anime-hero-indicators">
            {heroItems.map((_, i) => (
              <button
                key={i}
                className={`anime-hero-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---- Skeleton Row ---- */
function SkeletonRow({ count = 8 }) {
  return (
    <div className="anime-row-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="anime-skeleton-card">
          <div className="anime-skeleton-poster" />
          <div className="anime-skeleton-title" />
          <div className="anime-skeleton-sub" />
        </div>
      ))}
    </div>
  );
}

/* ---- Anime Card (for scroll rows) ---- */
function AnimeCard({ item, onPlay, onToggleCollection, isInCollection }) {
  const score = item.voteAverage ? (item.voteAverage).toFixed(1) : null;

  return (
    <div className="anime-card" onClick={() => onPlay(item)}>
      <div className="anime-card-poster">
        <img
          src={item.poster || item.posterPath || 'https://via.placeholder.com/185x260/1a1a1a/d4af37?text=No+Image'}
          alt={item.title}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/185x260/1a1a1a/d4af37?text=No+Image'; }}
        />

        {/* Play overlay */}
        <div className="anime-card-play">
          <div className="anime-card-play-icon">▶</div>
        </div>

        {/* Badges */}
        {item.status === 'RELEASING' && (
          <span className="anime-card-badge airing">Airing</span>
        )}

        {score && <span className="anime-card-score">★ {score}</span>}

        {item.episodes && (
          <span className="anime-card-ep-badge">{item.episodes} ep</span>
        )}

        {/* Add to list */}
        <button
          className={`anime-card-add ${isInCollection ? 'in-collection' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleCollection(item); }}
          title={isInCollection ? 'In My List' : 'Add to My List'}
        >
          {isInCollection ? '✓' : '+'}
        </button>
      </div>

      <div className="anime-card-info">
        <div className="anime-card-title">{item.title}</div>
        <div className="anime-card-sub">
          {item.year && <span>{item.year}</span>}
          {item.year && item.format && <span className="dot" />}
          {item.format && <span>{item.format}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---- Horizontal Scroll Row ---- */
function ScrollRow({ title, icon, items, loading, onPlay, onToggleCollection, isInCollectionFn, onSeeAll }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="anime-scroll-section">
        <div className="anime-scroll-header">
          <h3 className="anime-scroll-title">
            {icon && <span className="row-icon">{icon}</span>}
            {title}
          </h3>
        </div>
        <SkeletonRow />
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="anime-scroll-section">
      <div className="anime-scroll-header">
        <h3 className="anime-scroll-title">
          {icon && <span className="row-icon">{icon}</span>}
          {title}
        </h3>
        {onSeeAll && (
          <button className="anime-scroll-see-all" onClick={onSeeAll}>
            View All →
          </button>
        )}
      </div>
      <div className="anime-scroll-viewport">
        <button className="anime-row-arrow prev" onClick={() => scroll(-1)}>‹</button>
        <div className="anime-scroll-track" ref={trackRef}>
          {items.map(item => (
            <AnimeCard
              key={item.id}
              item={item}
              onPlay={onPlay}
              onToggleCollection={onToggleCollection}
              isInCollection={isInCollectionFn(item.id, item.type)}
            />
          ))}
        </div>
        <button className="anime-row-arrow next" onClick={() => scroll(1)}>›</button>
      </div>
    </div>
  );
}

/* ---- Airing Schedule Row ---- */
function AiringRow({ items, onPlay }) {
  const trackRef = useRef(null);
  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const formatCountdown = (seconds) => {
    if (!seconds || seconds <= 0) return 'Airing now';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    if (d > 0) return `${d}d ${h}h`;
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const airingItems = items.filter(it => it.nextAiringEpisode);
  if (airingItems.length === 0) return null;

  return (
    <div className="anime-scroll-section">
      <div className="anime-scroll-header">
        <h3 className="anime-scroll-title">
          <span className="row-icon">⏰</span>
          Airing Schedule
        </h3>
      </div>
      <div className="anime-scroll-viewport">
        <button className="anime-row-arrow prev" onClick={() => scroll(-1)}>‹</button>
        <div className="anime-scroll-track" ref={trackRef}>
          {airingItems.map(item => (
            <div key={item.id} className="anime-airing-card" onClick={() => onPlay(item)}>
              <div className="anime-airing-top">
                <div className="anime-airing-poster">
                  <img src={item.poster} alt={item.title} loading="lazy" />
                </div>
                <div className="anime-airing-info">
                  <h4>{item.title}</h4>
                  <span>Episode {item.nextAiringEpisode.episode}</span>
                  <div className="anime-airing-countdown">
                    🟢 {formatCountdown(item.nextAiringEpisode.timeUntilAiring)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="anime-row-arrow next" onClick={() => scroll(1)}>›</button>
      </div>
    </div>
  );
}

/* ---- Continue Watching Row ---- */
function ContinueWatchingRow({ items, onPlay }) {
  const trackRef = useRef(null);
  if (!items || items.length === 0) return null;

  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <div className="anime-scroll-section">
      <div className="anime-scroll-header">
        <h3 className="anime-scroll-title">
          <span className="row-icon">▶</span>
          Continue Watching
        </h3>
      </div>
      <div className="anime-scroll-viewport">
        <button className="anime-row-arrow prev" onClick={() => scroll(-1)}>‹</button>
        <div className="anime-scroll-track" ref={trackRef}>
          {items.map(item => {
            const progress = item.currentEpisode && item.episodes
              ? Math.min((item.currentEpisode / item.episodes) * 100, 95)
              : 30;
            return (
              <div key={item.id} className="anime-continue-card" onClick={() => onPlay(item)}>
                <div className="anime-continue-poster">
                  <img
                    src={item.backdrop || item.poster || item.posterPath}
                    alt={item.title}
                    loading="lazy"
                  />
                  <div className="anime-continue-progress">
                    <div className="anime-continue-progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="anime-continue-info">
                  <div className="anime-continue-thumb">
                    <img src={item.poster || item.posterPath} alt="" />
                  </div>
                  <div className="anime-continue-text">
                    <h4>{item.title}</h4>
                    <span>
                      S{item.currentSeason || 1} E{item.currentEpisode || 1}
                      {item.episodes ? ` / ${item.episodes} episodes` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="anime-row-arrow next" onClick={() => scroll(1)}>›</button>
      </div>
    </div>
  );
}


/* ============================================
   MAIN COMPONENT
   ============================================ */

function AnimeSection({ onPlay, onEdit, searchQuery }) {
  const { state, actions } = useApp();
  const { isInCollection, toggleCollection } = useCollection();
  const collection = state?.collection || [];
  const filters = state?.filters || {};
  const mountedRef = useRef(true);

  // View state
  const [activeTab, setActiveTab] = useState('home');
  const [activeGenre, setActiveGenre] = useState(null);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const currentSeason = useMemo(() => anilistApi.getCurrentSeason(), []);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const seasonOptions = useMemo(() => buildSeasonOptions(), []);

  // Data state
  const [heroItems, setHeroItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [simulcastItems, setSimulcastItems] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [topRatedItems, setTopRatedItems] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [genreItems, setGenreItems] = useState([]);
  const [browseItems, setBrowseItems] = useState([]);

  // Loading states
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingRows, setLoadingRows] = useState({});
  const [loadingBrowse, setLoadingBrowse] = useState(false);

  // Browse / search pagination
  const [browsePage, setBrowsePage] = useState(1);
  const [browseHasMore, setBrowseHasMore] = useState(true);

  // Continue watching from collection
  const continueWatching = useMemo(() => {
    return collection
      .filter(it => it.type === 'anime' && it.status === 'watching')
      .slice(0, 20);
  }, [collection]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /* ---- Data Loaders ---- */

  // Load hero + home rows on mount
  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoadingHero(true);
        setLoadingRows(prev => ({ ...prev, trending: true, simulcast: true, popular: true, recent: true }));

        const [trendingRes, simulcastRes, popularRes, recentRes] = await Promise.allSettled([
          anilistApi.getTrendingAnime(1, 10),
          anilistApi.getSeasonAnime(currentSeason.season, currentSeason.year, 1, 20),
          anilistApi.getPopularAnime(1, 20),
          anilistApi.getRecentlyUpdatedAnime(1, 20),
        ]);

        if (!mountedRef.current) return;

        const trending = trendingRes.status === 'fulfilled' ? trendingRes.value.results.map(a => ({ ...a, type: 'anime' })) : [];
        const simulcast = simulcastRes.status === 'fulfilled' ? simulcastRes.value.results.map(a => ({ ...a, type: 'anime' })) : [];
        const popular = popularRes.status === 'fulfilled' ? popularRes.value.results.map(a => ({ ...a, type: 'anime' })) : [];
        const recent = recentRes.status === 'fulfilled' ? recentRes.value.results.map(a => ({ ...a, type: 'anime' })) : [];

        // Hero items: pick ones that have bannerImage, fallback to trending
        const withBanner = [...simulcast, ...trending].filter(a => a.backdrop);
        setHeroItems(withBanner.length >= 3 ? withBanner.slice(0, 6) : trending.slice(0, 6));

        setTrendingItems(trending);
        setSimulcastItems(simulcast);
        setPopularItems(popular);
        setRecentItems(recent);
      } catch (err) {
        console.error('Error loading anime home data:', err);
      } finally {
        if (mountedRef.current) {
          setLoadingHero(false);
          setLoadingRows(prev => ({ ...prev, trending: false, simulcast: false, popular: false, recent: false }));
        }
      }
    }
    loadHomeData();
  }, [currentSeason]);

  // Load top rated lazily
  useEffect(() => {
    if (activeTab !== 'home' && activeTab !== 'top-rated') return;
    if (topRatedItems.length > 0) return;

    async function load() {
      setLoadingRows(prev => ({ ...prev, topRated: true }));
      try {
        const res = await anilistApi.getTopRatedAnime(1, 20);
        if (mountedRef.current) setTopRatedItems(res.results.map(a => ({ ...a, type: 'anime' })));
      } catch (e) { console.error(e); }
      finally { if (mountedRef.current) setLoadingRows(prev => ({ ...prev, topRated: false })); }
    }
    load();
  }, [activeTab, topRatedItems.length]);

  // Load upcoming lazily
  useEffect(() => {
    if (activeTab !== 'home' && activeTab !== 'upcoming') return;
    if (upcomingItems.length > 0) return;

    async function load() {
      setLoadingRows(prev => ({ ...prev, upcoming: true }));
      try {
        const res = await anilistApi.getUpcomingAnime(1, 20);
        if (mountedRef.current) setUpcomingItems(res.results.map(a => ({ ...a, type: 'anime' })));
      } catch (e) { console.error(e); }
      finally { if (mountedRef.current) setLoadingRows(prev => ({ ...prev, upcoming: false })); }
    }
    load();
  }, [activeTab, upcomingItems.length]);

  // Handle genre selection
  useEffect(() => {
    if (!activeGenre) { setGenreItems([]); return; }

    async function loadGenre() {
      setLoadingRows(prev => ({ ...prev, genre: true }));
      try {
        const res = await anilistApi.getAnimeByGenre(activeGenre, 1, 24);
        if (mountedRef.current) setGenreItems(res.results.map(a => ({ ...a, type: 'anime' })));
      } catch (e) { console.error(e); }
      finally { if (mountedRef.current) setLoadingRows(prev => ({ ...prev, genre: false })); }
    }
    loadGenre();
  }, [activeGenre]);

  // Handle tab-specific loading (simulcast tab with season selector)
  useEffect(() => {
    if (activeTab !== 'simulcast') return;

    async function loadSeason() {
      setLoadingBrowse(true);
      try {
        const res = await anilistApi.getSeasonAnime(selectedSeason.season, selectedSeason.year, 1, 40);
        if (mountedRef.current) {
          setBrowseItems(res.results.map(a => ({ ...a, type: 'anime' })));
          setBrowseHasMore(res.pageInfo?.hasNextPage || false);
          setBrowsePage(1);
        }
      } catch (e) { console.error(e); }
      finally { if (mountedRef.current) setLoadingBrowse(false); }
    }
    loadSeason();
  }, [activeTab, selectedSeason]);

  // Handle browse/search
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      setActiveTab('browse');
      loadBrowse(1, false, searchQuery);
    }
  }, [searchQuery]);

  const loadBrowse = useCallback(async (page = 1, append = false, query = null) => {
    setLoadingBrowse(true);
    try {
      let data;
      if (query) {
        data = await anilistApi.searchAnime(query, page, 24);
      } else if (activeTab === 'popular') {
        data = await anilistApi.getPopularAnime(page, 24, {
          genre: filters.genre || activeGenre || undefined,
          sort: filters.sort || undefined,
        });
      } else if (activeTab === 'top-rated') {
        data = await anilistApi.getTopRatedAnime(page, 24);
      } else if (activeTab === 'upcoming') {
        data = await anilistApi.getUpcomingAnime(page, 24);
      } else {
        data = await anilistApi.getPopularAnime(page, 24, {
          genre: activeGenre || undefined,
        });
      }

      if (!mountedRef.current) return;
      const results = (data?.results || []).map(a => ({ ...a, type: 'anime' }));

      if (append) {
        setBrowseItems(prev => [...prev, ...results]);
      } else {
        setBrowseItems(results);
      }
      setBrowseHasMore(results.length >= 20);
      setBrowsePage(page);
    } catch (e) {
      console.error('Browse load error:', e);
    } finally {
      if (mountedRef.current) setLoadingBrowse(false);
    }
  }, [activeTab, activeGenre, filters]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'browse' || tab === 'popular' || tab === 'top-rated' || tab === 'upcoming') {
      setBrowseItems([]);
      setBrowsePage(1);
      loadBrowse(1, false);
    }
  };

  // Season change
  const handleSeasonChange = (opt) => {
    setSelectedSeason(opt);
    setSeasonDropdownOpen(false);
  };

  // Genre click
  const handleGenreClick = (genre) => {
    if (activeGenre === genre) {
      setActiveGenre(null);
    } else {
      setActiveGenre(genre);
    }
  };

  // "See all" -> switch to browse view
  const handleSeeAll = (tab) => {
    setActiveTab(tab);
    setBrowseItems([]);
    loadBrowse(1, false);
  };

  // Load more for browse grid
  const handleLoadMore = () => {
    if (!loadingBrowse && browseHasMore) {
      loadBrowse(browsePage + 1, true, searchQuery || null);
    }
  };

  // Close season dropdown on outside click
  useEffect(() => {
    if (!seasonDropdownOpen) return;
    const close = () => setSeasonDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [seasonDropdownOpen]);

  /* ---- RENDERS ---- */

  // Is this a "grid view" tab (browse, popular, top-rated, upcoming, simulcast, search)?
  const isGridView = activeTab !== 'home' || (searchQuery && searchQuery.trim());

  // Get title for grid views
  const getGridTitle = () => {
    if (searchQuery) return `🔍 Results for "${searchQuery}"`;
    switch (activeTab) {
      case 'simulcast': return `📡 ${selectedSeason.label} Simulcasts`;
      case 'popular': return '🔥 Popular Anime';
      case 'top-rated': return '⭐ Top Rated';
      case 'upcoming': return '📅 Upcoming';
      case 'browse': return activeGenre ? `📚 ${activeGenre} Anime` : '📚 Browse All';
      default: return '🎌 Anime';
    }
  };

  return (
    <section className="anime-hub">
      {/* ---- NAVIGATION BAR ---- */}
      <div className="anime-nav-bar">
        {NAV_TABS.map((tab, i) => (
          <React.Fragment key={tab.id}>
            <button
              className={`anime-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
            {i < NAV_TABS.length - 1 && <span className="anime-nav-divider" />}
          </React.Fragment>
        ))}

        {/* Season selector */}
        <div
          className="anime-season-selector"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="anime-season-btn"
            onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
          >
            📅 {selectedSeason.label}
            <span className={`chevron ${seasonDropdownOpen ? 'open' : ''}`}>▼</span>
          </button>
          {seasonDropdownOpen && (
            <div className="anime-season-dropdown">
              {seasonOptions.map(opt => (
                <button
                  key={`${opt.season}-${opt.year}`}
                  className={`anime-season-option ${opt.season === selectedSeason.season && opt.year === selectedSeason.year ? 'active' : ''}`}
                  onClick={() => handleSeasonChange(opt)}
                >
                  {opt.label}
                  <span className="check">✓</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- GENRE PILLS ---- */}
      <div className="anime-genre-bar">
        {GENRES.map(g => (
          <button
            key={g}
            className={`anime-genre-pill ${activeGenre === g ? 'active' : ''}`}
            onClick={() => handleGenreClick(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ================ HOME VIEW ================ */}
      {activeTab === 'home' && !searchQuery && (
        <div className="anime-hub-content">
          {/* Hero Carousel */}
          {loadingHero ? (
            <div className="anime-hero-skeleton" />
          ) : (
            <HeroCarousel
              items={heroItems}
              onPlay={onPlay}
              onAddToCollection={toggleCollection}
            />
          )}

          {/* Continue Watching */}
          <ContinueWatchingRow items={continueWatching} onPlay={onPlay} />

          {/* Simulcasts This Season */}
          <ScrollRow
            title={`${currentSeason.label} Simulcasts`}
            icon="📡"
            items={simulcastItems}
            loading={loadingRows.simulcast}
            onPlay={onPlay}
            onToggleCollection={toggleCollection}
            isInCollectionFn={isInCollection}
            onSeeAll={() => handleSeeAll('simulcast')}
          />

          {/* Airing Schedule */}
          <AiringRow items={simulcastItems} onPlay={onPlay} />

          {/* Trending */}
          <ScrollRow
            title="Trending Now"
            icon="🔥"
            items={trendingItems}
            loading={loadingRows.trending}
            onPlay={onPlay}
            onToggleCollection={toggleCollection}
            isInCollectionFn={isInCollection}
            onSeeAll={() => handleSeeAll('popular')}
          />

          {/* Recently Updated */}
          <ScrollRow
            title="Recently Updated"
            icon="🆕"
            items={recentItems}
            loading={loadingRows.recent}
            onPlay={onPlay}
            onToggleCollection={toggleCollection}
            isInCollectionFn={isInCollection}
          />

          {/* Popular */}
          <ScrollRow
            title="Popular This Season"
            icon="⚡"
            items={popularItems}
            loading={loadingRows.popular}
            onPlay={onPlay}
            onToggleCollection={toggleCollection}
            isInCollectionFn={isInCollection}
            onSeeAll={() => handleSeeAll('popular')}
          />

          {/* Genre results if selected */}
          {activeGenre && (
            <ScrollRow
              title={`${activeGenre} Anime`}
              icon="🏷️"
              items={genreItems}
              loading={loadingRows.genre}
              onPlay={onPlay}
              onToggleCollection={toggleCollection}
              isInCollectionFn={isInCollection}
              onSeeAll={() => handleSeeAll('browse')}
            />
          )}

          {/* Top Rated */}
          <ScrollRow
            title="Top Rated of All Time"
            icon="⭐"
            items={topRatedItems}
            loading={loadingRows.topRated}
            onPlay={onPlay}
            onToggleCollection={toggleCollection}
            isInCollectionFn={isInCollection}
            onSeeAll={() => handleSeeAll('top-rated')}
          />

          {/* Upcoming */}
          <ScrollRow
            title="Upcoming Next Season"
            icon="📅"
            items={upcomingItems}
            loading={loadingRows.upcoming}
            onPlay={onPlay}
            onToggleCollection={toggleCollection}
            isInCollectionFn={isInCollection}
            onSeeAll={() => handleSeeAll('upcoming')}
          />
        </div>
      )}

      {/* ================ GRID VIEW (browse, search, tabs) ================ */}
      {isGridView && (
        <div className="anime-hub-content">
          {activeTab !== 'home' && (
            <button className="anime-back-btn" onClick={() => { setActiveTab('home'); setBrowseItems([]); }}>
              ← Back to Home
            </button>
          )}

          <div className="anime-browse-header">
            <h2 className="anime-browse-title">{getGridTitle()}</h2>
            {browseItems.length > 0 && (
              <span className="anime-browse-count">{browseItems.length} results</span>
            )}
          </div>

          <ContentGrid
            items={browseItems}
            loading={loadingBrowse}
            onLoadMore={handleLoadMore}
            hasMore={browseHasMore}
            onPlay={onPlay}
            onEdit={onEdit}
            emptyMessage={searchQuery ? 'No anime found for your search' : 'No anime found'}
          />
        </div>
      )}
    </section>
  );
}

export default AnimeSection;
