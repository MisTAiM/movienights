/* ========================================
   WatchPartySection.jsx - Online Watch Party with Firebase
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  generateRoomCode,
  generateUserId,
  createRoom,
  roomExists,
  getRoom,
  joinRoom,
  leaveRoom,
  subscribeToRoom,
  updateVideoUrl,
  updatePlayState,
  passRemote,
  takeBackRemote,
  sendChatMessage,
  sendReaction
} from '../../utils/firebase';
import './Sections.css';
import './WatchPartySection.css';

function WatchPartySection() {
  const appContext = useApp();
  const actions = appContext?.actions || {};
  
  // Notification helper
  const notify = (msg, type = 'info') => {
    if (actions.addNotification) {
      actions.addNotification(msg, type);
    }
    console.log(`[WatchParty] ${type}: ${msg}`);
  };
  
  // User ID (persistent across sessions)
  const [visitorId] = useState(() => {
    let id = localStorage.getItem('wp_user_id');
    if (!id) {
      id = generateUserId();
      localStorage.setItem('wp_user_id', id);
    }
    return id;
  });
  
  // Form states
  const [username, setUsername] = useState(() => localStorage.getItem('wp_username') || '');
  const [joinCode, setJoinCode] = useState('');
  
  // Room states
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  
  // Refs
  const chatEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  
  // Derived states
  const controllerId = roomData?.controllerId;
  const hasRemote = controllerId === visitorId;
  const videoUrl = roomData?.videoUrl || '';
  const isPlaying = roomData?.isPlaying || false;
  
  const reactions = ['😂', '😮', '😢', '😍', '🔥', '👏', '💀', '🎬'];

  // Get controller name
  const getControllerName = useCallback(() => {
    if (!controllerId || !participants.length) return 'Unknown';
    const controller = participants.find(p => p.id === controllerId);
    return controller?.name || 'Unknown';
  }, [controllerId, participants]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Subscribe to room updates when in room
  useEffect(() => {
    if (!isInRoom || !roomCode) return;
    
    // Subscribe to room changes
    unsubscribeRef.current = subscribeToRoom(roomCode, (data) => {
      if (!data) {
        // Room was deleted
        setIsInRoom(false);
        setRoomCode('');
        setRoomData(null);
        setParticipants([]);
        setMessages([]);
        notify('The room has been closed', 'info');
        return;
      }
      
      setRoomData(data);
      
      // Convert participants object to array
      if (data.participants) {
        const participantList = Object.values(data.participants);
        setParticipants(participantList);
      }
      
      // Convert messages object to array
      if (data.messages) {
        const messageList = Object.values(data.messages);
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      }
    });
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isInRoom, roomCode]);

  // ========== ROOM ACTIONS ==========
  
  // Create a new room
  const handleCreateRoom = async () => {
    if (!username.trim()) {
      notify('Please enter your name first', 'warning');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      localStorage.setItem('wp_username', username);
      
      const code = generateRoomCode();
      await createRoom(code, visitorId, username);
      
      setRoomCode(code);
      setIsHost(true);
      setIsInRoom(true);
      
      notify(`Room created! Code: ${code}`, 'success');
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
      notify('Failed to create room', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Join an existing room
  const handleJoinRoom = async () => {
    if (!username.trim()) {
      notify('Please enter your name first', 'warning');
      return;
    }
    
    if (!joinCode.trim()) {
      notify('Please enter a room code', 'warning');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      localStorage.setItem('wp_username', username);
      
      const code = joinCode.toUpperCase();
      
      // Check if room exists
      const exists = await roomExists(code);
      if (!exists) {
        setError('Room not found. Please check the code and try again.');
        notify('Room not found', 'error');
        setIsLoading(false);
        return;
      }
      
      // Join the room
      const room = await joinRoom(code, visitorId, username);
      
      setRoomCode(code);
      setIsHost(room.host === visitorId);
      setIsInRoom(true);
      
      notify(`Joined room ${code}!`, 'success');
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
      notify('Failed to join room', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Leave the room
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomCode, visitorId, username, isHost);
      
      // Cleanup
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      setIsInRoom(false);
      setIsHost(false);
      setRoomCode('');
      setRoomData(null);
      setParticipants([]);
      setMessages([]);
      setJoinCode('');
      
      notify('Left the room', 'info');
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  };

  // ========== VIDEO ACTIONS ==========
  
  // Select content
  const handleSelectContent = async () => {
    const input = prompt('Enter TMDB movie ID or video URL:');
    if (!input) return;
    
    const url = input.startsWith('http') ? input : `https://vidsrc.cc/v2/embed/movie/${input}`;
    
    try {
      await updateVideoUrl(roomCode, url);
    } catch (err) {
      console.error('Error updating video:', err);
      notify('Failed to update video', 'error');
    }
  };

  // Toggle play/pause
  const handleTogglePlay = async () => {
    try {
      await updatePlayState(roomCode, !isPlaying);
    } catch (err) {
      console.error('Error toggling play state:', err);
    }
  };

  // ========== REMOTE CONTROL ACTIONS ==========
  
  // Pass remote to another user
  const handlePassRemote = async (targetId) => {
    const target = participants.find(p => p.id === targetId);
    if (!target) return;
    
    try {
      await passRemote(roomCode, targetId, username, target.name);
      setShowPassModal(false);
      notify(`Passed remote to ${target.name}`, 'success');
    } catch (err) {
      console.error('Error passing remote:', err);
    }
  };

  // Take back remote (host only)
  const handleTakeBackRemote = async () => {
    try {
      await takeBackRemote(roomCode, visitorId, username);
      notify('You now have the remote', 'success');
    } catch (err) {
      console.error('Error taking back remote:', err);
    }
  };

  // Request remote
  const handleRequestRemote = () => {
    // For now, just notify - could implement a request system later
    notify('Remote request sent!', 'info');
  };

  // ========== CHAT ACTIONS ==========
  
  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await sendChatMessage(roomCode, visitorId, username, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Send reaction
  const handleSendReaction = async (emoji) => {
    try {
      await sendReaction(roomCode, visitorId, username, emoji);
    } catch (err) {
      console.error('Error sending reaction:', err);
    }
  };

  // Copy room code
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    notify('Room code copied!', 'success');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ==================== RENDER ====================

  // LOBBY VIEW
  if (!isInRoom) {
    return (
      <section className="section watch-party-section">
        <div className="section-header">
          <h2 className="section-title">🎉 Watch Party</h2>
        </div>

        <div className="wp-lobby">
          <div className="wp-online-badge">
            <span className="wp-online-dot"></span>
            <span>🌐 Online Mode - Share with anyone, anywhere!</span>
          </div>

          <div className="wp-card wp-name-card">
            <h3>👤 Your Name</h3>
            <input
              type="text"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              disabled={isLoading}
            />
          </div>

          <div className="wp-options">
            <div className="wp-card">
              <div className="wp-card-icon">🎬</div>
              <h3>Create Room</h3>
              <p>Start a new watch party</p>
              <button 
                className="wp-btn wp-btn-create" 
                onClick={handleCreateRoom}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Room'}
              </button>
            </div>

            <div className="wp-card">
              <div className="wp-card-icon">🔗</div>
              <h3>Join Room</h3>
              <p>Enter room code to join</p>
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
                disabled={isLoading}
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </button>
              {error && <p className="wp-error">{error}</p>}
            </div>
          </div>

          <div className="wp-features">
            <h3>✨ Features</h3>
            <div className="wp-features-grid">
              <div className="wp-feature">
                <span>🌐</span>
                <span>Works online across devices</span>
              </div>
              <div className="wp-feature">
                <span>🎮</span>
                <span>Pass the remote control</span>
              </div>
              <div className="wp-feature">
                <span>💬</span>
                <span>Real-time chat</span>
              </div>
              <div className="wp-feature">
                <span>😂</span>
                <span>Quick reactions</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ROOM VIEW
  return (
    <section className="section watch-party-section">
      {/* Pass Remote Modal */}
      {showPassModal && (
        <div className="wp-modal-overlay" onClick={() => setShowPassModal(false)}>
          <div className="wp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🎮 Pass Remote To</h3>
            <div className="wp-user-list">
              {participants.filter(p => p.id !== visitorId).map(p => (
                <button 
                  key={p.id} 
                  className="wp-user-btn" 
                  onClick={() => handlePassRemote(p.id)}
                >
                  <span className="wp-user-avatar">{p.name[0].toUpperCase()}</span>
                  <span className="wp-user-name">{p.name}</span>
                  {p.isHost && <span className="wp-host-badge">Host</span>}
                  {p.id === controllerId && <span className="wp-remote-badge">🎮</span>}
                </button>
              ))}
              {participants.length <= 1 && (
                <p className="wp-no-users">No other users in room yet</p>
              )}
            </div>
            <button 
              className="wp-btn wp-btn-close" 
              onClick={() => setShowPassModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Room Header */}
      <div className="wp-room-header">
        <div className="wp-room-info">
          <h2>🎉 Watch Party</h2>
          <button className="wp-code-display" onClick={copyCode} title="Click to copy">
            <span>Room: </span>
            <strong>{roomCode}</strong>
            <span>📋</span>
          </button>
        </div>

        <div className="wp-remote-status">
          {hasRemote ? (
            <span className="wp-has-remote">🎮 You have the remote</span>
          ) : (
            <span className="wp-no-remote">📺 {getControllerName()} has remote</span>
          )}
        </div>

        <div className="wp-room-actions">
          {hasRemote && (
            <>
              <button className="wp-btn" onClick={handleSelectContent}>
                🎬 Select
              </button>
              <button className="wp-btn" onClick={() => setShowPassModal(true)}>
                🎮 Pass
              </button>
            </>
          )}
          {!hasRemote && (
            <button className="wp-btn" onClick={handleRequestRemote}>
              🙋 Request
            </button>
          )}
          {isHost && !hasRemote && (
            <button className="wp-btn" onClick={handleTakeBackRemote}>
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
            {videoUrl ? (
              <iframe
                src={videoUrl}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media"
                title="Watch Party Video"
              />
            ) : (
              <div className="wp-video-placeholder">
                <span className="wp-placeholder-icon">🎬</span>
                <p>
                  {hasRemote 
                    ? 'Click "Select" to choose something to watch' 
                    : `Waiting for ${getControllerName()} to select content...`
                  }
                </p>
              </div>
            )}
            
            {!hasRemote && videoUrl && (
              <div className="wp-controller-indicator">
                🎮 {getControllerName()} is controlling
              </div>
            )}
          </div>

          {hasRemote && videoUrl && (
            <div className="wp-video-controls">
              <button 
                className={`wp-btn ${isPlaying ? 'wp-btn-pause' : 'wp-btn-play'}`}
                onClick={handleTogglePlay}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <span className="wp-sync-status">
                🔄 {participants.length} viewer{participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="wp-participants-bar">
            <span className="wp-participants-label">👥 Watching:</span>
            <div className="wp-participants-list">
              {participants.map((p) => (
                <span 
                  key={p.id} 
                  className={`wp-participant ${p.isHost ? 'host' : ''} ${p.id === visitorId ? 'you' : ''} ${p.id === controllerId ? 'controller' : ''}`}
                >
                  {p.id === controllerId && <span className="wp-mini-remote">🎮</span>}
                  {p.name}
                  {p.isHost && ' 👑'}
                  {p.id === visitorId && ' (you)'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="wp-chat-section">
          <div className="wp-chat-header">
            <h3>💬 Chat</h3>
            <span className="wp-online-count">{participants.length} online</span>
          </div>

          <div className="wp-chat-messages">
            {messages.length === 0 ? (
              <div className="wp-no-messages">
                <p>👋 No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={msg.id || idx} 
                  className={`wp-message ${msg.type} ${msg.userId === visitorId ? 'own' : ''}`}
                >
                  {msg.type === 'system' ? (
                    <span className="wp-system-msg">{msg.text}</span>
                  ) : msg.type === 'reaction' ? (
                    <div className="wp-reaction-msg">
                      <span className="wp-reaction-user">{msg.userName}</span>
                      <span className="wp-reaction-emoji">{msg.text}</span>
                    </div>
                  ) : (
                    <div className="wp-chat-msg">
                      <div className="wp-msg-header">
                        <span className="wp-msg-user">{msg.userName}</span>
                        <span className="wp-msg-time">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="wp-msg-text">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="wp-reactions">
            {reactions.map(emoji => (
              <button 
                key={emoji} 
                className="wp-reaction-btn"
                onClick={() => handleSendReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          <form className="wp-chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
            />
            <button type="submit" className="wp-send-btn">➤</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default WatchPartySection;
