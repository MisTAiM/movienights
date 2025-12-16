/* ========================================
   Header.jsx - MovieNights Header
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Header.css';

function Header() {
  const { state, actions } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    actions.setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="header-logo">
          <span className="logo-icon">🎬</span>
          <div className="logo-text">
            <h1>MovieNights</h1>
            <span className="logo-tagline">Ultimate</span>
          </div>
        </div>

        <div className="header-right">
          <div className="header-stats">
            <div className="stat-item" title="Collection">
              <span className="stat-icon">📚</span>
              <span className="stat-value">{state.collection?.length || 0}</span>
            </div>
            <div className="stat-item" title="Achievements">
              <span className="stat-icon">🏆</span>
              <span className="stat-value">
                {state.achievements?.filter(a => a.unlocked)?.length || 0}
              </span>
            </div>
          </div>

          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {state.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
