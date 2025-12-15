/* ========================================
   WatchPartySection.jsx - Watch Party
   ======================================== */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { generateRoomCode, generateUserId } from '../../utils/helpers';
import './Sections.css';
import './WatchPartySection.css';

// Global room storage shared between tabs
const ROOMS = {};
const CHANNEL_NAME = 'watchparty_channel';

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
  
  // User ID (persistent)
  const [visitorId] = useState(() => {
    let id = localStorage.getItem('wp_user_id');
    if (!id) {
      id = generateUserId();
      localStorage.setItem('wp_user_id', id);
    }
    return id;
  });
  
  // States
  const [username, setUsername] = useState(() => localStorage.getItem('wp_username') || '');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [controllerId, setControllerId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  
  // Refs
  const channelRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const hasRemote = controllerId === visitorId;
  const reactions = ['😂', '😮', '😢', '😍', '🔥', '👏', '💀', '🎬'];

  // Setup BroadcastChannel
  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current.onmessage = (e) => {
        const { type, code, room } = e.data;
        if (type === 'SYNC' && room) {
          ROOMS[code] = room;
        }
        if (type === 'DELETE') {
          delete ROOMS[code];
        }
      };
    } catch (err) {
      console.log('BroadcastChannel not available');
    }
    return () => channelRef.current?.close();
  }, []);

  // Sync room state
  useEffect(() => {
    if (!isInRoom || !roomCode) return;
    
    const interval = setInterval(() => {
      const room = ROOMS[roomCode];
      if (room) {
        setParticipants([...room.participants]);
        setMessages([...room.messages]);
        setControllerId(room.controllerId);
        if (room.controllerId !== visitorId) {
          setVideoUrl(room.videoUrl || '');
          setIsPlaying(room.isPlaying || false);
        }
      } else if (!isHost) {
        leaveRoom();
        notify('Room was closed', 'info');
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [isInRoom, roomCode, isHost, visitorId]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Broadcast helper
  const broadcast = (code, room) => {
    ROOMS[code] = room;
    channelRef.current?.postMessage({ type: 'SYNC', code, room });
  };

  // Create Room
  const createRoom = () => {
    if (!username.trim()) {
      notify('Enter your name first', 'warning');
      return;
    }
    localStorage.setItem('wp_username', username);
    
    const code = generateRoomCode();
    const room = {
      code,
      host: visitorId,
      controllerId: visitorId,
      participants: [{ id: visitorId, name: username, isHost: true }],
      messages: [{ id: Date.now(), type: 'system', text: `${username} created the room` }],
      videoUrl: '',
      isPlaying: false
    };
    
    broadcast(code, room);
    
    setRoomCode(code);
    setIsHost(true);
    setIsInRoom(true);
    setControllerId(visitorId);
    setParticipants(room.participants);
    setMessages(room.messages);
    setError('');
    
    notify(`Room ${code} created!`, 'success');
  };

  // Join Room
  const joinRoom = async () => {
    if (!username.trim()) {
      notify('Enter your name first', 'warning');
      return;
    }
    if (!joinCode.trim()) {
      notify('Enter a room code', 'warning');
      return;
    }
    localStorage.setItem('wp_username', username);
    
    const code = joinCode.toUpperCase();
    
    // Request room data from other tabs
    channelRef.current?.postMessage({ type: 'REQUEST', code });
    await new Promise(r => setTimeout(r, 400));
    
    const room = ROOMS[code];
    if (!room) {
      setError('Room not found. Make sure host tab is open.');
      notify('Room not found', 'error');
      return;
    }
    
    // Add participant
    if (!room.participants.find(p => p.id === visitorId)) {
      room.participants.push({ id: visitorId, name: username, isHost: false });
    }
    room.messages.push({ id: Date.now(), type: 'system', text: `${username} joined` });
    
    broadcast(code, room);
    
    setRoomCode(code);
    setIsHost(false);
    setIsInRoom(true);
    setControllerId(room.controllerId);
    setParticipants([...room.participants]);
    setMessages([...room.messages]);
    setVideoUrl(room.videoUrl || '');
    setIsPlaying(room.isPlaying || false);
    setError('');
    
    notify(`Joined room ${code}!`, 'success');
  };

  // Leave Room
  const leaveRoom = () => {
    if (roomCode && ROOMS[roomCode]) {
      if (isHost) {
        delete ROOMS[roomCode];
        channelRef.current?.postMessage({ type: 'DELETE', code: roomCode });
      } else {
        const room = ROOMS[roomCode];
        room.participants = room.participants.filter(p => p.id !== visitorId);
        room.messages.push({ id: Date.now(), type: 'system', text: `${username} left` });
        if (room.controllerId === visitorId) room.controllerId = room.host;
        broadcast(roomCode, room);
      }
    }
    
    setRoomCode('');
    setIsInRoom(false);
    setIsHost(false);
    setControllerId(null);
    setParticipants([]);
    setMessages([]);
    setVideoUrl('');
    notify('Left room', 'info');
  };

  // Pass Remote
  const passRemote = (targetId) => {
    const room = ROOMS[roomCode];
    if (!room) return;
    
    const target = participants.find(p => p.id === targetId);
    room.controllerId = targetId;
    room.messages.push({ id: Date.now(), type: 'system', text: `🎮 Remote passed to ${target?.name}` });
    broadcast(roomCode, room);
    
    setControllerId(targetId);
    setMessages([...room.messages]);
    setShowPassModal(false);
    notify(`Passed remote to ${target?.name}`, 'success');
  };

  // Take Back Remote (Host only)
  const takeBackRemote = () => {
    const room = ROOMS[roomCode];
    if (!room) return;
    
    room.controllerId = visitorId;
    room.messages.push({ id: Date.now(), type: 'system', text: `🎮 ${username} took back remote` });
    broadcast(roomCode, room);
    
    setControllerId(visitorId);
    setMessages([...room.messages]);
    notify('You have the remote', 'success');
  };

  // Request Remote
  const requestRemote = () => {
    notify('Remote request sent!', 'info');
  };

  // Send Message
  const sendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    
    const room = ROOMS[roomCode];
    if (!room) return;
    
    room.messages.push({
      id: Date.now(),
      type: 'chat',
      userId: visitorId,
      name: username,
      text: newMessage
    });
    broadcast(roomCode, room);
    
    setMessages([...room.messages]);
    setNewMessage('');
  };

  // Send Reaction
  const sendReaction = (emoji) => {
    const room = ROOMS[roomCode];
    if (!room) return;
    
    room.messages.push({
      id: Date.now(),
      type: 'reaction',
      userId: visitorId,
      name: username,
      text: emoji
    });
    broadcast(roomCode, room);
    setMessages([...room.messages]);
  };

  // Select Content
  const selectContent = () => {
    const input = prompt('Enter TMDB movie ID or video URL:');
    if (!input) return;
    
    const url = input.startsWith('http') ? input : `https://vidsrc.cc/v2/embed/movie/${input}`;
    const room = ROOMS[roomCode];
    if (!room) return;
    
    room.videoUrl = url;
    room.messages.push({ id: Date.now(), type: 'system', text: '🎬 Content selected' });
    broadcast(roomCode, room);
    
    setVideoUrl(url);
    setMessages([...room.messages]);
  };

  // Toggle Play
  const togglePlay = () => {
    const room = ROOMS[roomCode];
    if (!room) return;
    
    room.isPlaying = !room.isPlaying;
    room.messages.push({ id: Date.now(), type: 'system', text: room.isPlaying ? '▶️ Playing' : '⏸️ Paused' });
    broadcast(roomCode, room);
    
    setIsPlaying(room.isPlaying);
    setMessages([...room.messages]);
  };

  // Copy Code
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    notify('Code copied!', 'success');
  };

  // Get controller name
  const getControllerName = () => {
    return participants.find(p => p.id === controllerId)?.name || 'Unknown';
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
          <div className="wp-status-bar">
            <span className="wp-status-dot"></span>
            <span>Open in multiple tabs to test</span>
          </div>

          <div className="wp-card wp-name-card">
            <h3>👤 Your Name</h3>
            <input
              type="text"
              placeholder="Enter name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="wp-options">
            <div className="wp-card">
              <div className="wp-card-icon">🎬</div>
              <h3>Create Room</h3>
              <p>Start a new party</p>
              <button className="wp-btn wp-btn-create" onClick={createRoom}>
                Create
              </button>
            </div>

            <div className="wp-card">
              <div className="wp-card-icon">🔗</div>
              <h3>Join Room</h3>
              <p>Enter code to join</p>
              <input
                type="text"
                placeholder="XXXXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="wp-code-input"
              />
              <button className="wp-btn wp-btn-join" onClick={joinRoom}>
                Join
              </button>
              {error && <p className="wp-error">{error}</p>}
            </div>
          </div>

          <div className="wp-instructions">
            <h3>🧪 How to Test</h3>
            <ol>
              <li><strong>Tab 1:</strong> Enter name → Create Room</li>
              <li><strong>Copy</strong> the 6-character code</li>
              <li><strong>Tab 2:</strong> Enter name → Paste code → Join</li>
            </ol>
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
                <button key={p.id} className="wp-user-btn" onClick={() => passRemote(p.id)}>
                  <span className="wp-user-avatar">{p.name[0]}</span>
                  <span>{p.name}</span>
                  {p.id === controllerId && <span className="wp-remote-badge">🎮</span>}
                </button>
              ))}
              {participants.length <= 1 && <p>No other users</p>}
            </div>
            <button className="wp-btn wp-btn-close" onClick={() => setShowPassModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Room Header */}
      <div className="wp-room-header">
        <div className="wp-room-info">
          <h2>🎉 Watch Party</h2>
          <button className="wp-code-display" onClick={copyCode}>
            <span>Room: </span>
            <strong>{roomCode}</strong>
            <span>📋</span>
          </button>
        </div>

        <div className="wp-remote-status">
          {hasRemote ? (
            <span className="wp-has-remote">🎮 You have remote</span>
          ) : (
            <span className="wp-no-remote">📺 {getControllerName()} has remote</span>
          )}
        </div>

        <div className="wp-room-actions">
          {hasRemote && (
            <>
              <button className="wp-btn" onClick={selectContent}>🎬 Select</button>
              <button className="wp-btn" onClick={() => setShowPassModal(true)}>🎮 Pass</button>
            </>
          )}
          {!hasRemote && <button className="wp-btn" onClick={requestRemote}>🙋 Request</button>}
          {isHost && !hasRemote && <button className="wp-btn" onClick={takeBackRemote}>👑 Take Back</button>}
          <button className="wp-btn wp-btn-leave" onClick={leaveRoom}>🚪 Leave</button>
        </div>
      </div>

      {/* Room Content */}
      <div className="wp-room-content">
        {/* Video */}
        <div className="wp-video-section">
          <div className="wp-video-container">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen"
                title="Video"
              />
            ) : (
              <div className="wp-video-placeholder">
                <span>🎬</span>
                <p>{hasRemote ? 'Click Select to pick content' : `Waiting for ${getControllerName()}...`}</p>
              </div>
            )}
          </div>

          {hasRemote && videoUrl && (
            <div className="wp-video-controls">
              <button className="wp-btn" onClick={togglePlay}>
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
            </div>
          )}

          <div className="wp-participants">
            <span>👥</span>
            {participants.map((p, i) => (
              <span key={i} className={`wp-participant ${p.id === controllerId ? 'controller' : ''}`}>
                {p.id === controllerId && '🎮 '}
                {p.name}
                {p.isHost && ' 👑'}
                {p.id === visitorId && ' (you)'}
              </span>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="wp-chat-section">
          <div className="wp-chat-header">
            <h3>💬 Chat</h3>
            <span>{participants.length} online</span>
          </div>

          <div className="wp-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`wp-message ${msg.type} ${msg.userId === visitorId ? 'own' : ''}`}>
                {msg.type === 'system' ? (
                  <span className="wp-system-msg">{msg.text}</span>
                ) : msg.type === 'reaction' ? (
                  <span className="wp-reaction-msg">{msg.name}: {msg.text}</span>
                ) : (
                  <div className="wp-chat-msg">
                    <strong>{msg.name}</strong>
                    <p>{msg.text}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="wp-reactions">
            {reactions.map(e => (
              <button key={e} onClick={() => sendReaction(e)}>{e}</button>
            ))}
          </div>

          <form className="wp-chat-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit">➤</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default WatchPartySection;
