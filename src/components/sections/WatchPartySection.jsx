/* ========================================
   WatchPartySection.jsx - Watch Party with Real-time Sync
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { generateRoomCode, generateUserId } from '../../utils/helpers';
import './WatchPartySection.css';

// Simulated WebRTC/WebSocket sync (in production, use Firebase, Socket.io, or WebRTC)
const SYNC_INTERVAL = 1000; // Sync every second

function WatchPartySection() {
  const { state, actions } = useApp();
  
  // Room state
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [username, setUsername] = useState(() => localStorage.getItem('watchparty_username') || '');
  
  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Refs
  const iframeRef = useRef(null);
  const chatEndRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const userId = useRef(generateUserId());

  // Quick reactions
  const quickReactions = ['😂', '😮', '😢', '😍', '🔥', '👏', '💀', '🎬'];

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create a new room
  const createRoom = () => {
    if (!username.trim()) {
      actions.addNotification('Please enter a username first', 'warning');
      return;
    }
    
    localStorage.setItem('watchparty_username', username);
    
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setIsInRoom(true);
    setParticipants([{ id: userId.current, name: username, isHost: true }]);
    setRoomData({
      code,
      host: userId.current,
      created: Date.now(),
      videoUrl: '',
      isPlaying: false,
      currentTime: 0
    });
    
    // Store room in localStorage for demo (in production, use a backend)
    const roomInfo = {
      code,
      host: userId.current,
      hostName: username,
      participants: [{ id: userId.current, name: username, isHost: true }],
      messages: [],
      videoUrl: '',
      isPlaying: false,
      currentTime: 0
    };
    localStorage.setItem(`watchparty_${code}`, JSON.stringify(roomInfo));
    
    actions.addNotification(`Room created! Code: ${code}`, 'success');
    
    // Add system message
    addSystemMessage(`${username} created the room`);
  };

  // Join an existing room
  const joinRoom = () => {
    if (!username.trim()) {
      actions.addNotification('Please enter a username first', 'warning');
      return;
    }
    
    if (!joinCode.trim()) {
      actions.addNotification('Please enter a room code', 'warning');
      return;
    }
    
    localStorage.setItem('watchparty_username', username);
    
    // Try to find room (demo using localStorage)
    const roomInfo = localStorage.getItem(`watchparty_${joinCode.toUpperCase()}`);
    
    if (!roomInfo) {
      actions.addNotification('Room not found. Check the code and try again.', 'error');
      return;
    }
    
    const room = JSON.parse(roomInfo);
    
    // Add self to participants
    const newParticipant = { id: userId.current, name: username, isHost: false };
    room.participants.push(newParticipant);
    localStorage.setItem(`watchparty_${joinCode.toUpperCase()}`, JSON.stringify(room));
    
    setRoomCode(joinCode.toUpperCase());
    setIsHost(false);
    setIsInRoom(true);
    setParticipants(room.participants);
    setMessages(room.messages || []);
    setVideoUrl(room.videoUrl || '');
    setIsPlaying(room.isPlaying || false);
    setCurrentTime(room.currentTime || 0);
    setRoomData(room);
    
    actions.addNotification(`Joined room ${joinCode.toUpperCase()}!`, 'success');
    addSystemMessage(`${username} joined the room`);
  };

  // Leave room
  const leaveRoom = () => {
    if (roomCode) {
      const roomInfo = localStorage.getItem(`watchparty_${roomCode}`);
      if (roomInfo) {
        const room = JSON.parse(roomInfo);
        room.participants = room.participants.filter(p => p.id !== userId.current);
        
        if (room.participants.length === 0) {
          localStorage.removeItem(`watchparty_${roomCode}`);
        } else {
          localStorage.setItem(`watchparty_${roomCode}`, JSON.stringify(room));
        }
      }
    }
    
    setRoomCode('');
    setJoinCode('');
    setIsHost(false);
    setIsInRoom(false);
    setRoomData(null);
    setParticipants([]);
    setMessages([]);
    setVideoUrl('');
    setSelectedContent(null);
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    actions.addNotification('Left the room', 'info');
  };

  // Add system message
  const addSystemMessage = (text) => {
    const msg = {
      id: Date.now(),
      type: 'system',
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
    syncMessages([...messages, msg]);
  };

  // Send chat message
  const sendMessage = (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const msg = {
      id: Date.now(),
      type: 'chat',
      userId: userId.current,
      username,
      text: newMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, msg]);
    syncMessages([...messages, msg]);
    setNewMessage('');
  };

  // Send reaction
  const sendReaction = (emoji) => {
    const msg = {
      id: Date.now(),
      type: 'reaction',
      userId: userId.current,
      username,
      text: emoji,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, msg]);
    syncMessages([...messages, msg]);
  };

  // Sync messages to "server" (localStorage for demo)
  const syncMessages = (msgs) => {
    if (!roomCode) return;
    const roomInfo = localStorage.getItem(`watchparty_${roomCode}`);
    if (roomInfo) {
      const room = JSON.parse(roomInfo);
      room.messages = msgs;
      localStorage.setItem(`watchparty_${roomCode}`, JSON.stringify(room));
    }
  };

  // Sync video state
  const syncVideoState = useCallback((playing, time) => {
    if (!roomCode || !isHost) return;
    
    const roomInfo = localStorage.getItem(`watchparty_${roomCode}`);
    if (roomInfo) {
      const room = JSON.parse(roomInfo);
      room.isPlaying = playing;
      room.currentTime = time;
      room.videoUrl = videoUrl;
      localStorage.setItem(`watchparty_${roomCode}`, JSON.stringify(room));
    }
  }, [roomCode, isHost, videoUrl]);

  // Poll for updates (simulated real-time)
  useEffect(() => {
    if (!isInRoom || !roomCode) return;
    
    syncIntervalRef.current = setInterval(() => {
      const roomInfo = localStorage.getItem(`watchparty_${roomCode}`);
      if (roomInfo) {
        const room = JSON.parse(roomInfo);
        
        // Update participants
        setParticipants(room.participants || []);
        
        // Update messages
        if (room.messages && room.messages.length !== messages.length) {
          setMessages(room.messages);
        }
        
        // Sync video state if not host
        if (!isHost) {
          if (room.videoUrl !== videoUrl) {
            setVideoUrl(room.videoUrl);
          }
          setIsPlaying(room.isPlaying);
          setCurrentTime(room.currentTime);
        }
      }
    }, SYNC_INTERVAL);
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isInRoom, roomCode, isHost, messages.length, videoUrl]);

  // Set video URL (host only)
  const setVideo = (url) => {
    if (!isHost) return;
    setVideoUrl(url);
    syncVideoState(false, 0);
    addSystemMessage(`Now watching: ${selectedContent?.title || 'New video'}`);
  };

  // Play/Pause (host only)
  const togglePlayPause = () => {
    if (!isHost) return;
    const newState = !isPlaying;
    setIsPlaying(newState);
    syncVideoState(newState, currentTime);
    addSystemMessage(newState ? '▶️ Video playing' : '⏸️ Video paused');
  };

  // Select content from collection
  const selectFromCollection = () => {
    // This would open a modal to select from collection
    // For now, we'll use a simple prompt
    const tmdbId = prompt('Enter TMDB ID or paste video URL:');
    if (tmdbId) {
      if (tmdbId.startsWith('http')) {
        setVideoUrl(tmdbId);
        setVideo(tmdbId);
      } else {
        // Assume it's a movie ID, construct embed URL
        const url = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
        setVideoUrl(url);
        setVideo(url);
      }
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    actions.addNotification('Room code copied!', 'success');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render lobby (not in room)
  if (!isInRoom) {
    return (
      <section className="section watch-party-section">
        <div className="section-header">
          <h2 className="section-title">🎉 Watch Party</h2>
          <p className="section-subtitle">Watch together with friends in real-time</p>
        </div>

        <div className="watch-party-lobby">
          {/* Username Input */}
          <div className="lobby-card username-card">
            <h3>👤 Your Name</h3>
            <input
              type="text"
              className="lobby-input"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="lobby-options">
            {/* Create Room */}
            <div className="lobby-card create-card">
              <div className="card-icon">🎬</div>
              <h3>Create a Room</h3>
              <p>Start a new watch party and invite friends</p>
              <button className="lobby-btn create-btn" onClick={createRoom}>
                Create Room
              </button>
            </div>

            {/* Join Room */}
            <div className="lobby-card join-card">
              <div className="card-icon">🔗</div>
              <h3>Join a Room</h3>
              <p>Enter a room code to join friends</p>
              <input
                type="text"
                className="lobby-input code-input"
                placeholder="Enter room code..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button className="lobby-btn join-btn" onClick={joinRoom}>
                Join Room
              </button>
            </div>
          </div>

          {/* Features Info */}
          <div className="features-info">
            <h3>✨ Watch Party Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <span>Synchronized playback</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <span>Live chat</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">😂</span>
                <span>Quick reactions</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>See who's watching</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render room (in watch party)
  return (
    <section className="section watch-party-section in-room">
      <div className="watch-party-room">
        {/* Room Header */}
        <div className="room-header">
          <div className="room-info">
            <h2>🎉 Watch Party</h2>
            <div className="room-code-display" onClick={copyRoomCode} title="Click to copy">
              <span className="code-label">Room Code:</span>
              <span className="code-value">{roomCode}</span>
              <span className="copy-icon">📋</span>
            </div>
          </div>
          <div className="room-actions">
            {isHost && (
              <button className="room-btn select-btn" onClick={selectFromCollection}>
                🎬 Select Content
              </button>
            )}
            <button className="room-btn leave-btn" onClick={leaveRoom}>
              🚪 Leave Room
            </button>
          </div>
        </div>

        <div className="room-content">
          {/* Video Section */}
          <div className="video-section">
            {/* Video Player */}
            <div className="video-container">
              {videoUrl ? (
                <iframe
                  ref={iframeRef}
                  src={videoUrl}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media"
                  title="Watch Party Video"
                />
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-content">
                    <span className="placeholder-icon">🎬</span>
                    <p>{isHost ? 'Select content to start watching' : 'Waiting for host to select content...'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls (Host only) */}
            {isHost && videoUrl && (
              <div className="video-controls">
                <button 
                  className={`control-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                <span className="sync-status">
                  🔄 Synced with {participants.length} viewer{participants.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Participants */}
            <div className="participants-bar">
              <span className="participants-label">👥 Watching:</span>
              <div className="participants-list">
                {participants.map((p) => (
                  <span 
                    key={p.id} 
                    className={`participant ${p.isHost ? 'host' : ''} ${p.id === userId.current ? 'you' : ''}`}
                  >
                    {p.name} {p.isHost && '👑'} {p.id === userId.current && '(you)'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-header">
              <h3>💬 Live Chat</h3>
              <span className="online-count">{participants.length} online</span>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`chat-message ${msg.type} ${msg.userId === userId.current ? 'own' : ''}`}
                  >
                    {msg.type === 'system' ? (
                      <span className="system-text">{msg.text}</span>
                    ) : msg.type === 'reaction' ? (
                      <div className="reaction-message">
                        <span className="reaction-user">{msg.username}</span>
                        <span className="reaction-emoji">{msg.text}</span>
                      </div>
                    ) : (
                      <>
                        <div className="message-header">
                          <span className="message-user">{msg.username}</span>
                          <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="message-text">{msg.text}</p>
                      </>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Reactions */}
            <div className="quick-reactions">
              {quickReactions.map((emoji) => (
                <button 
                  key={emoji} 
                  className="reaction-btn"
                  onClick={() => sendReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <form className="chat-input-form" onSubmit={sendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                maxLength={500}
              />
              <button type="submit" className="send-btn">
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WatchPartySection;
