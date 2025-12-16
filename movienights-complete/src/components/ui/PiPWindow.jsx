/* ========================================
   PiPWindow.jsx - Picture-in-Picture Window Component
   ======================================== */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PiPWindow.css';

function PiPWindow({ isOpen, onClose, src, title }) {
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 250 });
  const [size, setSize] = useState({ width: 320, height: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const windowRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    if (e.target.closest('.pip-resize-handle') || e.target.closest('.pip-controls')) {
      return;
    }
    
    e.preventDefault();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
    setIsDragging(true);
  }, [position]);

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    const newX = Math.max(0, Math.min(window.innerWidth - size.width, clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - size.height, clientY - dragOffset.current.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, size]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    resizeStart.current = {
      width: size.width,
      height: size.height,
      x: clientX,
      y: clientY
    };
    setIsResizing(true);
  }, [size]);

  // Handle resize move
  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    const deltaX = clientX - resizeStart.current.x;
    const deltaY = clientY - resizeStart.current.y;
    
    const newWidth = Math.max(240, Math.min(800, resizeStart.current.width + deltaX));
    const newHeight = Math.max(135, Math.min(450, resizeStart.current.height + deltaY));
    
    // Maintain aspect ratio
    const aspectRatio = 16 / 9;
    const heightFromWidth = newWidth / aspectRatio;
    
    setSize({
      width: newWidth,
      height: Math.round(heightFromWidth)
    });
  }, [isResizing]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.addEventListener('touchmove', handleResizeMove);
      document.addEventListener('touchend', handleResizeEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchmove', handleResizeMove);
      document.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Toggle minimize
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={`pip-window ${isDragging ? 'dragging' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 200 : size.width,
        height: isMinimized ? 40 : size.height + 40
      }}
    >
      {/* Header */}
      <div
        className="pip-header"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <span className="pip-title">{title || 'Now Playing'}</span>
        <div className="pip-controls">
          <button className="pip-btn" onClick={handleMinimize} title={isMinimized ? 'Expand' : 'Minimize'}>
            {isMinimized ? '□' : '−'}
          </button>
          <button className="pip-btn pip-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      {/* Video Content */}
      {!isMinimized && (
        <div className="pip-content">
          <iframe
            src={src}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen"
            title={title}
          />
        </div>
      )}

      {/* Resize Handle */}
      {!isMinimized && (
        <div
          className="pip-resize-handle"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <svg viewBox="0 0 10 10" width="10" height="10">
            <path d="M0 10 L10 0 M5 10 L10 5 M10 10 L10 10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default PiPWindow;
