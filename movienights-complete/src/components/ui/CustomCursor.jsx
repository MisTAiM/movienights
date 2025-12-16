/* ========================================
   CustomCursor.jsx - Custom Cursor Component
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CustomCursor.css';

function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  const requestRef = useRef();
  const targetRef = useRef({ x: 0, y: 0 });

  // Check if device supports hover (not touch)
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check for hover capability
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsSupported(hasHover);
  }, []);

  // Smooth cursor movement
  const animate = useCallback(() => {
    setPosition(prev => ({
      x: prev.x + (targetRef.current.x - prev.x) * 0.15,
      y: prev.y + (targetRef.current.y - prev.y) * 0.15
    }));
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const handleMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setIsHidden(false);
    };

    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleElementHover = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.classList.contains('content-card') ||
        target.classList.contains('nav-tab') ||
        target.classList.contains('action-btn') ||
        target.onclick !== null ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[onclick]') ||
        target.closest('.content-card');
      
      setIsPointer(isClickable);
    };

    // Start animation loop
    requestRef.current = requestAnimationFrame(animate);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleElementHover);

    return () => {
      cancelAnimationFrame(requestRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
    };
  }, [isSupported, animate]);

  if (!isSupported) return null;

  return (
    <>
      {/* Main Cursor */}
      <div
        className={`custom-cursor ${isPointer ? 'pointer' : ''} ${isHidden ? 'hidden' : ''} ${isClicking ? 'clicking' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        <div className="cursor-dot"></div>
      </div>

      {/* Cursor Ring */}
      <div
        className={`cursor-ring ${isPointer ? 'pointer' : ''} ${isHidden ? 'hidden' : ''} ${isClicking ? 'clicking' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      />
    </>
  );
}

export default CustomCursor;
