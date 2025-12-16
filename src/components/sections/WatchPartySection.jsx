/* ========================================
   WatchPartySection.jsx - Firebase Watch Party
   ======================================== */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import useFirebaseWatchParty from '../../hooks/useFirebaseWatchParty';
import './Sections.css';
import './WatchPartySection.css';

function WatchPartySection() {
  const appContext = useApp();
  const actions = appContext?.actions || {};
  
  // Firebase Watch Party Hook
  const {
    userId,
    username,
    setUsername,
    roomCode,
    isInRoom,
    isHost,
    isLoading,
    error,
    isConnected,
    participants,
    messages,
    controllerId,
    hasRemote,
    getControllerName,
    passRemote,
    takeBackRemote,
    requestRemote,
    videoState,
    setVideoUrl,
    togglePlayPause,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendReaction,
    setError
  } = useFirebaseWatchParty();
  
  // Local UI state
  const [joinCode, setJoinCode] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  
  // Refs
  const chatEndRef = useRef(null);
  
  // Quick reactions
  const reactions = ['😂', '😮', '😢', '😍', '🔥', '👏', '💀', '🎬'];

  // Notification helper
  const notify = (msg, type = 'info') => {
    if (actions.addNotification) {
      actions.addNotification(msg, type);
    }
  };

  // Scroll chat to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle create room
  const handleCreateRoom = async () => {
    const code = await createRoom();
    if (code) {
      notify(`Room ${code} created!`, 'success');
    }
  };

  // Handle join room
  const handleJoinRoom = async () => {
    const success = await joinRoom(joinCode);
    if (success) {
      notify(`Joined room ${joinCode.toUpperCase()}!`, 'success');
      setJoinCode('');
    }
  };

  // Handle leave room
  const handleLeaveRoom = async () => {
    await leaveRoom();
    notify('Left the room', 'info');
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage('');
  };

  // Handle select content
  const handleSelectContent = async () => {
    const input = prompt('Enter TMDB ID, IMDb ID, or direct video URL:\n\nExamples:\n• 550 (Fight Club)\n• tt0137523 (IMDb)\n• https://example.com/video.mp4');
    if (!input) return;
    
    let url = input;
    let contentInfo = null;
    
    if (input.startsWith('http')) {
      url = input;
    } else if (input.startsWith('tt')) {
      url = `https://vidsrc.cc/v2/embed/movie/${input}`;
      contentInfo = { type: 'movie', id: input };
    } else if (/^\d+$/.test(input)) {
      url = `https://vidsrc.cc/v2/embed/movie/${input}`;
      contentInfo = { type: 'movie', tmdbId: input };
    }
    
    await setVideoUrl(url, contentInfo);
    notify('Content selected!', 'success');
  };

  // Handle pass remote
  const handlePassRemote = async (targetId) => {
    await passRemote(targetId);
    setShowPassModal(false);
    notify('Remote passed!', 'success');
  };

  // Handle take back remote
  const handleTakeBackRemote = async () => {
    await takeBackRemote();
    notify('You have the remote!', 'success');
  };

  // Handle request remote
  const handleRequestRemote = async () => {
    await requestRemote();
    notify('Remote requested!', 'info');
  };

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    notify('Room code copied!', 'success');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ==================== RENDER ====================

  // LOBBY VIEW
  if (!isInRoom) {
    return (
      <section className="section watch-party-section">
        <div className="section-header">
          <h2 className="section-title">🎉 Watch Party</h2>
          <p className="wp-subtitle">Watch together in real-time with Firebase sync</p>
        </div>

        <div className="wp-lobby">
          {/* Connection Status */}
          <div className={`wp-status-bar ${error ? 'error' : ''}`}>
            <span className={`wp-status-dot ${error ? 'error' : ''}`}></span>
            <span>{error || 'Ready to create or join a party'}</span>
          </div>

          {/* Username Card */}
          <div className="wp-card wp-name-card">
            <h3>👤 Your Display Name</h3>
            <input
              type="text"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              disabled={isLoading}
            />
          </div>

          {/* Create / Join Options */}
          <div className="wp-options">
            <div className="wp-card">
              <div className="wp-card-icon">🎬</div>
              <h3>Create Party</h3>
              <p>Start a new watch party and invite friends</p>
              <button 
                className="wp-btn wp-btn-create" 
                onClick={handleCreateRoom}
                disabled={isLoading || !username.trim()}
              >
                {isLoading ? 'Creating...' : 'Create Room'}
              </button>
            </div>

            <div className="wp-card">
              <div className="wp-card-icon">🔗</div>
              <h3>Join Party</h3>
              <p>Enter a 6-character room code</p>
              <input
                type="text"
                placeholder="XXXXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="wp-code-input"
                disabled={isLoading}
              />
              <button 
                className="wp-btn wp-btn-join" 
                onClick={handleJoinRoom}
                disabled={isLoading || !username.trim() || joinCode.length !== 6}
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>

          {/* Features Info */}
          <div className="wp-features">
            <h3>✨ Features</h3>
            <div className="wp-features-grid">
              <div className="wp-feature">
                <span>🌐</span>
                <div>
                  <strong>Real-time Sync</strong>
                  <p>Firebase-powered cross-device sync</p>
                </div>
              </div>
              <div className="wp-feature">
                <span>🎮</span>
                <div>
                  <strong>Remote Control</strong>
                  <p>Pass control to any participant</p>
                </div>
              </div>
              <div className="wp-feature">
                <span>💬</span>
                <div>
                  <strong>Live Chat</strong>
                  <p>Chat and react in real-time</p>
                </div>
              </div>
              <div className="wp-feature">
                <span>📱</span>
                <div>
                  <strong>Any Device</strong>
                  <p>Works on desktop, tablet & mobile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="wp-instructions">
            <h3>🔧 Firebase Setup Required</h3>
            <p>Add your Firebase config to <code>.env</code> file:</p>
            <pre className="wp-code-block">{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}</pre>
            <p className="wp-setup-note">
              📌 Enable <strong>Realtime Database</strong> in Firebase Console and set rules to allow read/write.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ROOM VIEW
  return (
    <section className="section watch-party-section wp-in-room">
      {/* Pass Remote Modal */}
      {showPassModal && (
        <div className="wp-modal-overlay" onClick={() => setShowPassModal(false)}>
          <div className="wp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🎮 Pass Remote To</h3>
            <div className="wp-user-list">
              {participants
                .filter(p => p.id !== userId && p.active)
                .map(p => (
                  <button 
                    key={p.id} 
                    className="wp-user-btn" 
                    onClick={() => handlePassRemote(p.id)}
                  >
                    <span className="wp-user-avatar">{p.name[0]?.toUpperCase()}</span>
                    <span className="wp-user-name">{p.name}</span>
                    {p.isHost && <span className="wp-host-badge">👑 Host</span>}
                    {p.id === controllerId && <span className="wp-remote-badge">🎮</span>}
                  </button>
                ))}
              {participants.filter(p => p.id !== userId && p.active).length === 0 && (
                <p className="wp-no-users">No other users in the room</p>
              )}
            </div>
            <button 
              className="wp-btn wp-btn-close" 
              onClick={() => setShowPassModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Room Header */}
      <div className="wp-room-header">
        <div className="wp-room-info">
          <h2>🎉 Watch Party</h2>
          <button className="wp-code-display" onClick={copyRoomCode} title="Click to copy">
            <span>Room:</span>
            <strong>{roomCode}</strong>
            <span>📋</span>
          </button>
          {isConnected && <span className="wp-connected-badge">● Connected</span>}
        </div>

        <div className="wp-remote-status">
          {hasRemote ? (
            <span className="wp-has-remote">🎮 You have the remote</span>
          ) : (
            <span className="wp-no-remote">📺 {getControllerName()} has the remote</span>
          )}
        </div>

        <div className="wp-room-actions">
          {hasRemote && (
            <>
              <button className="wp-btn wp-btn-action" onClick={handleSelectContent}>
                🎬 Select
              </button>
              <button className="wp-btn wp-btn-action" onClick={() => setShowPassModal(true)}>
                🎮 Pass
              </button>
            </>
          )}
          {!hasRemote && (
            <button className="wp-btn wp-btn-action" onClick={handleRequestRemote}>
              🙋 Request
            </button>
          )}
          {isHost && !hasRemote && (
            <button className="wp-btn wp-btn-action" onClick={handleTakeBackRemote}>
              👑 Take Back
            </button>
          )}
          <button className="wp-btn wp-btn-leave" onClick={handleLeaveRoom}>
            🚪 Leave
          </button>
        </div>
      </div>

      {/* Room Content */}
      <div className="wp-room-content">
        {/* Video Section */}
        <div className="wp-video-section">
          <div className="wp-video-container">
            {videoState.url ? (
              <iframe
                src={videoState.url}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                title="Watch Party Video"
              />
            ) : (
              <div className="wp-video-placeholder">
                <span className="wp-placeholder-icon">🎬</span>
                <p>
                  {hasRemote 
                    ? 'Click "Select" to choose content' 
                    : `Waiting for ${getControllerName()} to select content...`}
                </p>
              </div>
            )}
            
            {/* Controller indicator overlay */}
            {!hasRemote && videoState.url && (
              <div className="wp-controller-overlay">
                🎮 {getControllerName()} is controlling
              </div>
            )}
          </div>

          {/* Video Controls (controller only) */}
          {hasRemote && videoState.url && (
            <div className="wp-video-controls">
              <button 
                className={`wp-btn wp-btn-play ${videoState.isPlaying ? 'playing' : ''}`}
                onClick={togglePlayPause}
              >
                {videoState.isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <span className="wp-sync-status">
                🔄 Syncing {participants.filter(p => p.active).length} viewer{participants.filter(p => p.active).length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Participants Bar */}
          <div className="wp-participants">
            <span className="wp-participants-label">👥 Watching:</span>
            <div className="wp-participants-list">
              {participants.filter(p => p.active).map((p) => (
                <span 
                  key={p.id} 
                  className={`wp-participant ${p.isHost ? 'host' : ''} ${p.id === userId ? 'you' : ''} ${p.id === controllerId ? 'controller' : ''}`}
                >
                  {p.id === controllerId && <span className="wp-mini-remote">🎮</span>}
                  {p.name}
                  {p.isHost && ' 👑'}
                  {p.id === userId && ' (you)'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="wp-chat-section">
          <div className="wp-chat-header">
            <h3>💬 Live Chat</h3>
            <span className="wp-online-count">
              {participants.filter(p => p.active).length} online
            </span>
          </div>

          <div className="wp-chat-messages">
            {messages.length === 0 ? (
              <div className="wp-no-messages">
                <p>👋 Say hello!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`wp-message ${msg.type} ${msg.userId === userId ? 'own' : ''}`}
                >
                  {msg.type === 'system' ? (
                    <span className="wp-system-msg">{msg.text}</span>
                  ) : msg.type === 'reaction' ? (
                    <span className="wp-reaction-msg">
                      <strong>{msg.username}</strong> {msg.text}
                    </span>
                  ) : (
                    <div className="wp-chat-msg">
                      <div className="wp-msg-header">
                        <strong>{msg.username}</strong>
                        <span className="wp-msg-time">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Reactions */}
          <div className="wp-reactions">
            {reactions.map(emoji => (
              <button 
                key={emoji} 
                className="wp-reaction-btn"
                onClick={() => sendReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form className="wp-chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
            />
            <button type="submit" disabled={!newMessage.trim()}>
              ➤
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default WatchPartySection;
