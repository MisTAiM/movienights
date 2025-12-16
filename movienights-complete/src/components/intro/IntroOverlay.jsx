/* ========================================
   IntroOverlay.jsx - Intro Animation Overlay
   ======================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { detectDevice } from '../../utils/helpers';
import LuxuryLogoAnimation from './LuxuryLogoAnimation';
import './IntroOverlay.css';

function IntroOverlay() {
  const { state, actions } = useApp();
  const [isExiting, setIsExiting] = useState(false);
  const [particles, setParticles] = useState([]);

  // Determine intro duration based on device
  const device = detectDevice();
  const introDuration = device.isMobile ? 2500 : 5500;

  // Generate particles on mount
  useEffect(() => {
    if (!device.isMobile) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 4,
        tx: (Math.random() - 0.5) * 200,
        ty: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 720
      }));
      setParticles(newParticles);
    }
  }, []);

  // Handle intro completion
  useEffect(() => {
    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, introDuration - 800);

    // Complete intro
    const completeTimer = setTimeout(() => {
      actions.setIntroComplete(true);
    }, introDuration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [introDuration, actions]);

  // Don't render if intro is complete
  if (state.isIntroComplete) return null;

  return (
    <div className={`intro-overlay ${isExiting ? 'exiting' : ''}`}>
      {/* Background Effects */}
      {!device.isMobile && (
        <>
          <div className="intro-rays"></div>
          <div className="intro-vignette"></div>
          <div className="intro-spotlight"></div>
        </>
      )}

      {/* Floating Particles */}
      {!device.isMobile && (
        <div className="luxury-particles">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="luxury-particle"
              style={{
                left: particle.left,
                top: particle.top,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                '--tx': `${particle.tx}px`,
                '--ty': `${particle.ty}px`,
                '--r': `${particle.rotation}deg`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="intro-content-wrapper">
        {/* Decorative Frame */}
        <div className="intro-frame">
          <div className="frame-corner top-left"></div>
          <div className="frame-corner top-right"></div>
          <div className="frame-corner bottom-left"></div>
          <div className="frame-corner bottom-right"></div>
        </div>

        {/* Logo */}
        <LuxuryLogoAnimation />

        {/* Title */}
        <h1 className="intro-title">MOVIENIGHTS</h1>

        {/* Subtitle */}
        <p className="intro-subtitle">Ultimate Entertainment Experience</p>

        {/* Creator Credit */}
        <p className="intro-creator">Created by <span className="creator-name">Morpheus</span></p>

        {/* Divider */}
        <div className="intro-divider"></div>

        {/* Loading Bar */}
        <div className="intro-loading">
          <div className="loading-bar">
            <div className="loading-fill"></div>
            <div className="loading-shine"></div>
          </div>
        </div>
      </div>

      {/* Floating Shapes (background) */}
      {!device.isMobile && (
        <div className="floating-particles">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="floating-particle"
              style={{
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default IntroOverlay;
