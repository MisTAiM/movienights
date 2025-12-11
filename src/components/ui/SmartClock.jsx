/* ========================================
   SmartClock.jsx - Smart Clock Component
   ======================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './SmartClock.css';

function SmartClock({ currentItem = null }) {
  const [time, setTime] = useState(new Date());
  const [isVisible, setIsVisible] = useLocalStorage('smartClockVisible', false);
  const [position, setPosition] = useLocalStorage('smartClockPosition', { x: 20, y: 80 });
  const [alarms, setAlarms] = useLocalStorage('movieNightsAlarms', []);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [watchingDuration, setWatchingDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const clockRef = useRef(null);
  const watchingStartRef = useRef(null);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track watching duration
  useEffect(() => {
    if (currentItem) {
      watchingStartRef.current = Date.now();
      const interval = setInterval(() => {
        if (watchingStartRef.current) {
          setWatchingDuration(Math.floor((Date.now() - watchingStartRef.current) / 1000));
        }
      }, 1000);
      return () => {
        clearInterval(interval);
        watchingStartRef.current = null;
        setWatchingDuration(0);
      };
    }
  }, [currentItem]);

  // Check alarms
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      alarms.forEach(alarm => {
        if (alarm.time === currentTimeStr && !alarm.triggered) {
          setActiveAlarm(alarm);
          playAlarmSound();
          // Mark as triggered
          setAlarms(prev => prev.map(a => 
            a.id === alarm.id ? { ...a, triggered: true } : a
          ));
          // Auto-dismiss after 1 minute
          setTimeout(() => {
            setActiveAlarm(null);
            deleteAlarm(alarm.id);
          }, 60000);
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, setAlarms]);

  // Play alarm sound
  const playAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create alarm beep sequence
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioContext.currentTime);
          gain.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.3);
        }, i * 400);
      }
    } catch (e) {
      console.log('Could not play alarm sound');
    }
  };

  // Add alarm
  const addAlarm = () => {
    const timeStr = prompt('Enter alarm time (HH:MM in 24h format):');
    if (!timeStr) return;
    
    const match = timeStr.match(/^(\d{2}):(\d{2})$/);
    if (!match) {
      alert('Invalid time format. Use HH:MM (e.g., 14:30)');
      return;
    }
    
    const label = prompt('Alarm label (optional):') || 'Alarm';
    
    const newAlarm = {
      id: Date.now(),
      time: timeStr,
      label,
      triggered: false
    };
    
    setAlarms(prev => [...prev, newAlarm]);
  };

  // Delete alarm
  const deleteAlarm = (id) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
    if (activeAlarm?.id === id) {
      setActiveAlarm(null);
    }
  };

  // Dismiss active alarm
  const dismissAlarm = () => {
    if (activeAlarm) {
      deleteAlarm(activeAlarm.id);
    }
  };

  // Toggle visibility
  const toggleClock = useCallback(() => {
    setIsVisible(prev => !prev);
  }, [setIsVisible]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.alarm-btn') || e.target.closest('.alarm-delete')) return;
    setIsDragging(true);
    const rect = clockRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newX = window.innerWidth - e.clientX - clockRef.current.offsetWidth + dragOffset.x;
    const newY = window.innerHeight - e.clientY - clockRef.current.offsetHeight + dragOffset.y;
    
    // Keep within bounds
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 200));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 150));
    
    setPosition({ x: boundedX, y: boundedY });
  }, [isDragging, dragOffset, setPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate end time
  const getEndTime = () => {
    if (!currentItem?.runtime) return null;
    const endTime = new Date(watchingStartRef.current + (currentItem.runtime * 60000));
    return endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Expose toggle function globally
  useEffect(() => {
    window.toggleSmartClock = toggleClock;
    return () => {
      delete window.toggleSmartClock;
    };
  }, [toggleClock]);

  if (!isVisible) return null;

  return (
    <div
      ref={clockRef}
      className={`smart-clock ${activeAlarm ? 'alarm-active' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ right: position.x, bottom: position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Active Alarm Overlay */}
      {activeAlarm && (
        <div className="alarm-overlay">
          <div className="alarm-message">
            <span className="alarm-icon">⏰</span>
            <span className="alarm-label">{activeAlarm.label}</span>
          </div>
          <button className="dismiss-btn" onClick={dismissAlarm}>
            Dismiss
          </button>
        </div>
      )}

      {/* Time Display */}
      <div className="clock-time">{formatTime(time)}</div>
      <div className="clock-date">{formatDate(time)}</div>

      {/* Currently Watching */}
      {currentItem && (
        <div className="clock-watching">
          <div className="watching-title">
            {currentItem.title || currentItem.name}
          </div>
          <div className="watching-stats">
            <span>⏱️ {formatDuration(watchingDuration)}</span>
            {currentItem.runtime && (
              <span className="end-time">🎬 Ends at {getEndTime()}</span>
            )}
          </div>
        </div>
      )}

      {/* Alarms Section */}
      <div className="clock-alarms">
        <div className="alarms-header">
          <span className="alarms-title">⏰ Alarms</span>
          <button className="alarm-btn add-alarm" onClick={addAlarm}>
            + Add
          </button>
        </div>
        
        {alarms.length > 0 && (
          <div className="alarm-list">
            {alarms.map(alarm => (
              <div key={alarm.id} className="alarm-item">
                <span className="alarm-time">{alarm.time}</span>
                <span className="alarm-label">{alarm.label}</span>
                <button 
                  className="alarm-delete"
                  onClick={() => deleteAlarm(alarm.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      <button className="clock-close" onClick={toggleClock}>×</button>
    </div>
  );
}

export default SmartClock;
