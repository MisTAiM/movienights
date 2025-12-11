/* ========================================
   CastButton.jsx - Chromecast & Casting Support
   ======================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './CastButton.css';

function CastButton({ currentSource, title, isLiveTV = false }) {
  const { actions } = useApp();
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [showCastMenu, setShowCastMenu] = useState(false);
  const [castSession, setCastSession] = useState(null);

  // Initialize Google Cast SDK
  useEffect(() => {
    // Load Google Cast SDK
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    script.async = true;
    document.body.appendChild(script);

    // Initialize Cast when SDK is loaded
    window['__onGCastApiAvailable'] = function(isAvailable) {
      if (isAvailable) {
        initializeCastApi();
      }
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeCastApi = () => {
    const cast = window.cast;
    const chrome = window.chrome;

    if (!cast || !chrome || !chrome.cast) {
      console.log('Cast API not available');
      return;
    }

    const sessionRequest = new chrome.cast.SessionRequest(
      chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    );

    const apiConfig = new chrome.cast.ApiConfig(
      sessionRequest,
      sessionListener,
      receiverListener
    );

    chrome.cast.initialize(
      apiConfig,
      () => {
        console.log('Cast initialized successfully');
        setIsCastAvailable(true);
      },
      (error) => {
        console.log('Cast initialization error:', error);
      }
    );
  };

  const sessionListener = (session) => {
    console.log('New cast session:', session);
    setCastSession(session);
    setIsCasting(true);
  };

  const receiverListener = (availability) => {
    if (availability === 'available') {
      setIsCastAvailable(true);
    } else {
      setIsCastAvailable(false);
    }
  };

  // Start casting
  const startCasting = useCallback(() => {
    const chrome = window.chrome;
    
    if (!chrome || !chrome.cast) {
      // Fallback: Show manual casting options
      setShowCastMenu(true);
      return;
    }

    chrome.cast.requestSession(
      (session) => {
        setCastSession(session);
        setIsCasting(true);
        
        if (currentSource) {
          loadMedia(session);
        }
        
        actions.addNotification(`Casting to ${session.receiver.friendlyName}`, 'success');
        setShowCastMenu(false);
      },
      (error) => {
        console.log('Cast request error:', error);
        // Show fallback menu
        setShowCastMenu(true);
      }
    );
  }, [currentSource, actions]);

  // Load media to cast device
  const loadMedia = (session) => {
    const chrome = window.chrome;
    
    if (!chrome || !chrome.cast || !currentSource) return;

    const mediaInfo = new chrome.cast.media.MediaInfo(currentSource, 'video/mp4');
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title || 'MovieNights';

    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    session.loadMedia(
      request,
      (mediaSession) => {
        console.log('Media loaded successfully');
      },
      (error) => {
        console.log('Error loading media:', error);
      }
    );
  };

  // Stop casting
  const stopCasting = () => {
    if (castSession) {
      castSession.stop(
        () => {
          setIsCasting(false);
          setCastSession(null);
          actions.addNotification('Stopped casting', 'info');
        },
        (error) => {
          console.log('Error stopping cast:', error);
        }
      );
    }
    setShowCastMenu(false);
  };

  // Open in external app for casting
  const openInApp = (app) => {
    if (!currentSource) {
      actions.addNotification('No video source to cast', 'warning');
      return;
    }

    let url;
    switch (app) {
      case 'vlc':
        // VLC URL scheme
        url = `vlc://${currentSource}`;
        break;
      case 'webvideo':
        // Web Video Caster scheme
        url = `https://nicecatch.me/cast/?url=${encodeURIComponent(currentSource)}`;
        break;
      case 'copy':
        // Copy URL to clipboard
        navigator.clipboard.writeText(currentSource).then(() => {
          actions.addNotification('URL copied! Paste in your casting app', 'success');
        });
        setShowCastMenu(false);
        return;
      default:
        return;
    }

    window.open(url, '_blank');
    setShowCastMenu(false);
  };

  // Screen sharing / Presentation API
  const startScreenShare = async () => {
    try {
      if ('getDisplayMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        actions.addNotification('Screen sharing started!', 'success');
        // Stream is now being captured
        setShowCastMenu(false);
      } else {
        actions.addNotification('Screen sharing not supported in this browser', 'warning');
      }
    } catch (error) {
      console.log('Screen share error:', error);
      if (error.name !== 'AbortError') {
        actions.addNotification('Could not start screen sharing', 'error');
      }
    }
  };

  // Presentation API for Smart TVs
  const startPresentation = async () => {
    try {
      if ('presentation' in navigator) {
        const request = new PresentationRequest([currentSource || window.location.href]);
        const connection = await request.start();
        
        connection.addEventListener('connect', () => {
          actions.addNotification('Connected to display!', 'success');
          setIsCasting(true);
        });
        
        connection.addEventListener('close', () => {
          setIsCasting(false);
        });
        
        setShowCastMenu(false);
      } else {
        actions.addNotification('Presentation API not supported', 'warning');
      }
    } catch (error) {
      console.log('Presentation error:', error);
      if (error.name !== 'AbortError') {
        actions.addNotification('Could not connect to display', 'error');
      }
    }
  };

  return (
    <div className="cast-button-container">
      <button
        className={`cast-btn ${isCasting ? 'casting' : ''}`}
        onClick={() => isCasting ? stopCasting() : setShowCastMenu(!showCastMenu)}
        title={isCasting ? 'Stop Casting' : 'Cast to Device'}
      >
        {isCasting ? (
          <>
            <svg viewBox="0 0 24 24" className="cast-icon casting">
              <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              <circle cx="5" cy="19" r="3" className="cast-pulse"/>
            </svg>
            <span className="cast-label">Casting</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="cast-icon">
              <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <span className="cast-label">Cast</span>
          </>
        )}
      </button>

      {/* Cast Menu Dropdown */}
      {showCastMenu && (
        <>
          <div className="cast-menu-backdrop" onClick={() => setShowCastMenu(false)} />
          <div className="cast-menu">
            <div className="cast-menu-header">
              <h3>📺 Cast to Device</h3>
              <button className="close-btn" onClick={() => setShowCastMenu(false)}>×</button>
            </div>
            
            <div className="cast-options">
              {/* Chromecast */}
              <button className="cast-option" onClick={startCasting}>
                <span className="cast-option-icon">📡</span>
                <div className="cast-option-info">
                  <span className="cast-option-name">Chromecast</span>
                  <span className="cast-option-desc">Cast to Chromecast devices</span>
                </div>
              </button>

              {/* Smart TV / Presentation API */}
              <button className="cast-option" onClick={startPresentation}>
                <span className="cast-option-icon">📺</span>
                <div className="cast-option-info">
                  <span className="cast-option-name">Smart TV / Display</span>
                  <span className="cast-option-desc">Connect to nearby displays</span>
                </div>
              </button>

              {/* Screen Share */}
              <button className="cast-option" onClick={startScreenShare}>
                <span className="cast-option-icon">🖥️</span>
                <div className="cast-option-info">
                  <span className="cast-option-name">Screen Share</span>
                  <span className="cast-option-desc">Share your screen to a meeting</span>
                </div>
              </button>

              {/* AirPlay hint */}
              <div className="cast-option disabled">
                <span className="cast-option-icon">🍎</span>
                <div className="cast-option-info">
                  <span className="cast-option-name">AirPlay</span>
                  <span className="cast-option-desc">Use Safari's AirPlay button</span>
                </div>
              </div>

              <div className="cast-divider">
                <span>External Apps</span>
              </div>

              {/* Copy URL */}
              <button className="cast-option" onClick={() => openInApp('copy')}>
                <span className="cast-option-icon">📋</span>
                <div className="cast-option-info">
                  <span className="cast-option-name">Copy Stream URL</span>
                  <span className="cast-option-desc">Paste in VLC, casting apps, etc.</span>
                </div>
              </button>

              {/* Web Video Caster */}
              <button className="cast-option" onClick={() => openInApp('webvideo')}>
                <span className="cast-option-icon">🎬</span>
                <div className="cast-option-info">
                  <span className="cast-option-name">Web Video Caster</span>
                  <span className="cast-option-desc">Open in web casting tool</span>
                </div>
              </button>

              {/* Open in new tab */}
              {currentSource && (
                <a 
                  href={currentSource} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="cast-option"
                  onClick={() => setShowCastMenu(false)}
                >
                  <span className="cast-option-icon">🔗</span>
                  <div className="cast-option-info">
                    <span className="cast-option-name">Open in New Tab</span>
                    <span className="cast-option-desc">Use browser's built-in cast</span>
                  </div>
                </a>
              )}
            </div>

            <div className="cast-menu-footer">
              <p>💡 Tip: In Chrome, right-click the video and select "Cast"</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CastButton;
