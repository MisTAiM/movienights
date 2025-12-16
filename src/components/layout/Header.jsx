/* ========================================
   Header.jsx - Main Header Component
   ======================================== */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import NavigationTabs from './NavigationTabs';
import './Header.css';

function Header() {
  const { state, actions } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const settingsRef = useRef(null);
  const buttonRef = useRef(null);

  // Update dropdown position when opening
  useEffect(() => {
    if (settingsOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right
      });
    }
  }, [settingsOpen]);

  // Close settings on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };

    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  const handleExport = () => {
    const data = actions.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movienights-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    actions.addNotification('Collection exported!', 'success');
    setSettingsOpen(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            actions.importData(data);
            actions.addNotification('Collection imported!', 'success');
          } catch {
            actions.addNotification('Invalid file format', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setSettingsOpen(false);
  };

  return (
    <header className="header">
      {/* Animated Banner */}
      <div className="banner-container">
        <svg className="banner-svg" viewBox="0 0 1600 180" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Gold Gradient */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
            
            {/* Elegant dark gradient - vertical */}
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="50%" stopColor="#111111" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            
            {/* Subtle center spotlight */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.08" />
              <stop offset="40%" stopColor="#d4af37" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            
            {/* Vignette effect */}
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </radialGradient>
            
            {/* Horizontal shimmer */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
              <stop offset="50%" stopColor="#d4af37" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Soft glow for accents */}
            <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base Background - Smooth gradient */}
          <rect width="100%" height="100%" fill="url(#bgGradient)" />
          
          {/* Center spotlight glow */}
          <rect width="100%" height="100%" fill="url(#centerGlow)" />
          
          {/* Subtle horizontal shimmer band */}
          <rect x="0" y="70" width="100%" height="40" fill="url(#shimmer)" opacity="0.5" />
          
          {/* Vignette overlay */}
          <rect width="100%" height="100%" fill="url(#vignette)" />

          {/* Top accent line - elegant thin gold */}
          <rect className="accent-bar" x="0" y="0" width="100%" height="2" fill="url(#goldGradient)" opacity="0.9" />
          
          {/* Bottom accent line */}
          <rect className="accent-bar" x="0" y="178" width="100%" height="2" fill="url(#goldGradient)" opacity="0.9" />
          
          {/* Decorative corner flourishes - left */}
          <g opacity="0.4" filter="url(#softGlow)">
            <path d="M0,0 Q80,40 60,90 Q40,140 0,180" stroke="url(#goldGradient)" strokeWidth="1" fill="none" />
            <circle cx="60" cy="90" r="2" fill="#d4af37" />
          </g>
          
          {/* Decorative corner flourishes - right */}
          <g opacity="0.4" filter="url(#softGlow)">
            <path d="M1600,0 Q1520,40 1540,90 Q1560,140 1600,180" stroke="url(#goldGradient)" strokeWidth="1" fill="none" />
            <circle cx="1540" cy="90" r="2" fill="#d4af37" />
          </g>
          
          {/* Center decorative elements */}
          <g transform="translate(800, 60)" filter="url(#glow)">
            {/* Outer ring */}
            <circle r="35" fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" opacity="0.6" />
            {/* Inner glow */}
            <circle r="25" fill="url(#goldGradient)" opacity="0.08" />
            {/* Play symbol */}
            <polygon points="-8,-12 -8,12 12,0" fill="url(#goldGradient)" opacity="0.9" />
          </g>
          
          {/* Subtle horizontal lines for depth */}
          <line x1="200" y1="60" x2="500" y2="60" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.2" />
          <line x1="1100" y1="60" x2="1400" y2="60" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.2" />

          {/* Title */}
          <text x="800" y="125" textAnchor="middle" className="banner-title" fill="url(#goldGradient)">
            MOVIENIGHTS
          </text>
          
          {/* Subtitle */}
          <text x="800" y="150" textAnchor="middle" className="banner-subtitle" fill="#888888">
            Ultimate Entertainment Experience
          </text>

          {/* Elegant floating particles - fewer, more refined */}
          {[...Array(12)].map((_, i) => (
            <circle
              key={i}
              className="sparkle"
              cx={150 + (i * 120)}
              cy={30 + (i % 3) * 50}
              r={1 + (i % 2)}
              fill="#d4af37"
              opacity={0.3 + (i % 3) * 0.2}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </svg>

        {/* Settings Dropdown - Positioned inside banner */}
        <div className="header-actions" ref={settingsRef}>
          <button 
            ref={buttonRef}
            className="settings-trigger"
            onClick={() => setSettingsOpen(!settingsOpen)}
            aria-expanded={settingsOpen}
          >
            <span className="settings-icon">⚙️</span>
            <span className="settings-label">Settings</span>
            <span className={`settings-arrow ${settingsOpen ? 'open' : ''}`}>▼</span>
          </button>
        </div>
      </div>

      {/* Settings Menu - Fixed position to appear above everything */}
      {settingsOpen && (
        <div 
          className="settings-menu-fixed"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            zIndex: 9999
          }}
        >
          <button className="settings-item" onClick={actions.toggleTheme}>
            <span className="item-icon">{state.theme === 'dark' ? '☀️' : '🌙'}</span>
            <div className="item-content">
              <span className="item-label">
                {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
              <span className="item-desc">Switch theme</span>
            </div>
          </button>

          <button className="settings-item" onClick={handleExport}>
            <span className="item-icon">📤</span>
            <div className="item-content">
              <span className="item-label">Export Data</span>
              <span className="item-desc">Backup your collection</span>
            </div>
          </button>

          <button className="settings-item" onClick={handleImport}>
            <span className="item-icon">📥</span>
            <div className="item-content">
              <span className="item-label">Import Data</span>
              <span className="item-desc">Restore from backup</span>
            </div>
          </button>

          <button className="settings-item settings-danger" onClick={actions.clearAllData}>
            <span className="item-icon">🗑️</span>
            <div className="item-content">
              <span className="item-label">Clear All Data</span>
              <span className="item-desc">Reset everything</span>
            </div>
          </button>

          <div className="settings-divider"></div>

          <button 
            className="settings-item" 
            onClick={() => {
              if (window.toggleSmartClock) window.toggleSmartClock();
              setSettingsOpen(false);
            }}
          >
            <span className="item-icon">🕐</span>
            <div className="item-content">
              <span className="item-label">Smart Clock</span>
              <span className="item-desc">Toggle clock display (C)</span>
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <NavigationTabs />
    </header>
  );
}

export default Header;
