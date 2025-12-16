/* ========================================
   StatsSection.jsx - Stats & Achievements Section
   ======================================== */

import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import { getAchievementsByCategory, getAchievementStats } from '../../utils/achievements';
import * as watchTracker from '../../utils/watchTracker';
import './StatsSection.css';

function StatsSection() {
  const { state } = useApp();
  const { stats, collection } = useCollection();
  const { achievements } = state;
  const [watchStats, setWatchStats] = useState(null);

  // Load watch stats
  useEffect(() => {
    const stats = watchTracker.loadWatchStats();
    setWatchStats(stats);
  }, []);

  // Calculate achievement stats
  const achievementStats = useMemo(() => 
    getAchievementStats(achievements), 
    [achievements]
  );

  // Group achievements by category
  const achievementsByCategory = useMemo(() => 
    getAchievementsByCategory(achievements),
    [achievements]
  );

  // Calculate watching stats
  const watchingStats = useMemo(() => {
    const watching = collection.filter(item => item.status === 'watching').length;
    const completed = collection.filter(item => item.status === 'completed').length;
    const planToWatch = collection.filter(item => item.status === 'plan').length;
    const dropped = collection.filter(item => item.status === 'dropped').length;
    
    return { watching, completed, planToWatch, dropped };
  }, [collection]);

  // Calculate genre distribution
  const genreDistribution = useMemo(() => {
    const genres = {};
    collection.forEach(item => {
      if (item.genres) {
        item.genres.forEach(genre => {
          const name = typeof genre === 'string' ? genre : genre.name;
          if (name) {
            genres[name] = (genres[name] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [collection]);

  return (
    <div className="stats-section">
      <h2 className="section-title">📊 Statistics & Achievements</h2>

      {/* Overview Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-value">{stats.movies}</div>
          <div className="stat-label">Movies</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📺</div>
          <div className="stat-value">{stats.tvShows}</div>
          <div className="stat-label">TV Shows</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎌</div>
          <div className="stat-value">{stats.anime}</div>
          <div className="stat-label">Anime</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.avgRating}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      {/* Watch Time Stats */}
      {watchStats && (
        <div className="stats-section-block watch-time-block">
          <h3>⏱️ Watch Time</h3>
          <div className="watch-time-stats">
            <div className="watch-stat-card">
              <div className="watch-stat-icon">🕐</div>
              <div className="watch-stat-value">
                {Math.round(watchStats.totalWatchTimeMinutes / 60)}h
              </div>
              <div className="watch-stat-label">Total Watch Time</div>
            </div>
            <div className="watch-stat-card">
              <div className="watch-stat-icon">🎬</div>
              <div className="watch-stat-value">{watchStats.totalMoviesWatched}</div>
              <div className="watch-stat-label">Movies Watched</div>
            </div>
            <div className="watch-stat-card">
              <div className="watch-stat-icon">📺</div>
              <div className="watch-stat-value">{watchStats.totalEpisodesWatched}</div>
              <div className="watch-stat-label">Episodes Watched</div>
            </div>
            <div className="watch-stat-card">
              <div className="watch-stat-icon">🔥</div>
              <div className="watch-stat-value">{watchStats.currentStreakDays}</div>
              <div className="watch-stat-label">Day Streak</div>
            </div>
            <div className="watch-stat-card">
              <div className="watch-stat-icon">🏆</div>
              <div className="watch-stat-value">
                {Math.round(watchStats.longestSessionMinutes / 60 * 10) / 10}h
              </div>
              <div className="watch-stat-label">Longest Session</div>
            </div>
            <div className="watch-stat-card">
              <div className="watch-stat-icon">🎭</div>
              <div className="watch-stat-value">{watchStats.genresWatched?.length || 0}</div>
              <div className="watch-stat-label">Genres Explored</div>
            </div>
          </div>
        </div>
      )}

      {/* Watch Status */}
      <div className="stats-section-block">
        <h3>Watch Status</h3>
        <div className="status-bars">
          <div className="status-bar">
            <div className="status-label">
              <span>▶ Watching</span>
              <span>{watchingStats.watching}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill watching"
                style={{ width: `${(watchingStats.watching / stats.total) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="status-bar">
            <div className="status-label">
              <span>✓ Completed</span>
              <span>{watchingStats.completed}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill completed"
                style={{ width: `${(watchingStats.completed / stats.total) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="status-bar">
            <div className="status-label">
              <span>📋 Plan to Watch</span>
              <span>{watchingStats.planToWatch}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill plan"
                style={{ width: `${(watchingStats.planToWatch / stats.total) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Genre Distribution */}
      {genreDistribution.length > 0 && (
        <div className="stats-section-block">
          <h3>Top Genres</h3>
          <div className="genre-list">
            {genreDistribution.map(([genre, count], index) => (
              <div key={genre} className="genre-item">
                <span className="genre-rank">#{index + 1}</span>
                <span className="genre-name">{genre}</span>
                <span className="genre-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="stats-section-block achievements-block">
        <h3>
          🏆 Achievements 
          <span className="achievement-progress">
            {achievementStats.unlocked}/{achievementStats.total} ({achievementStats.percentage}%)
          </span>
        </h3>
        
        <div className="achievement-progress-bar">
          <div 
            className="achievement-fill"
            style={{ width: `${achievementStats.percentage}%` }}
          ></div>
        </div>

        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
          <div key={category} className="achievement-category">
            <h4 className="category-title">{category}</h4>
            <div className="achievements-grid">
              {categoryAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  title={achievement.description}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-desc">{achievement.description}</div>
                    {!achievement.unlocked && achievement.goal && (
                      <div className="achievement-progress-text">
                        {achievement.progress || 0}/{achievement.goal}
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="achievement-badge">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsSection;
