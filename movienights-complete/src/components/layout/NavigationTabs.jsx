/* ========================================
   NavigationTabs.jsx - Modern Navigation Component
   ======================================== */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './NavigationTabs.css';

const navGroups = [
  {
    id: 'browse',
    tabs: [
      { id: 'discover', label: 'Discover', icon: '🔥' },
      { id: 'movies', label: 'Movies', icon: '🎬' },
      { id: 'tvshows', label: 'TV', icon: '📺' },
      { id: 'anime', label: 'Anime', icon: '🎌' },
    ]
  },
  {
    id: 'media',
    tabs: [
      { id: 'livetv', label: 'Live', icon: '📡' },
      { id: 'music', label: 'Music', icon: '🎵' },
      { id: 'games', label: 'Games', icon: '🎮' },
      { id: 'reading', label: 'Read', icon: '📚' },
    ]
  },
  {
    id: 'social',
    tabs: [
      { id: 'watchparty', label: 'Party', icon: '🎉' },
      { id: 'calendar', label: 'Calendar', icon: '📅' },
    ]
  },
  {
    id: 'personal',
    tabs: [
      { id: 'focus', label: 'Focus', icon: '🧘' },
      { id: 'collection', label: 'Library', icon: '💼' },
      { id: 'watchlists', label: 'Lists', icon: '📋' },
      { id: 'stats', label: 'Stats', icon: '📊' },
    ]
  }
];

// Flat list for TV navigation
const allTabs = navGroups.flatMap(g => g.tabs);

function NavigationTabs() {
  const { state, actions } = useApp();
  const { currentSection, isMobile } = state;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef(null);
  const tabRefs = useRef([]);

  // Find current tab index
  useEffect(() => {
    const idx = allTabs.findIndex(t => t.id === currentSection);
    if (idx !== -1) setFocusedIndex(idx);
  }, [currentSection]);

  // TV Remote / Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(allTabs.length - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          if (document.activeElement?.classList.contains('nav-item')) {
            e.preventDefault();
            actions.setSection(allTabs[focusedIndex].id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, actions]);

  // Focus management for TV
  useEffect(() => {
    if (tabRefs.current[focusedIndex]) {
      tabRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (isMobile && tabRefs.current[focusedIndex]) {
      tabRefs.current[focusedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [focusedIndex, isMobile]);

  let tabIndex = 0;

  return (
    <nav className="nav-container" ref={navRef} role="navigation" aria-label="Main">
      <div className="nav-scroll">
        <div className="nav-inner">
          {navGroups.map((group, groupIdx) => (
            <div key={group.id} className="nav-group">
              {group.tabs.map((tab) => {
                const currentTabIndex = tabIndex++;
                const isActive = currentSection === tab.id;
                const isFocused = focusedIndex === currentTabIndex;
                
                return (
                  <button
                    key={tab.id}
                    ref={el => tabRefs.current[currentTabIndex] = el}
                    className={`nav-item ${isActive ? 'active' : ''} ${isFocused ? 'focused' : ''}`}
                    onClick={() => actions.setSection(tab.id)}
                    onFocus={() => setFocusedIndex(currentTabIndex)}
                    tabIndex={isFocused ? 0 : -1}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-item-icon">{tab.icon}</span>
                    <span className="nav-item-label">{tab.label}</span>
                  </button>
                );
              })}
              {groupIdx < navGroups.length - 1 && <div className="nav-divider" />}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default NavigationTabs;
