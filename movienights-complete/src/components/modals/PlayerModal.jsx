/* ========================================
   PlayerModal.jsx - Video Player Modal with Watch Tracking
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import * as tmdbApi from '../../utils/tmdb';
import * as anilistApi from '../../utils/anilist';
import { getStreamingSources, formatRuntime, calculateEndTime } from '../../utils/helpers';
import * as watchTracker from '../../utils/watchTracker';
import ModalBackdrop, { ModalContent, ModalHeader, ModalBody } from '../common/ModalBackdrop';
import ContentCard from '../cards/ContentCard';
import CastButton from '../ui/CastButton';
import './PlayerModal.css';

function PlayerModal({ isOpen, onClose, item, onShowCastCrew, onOpenPiP }) {
  const { state, actions } = useApp();
  
  const [currentSource, setCurrentSource] = useState(null);
  const [sources, setSources] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [animeLanguage, setAnimeLanguage] = useState('sub');
  const [runtime, setRuntime] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  
  // Refs for watch tracking
  const watchIntervalRef = useRef(null);
  const sessionStartedRef = useRef(false);

  // Start watch session when modal opens
  useEffect(() => {
    if (isOpen && item && !sessionStartedRef.current) {
      console.log('Starting watch session for:', item.title);
      watchTracker.startWatchSession(item, selectedEpisode, selectedSeason);
      sessionStartedRef.current = true;
      
      // Start periodic updates every 30 seconds
      watchIntervalRef.current = setInterval(() => {
        const session = watchTracker.updateWatchSession();
        if (session) {
          setWatchTime(Math.round(session.accumulatedMinutes));
        }
      }, 30000);
    }
    
    return () => {
      // Don't clean up here - wait for explicit close
    };
  }, [isOpen, item]);

  // Handle modal close - end watch session
  const handleClose = useCallback(() => {
    if (sessionStartedRef.current) {
      console.log('Ending watch session');
      
      // Clear interval
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
      
      // End session
      const result = watchTracker.endWatchSession(false);
      if (result && result.watchedMinutes > 0) {
        actions.addNotification(`Watched for ${result.watchedMinutes} minutes`, 'info');
      }
      
      sessionStartedRef.current = false;
      setWatchTime(0);
    }
    
    onClose();
  }, [onClose, actions]);

  // Mark as watched handler
  const handleMarkAsWatched = useCallback(() => {
    if (!item) return;
    
    // Get estimated runtime
    const estimatedRuntime = runtime || (item.type === 'movie' ? 120 : 
                                          item.type === 'anime' ? 24 : 45);
    
    // Mark as watched
    const stats = watchTracker.markAsWatched(
      item, 
      selectedEpisode, 
      selectedSeason, 
      estimatedRuntime
    );
    
    setIsWatched(true);
    
    // Check achievements
    const { updated } = watchTracker.checkWatchAchievements(
      state.achievements,
      (achievement) => {
        actions.addNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success');
      }
    );
    
    // Update achievements in state
    actions.setAchievements(updated);
    
    // Show notification
    if (item.type === 'movie') {
      actions.addNotification(`✅ Marked "${item.title}" as watched!`, 'success');
    } else {
      actions.addNotification(`✅ Marked S${selectedSeason}E${selectedEpisode} as watched!`, 'success');
    }
    
    // Auto-advance to next episode for TV/Anime
    if (item.type !== 'movie' && episodes.length > selectedEpisode) {
      setTimeout(() => {
        handleEpisodeChange(selectedEpisode + 1);
        setIsWatched(false);
      }, 1500);
    }
  }, [item, runtime, selectedEpisode, selectedSeason, episodes, state.achievements, actions]);

  // Set default episodes immediately when item changes
  useEffect(() => {
    if (isOpen && item) {
      // Reset states
      setSelectedSeason(1);
      setSelectedEpisode(1);
      setIsLoading(true);
      setIsWatched(false);
      
      // Set immediate defaults based on item type
      if (item.type === 'anime') {
        const epCount = item.episodes || item.totalEpisodes || 24;
        const defaultEps = Array.from({ length: Math.max(epCount, 1) }, (_, i) => ({
          episodeNumber: i + 1,
          name: `Episode ${i + 1}`,
          runtime: 24
        }));
        setEpisodes(defaultEps);
        setSeasons([]);
        
        // Get streaming sources with language parameter for anime
        const streamSources = getStreamingSources({ ...item, language: animeLanguage }, 1, 1);
        setSources(streamSources);
        if (streamSources.length > 0) {
          setCurrentSource(streamSources[0].url);
        }
      } else if (item.type === 'tv') {
        // Default to 1 season with 10 episodes
        setSeasons([{ seasonNumber: 1, episodeCount: 10 }]);
        const defaultEps = Array.from({ length: 10 }, (_, i) => ({
          episodeNumber: i + 1,
          name: `Episode ${i + 1}`
        }));
        setEpisodes(defaultEps);
        
        // Get streaming sources for TV
        const streamSources = getStreamingSources(item, 1, 1);
        setSources(streamSources);
        if (streamSources.length > 0) {
          setCurrentSource(streamSources[0].url);
        }
      } else {
        // Movies
        const streamSources = getStreamingSources(item, 1, 1);
        setSources(streamSources);
        if (streamSources.length > 0) {
          setCurrentSource(streamSources[0].url);
        }
      }
      
      // Then load full data async
      loadFullData();
    }
  }, [isOpen, item]);

  // Load full data async
  const loadFullData = useCallback(async () => {
    if (!item) return;
    
    try {
      if (item.type === 'movie') {
        // Get movie runtime
        const movieRuntime = await tmdbApi.getMovieRuntime(item.id);
        setRuntime(movieRuntime);
        
        // Get trailer
        const trailer = await tmdbApi.getTrailer(item.id, 'movie');
        setTrailerKey(trailer);
        
        // Get recommendations
        const recs = await tmdbApi.getRecommendations(item.id, 'movie');
        setRecommendations(recs);
        
      } else if (item.type === 'tv') {
        // Get TV show seasons
        try {
          const showData = await tmdbApi.getTVShowSeasons(item.id);
          if (showData.seasons && showData.seasons.length > 0) {
            setSeasons(showData.seasons);
            
            // Load first season episodes
            const firstSeasonEps = await tmdbApi.getSeasonEpisodes(item.id, 1);
            if (firstSeasonEps && firstSeasonEps.length > 0) {
              setEpisodes(firstSeasonEps);
            }
          }
        } catch (e) {
          console.error('Error getting TV data:', e);
          // Keep defaults set in initial effect
        }
        
        // Get trailer
        const trailer = await tmdbApi.getTrailer(item.id, 'tv');
        setTrailerKey(trailer);
        
        // Get recommendations
        const recs = await tmdbApi.getRecommendations(item.id, 'tv');
        setRecommendations(recs);
        
      } else if (item.type === 'anime') {
        // Get detailed anime info
        try {
          const animeDetails = await anilistApi.getAnimeDetails(item.id);
          if (animeDetails) {
            // Update episode count if we got it
            if (animeDetails.episodes) {
              const animeEps = Array.from({ length: animeDetails.episodes }, (_, i) => ({
                episodeNumber: i + 1,
                name: `Episode ${i + 1}`,
                runtime: animeDetails.duration || 24
              }));
              setEpisodes(animeEps);
            }
            setRuntime(animeDetails.duration);
            
            // Get recommendations from anime details
            if (animeDetails.recommendations) {
              setRecommendations(animeDetails.recommendations);
            }
          }
        } catch (e) {
          console.error('Error getting anime data:', e);
          // Keep defaults set in initial effect
        }
      }
    } catch (error) {
      console.error('Error loading player data:', error);
      actions?.addNotification?.('Error loading player data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [item, actions]);

  // Handle season change
  const handleSeasonChange = async (seasonNum) => {
    setSelectedSeason(parseInt(seasonNum));
    setSelectedEpisode(1);
    setIsWatched(false);
    
    // Update watch session with new season
    if (sessionStartedRef.current) {
      watchTracker.startWatchSession(item, 1, parseInt(seasonNum));
    }
    
    if (item.type === 'tv') {
      try {
        const eps = await tmdbApi.getSeasonEpisodes(item.id, parseInt(seasonNum));
        setEpisodes(eps || []);
      } catch (error) {
        console.error('Error loading episodes:', error);
        // Generate default episodes
        const defaultEps = Array.from({ length: 10 }, (_, i) => ({
          episodeNumber: i + 1,
          name: `Episode ${i + 1}`
        }));
        setEpisodes(defaultEps);
      }
    }
  };

  // Handle episode change
  const handleEpisodeChange = (episodeNum) => {
    const epNum = parseInt(episodeNum);
    setSelectedEpisode(epNum);
    setIsWatched(false);
    
    // Update watch session with new episode
    if (sessionStartedRef.current) {
      watchTracker.startWatchSession(item, epNum, selectedSeason);
    }
    
    // Update sources with new episode
    const newSources = getStreamingSources(
      { ...item, language: animeLanguage },
      selectedSeason,
      epNum
    );
    setSources(newSources);
    if (newSources.length > 0) {
      setCurrentSource(newSources[0].url);
    }
    
    actions.addNotification(`Loading S${selectedSeason}E${epNum}`, 'info');
  };

  // Handle language toggle for anime
  const handleLanguageToggle = (lang) => {
    setAnimeLanguage(lang);
    
    const newSources = getStreamingSources(
      { ...item, language: lang },
      selectedSeason,
      selectedEpisode
    );
    setSources(newSources);
    if (newSources.length > 0) {
      setCurrentSource(newSources[0].url);
    }
    
    actions.addNotification(`Switched to ${lang.toUpperCase()}`, 'success');
  };

  // Handle source change
  const handleSourceChange = (url) => {
    setCurrentSource(url);
  };

  // Toggle trailer
  const handleTrailerToggle = () => {
    if (showTrailer) {
      // Back to sources
      setShowTrailer(false);
      if (sources.length > 0) {
        setCurrentSource(sources[0].url);
      }
    } else {
      // Show trailer
      setShowTrailer(true);
      setCurrentSource(`https://www.youtube.com/embed/${trailerKey}?autoplay=1`);
    }
  };

  // Save progress
  const handleSaveProgress = () => {
    const progressKey = `${item.id}-${item.type}`;
    const progress = {
      season: selectedSeason,
      episode: selectedEpisode,
      timestamp: Date.now()
    };
    actions.updateResumeProgress(progressKey, progress);
    actions.addNotification('Progress saved!', 'success');
  };

  if (!item) return null;

  const title = item.title || item.name;
  const description = item.overview || item.description || '';
  const year = item.year || (item.release_date || item.releaseDate || '').split('-')[0];
  const rating = (item.vote_average || item.voteAverage || 0).toFixed(1);
  const genres = item.genres || [];

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose} className="player-modal-backdrop">
      <ModalContent className="player-modal-content" maxWidth="1200px">
        <ModalHeader onClose={handleClose}>
          <h2>{title}</h2>
          <div className="header-info">
            {runtime && (
              <span className="runtime-badge">
                {formatRuntime(runtime)} • Ends at {calculateEndTime(runtime)}
              </span>
            )}
            {watchTime > 0 && (
              <span className="watch-time-badge">
                ⏱️ {watchTime}m watched
              </span>
            )}
          </div>
        </ModalHeader>

        <ModalBody className="player-modal-body">
          {/* Content Info Section */}
          <div className="content-info-section">
            <div className="content-meta">
              {year && <span className="meta-item">📅 {year}</span>}
              {rating > 0 && <span className="meta-item">⭐ {rating}/10</span>}
              {item.type && (
                <span className="meta-item type-badge">
                  {item.type === 'movie' && '🎬 Movie'}
                  {item.type === 'tv' && '📺 TV Show'}
                  {item.type === 'anime' && '🎌 Anime'}
                </span>
              )}
              {genres.length > 0 && (
                <span className="meta-item genres">
                  {genres.slice(0, 3).join(' • ')}
                </span>
              )}
            </div>
            {description && (
              <p className="content-description">{description}</p>
            )}
          </div>

          {/* Episode Selector (TV/Anime only) */}
          {(item.type === 'tv' || item.type === 'anime') && (
            <div className="episode-selector">
              {/* Season Selector (TV only) */}
              {item.type === 'tv' && (
                <div className="selector-group">
                  <label>Season</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => handleSeasonChange(e.target.value)}
                    className="elegant-select"
                  >
                    {seasons.length > 0 ? (
                      seasons.map((season) => (
                        <option key={season.seasonNumber} value={season.seasonNumber}>
                          Season {season.seasonNumber} {season.episodeCount ? `(${season.episodeCount} eps)` : ''}
                        </option>
                      ))
                    ) : (
                      <option value={1}>Season 1</option>
                    )}
                  </select>
                </div>
              )}

              {/* Episode Selector */}
              <div className="selector-group">
                <label>Episode</label>
                <select
                  value={selectedEpisode}
                  onChange={(e) => handleEpisodeChange(e.target.value)}
                  className="elegant-select"
                >
                  {episodes.length > 0 ? (
                    episodes.map((ep) => (
                      <option key={ep.episodeNumber} value={ep.episodeNumber}>
                        Ep {ep.episodeNumber}{ep.name && ep.name !== `Episode ${ep.episodeNumber}` ? `: ${ep.name}` : ''}
                      </option>
                    ))
                  ) : (
                    <option value={1}>Episode 1</option>
                  )}
                </select>
              </div>

              {/* Language Toggle (Anime only) */}
              {item.type === 'anime' && (
                <div className="language-toggle">
                  <button
                    className={`lang-btn ${animeLanguage === 'sub' ? 'active' : ''}`}
                    onClick={() => handleLanguageToggle('sub')}
                  >
                    SUB
                  </button>
                  <button
                    className={`lang-btn ${animeLanguage === 'dub' ? 'active' : ''}`}
                    onClick={() => handleLanguageToggle('dub')}
                  >
                    DUB
                  </button>
                </div>
              )}
              
              {/* Episode count info */}
              <div className="episode-info">
                {item.type === 'anime' && episodes.length > 0 && (
                  <span className="episode-count">{episodes.length} Episodes</span>
                )}
                {item.type === 'tv' && seasons.length > 0 && (
                  <span className="episode-count">{seasons.length} Seasons</span>
                )}
              </div>
            </div>
          )}

          {/* Source Buttons */}
          <div className="source-buttons">
            {sources.map((source, index) => (
              <button
                key={source.name}
                className={`source-btn ${currentSource === source.url ? 'active' : ''}`}
                onClick={() => handleSourceChange(source.url)}
              >
                {source.name}
              </button>
            ))}
            
            {/* Open in New Tab fallback */}
            {currentSource && (
              <a 
                href={currentSource} 
                target="_blank" 
                rel="noopener noreferrer"
                className="source-btn external-btn"
                title="Open in new tab if video doesn't load"
              >
                🔗 Open External
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="player-actions">
            {/* Mark as Watched Button */}
            <button 
              className={`action-btn watched-btn ${isWatched ? 'active' : ''}`}
              onClick={handleMarkAsWatched}
              disabled={isWatched}
            >
              {isWatched ? '✅ Watched!' : '👁️ Mark Watched'}
            </button>
            
            {trailerKey && (
              <button 
                className={`action-btn trailer-btn ${showTrailer ? 'active' : ''}`}
                onClick={handleTrailerToggle}
              >
                {showTrailer ? '📺 Back to Sources' : '🎬 Watch Trailer'}
              </button>
            )}
            
            <button className="action-btn" onClick={handleSaveProgress}>
              💾 Save Progress
            </button>
            
            <button className="action-btn" onClick={() => onShowCastCrew?.(item)}>
              👥 Cast & Crew
            </button>

            {/* Cast to Device Button */}
            <CastButton 
              currentSource={currentSource} 
              title={title}
            />
          </div>

          {/* Player Container */}
          <div className="player-container">
            {currentSource ? (
              <iframe
                src={currentSource}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                title={title}
              />
            ) : (
              <div className="player-placeholder">
                <p>Select a source to start watching</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>More Like This</h3>
              <div className="recommendations-grid">
                {recommendations.slice(0, 6).map((rec) => (
                  <ContentCard
                    key={rec.id}
                    item={rec}
                    onPlay={() => {
                      // Reset and load new item
                      // This would typically update the parent's state
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </ModalBackdrop>
  );
}

export default PlayerModal;
