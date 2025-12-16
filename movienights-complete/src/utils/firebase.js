/* ========================================
   firebase.js - Firebase Configuration
   ======================================== */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, onValue, remove, update, child } from 'firebase/database';

// Your Firebase configuration
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

// ========== ROOM FUNCTIONS ==========

// Generate a random 6-character room code
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like O, 0, I, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate a unique user ID
export function generateUserId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create a new room
export async function createRoom(roomCode, hostId, hostName) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  const roomData = {
    code: roomCode,
    host: hostId,
    hostName: hostName,
    controllerId: hostId, // Host starts with remote
    createdAt: Date.now(),
    videoUrl: '',
    isPlaying: false,
    currentTime: 0,
    participants: {
      [hostId]: {
        id: hostId,
        name: hostName,
        isHost: true,
        joinedAt: Date.now()
      }
    }
  };
  
  await set(roomRef, roomData);
  
  // Add system message
  await addMessage(roomCode, {
    type: 'system',
    text: `${hostName} created the room`
  });
  
  return roomData;
}

// Check if room exists
export async function roomExists(roomCode) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
}

// Get room data
export async function getRoom(roomCode) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  return snapshot.exists() ? snapshot.val() : null;
}

// Join a room
export async function joinRoom(roomCode, userId, userName) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }
  
  // Add participant
  const participantRef = ref(database, `rooms/${roomCode}/participants/${userId}`);
  await set(participantRef, {
    id: userId,
    name: userName,
    isHost: false,
    joinedAt: Date.now()
  });
  
  // Add system message
  await addMessage(roomCode, {
    type: 'system',
    text: `${userName} joined the room`
  });
  
  return snapshot.val();
}

// Leave a room
export async function leaveRoom(roomCode, userId, userName, isHost) {
  if (isHost) {
    // Host leaving = delete the whole room
    const roomRef = ref(database, `rooms/${roomCode}`);
    await remove(roomRef);
  } else {
    // Remove participant
    const participantRef = ref(database, `rooms/${roomCode}/participants/${userId}`);
    await remove(participantRef);
    
    // Add system message
    await addMessage(roomCode, {
      type: 'system',
      text: `${userName} left the room`
    });
  }
}

// Subscribe to room changes
export function subscribeToRoom(roomCode, callback) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
}

// ========== VIDEO CONTROL FUNCTIONS ==========

// Update video URL
export async function updateVideoUrl(roomCode, videoUrl, title = '') {
  const roomRef = ref(database, `rooms/${roomCode}`);
  await update(roomRef, {
    videoUrl: videoUrl,
    videoTitle: title,
    isPlaying: false,
    currentTime: 0
  });
  
  await addMessage(roomCode, {
    type: 'system',
    text: title ? `🎬 Now watching: ${title}` : '🎬 New content selected'
  });
}

// Update play state
export async function updatePlayState(roomCode, isPlaying) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  await update(roomRef, { isPlaying });
  
  await addMessage(roomCode, {
    type: 'system',
    text: isPlaying ? '▶️ Video playing' : '⏸️ Video paused'
  });
}

// Sync video time
export async function syncVideoTime(roomCode, currentTime) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  await update(roomRef, { currentTime });
}

// ========== REMOTE CONTROL FUNCTIONS ==========

// Pass remote to another user
export async function passRemote(roomCode, newControllerId, fromName, toName) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  await update(roomRef, { controllerId: newControllerId });
  
  await addMessage(roomCode, {
    type: 'system',
    text: `🎮 ${fromName} passed the remote to ${toName}`
  });
}

// Take back remote (host only)
export async function takeBackRemote(roomCode, hostId, hostName) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  await update(roomRef, { controllerId: hostId });
  
  await addMessage(roomCode, {
    type: 'system',
    text: `🎮 ${hostName} took back the remote`
  });
}

// ========== CHAT FUNCTIONS ==========

// Add a message
export async function addMessage(roomCode, message) {
  const messagesRef = ref(database, `rooms/${roomCode}/messages`);
  const newMessageRef = push(messagesRef);
  
  await set(newMessageRef, {
    id: newMessageRef.key,
    ...message,
    timestamp: Date.now()
  });
}

// Send chat message
export async function sendChatMessage(roomCode, userId, userName, text) {
  await addMessage(roomCode, {
    type: 'chat',
    userId,
    userName,
    text
  });
}

// Send reaction
export async function sendReaction(roomCode, userId, userName, emoji) {
  await addMessage(roomCode, {
    type: 'reaction',
    userId,
    userName,
    text: emoji
  });
}

// Subscribe to messages
export function subscribeToMessages(roomCode, callback) {
  const messagesRef = ref(database, `rooms/${roomCode}/messages`);
  return onValue(messagesRef, (snapshot) => {
    const messages = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        messages.push(child.val());
      });
    }
    callback(messages);
  });
}

export { database };
