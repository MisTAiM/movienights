/* ========================================
   WatchPartySection.jsx - Watch Party with Remote Control Passing
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { generateRoomCode, generateUserId } from '../../utils/helpers';
import './WatchPartySection.css';

// Global room storage that persists across component renders
const globalRoomStorage = {};
const BROADCAST_CHANNEL_NAME = 'watchparty_sync';

// Sync interval
const SYNC_INTERVAL = 500;

function WatchPartySection() {
  const { state, actions } = useApp();
  
  // Room state
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [username, setUsername] = useState(() => localStorage.getItem('watchparty_username') || '');
  
  // Remote control state
  const [controllerId, setControllerId] = useState(null); // Who has the remote
  const [showPassRemoteModal, setShowPassRemoteModal] = useState(false);
  const [remoteRequestFrom, setRemoteRequestFrom] = useState(null); // Someone requesting remote
  
  // Connection state
  const [connectionError, setConnectionError] = useState(null);
  
  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Refs
  const iframeRef = useRef(null);
  const chatEndRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const userId = useRef(() => {
    let id = localStorage.getItem('watchparty_userid');
    if (!id) {
      id = generateUserId();
      localStorage.setItem('watchparty_userid', id);
    }
    return id;
  })();

  // Quick reactions
  const quickReactions = ['😂', '😮', '😢', '😍', '🔥', '👏', '💀', '🎬'];

  // Check if current user has the remote
  const hasRemote = controllerId === userId.current;
  
  // Get controller name
  const getControllerName = () => {
    const controller = participants.find(p => p.id === controllerId);
    return controller?.name || 'Unknown';
  };

  // Initialize BroadcastChannel for same-browser sync
  useEffect(() => {
    try {
      broadcastChannelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      
      broadcastChannelRef.current.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'ROOM_CREATED':
            globalRoomStorage[data.code] = data.room;
            break;
            
          case 'ROOM_UPDATED':
            globalRoomStorage[data.code] = data.room;
            if (data.code === roomCode) {
              setParticipants(data.room.participants || []);
              setMessages(data.room.messages || []);
              setControllerId(data.room.controllerId);
              
              // Non-controllers sync video state
              if (data.room.controllerId !== userId.current) {
                setVideoUrl(data.room.videoUrl || '');
                setIsPlaying(data.room.isPlaying || false);
              }
            }
            break;
            
          case 'ROOM_DELETED':
            delete globalRoomStorage[data.code];
            if (data.code === roomCode && !isHost) {
              handleForceLeave('The host ended the watch party');
            }
            break;
            
          case 'REQUEST_ROOM':
            if (globalRoomStorage[data.code]) {
              broadcastChannelRef.current?.postMessage({
                type: 'ROOM_EXISTS',
                data: { code: data.code, room: globalRoomStorage[data.code] }
              });
            }
            break;
            
          case 'ROOM_EXISTS':
            if (data.code && data.room) {
              globalRoomStorage[data.code] = data.room;
            }
            break;
            
          case 'REMOTE_REQUEST':
            // Someone is requesting the remote
            if (data.code === roomCode && data.toUserId === userId.current) {
              setRemoteRequestFrom(data.fromUser);
            }
            break;
            
          default:
            break;
        }
      };
    } catch (e) {
      console.log('BroadcastChannel not supported');
    }
    
    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [roomCode, isHost]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Force leave handler
  const handleForceLeave = (message) => {
    setRoomCode('');
    setJoinCode('');
    setIsHost(false);
    setIsInRoom(false);
    setParticipants([]);
    setMessages([]);
    setVideoUrl('');
    setSelectedContent(null);
    setConnectionError(null);
    setControllerId(null);
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    actions.addNotification(message, 'info');
  };

  // Broadcast room update to all tabs
  const broadcastUpdate = useCallback((code, room) => {
    globalRoomStorage[code] = room;
    broadcastChannelRef.current?.postMessage({
      type: 'ROOM_UPDATED',
      data: { code, room }
    });
  }, []);

  // Create a new room
  const createRoom = () => {
    if (!username.trim()) {
      actions.addNotification('Please enter a username first', 'warning');
      return;
    }
    
    localStorage.setItem('watchparty_username', username);
    
    const code = generateRoomCode();
    const newRoom = {
      code,
      host: userId.current,
      hostName: username,
      controllerId: userId.current, // Host starts with remote
      participants: [{ id: userId.current, name: username, isHost: true }],
      messages: [{
        id: Date.now(),
        type: 'system',
        text: `${username} created the room`,
        timestamp: Date.now()
      }],
      videoUrl: '',
      isPlaying: false,
      currentTime: 0,
      created: Date.now()
    };
    
    globalRoomStorage[code] = newRoom;
    
    broadcastChannelRef.current?.postMessage({
      type: 'ROOM_CREATED',
      data: { code, room: newRoom }
    });
    
    setRoomCode(code);
    setIsHost(true);
    setIsInRoom(true);
    setParticipants(newRoom.participants);
    setMessages(newRoom.messages);
    setControllerId(userId.current);
    
    actions.addNotification(`Room created! Code: ${code}`, 'success');
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
    
    let room = globalRoomStorage[code];
    
    if (!room) {
      broadcastChannelRef.current?.postMessage({
        type: 'REQUEST_ROOM',
        data: { code }
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      room = globalRoomStorage[code];
    }
    
    if (!room) {
      setConnectionError(
        'Room not found. Make sure:\n' +
        '• The host has created the room\n' +
        '• You\'re using the correct code\n' +
        '• The host\'s browser tab is still open'
      );
      actions.addNotification('Room not found. Check the code and try again.', 'error');
      return;
    }
    
    setConnectionError(null);
    
    const newParticipant = { id: userId.current, name: username, isHost: false };
    const existingParticipant = room.participants?.find(p => p.id === userId.current);
    
    let updatedParticipants;
    if (existingParticipant) {
      updatedParticipants = room.participants;
    } else {
      updatedParticipants = [...(room.participants || []), newParticipant];
    }
    
    const joinMessage = {
      id: Date.now(),
      type: 'system',
      text: `${username} joined the room`,
      timestamp: Date.now()
    };
    
    const updatedRoom = {
      ...room,
      participants: updatedParticipants,
      messages: [...(room.messages || []), joinMessage]
    };
    
    broadcastUpdate(code, updatedRoom);
    
    setRoomCode(code);
    setIsHost(room.host === userId.current);
    setIsInRoom(true);
    setParticipants(updatedRoom.participants);
    setMessages(updatedRoom.messages);
    setVideoUrl(updatedRoom.videoUrl || '');
    setIsPlaying(updatedRoom.isPlaying || false);
    setControllerId(updatedRoom.controllerId);
    
    actions.addNotification(`Joined room ${code}!`, 'success');
  };

  // Leave room
  const leaveRoom = () => {
    if (roomCode && globalRoomStorage[roomCode]) {
      if (isHost) {
        delete globalRoomStorage[roomCode];
        broadcastChannelRef.current?.postMessage({
          type: 'ROOM_DELETED',
          data: { code: roomCode }
        });
      } else {
        const room = globalRoomStorage[roomCode];
        const updatedParticipants = (room.participants || []).filter(p => p.id !== userId.current);
        
        // If leaving user had remote, give it back to host
        let newControllerId = room.controllerId;
        if (room.controllerId === userId.current) {
          newControllerId = room.host;
        }
        
        const leaveMessage = {
          id: Date.now(),
          type: 'system',
          text: `${username} left the room`,
          timestamp: Date.now()
        };
        
        const updatedRoom = { 
          ...room, 
          participants: updatedParticipants,
          controllerId: newControllerId,
          messages: [...(room.messages || []), leaveMessage]
        };
        broadcastUpdate(roomCode, updatedRoom);
      }
    }
    
    setRoomCode('');
    setJoinCode('');
    setIsHost(false);
    setIsInRoom(false);
    setParticipants([]);
    setMessages([]);
    setVideoUrl('');
    setSelectedContent(null);
    setConnectionError(null);
    setControllerId(null);
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    actions.addNotification('Left the room', 'info');
  };

  // Pass remote to another user (host or current controller only)
  const passRemoteTo = (targetUserId) => {
    if (!roomCode || (!isHost && !hasRemote)) return;
    
    const room = globalRoomStorage[roomCode];
    if (!room) return;
    
    const targetUser = participants.find(p => p.id === targetUserId);
    if (!targetUser) return;
    
    const systemMsg = {
      id: Date.now(),
      type: 'system',
      text: `🎮 ${username} passed the remote to ${targetUser.name}`,
      timestamp: Date.now()
    };
    
    const updatedRoom = {
      ...room,
      controllerId: targetUserId,
      messages: [...(room.messages || []), systemMsg]
    };
    
    broadcastUpdate(roomCode, updatedRoom);
    setControllerId(targetUserId);
    setMessages(updatedRoom.messages);
    setShowPassRemoteModal(false);
    
    actions.addNotification(`Remote passed to ${targetUser.name}`, 'success');
  };

  // Take back remote (host only)
  const takeBackRemote = () => {
    if (!roomCode || !isHost) return;
    
    const room = globalRoomStorage[roomCode];
    if (!room) return;
    
    const systemMsg = {
      id: Date.now(),
      type: 'system',
      text: `🎮 ${username} took back the remote`,
      timestamp: Date.now()
    };
    
    const updatedRoom = {
      ...room,
      controllerId: userId.current,
      messages: [...(room.messages || []), systemMsg]
    };
    
    broadcastUpdate(roomCode, updatedRoom);
    setControllerId(userId.current);
    setMessages(updatedRoom.messages);
    
    actions.addNotification('You now have the remote', 'success');
  };

  // Request remote from current controller
  const requestRemote = () => {
    if (!roomCode || hasRemote) return;
    
    broadcastChannelRef.current?.postMessage({
      type: 'REMOTE_REQUEST',
      data: { 
        code: roomCode, 
        fromUser: { id: userId.current, name: username },
        toUserId: controllerId
      }
    });
    
    actions.addNotification('Remote request sent!', 'info');
  };

  // Accept remote request
  const acceptRemoteRequest = () => {
    if (remoteRequestFrom) {
      passRemoteTo(remoteRequestFrom.id);
      setRemoteRequestFrom(null);
    }
  };

  // Decline remote request
  const declineRemoteRequest = () => {
    setRemoteRequestFrom(null);
    actions.addNotification('Remote request declined', 'info');
  };

  // Send chat message
  const sendMessage = (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !roomCode) return;
    
    const msg = {
      id: Date.now(),
      type: 'chat',
      userId: userId.current,
      username,
      text: newMessage,
      timestamp: Date.now()
    };
    
    const room = globalRoomStorage[roomCode];
    if (room) {
      const updatedRoom = {
        ...room,
        messages: [...(room.messages || []), msg]
      };
      broadcastUpdate(roomCode, updatedRoom);
      setMessages(updatedRoom.messages);
    }
    
    setNewMessage('');
  };

  // Send reaction
  const sendReaction = (emoji) => {
    if (!roomCode) return;
    
    const msg = {
      id: Date.now(),
      type: 'reaction',
      userId: userId.current,
      username,
      text: emoji,
      timestamp: Date.now()
    };
    
    const room = globalRoomStorage[roomCode];
    if (room) {
      const updatedRoom = {
        ...room,
        messages: [...(room.messages || []), msg]
      };
      broadcastUpdate(roomCode, updatedRoom);
      setMessages(updatedRoom.messages);
    }
  };

  // Set video URL (controller only)
  const setVideo = (url) => {
    if (!hasRemote || !roomCode) return;
    
    const room = globalRoomStorage[roomCode];
    if (room) {
      const systemMsg = {
        id: Date.now(),
        type: 'system',
        text: `🎬 Now watching: ${selectedContent?.title || 'New video'}`,
        timestamp: Date.now()
      };
      
      const updatedRoom = {
        ...room,
        videoUrl: url,
        isPlaying: false,
        currentTime: 0,
        messages: [...(room.messages || []), systemMsg]
      };
      broadcastUpdate(roomCode, updatedRoom);
      setVideoUrl(url);
      setMessages(updatedRoom.messages);
    }
  };

  // Play/Pause (controller only)
  const togglePlayPause = () => {
    if (!hasRemote || !roomCode) return;
    
    const newState = !isPlaying;
    const room = globalRoomStorage[roomCode];
    
    if (room) {
      const systemMsg = {
        id: Date.now(),
        type: 'system',
        text: newState ? '▶️ Video playing' : '⏸️ Video paused',
        timestamp: Date.now()
      };
      
      const updatedRoom = {
        ...room,
        isPlaying: newState,
        messages: [...(room.messages || []), systemMsg]
      };
      broadcastUpdate(roomCode, updatedRoom);
      setIsPlaying(newState);
      setMessages(updatedRoom.messages);
    }
  };

  // Select content
  const selectFromCollection = () => {
    const input = prompt('Enter TMDB ID or paste video URL:');
    if (input) {
      let url;
      if (input.startsWith('http')) {
        url = input;
      } else {
        url = `https://vidsrc.cc/v2/embed/movie/${input}`;
      }
      setVideoUrl(url);
      setVideo(url);
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    actions.addNotification('Room code copied! Share it with friends.', 'success');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Polling for updates
  useEffect(() => {
    if (!isInRoom || !roomCode) return;
    
    syncIntervalRef.current = setInterval(() => {
      const room = globalRoomStorage[roomCode];
      if (room) {
        if (JSON.stringify(room.participants) !== JSON.stringify(participants)) {
          setParticipants(room.participants || []);
        }
        
        if (room.messages?.length !== messages.length) {
          setMessages(room.messages || []);
        }
        
        if (room.controllerId !== controllerId) {
          setControllerId(room.controllerId);
        }
        
        // Non-controllers sync video state
        if (room.controllerId !== userId.current) {
          if (room.videoUrl !== videoUrl) {
            setVideoUrl(room.videoUrl || '');
          }
          if (room.isPlaying !== isPlaying) {
            setIsPlaying(room.isPlaying || false);
          }
        }
      } else if (!isHost) {
        handleForceLeave('The room has been closed');
      }
    }, SYNC_INTERVAL);
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isInRoom, roomCode, isHost, participants, messages.length, videoUrl, isPlaying, controllerId]);

  // Render lobby (not in room)
  if (!isInRoom) {
    return (
      <section className="section watch-party-section">
        <div className="section-header">
          <h2 className="section-title">🎉 Watch Party</h2>
          <p className="section-subtitle">Watch together with friends in real-time</p>
        </div>

        <div className="watch-party-lobby">
          {/* Connection Status */}
          <div className="connection-status">
            <span className="status-indicator"></span>
            <span className="status-text">
              💻 Same-browser sync active — Open this page in multiple tabs to test!
            </span>
          </div>

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
              
              {connectionError && (
                <div className="connection-error">
                  <p>⚠️ {connectionError}</p>
                </div>
              )}
            </div>
          </div>

          {/* How to Test */}
          <div className="features-info">
            <h3>🧪 How to Test Watch Party</h3>
            <div className="test-instructions">
              <ol>
                <li><strong>Open this page in Tab 1</strong> - Enter a name and click "Create Room"</li>
                <li><strong>Copy the room code</strong> - Click the code to copy it</li>
                <li><strong>Open this page in Tab 2</strong> - Enter a different name</li>
                <li><strong>Paste the code and join</strong> - You'll see both users connected!</li>
              </ol>
            </div>
            
            <h3 style={{marginTop: '24px'}}>✨ Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🎮</span>
                <span>Pass the remote</span>
              </div>
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
        {/* Remote Request Modal */}
        {remoteRequestFrom && (
          <div className="remote-request-modal">
            <div className="remote-request-content">
              <div className="request-icon">🎮</div>
              <h3>Remote Request</h3>
              <p><strong>{remoteRequestFrom.name}</strong> wants the remote control</p>
              <div className="request-actions">
                <button className="accept-btn" onClick={acceptRemoteRequest}>
                  ✓ Pass Remote
                </button>
                <button className="decline-btn" onClick={declineRemoteRequest}>
                  ✕ Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pass Remote Modal */}
        {showPassRemoteModal && (
          <div className="pass-remote-modal">
            <div className="pass-remote-content">
              <div className="modal-header">
                <h3>🎮 Pass the Remote</h3>
                <button className="close-btn" onClick={() => setShowPassRemoteModal(false)}>✕</button>
              </div>
              <p>Select who should control the video:</p>
              <div className="user-list">
                {participants.filter(p => p.id !== userId.current).map((p) => (
                  <button 
                    key={p.id} 
                    className="user-select-btn"
                    onClick={() => passRemoteTo(p.id)}
                  >
                    <span className="user-avatar">{p.name.charAt(0).toUpperCase()}</span>
                    <span className="user-name">{p.name}</span>
                    {p.isHost && <span className="host-badge">Host</span>}
                    {p.id === controllerId && <span className="remote-badge">🎮</span>}
                  </button>
                ))}
              </div>
              {participants.length <= 1 && (
                <p className="no-users-msg">No other users to pass the remote to</p>
              )}
            </div>
          </div>
        )}

        {/* Room Header */}
        <div className="room-header">
          <div className="room-info">
            <h2>🎉 Watch Party</h2>
            <div className="room-code-display" onClick={copyRoomCode} title="Click to copy">
              <span className="code-label">Room:</span>
              <span className="code-value">{roomCode}</span>
              <span className="copy-icon">📋</span>
            </div>
          </div>
          
          {/* Remote Control Status */}
          <div className="remote-status">
            {hasRemote ? (
              <div className="has-remote">
                <span className="remote-icon">🎮</span>
                <span>You have the remote</span>
              </div>
            ) : (
              <div className="no-remote">
                <span className="remote-icon">📺</span>
                <span>{getControllerName()} has the remote</span>
              </div>
            )}
          </div>
          
          <div className="room-actions">
            {hasRemote && (
              <>
                <button className="room-btn select-btn" onClick={selectFromCollection}>
                  🎬 Select Content
                </button>
                <button className="room-btn pass-btn" onClick={() => setShowPassRemoteModal(true)}>
                  🎮 Pass Remote
                </button>
              </>
            )}
            {!hasRemote && (
              <button className="room-btn request-btn" onClick={requestRemote}>
                🙋 Request Remote
              </button>
            )}
            {isHost && !hasRemote && (
              <button className="room-btn takeback-btn" onClick={takeBackRemote}>
                👑 Take Back Remote
              </button>
            )}
            <button className="room-btn leave-btn" onClick={leaveRoom}>
              🚪 Leave
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
                    <p>{hasRemote ? 'Click "Select Content" to start watching' : `Waiting for ${getControllerName()} to select content...`}</p>
                  </div>
                </div>
              )}
              
              {/* Controller Indicator */}
              {!hasRemote && videoUrl && (
                <div className="controller-indicator">
                  <span>🎮 {getControllerName()} is controlling</span>
                </div>
              )}
            </div>

            {/* Video Controls (Controller only) */}
            {hasRemote && videoUrl && (
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
                {participants.map((p, idx) => (
                  <span 
                    key={p.id || idx} 
                    className={`participant ${p.isHost ? 'host' : ''} ${p.id === userId.current ? 'you' : ''} ${p.id === controllerId ? 'controller' : ''}`}
                    title={p.id === controllerId ? 'Has the remote' : ''}
                  >
                    {p.id === controllerId && <span className="mini-remote">🎮</span>}
                    {p.name}
                    {p.isHost && ' 👑'}
                    {p.id === userId.current && ' (you)'}
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
                messages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
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
