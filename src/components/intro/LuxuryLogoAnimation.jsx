/* ========================================
   LuxuryLogoAnimation.jsx - Animated Logo Component
   ======================================== */

import React from 'react';
import './LuxuryLogoAnimation.css';

function LuxuryLogoAnimation() {
  return (
    <div className="luxury-logo">
      {/* Orbiting Elements */}
      <div className="orbit-ring orbit-1">
        <div className="orbit-dot"></div>
      </div>
      <div className="orbit-ring orbit-2">
        <div className="orbit-dot"></div>
      </div>
      <div className="orbit-ring orbit-3">
        <div className="orbit-dot"></div>
      </div>

      {/* Main Logo Circle */}
      <div className="logo-circle">
        <div className="logo-inner">
          <svg viewBox="0 0 100 100" className="logo-svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#b8860b" />
              </linearGradient>
              <filter id="logoGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Play Triangle */}
            <polygon
              points="35,25 35,75 75,50"
              fill="url(#logoGradient)"
              filter="url(#logoGlow)"
              className="play-icon"
            />
          </svg>
        </div>
        
        {/* Pulse Ring */}
        <div className="pulse-ring"></div>
        <div className="pulse-ring delay-1"></div>
        <div className="pulse-ring delay-2"></div>
      </div>

      {/* Sparkle Effects */}
      <div className="sparkles">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              '--angle': `${i * 45}deg`,
              '--delay': `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default LuxuryLogoAnimation;
