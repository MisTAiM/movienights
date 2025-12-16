/* ========================================
   WatchPartySection.jsx - Watch Party with Firebase Real-time Sync
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { generateRoomCode, generateUserId } from '../../utils/helpers';
import './WatchPartySection.css';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get,
  push,
  onValue, 
  off, 
  update, 
  remove,
  serverTimestamp 
} from 'firebase/database';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdek4iW7U4ScbS_eV5vKQF9Gwqi77P8Wc",
  authDomain: "movienights-party.firebaseapp.com",
  databaseURL: "https://movienights-party-default-rtdb.firebaseio.com",
  projectId: "movienights-party",
  storageBucket: "movienights-party.firebasestorage.app",
  messagingSenderId: "314294618696",
  appId: "1:314294618696:web:2a458d63bcabc85a49267d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
  const userId = useRef(generateUserId());
  const roomRef = useRef(null);
  const participantsRef = useRef(null);
  const messagesRef = useRef(null);

  // Quick reactions
  const quickReactions = ['😂', '😮', '😢', '😍', '🔥', '👏', '💀', '🎬'];

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup Firebase listeners on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) off(roomRef.current);
      if (participantsRef.current) off(participantsRef.current);
      if (messagesRef.current) off(messagesRef.current);
    };
  }, []);

  // Setup Firebase listeners when in room
  useEffect(() => {
    if (!isInRoom || !roomCode) return;

    // Reference to room data
    roomRef.current = ref(database, `rooms/${roomCode}`);
    participantsRef.current = ref(database, `rooms/${roomCode}/participants`);
    messagesRef.current = ref(database, `rooms/${roomCode}/messages`);

    // Listen for room updates
    const roomListener = onValue(roomRef.current, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (!isHost) {
          // Sync video state from host
          if (data.videoUrl !== videoUrl) {
            setVideoUrl(data.videoUrl || '');
          }
          setIsPlaying(data.isPlaying || false);
          setCurrentTime(data.currentTime || 0);
        }
      }
    });

    // Listen for participants updates
    const participantsListener = onValue(participantsRef.current, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantsList = Object.values(data);
        setParticipants(participantsList);
      }
    });

    // Listen for messages
    const messagesListener = onValue(messagesRef.current, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);
      }
    });

    // Cleanup listeners
    return () => {
      off(roomRef.current);
      off(participantsRef.current);
      off(messagesRef.current);
    };
  }, [isInRoom, roomCode, isHost]);

  // Create a new room
  const createRoom = async () => {
    if (!username.trim()) {
      actions.addNotification('Please enter a username first', 'warning');
      return;
    }
    
    localStorage.setItem('watchparty_username', username);
    
    const code = generateRoomCode();
    
    try {
      // Create room in Firebase
      const roomRefPath = ref(database, `rooms/${code}`);
      await set(roomRefPath, {
        code,
        host: userId.current,
        hostName: username,
        created: Date.now(),
        videoUrl: '',
        isPlaying: false,
        currentTime: 0
      });

      // Add host as participant
      const participantRef = ref(database, `rooms/${code}/participants/${userId.current}`);
      await set(participantRef, {
        id: userId.current,
        name: username,
        isHost: true,
        joinedAt: Date.now()
      });

      setRoomCode(code);
      setIsHost(true);
      setIsInRoom(true);
      setParticipants([{ id: userId.current, name: username, isHost: true }]);
      
      actions.addNotification(`Room created! Code: ${code}`, 'success');
      
      // Add system message
      await addSystemMessage(code, `${username} created the room`);
    } catch (error) {
      console.error('Error creating room:', error);
      actions.addNotification('Failed to create room. Please try again.', 'error');
    }
  };

  // Join an existing room
  const joinRoom = async () => {
    if (!username.trim()) {
      actions.addNotification('Please enter a username first', 'warning');
      return;
    }
    
    if (!joinCode.trim()) {
      actions.addNotification('Please enter a room code', 'warning');
      return;
    }
    
    localStorage.setItem('watchparty_username', username);
    
    const code = joinCode.toUpperCase();
    
    try {
      // Check if room exists
      const roomRefPath = ref(database, `rooms/${code}`);
      const snapshot = await get(roomRefPath);
      
      if (!snapshot.exists()) {
        actions.addNotification('Room not found. Check the code and try again.', 'error');
        return;
      }
      
      const room = snapshot.val();
      
      // Add self to participants
      const participantRef = ref(database, `rooms/${code}/participants/${userId.current}`);
      await set(participantRef, {
        id: userId.current,
        name: username,
        isHost: false,
        joinedAt: Date.now()
      });
      
      setRoomCode(code);
      setIsHost(false);
      setIsInRoom(true);
      setVideoUrl(room.videoUrl || '');
      setIsPlaying(room.isPlaying || false);
      setCurrentTime(room.currentTime || 0);
      setRoomData(room);
      
      actions.addNotification(`Joined room ${code}!`, 'success');
      await addSystemMessage(code, `${username} joined the room`);
    } catch (error) {
      console.error('Error joining room:', error);
      actions.addNotification('Failed to join room. Please try again.', 'error');
    }
  };

  // Leave room
  const leaveRoom = async () => {
    if (roomCode) {
      try {
        // Remove self from participants
        const participantRef = ref(database, `rooms/${roomCode}/participants/${userId.current}`);
        await remove(participantRef);
        
        // If host leaves, delete the room
        if (isHost) {
          const roomRefPath = ref(database, `rooms/${roomCode}`);
          await remove(roomRefPath);
        } else {
          await addSystemMessage(roomCode, `${username} left the room`);
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    
    // Clear local state
    setRoomCode('');
    setJoinCode('');
    setIsHost(false);
    setIsInRoom(false);
    setRoomData(null);
    setParticipants([]);
    setMessages([]);
    setVideoUrl('');
    setSelectedContent(null);
    
    actions.addNotification('Left the room', 'info');
  };

  // Add system message
  const addSystemMessage = async (code, text) => {
    const messagesRefPath = ref(database, `rooms/${code}/messages`);
    const newMessageRef = push(messagesRefPath);
    await set(newMessageRef, {
      id: newMessageRef.key,
      type: 'system',
      text,
      timestamp: Date.now()
    });
  };

  // Send chat message
  const sendMessage = async (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !roomCode) return;
    
    try {
      const messagesRefPath = ref(database, `rooms/${roomCode}/messages`);
      const newMessageRef = push(messagesRefPath);
      await set(newMessageRef, {
        id: newMessageRef.key,
        type: 'chat',
        userId: userId.current,
        username,
        text: newMessage,
        timestamp: Date.now()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      actions.addNotification('Failed to send message', 'error');
    }
  };

  // Send reaction
  const sendReaction = async (emoji) => {
    if (!roomCode) return;
    
    try {
      const messagesRefPath = ref(database, `rooms/${roomCode}/messages`);
      const newMessageRef = push(messagesRefPath);
      await set(newMessageRef, {
        id: newMessageRef.key,
        type: 'reaction',
        userId: userId.current,
        username,
        text: emoji,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  // Sync video state (host only)
  const syncVideoState = useCallback(async (playing, time, url = videoUrl) => {
    if (!roomCode || !isHost) return;
    
    try {
      const roomRefPath = ref(database, `rooms/${roomCode}`);
      await update(roomRefPath, {
        isPlaying: playing,
        currentTime: time,
        videoUrl: url
      });
    } catch (error) {
      console.error('Error syncing video state:', error);
    }
  }, [roomCode, isHost, videoUrl]);

  // Set video URL (host only)
  const setVideo = async (url) => {
    if (!isHost) return;
    setVideoUrl(url);
    await syncVideoState(false, 0, url);
    await addSystemMessage(roomCode, `Now watching: ${selectedContent?.title || 'New video'}`);
  };

  // Play/Pause (host only)
  const togglePlayPause = async () => {
    if (!isHost) return;
    const newState = !isPlaying;
    setIsPlaying(newState);
    await syncVideoState(newState, currentTime);
    await addSystemMessage(roomCode, newState ? '▶️ Video playing' : '⏸️ Video paused');
  };

  // Select content from collection
  const selectFromCollection = () => {
    const tmdbId = prompt('Enter TMDB ID or paste video URL:');
    if (tmdbId) {
      if (tmdbId.startsWith('http')) {
        setVideoUrl(tmdbId);
        setVideo(tmdbId);
      } else {
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
