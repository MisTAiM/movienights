/* ========================================
   Header.jsx - Premium Cosmic Header
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Header.css';

function Header() {
  const { state, actions } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const themes = [
    { id: 'default', name: 'Cosmic Purple', icon: '🟣' },
    { id: 'rose', name: 'Midnight Rose', icon: '🌹' },
    { id: 'ocean', name: 'Ocean Depths', icon: '🌊' },
    { id: 'emerald', name: 'Emerald Noir', icon: '💚' },
    { id: 'gold', name: 'Classic Gold', icon: '✨' },
    { id: 'light', name: 'Light Mode', icon: '☀️' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleThemeChange = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId === 'default' ? '' : themeId);
    localStorage.setItem('theme', themeId);
    setShowThemeMenu(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Animated gradient border */}
      <div className="header-glow"></div>
      
      <div className="header-content">
        {/* Logo Section */}
        <div className="header-logo">
          <div className="logo-icon">
            <span className="logo-emoji">🎬</span>
            <div className="logo-ring"></div>
          </div>
          <div className="logo-text">
            <h1 className="logo-title">MovieNights</h1>
            <span className="logo-subtitle">Ultimate</span>
          </div>
        </div>

        {/* Center - Clock & Date */}
        <div className="header-center">
          <div className="header-clock">
            <span className="clock-time">{formatTime(currentTime)}</span>
            <span className="clock-divider">•</span>
            <span className="clock-date">{formatDate(currentTime)}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Stats */}
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

          {/* Theme Switcher */}
          <div className="theme-switcher">
            <button 
              className="theme-toggle"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Change Theme"
            >
              <span className="theme-icon">🎨</span>
              <span className="theme-label">Theme</span>
            </button>
            
            {showThemeMenu && (
              <>
                <div className="theme-backdrop" onClick={() => setShowThemeMenu(false)}></div>
                <div className="theme-menu">
                  <div className="theme-menu-header">
                    <span>Choose Theme</span>
                  </div>
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      className="theme-option"
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <span className="theme-option-icon">{theme.icon}</span>
                      <span className="theme-option-name">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
