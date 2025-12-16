/* ========================================
   useFirebaseWatchParty.js - Real-time Watch Party Hook
   ======================================== */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  database, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  push,
  serverTimestamp 
} from '../config/firebase';

// Generate a random room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export function useFirebaseWatchParty() {
  // User identification
  const [userId] = useState(() => {
    let id = localStorage.getItem('wp_firebase_user_id');
    if (!id) {
      id = generateUserId();
      localStorage.setItem('wp_firebase_user_id', id);
    }
    return id;
  });
  
  const [username, setUsername] = useState(() => 
    localStorage.getItem('wp_firebase_username') || ''
  );
  
  // Room state
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState(null);
  
  // Derived state
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [controllerId, setControllerId] = useState(null);
  const [videoState, setVideoState] = useState({
    url: '',
    isPlaying: false,
    currentTime: 0,
    contentInfo: null
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs for cleanup
  const unsubscribeRef = useRef(null);
  const heartbeatRef = useRef(null);
  
  // Computed values
  const hasRemote = controllerId === userId;
  
  // Save username to localStorage
  useEffect(() => {
    if (username) {
      localStorage.setItem('wp_firebase_username', username);
    }
  }, [username]);

  // Subscribe to room updates
  const subscribeToRoom = useCallback((code) => {
    if (!database) {
      setError('Firebase not initialized');
      return;
    }
    
    const roomRef = ref(database, `watchparty/rooms/${code}`);
    
    unsubscribeRef.current = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        // Room was deleted
        if (isInRoom && !isHost) {
          leaveRoom();
          setError('Room was closed by the host');
        }
        return;
      }
      
      setRoomData(data);
      setIsConnected(true);
      
      // Update participants
      if (data.participants) {
        const participantList = Object.values(data.participants).filter(p => p.active);
        setParticipants(participantList);
      }
      
      // Update messages
      if (data.messages) {
        const messageList = Object.entries(data.messages)
          .map(([key, msg]) => ({ id: key, ...msg }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      }
      
      // Update controller
      setControllerId(data.controllerId || data.host);
      
      // Update video state (only if not controller)
      if (data.controllerId !== userId) {
        setVideoState({
          url: data.videoUrl || '',
          isPlaying: data.isPlaying || false,
          currentTime: data.currentTime || 0,
          contentInfo: data.contentInfo || null
        });
      }
    }, (error) => {
      console.error('Firebase subscription error:', error);
      setError('Connection error. Please try again.');
      setIsConnected(false);
    });
  }, [userId, isInRoom, isHost]);

  // Heartbeat to keep presence alive
  const startHeartbeat = useCallback((code) => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    heartbeatRef.current = setInterval(() => {
      if (database && code) {
        const participantRef = ref(database, `watchparty/rooms/${code}/participants/${userId}`);
        update(participantRef, { lastSeen: Date.now() });
      }
    }, 30000); // Every 30 seconds
  }, [userId]);

  // Create a new room
  const createRoom = useCallback(async () => {
    if (!username.trim()) {
      setError('Please enter your name');
      return null;
    }
    
    if (!database) {
      setError('Firebase not initialized. Check your configuration.');
      return null;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const code = generateRoomCode();
      const roomRef = ref(database, `watchparty/rooms/${code}`);
      
      // Check if room already exists (unlikely but possible)
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        // Generate new code if collision
        return createRoom();
      }
      
      const roomData = {
        code,
        host: userId,
        hostName: username,
        controllerId: userId,
        videoUrl: '',
        isPlaying: false,
        currentTime: 0,
        contentInfo: null,
        createdAt: Date.now(),
        participants: {
          [userId]: {
            id: userId,
            name: username,
            isHost: true,
            active: true,
            joinedAt: Date.now(),
            lastSeen: Date.now()
          }
        },
        messages: {}
      };
      
      await set(roomRef, roomData);
      
      // Add system message
      await addMessage(code, {
        type: 'system',
        text: `${username} created the room 🎉`
      });
      
      setRoomCode(code);
      setIsHost(true);
      setIsInRoom(true);
      setControllerId(userId);
      
      subscribeToRoom(code);
      startHeartbeat(code);
      
      setIsLoading(false);
      return code;
    } catch (err) {
      console.error('Create room error:', err);
      setError('Failed to create room. Please try again.');
      setIsLoading(false);
      return null;
    }
  }, [username, userId, subscribeToRoom, startHeartbeat]);

  // Join an existing room
  const joinRoom = useCallback(async (code) => {
    if (!username.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    if (!code || code.length !== 6) {
      setError('Invalid room code');
      return false;
    }
    
    if (!database) {
      setError('Firebase not initialized. Check your configuration.');
      return false;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const roomRef = ref(database, `watchparty/rooms/${code.toUpperCase()}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        setError('Room not found. Check the code and try again.');
        setIsLoading(false);
        return false;
      }
      
      const data = snapshot.val();
      const normalizedCode = code.toUpperCase();
      
      // Add participant
      const participantRef = ref(database, `watchparty/rooms/${normalizedCode}/participants/${userId}`);
      await set(participantRef, {
        id: userId,
        name: username,
        isHost: false,
        active: true,
        joinedAt: Date.now(),
        lastSeen: Date.now()
      });
      
      // Add join message
      await addMessage(normalizedCode, {
        type: 'system',
        text: `${username} joined the party 👋`
      });
      
      setRoomCode(normalizedCode);
      setIsHost(data.host === userId);
      setIsInRoom(true);
      setControllerId(data.controllerId || data.host);
      setVideoState({
        url: data.videoUrl || '',
        isPlaying: data.isPlaying || false,
        currentTime: data.currentTime || 0,
        contentInfo: data.contentInfo || null
      });
      
      subscribeToRoom(normalizedCode);
      startHeartbeat(normalizedCode);
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Join room error:', err);
      setError('Failed to join room. Please try again.');
      setIsLoading(false);
      return false;
    }
  }, [username, userId, subscribeToRoom, startHeartbeat]);

  // Leave the room
  const leaveRoom = useCallback(async () => {
    // Cleanup subscriptions
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    
    if (database && roomCode) {
      try {
        if (isHost) {
          // Host leaving - delete the room
          const roomRef = ref(database, `watchparty/rooms/${roomCode}`);
          await remove(roomRef);
        } else {
          // Participant leaving
          const participantRef = ref(database, `watchparty/rooms/${roomCode}/participants/${userId}`);
          await update(participantRef, { active: false });
          
          // Add leave message
          await addMessage(roomCode, {
            type: 'system',
            text: `${username} left the party 👋`
          });
          
          // If they had the remote, pass it back to host
          const roomRef = ref(database, `watchparty/rooms/${roomCode}`);
          const snapshot = await get(roomRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.controllerId === userId) {
              await update(roomRef, { controllerId: data.host });
            }
          }
        }
      } catch (err) {
        console.error('Leave room error:', err);
      }
    }
    
    // Reset state
    setRoomCode('');
    setIsInRoom(false);
    setIsHost(false);
    setRoomData(null);
    setParticipants([]);
    setMessages([]);
    setControllerId(null);
    setVideoState({ url: '', isPlaying: false, currentTime: 0, contentInfo: null });
    setIsConnected(false);
    setError('');
  }, [roomCode, isHost, userId, username]);

  // Add a message
  const addMessage = useCallback(async (code, messageData) => {
    if (!database || !code) return;
    
    try {
      const messagesRef = ref(database, `watchparty/rooms/${code}/messages`);
      await push(messagesRef, {
        ...messageData,
        userId: messageData.userId || userId,
        username: messageData.username || username,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Add message error:', err);
    }
  }, [userId, username]);

  // Send a chat message
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !roomCode) return;
    
    await addMessage(roomCode, {
      type: 'chat',
      text: text.trim()
    });
  }, [roomCode, addMessage]);

  // Send a reaction
  const sendReaction = useCallback(async (emoji) => {
    if (!roomCode) return;
    
    await addMessage(roomCode, {
      type: 'reaction',
      text: emoji
    });
  }, [roomCode, addMessage]);

  // Update video URL (controller only)
  const setVideoUrl = useCallback(async (url, contentInfo = null) => {
    if (!roomCode || !hasRemote || !database) return;
    
    try {
      const roomRef = ref(database, `watchparty/rooms/${roomCode}`);
      await update(roomRef, {
        videoUrl: url,
        isPlaying: false,
        currentTime: 0,
        contentInfo
      });
      
      await addMessage(roomCode, {
        type: 'system',
        text: contentInfo?.title 
          ? `🎬 Now watching: ${contentInfo.title}`
          : '🎬 New content selected'
      });
      
      setVideoState(prev => ({ ...prev, url, contentInfo }));
    } catch (err) {
      console.error('Set video error:', err);
    }
  }, [roomCode, hasRemote, addMessage]);

  // Toggle play/pause (controller only)
  const togglePlayPause = useCallback(async () => {
    if (!roomCode || !hasRemote || !database) return;
    
    try {
      const newState = !videoState.isPlaying;
      const roomRef = ref(database, `watchparty/rooms/${roomCode}`);
      await update(roomRef, { isPlaying: newState });
      
      await addMessage(roomCode, {
        type: 'system',
        text: newState ? '▶️ Playing' : '⏸️ Paused'
      });
      
      setVideoState(prev => ({ ...prev, isPlaying: newState }));
    } catch (err) {
      console.error('Toggle play error:', err);
    }
  }, [roomCode, hasRemote, videoState.isPlaying, addMessage]);

  // Sync current time (controller only)
  const syncTime = useCallback(async (time) => {
    if (!roomCode || !hasRemote || !database) return;
    
    try {
      const roomRef = ref(database, `watchparty/rooms/${roomCode}`);
      await update(roomRef, { currentTime: time });
    } catch (err) {
      console.error('Sync time error:', err);
    }
  }, [roomCode, hasRemote]);

  // Pass remote to another user
  const passRemote = useCallback(async (targetUserId) => {
    if (!roomCode || (!hasRemote && !isHost) || !database) return;
    
    try {
      const targetUser = participants.find(p => p.id === targetUserId);
      if (!targetUser) return;
      
      const roomRef = ref(database, `watchparty/rooms/${roomCode}`);
      await update(roomRef, { controllerId: targetUserId });
      
      await addMessage(roomCode, {
        type: 'system',
        text: `🎮 ${username} passed the remote to ${targetUser.name}`
      });
      
      setControllerId(targetUserId);
    } catch (err) {
      console.error('Pass remote error:', err);
    }
  }, [roomCode, hasRemote, isHost, participants, username, addMessage]);

  // Take back remote (host only)
  const takeBackRemote = useCallback(async () => {
    if (!roomCode || !isHost || !database) return;
    
    try {
      const roomRef = ref(database, `watchparty/rooms/${roomCode}`);
      await update(roomRef, { controllerId: userId });
      
      await addMessage(roomCode, {
        type: 'system',
        text: `🎮 ${username} took back the remote`
      });
      
      setControllerId(userId);
    } catch (err) {
      console.error('Take back remote error:', err);
    }
  }, [roomCode, isHost, userId, username, addMessage]);

  // Request remote
  const requestRemote = useCallback(async () => {
    if (!roomCode) return;
    
    await addMessage(roomCode, {
      type: 'system',
      text: `🙋 ${username} is requesting the remote`
    });
  }, [roomCode, username, addMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  // Get controller name
  const getControllerName = useCallback(() => {
    const controller = participants.find(p => p.id === controllerId);
    return controller?.name || 'Unknown';
  }, [participants, controllerId]);

  return {
    // User
    userId,
    username,
    setUsername,
    
    // Room state
    roomCode,
    isInRoom,
    isHost,
    isLoading,
    error,
    isConnected,
    
    // Participants & messages
    participants,
    messages,
    
    // Remote control
    controllerId,
    hasRemote,
    getControllerName,
    passRemote,
    takeBackRemote,
    requestRemote,
    
    // Video
    videoState,
    setVideoUrl,
    togglePlayPause,
    syncTime,
    
    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendReaction,
    
    // Utilities
    setError
  };
}

export default useFirebaseWatchParty;
