/* ========================================
   NavigationTabs.jsx - Navigation Tabs Component
   ======================================== */

import React from 'react';
import { useApp } from '../../context/AppContext';
import './NavigationTabs.css';

const tabs = [
  { id: 'discover', label: 'Discover', icon: '🔥' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'anime', label: 'Anime', icon: '🎌' },
  { id: 'tvshows', label: 'TV Shows', icon: '📺' },
  { id: 'livetv', label: 'Live TV', icon: '📡' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'focus', label: 'Focus', icon: '🧘' },
  { id: 'collection', label: 'Collection', icon: '💼' },
  { id: 'watchlists', label: 'Watchlists', icon: '📋' },
  { id: 'lists', label: 'Lists', icon: '📝' },
  { id: 'stats', label: 'Stats', icon: '📊' }
];

function NavigationTabs() {
  const { state, actions } = useApp();
  const { currentSection } = state;

  return (
    <nav className="premium-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${currentSection === tab.id ? 'active' : ''}`}
            onClick={() => actions.setSection(tab.id)}
            aria-current={currentSection === tab.id ? 'page' : undefined}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavigationTabs;
