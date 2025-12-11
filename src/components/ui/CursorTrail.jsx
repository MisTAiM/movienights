/* ========================================
   CursorTrail.jsx - Cursor Trail Effect Component
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CursorTrail.css';

const TRAIL_LENGTH = 12;
const TRAIL_FADE_DELAY = 50;

function CursorTrail() {
  const [trail, setTrail] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrame = useRef();

  // Check for hover capability and performance
  useEffect(() => {
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check device performance
    const isLowPerformance = 
      navigator.hardwareConcurrency < 4 ||
      navigator.deviceMemory < 4;
    
    setIsSupported(hasHover && !prefersReducedMotion && !isLowPerformance);
  }, []);

  const addTrailPoint = useCallback((x, y) => {
    const id = Date.now() + Math.random();
    setTrail(prev => {
      const newTrail = [...prev, { id, x, y, opacity: 1 }];
      // Keep only recent points
      return newTrail.slice(-TRAIL_LENGTH);
    });
  }, []);

  useEffect(() => {
    if (!isSupported || !isEnabled) return;

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      
      // Only add point if moved enough distance
      const dx = x - lastPosition.current.x;
      const dy = y - lastPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 10) {
        lastPosition.current = { x, y };
        addTrailPoint(x, y);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Fade out trail points
    const fadeInterval = setInterval(() => {
      setTrail(prev => 
        prev
          .map(point => ({ ...point, opacity: point.opacity - 0.1 }))
          .filter(point => point.opacity > 0)
      );
    }, TRAIL_FADE_DELAY);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(fadeInterval);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isSupported, isEnabled, addTrailPoint]);

  if (!isSupported || !isEnabled) return null;

  return (
    <div className="cursor-trail-container">
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="trail-dot"
          style={{
            left: point.x,
            top: point.y,
            opacity: point.opacity,
            transform: `translate(-50%, -50%) scale(${0.5 + (index / TRAIL_LENGTH) * 0.5})`,
          }}
        />
      ))}
    </div>
  );
}

export default CursorTrail;
