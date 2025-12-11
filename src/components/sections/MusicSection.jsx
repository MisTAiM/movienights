/* ========================================
   MusicSection.jsx - Advanced Music Hub with Full Player
   Features: Search, Equalizer, Sleep Timer, Playlists, Lyrics, Visualizer
   ======================================== */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// Deezer API endpoints (free, no auth required for search)
const DEEZER_API = 'https://api.deezer.com';
const CORS_PROXY = 'https://corsproxy.io/?';

// Equalizer presets
const EQ_PRESETS = {
  flat: { name: 'Flat', icon: '➖', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  bass: { name: 'Bass Boost', icon: '🔊', values: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  treble: { name: 'Treble Boost', icon: '🎵', values: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6] },
  vocal: { name: 'Vocal', icon: '🎤', values: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2] },
  rock: { name: 'Rock', icon: '🎸', values: [4, 3, 2, 0, -1, 0, 2, 3, 4, 4] },
  pop: { name: 'Pop', icon: '🎵', values: [-1, 0, 2, 4, 4, 2, 0, -1, -1, -1] },
  jazz: { name: 'Jazz', icon: '🎷', values: [0, 0, 2, 4, 4, 4, 2, 2, 3, 3] },
  classical: { name: 'Classical', icon: '🎻', values: [0, 0, 0, 0, 0, 0, -2, -3, -3, -4] },
  electronic: { name: 'Electronic', icon: '⚡', values: [4, 3, 0, -2, -2, 0, 2, 4, 4, 4] },
  hiphop: { name: 'Hip-Hop', icon: '🎤', values: [5, 4, 2, 0, -1, -1, 1, 0, 2, 3] }
};

// Sleep timer options (in minutes)
const SLEEP_TIMER_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
];

// Genre mappings for Deezer
const GENRES = [
  { id: 0, name: 'All', icon: '🎵' },
  { id: 132, name: 'Pop', icon: '🎤' },
  { id: 116, name: 'Rap/Hip Hop', icon: '🎤' },
  { id: 152, name: 'Rock', icon: '🎸' },
  { id: 113, name: 'Dance/EDM', icon: '💃' },
  { id: 165, name: 'R&B', icon: '💜' },
  { id: 85, name: 'Alternative', icon: '🔮' },
  { id: 106, name: 'Electro', icon: '⚡' },
  { id: 129, name: 'Jazz', icon: '🎷' },
  { id: 98, name: 'Classical', icon: '🎻' },
  { id: 173, name: 'Anime', icon: '🎌' },
  { id: 169, name: 'Soul & Funk', icon: '🕺' },
  { id: 153, name: 'Blues', icon: '🎺' },
  { id: 466, name: 'K-Pop', icon: '🇰🇷' },
  { id: 464, name: 'Metal', icon: '🤘' },
  { id: 144, name: 'Reggae', icon: '🌴' },
  { id: 197, name: 'Latino', icon: '💃' },
  { id: 95, name: 'Kids', icon: '🧒' }
];

// Mood/Activity playlists
const MOODS = [
  { id: 'chill', name: 'Chill & Relax', icon: '😌', query: 'chill lofi relax' },
  { id: 'focus', name: 'Focus & Study', icon: '📚', query: 'study focus concentration' },
  { id: 'workout', name: 'Workout', icon: '💪', query: 'workout gym motivation' },
  { id: 'party', name: 'Party', icon: '🎉', query: 'party dance hits' },
  { id: 'sleep', name: 'Sleep', icon: '😴', query: 'sleep ambient calm' },
  { id: 'happy', name: 'Happy Vibes', icon: '😊', query: 'happy upbeat feel good' },
  { id: 'sad', name: 'In My Feels', icon: '😢', query: 'sad emotional ballad' },
  { id: 'romance', name: 'Romantic', icon: '💕', query: 'love romantic ballad' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', query: 'gaming epic soundtrack' },
  { id: 'morning', name: 'Morning Coffee', icon: '☕', query: 'morning acoustic coffee' },
  { id: 'drive', name: 'Road Trip', icon: '🚗', query: 'road trip driving' },
  { id: 'throwback', name: 'Throwback', icon: '📼', query: '90s 2000s throwback hits' }
];

// Decades for browsing
const DECADES = [
  { id: '2020s', name: '2020s', query: '2023 2024 hits' },
  { id: '2010s', name: '2010s', query: '2010s hits' },
  { id: '2000s', name: '2000s', query: '2000s hits' },
  { id: '90s', name: '90s', query: '90s hits' },
  { id: '80s', name: '80s', query: '80s hits' },
  { id: '70s', name: '70s', query: '70s hits' },
  { id: '60s', name: '60s', query: '60s hits' }
];

// Radio stations (live streams)
const RADIO_STATIONS = [
  { id: 'lofi', name: 'Lofi Girl', icon: '🎧', youtube: 'jfKfPfyJRdk', type: 'live' },
  { id: 'chillhop', name: 'Chillhop', icon: '☕', youtube: '5yx6BWlEVcY', type: 'live' },
  { id: 'jazz', name: 'Jazz Radio', icon: '🎷', youtube: 'Dx5qFachd3A', type: 'live' },
  { id: 'classical', name: 'Classical', icon: '🎻', youtube: 'mIYzp5rcTvU', type: 'live' },
  { id: 'anime', name: 'Anime Radio', icon: '🎌', youtube: 'WDXPJWIgX-o', type: 'live' },
  { id: 'edm', name: 'EDM Radio', icon: '🔊', youtube: '5qap5aO4i9A', type: 'live' }
];

function MusicSection() {
  const { actions } = useApp();
  
  // Search & browse state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('track');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [showVisualizer, setShowVisualizer] = useState(false);
  
  // Queue & library
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  
  // UI state
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [activeRadio, setActiveRadio] = useState(null);
  
  // NEW: Advanced player features
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [eqPreset, setEqPreset] = useState('flat');
  const [customEq, setCustomEq] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [sleepTimer, setSleepTimer] = useState(0); // minutes
  const [sleepTimerEnd, setSleepTimerEnd] = useState(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null);
  const [crossfade, setCrossfade] = useState(0); // seconds
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // NEW: Playlist management
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [trackToAdd, setTrackToAdd] = useState(null);
  
  // NEW: Artist/Album view
  const [viewMode, setViewMode] = useState('tracks'); // tracks, artist, album
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [albumTracks, setAlbumTracks] = useState([]);
  
  // NEW: Advanced search filters
  const [yearFilter, setYearFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('all'); // all, short, medium, long
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // NEW: Mini player mode
  const [miniPlayer, setMiniPlayer] = useState(false);
  
  // NEW: Music stats
  const [listeningStats, setListeningStats] = useState({
    totalPlayed: 0,
    totalTime: 0,
    topArtists: [],
    topGenres: []
  });
  
  // Refs
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const eqFiltersRef = useRef([]);
  
  // Load saved data
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('movienights_music_favorites');
      const savedRecent = localStorage.getItem('movienights_music_recent');
      const savedVolume = localStorage.getItem('movienights_music_volume');
      const savedPlaylists = localStorage.getItem('movienights_music_playlists');
      const savedEqPreset = localStorage.getItem('movienights_music_eq');
      const savedStats = localStorage.getItem('movienights_music_stats');
      const savedCrossfade = localStorage.getItem('movienights_music_crossfade');
      
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));
      if (savedVolume) setVolume(parseFloat(savedVolume));
      if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
      if (savedEqPreset) setEqPreset(savedEqPreset);
      if (savedStats) setListeningStats(JSON.parse(savedStats));
      if (savedCrossfade) setCrossfade(parseInt(savedCrossfade));
    } catch (e) {
      console.error('Error loading music data:', e);
    }
  }, []);
  
  // Save favorites
  useEffect(() => {
    localStorage.setItem('movienights_music_favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Save recent
  useEffect(() => {
    localStorage.setItem('movienights_music_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);
  
  // Save playlists
  useEffect(() => {
    localStorage.setItem('movienights_music_playlists', JSON.stringify(playlists));
  }, [playlists]);
  
  // Save EQ preset
  useEffect(() => {
    localStorage.setItem('movienights_music_eq', eqPreset);
  }, [eqPreset]);
  
  // Save stats
  useEffect(() => {
    localStorage.setItem('movienights_music_stats', JSON.stringify(listeningStats));
  }, [listeningStats]);
  
  // Save crossfade
  useEffect(() => {
    localStorage.setItem('movienights_music_crossfade', crossfade.toString());
  }, [crossfade]);
  
  // Save volume
  useEffect(() => {
    localStorage.setItem('movienights_music_volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Search function using Deezer API
  const searchMusic = useCallback(async (query, type = 'track') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const endpoint = type === 'track' ? 'search' : `search/${type}`;
      const url = `${CORS_PROXY}${encodeURIComponent(`${DEEZER_API}/${endpoint}?q=${encodeURIComponent(query)}&limit=50`)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      try {
        const altUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=50`)}`;
        const response = await fetch(altUrl);
        const data = await response.json();
        if (data.data) {
          setSearchResults(data.data);
        }
      } catch (e) {
        setSearchResults([]);
        actions.addNotification('Search failed. Try again.', 'error');
      }
    } finally {
      setIsSearching(false);
    }
  }, [actions]);
  
  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchMusic(searchQuery, searchType);
      }, 500);
    } else {
      setSearchResults([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchType, searchMusic]);
  
  // Get chart/trending music
  const loadChart = useCallback(async (genreId = 0) => {
    setIsSearching(true);
    try {
      const endpoint = genreId > 0 ? `chart/${genreId}/tracks` : 'chart/0/tracks';
      const url = `${CORS_PROXY}${encodeURIComponent(`${DEEZER_API}/${endpoint}?limit=50`)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        setSearchResults(data.data);
      } else if (data.tracks?.data) {
        setSearchResults(data.tracks.data);
      }
    } catch (error) {
      console.error('Chart load error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Load mood playlist
  const loadMood = useCallback(async (mood) => {
    setSearchQuery(mood.query);
    setActiveTab('search');
    await searchMusic(mood.query, 'track');
    actions.addNotification(`Loading ${mood.name} playlist...`, 'info');
  }, [searchMusic, actions]);
  
  // Play track
  const playTrack = useCallback((track, addToQueue = true) => {
    if (!track.preview) {
      actions.addNotification('Preview not available - Opening YouTube', 'warning');
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist?.name || ''}`)}`, '_blank');
      return;
    }
    
    setActiveRadio(null);
    setCurrentTrack(track);
    setIsPlaying(true);
    
    const newRecent = [
      track,
      ...recentlyPlayed.filter(t => t.id !== track.id)
    ].slice(0, 50);
    setRecentlyPlayed(newRecent);
    
    if (addToQueue && !queue.find(t => t.id === track.id)) {
      setQueue(prev => [...prev, track]);
      setQueueIndex(queue.length);
    }
    
    if (audioRef.current) {
      audioRef.current.src = track.preview;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => {
        console.error('Play error:', e);
        actions.addNotification('Playback error. Try another track.', 'error');
      });
    }
  }, [actions, queue, recentlyPlayed, volume]);
  
  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  // Next track
  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }
    
    setQueueIndex(nextIndex);
    playTrack(queue[nextIndex], false);
  }, [queue, queueIndex, isShuffle, playTrack]);
  
  // Previous track
  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex], false);
  }, [queue, queueIndex, playTrack]);
  
  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 30);
    };
    
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [nextTrack, repeatMode, queue.length, queueIndex]);
  
  // Seek
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };
  
  // Toggle favorite
  const toggleFavorite = (track) => {
    const isFav = favorites.find(t => t.id === track.id);
    if (isFav) {
      setFavorites(prev => prev.filter(t => t.id !== track.id));
      actions.addNotification('Removed from favorites', 'info');
    } else {
      setFavorites(prev => [track, ...prev]);
      actions.addNotification('Added to favorites! ❤️', 'success');
    }
  };
  
  // Add to queue
  const addToQueue = (track) => {
    if (!queue.find(t => t.id === track.id)) {
      setQueue(prev => [...prev, track]);
      actions.addNotification(`Added "${track.title}" to queue`, 'info');
    }
  };
  
  // Remove from queue
  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex(prev => prev - 1);
    }
  };
  
  // Clear queue
  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(0);
  };
  
  // Play all results
  const playAll = () => {
    if (searchResults.length === 0) return;
    const playable = searchResults.filter(t => t.preview);
    if (playable.length === 0) {
      actions.addNotification('No playable tracks found', 'warning');
      return;
    }
    setQueue(playable);
    setQueueIndex(0);
    playTrack(playable[0], false);
  };
  
  // Shuffle play
  const shufflePlay = () => {
    if (searchResults.length === 0) return;
    const playable = searchResults.filter(t => t.preview);
    if (playable.length === 0) return;
    
    const shuffled = [...playable].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setQueueIndex(0);
    setIsShuffle(true);
    playTrack(shuffled[0], false);
  };
  
  // Play radio station
  const playRadio = (station) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setActiveRadio(station);
  };
  
  // Stop radio
  const stopRadio = () => {
    setActiveRadio(null);
  };
  
  // Fetch lyrics
  const fetchLyrics = useCallback(async (track) => {
    if (!track) return;
    
    setLyricsLoading(true);
    setLyrics('');
    
    try {
      const artist = track.artist?.name || '';
      const title = track.title || '';
      
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          setLyrics('Lyrics not found for this track.');
        }
      } else {
        setLyrics('Lyrics not found for this track.');
      }
    } catch (error) {
      setLyrics('Could not load lyrics. Try searching manually.');
    } finally {
      setLyricsLoading(false);
    }
  }, []);
  
  // Load lyrics when track changes
  useEffect(() => {
    if (showLyrics && currentTrack) {
      fetchLyrics(currentTrack);
    }
  }, [currentTrack, showLyrics, fetchLyrics]);
  
  // Audio visualizer
  useEffect(() => {
    if (!showVisualizer || !audioRef.current || !canvasRef.current) return;
    
    const initVisualizer = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
        source.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyzerRef.current.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, '#d4af37');
          gradient.addColorStop(1, '#b8860b');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      };
      
      draw();
    };
    
    if (isPlaying) {
      initVisualizer();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showVisualizer, isPlaying]);
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) nextTrack();
          break;
        case 'ArrowLeft':
          if (e.shiftKey) prevTrack();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'm':
        case 'M':
          setVolume(v => v > 0 ? 0 : 0.7);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack]);

  // ============ NEW FEATURES ============
  
  // Sleep Timer Logic
  useEffect(() => {
    if (sleepTimer > 0 && !sleepTimerEnd) {
      const endTime = Date.now() + sleepTimer * 60 * 1000;
      setSleepTimerEnd(endTime);
      actions.addNotification(`Sleep timer set for ${sleepTimer} minutes`, 'info');
    }
    
    if (sleepTimerEnd) {
      sleepTimerRef.current = setInterval(() => {
        const remaining = Math.max(0, sleepTimerEnd - Date.now());
        setSleepTimeRemaining(Math.ceil(remaining / 1000));
        
        if (remaining <= 0) {
          // Fade out and pause
          if (audioRef.current) {
            let vol = audioRef.current.volume;
            const fadeInterval = setInterval(() => {
              vol -= 0.1;
              if (vol <= 0) {
                audioRef.current.pause();
                audioRef.current.volume = volume;
                clearInterval(fadeInterval);
              } else {
                audioRef.current.volume = vol;
              }
            }, 200);
          }
          setSleepTimer(0);
          setSleepTimerEnd(null);
          setSleepTimeRemaining(null);
          clearInterval(sleepTimerRef.current);
          actions.addNotification('💤 Sleep timer ended. Goodnight!', 'info');
        }
      }, 1000);
    }
    
    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimer, sleepTimerEnd, volume, actions]);
  
  // Cancel sleep timer
  const cancelSleepTimer = () => {
    setSleepTimer(0);
    setSleepTimerEnd(null);
    setSleepTimeRemaining(null);
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
    }
    actions.addNotification('Sleep timer cancelled', 'info');
  };
  
  // Format sleep time remaining
  const formatSleepTime = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Playlist functions
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist = {
      id: Date.now(),
      name: newPlaylistName.trim(),
      tracks: [],
      createdAt: new Date().toISOString()
    };
    
    setPlaylists(prev => [...prev, newPlaylist]);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
    actions.addNotification(`Playlist "${newPlaylist.name}" created!`, 'success');
  };
  
  const addToPlaylist = (playlistId, track) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.tracks.find(t => t.id === track.id)) {
          actions.addNotification('Track already in playlist', 'warning');
          return pl;
        }
        actions.addNotification(`Added to "${pl.name}"`, 'success');
        return { ...pl, tracks: [...pl.tracks, track] };
      }
      return pl;
    }));
    setTrackToAdd(null);
  };
  
  const removeFromPlaylist = (playlistId, trackId) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
      }
      return pl;
    }));
  };
  
  const deletePlaylist = (playlistId) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
    }
    actions.addNotification('Playlist deleted', 'info');
  };
  
  const playPlaylist = (playlist) => {
    const playable = playlist.tracks.filter(t => t.preview);
    if (playable.length === 0) {
      actions.addNotification('No playable tracks in playlist', 'warning');
      return;
    }
    setQueue(playable);
    setQueueIndex(0);
    playTrack(playable[0], false);
    actions.addNotification(`Playing "${playlist.name}"`, 'info');
  };
  
  // Artist view functions
  const loadArtistTracks = async (artist) => {
    setSelectedArtist(artist);
    setViewMode('artist');
    setIsSearching(true);
    
    try {
      const url = `${CORS_PROXY}${encodeURIComponent(`${DEEZER_API}/artist/${artist.id}/top?limit=50`)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        setArtistTracks(data.data);
      }
    } catch (error) {
      console.error('Error loading artist tracks:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Album view functions
  const loadAlbumTracks = async (album) => {
    setSelectedAlbum(album);
    setViewMode('album');
    setIsSearching(true);
    
    try {
      const url = `${CORS_PROXY}${encodeURIComponent(`${DEEZER_API}/album/${album.id}`)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.tracks?.data) {
        setAlbumTracks(data.tracks.data);
      }
    } catch (error) {
      console.error('Error loading album tracks:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Close artist/album view
  const closeDetailView = () => {
    setViewMode('tracks');
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setArtistTracks([]);
    setAlbumTracks([]);
  };
  
  // Update listening stats
  const updateStats = useCallback((track) => {
    setListeningStats(prev => {
      const artistName = track.artist?.name || 'Unknown';
      const topArtists = [...prev.topArtists];
      const artistIndex = topArtists.findIndex(a => a.name === artistName);
      
      if (artistIndex >= 0) {
        topArtists[artistIndex].count++;
      } else {
        topArtists.push({ name: artistName, count: 1 });
      }
      
      topArtists.sort((a, b) => b.count - a.count);
      
      return {
        totalPlayed: prev.totalPlayed + 1,
        totalTime: prev.totalTime + (track.duration || 30),
        topArtists: topArtists.slice(0, 10),
        topGenres: prev.topGenres
      };
    });
  }, []);
  
  // Apply equalizer preset
  const applyEqPreset = (presetKey) => {
    setEqPreset(presetKey);
    setCustomEq(EQ_PRESETS[presetKey].values);
    actions.addNotification(`EQ: ${EQ_PRESETS[presetKey].name}`, 'info');
  };
  
  // Change playback speed
  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };
  
  // Share track
  const shareTrack = (track) => {
    const shareUrl = `https://www.deezer.com/track/${track.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to ${track.title} by ${track.artist?.name}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      actions.addNotification('Link copied to clipboard!', 'success');
    }
  };
  
  // Get related tracks
  const getRelatedTracks = async (track) => {
    try {
      const url = `${CORS_PROXY}${encodeURIComponent(`${DEEZER_API}/track/${track.id}`)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.artist?.id) {
        searchMusic(`${data.artist.name}`, 'track');
      }
    } catch (error) {
      console.error('Error getting related tracks:', error);
    }
  };
  
  // Filter results by duration
  const filteredResults = useMemo(() => {
    let results = searchResults;
    
    if (durationFilter !== 'all') {
      results = results.filter(track => {
        const duration = track.duration || 0;
        switch (durationFilter) {
          case 'short': return duration < 180; // < 3 min
          case 'medium': return duration >= 180 && duration < 300; // 3-5 min
          case 'long': return duration >= 300; // > 5 min
          default: return true;
        }
      });
    }
    
    return results;
  }, [searchResults, durationFilter]);

  return (
    <div className={`music-section ${miniPlayer ? 'mini-mode' : ''}`}>
      <audio ref={audioRef} />
      
      {/* Section Header */}
      <div className="music-header">
        <h2 className="section-title">🎵 Music Hub</h2>
        <div className="music-tabs">
          <button 
            className={`music-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Search
          </button>
          <button 
            className={`music-tab ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => { setActiveTab('discover'); loadChart(selectedGenre); }}
          >
            🔥 Discover
          </button>
          <button 
            className={`music-tab ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            📁 Playlists
          </button>
          <button 
            className={`music-tab ${activeTab === 'radio' ? 'active' : ''}`}
            onClick={() => setActiveTab('radio')}
          >
            📻 Radio
          </button>
          <button 
            className={`music-tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            💾 Library
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="music-content">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="search-section">
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="music-search-input"
                  placeholder="Search songs, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchMusic(searchQuery, searchType)}
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
              
              <div className="search-filters">
                <select 
                  className="search-type-select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="track">🎵 Songs</option>
                  <option value="artist">👤 Artists</option>
                  <option value="album">💿 Albums</option>
                </select>
                
                <select
                  className="genre-select"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(parseInt(e.target.value))}
                >
                  {GENRES.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.icon} {genre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Moods */}
            <div className="moods-section">
              <h3>🎭 Quick Moods</h3>
              <div className="moods-grid">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    className="mood-btn"
                    onClick={() => loadMood(mood)}
                  >
                    <span className="mood-icon">{mood.icon}</span>
                    <span className="mood-name">{mood.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Decades */}
            <div className="decades-section">
              <h3>📅 Browse by Decade</h3>
              <div className="decades-row">
                {DECADES.map(decade => (
                  <button
                    key={decade.id}
                    className="decade-btn"
                    onClick={() => { setSearchQuery(decade.query); searchMusic(decade.query, 'track'); }}
                  >
                    {decade.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="results-section">
                <div className="results-header">
                  <h3>🎵 Results ({searchResults.length})</h3>
                  <div className="results-actions">
                    <button className="action-btn" onClick={playAll}>▶️ Play All</button>
                    <button className="action-btn" onClick={shufflePlay}>🔀 Shuffle</button>
                  </div>
                </div>
                
                <div className="tracks-list">
                  {searchResults.map((track, index) => (
                    <div 
                      key={track.id} 
                      className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''} ${!track.preview ? 'no-preview' : ''}`}
                    >
                      <div className="track-number">{index + 1}</div>
                      <img 
                        src={track.album?.cover_small || track.picture_small || '/placeholder.jpg'} 
                        alt={track.title}
                        className="track-cover"
                        onClick={() => track.preview && playTrack(track)}
                      />
                      <div className="track-info" onClick={() => track.preview && playTrack(track)}>
                        <div className="track-title">{track.title || track.name}</div>
                        <div className="track-artist">
                          {track.artist?.name || 'Unknown Artist'}
                          {track.album?.title && ` • ${track.album.title}`}
                        </div>
                      </div>
                      <div className="track-duration">
                        {track.duration ? formatTime(track.duration) : '--:--'}
                      </div>
                      <div className="track-actions">
                        <button 
                          className={`track-btn ${favorites.find(t => t.id === track.id) ? 'active' : ''}`}
                          onClick={() => toggleFavorite(track)}
                          title="Favorite"
                        >
                          {favorites.find(t => t.id === track.id) ? '❤️' : '🤍'}
                        </button>
                        <button 
                          className="track-btn"
                          onClick={() => setTrackToAdd(track)}
                          title="Add to playlist"
                        >
                          📁
                        </button>
                        <button 
                          className="track-btn"
                          onClick={() => addToQueue(track)}
                          title="Add to queue"
                        >
                          ➕
                        </button>
                        <button 
                          className="track-btn"
                          onClick={() => shareTrack(track)}
                          title="Share"
                        >
                          📤
                        </button>
                        <button 
                          className="track-btn"
                          onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist?.name || ''}`)}`, '_blank')}
                          title="Find on YouTube"
                        >
                          ▶️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSearching && (
              <div className="loading-state">
                <div className="music-spinner"></div>
                <p>Searching...</p>
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="discover-section">
            <div className="genre-filters">
              {GENRES.slice(0, 10).map(genre => (
                <button
                  key={genre.id}
                  className={`genre-btn ${selectedGenre === genre.id ? 'active' : ''}`}
                  onClick={() => { setSelectedGenre(genre.id); loadChart(genre.id); }}
                >
                  {genre.icon} {genre.name}
                </button>
              ))}
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <h3>🔥 Top Charts</h3>
                <div className="chart-actions">
                  <button className="action-btn" onClick={playAll}>▶️ Play All</button>
                  <button className="action-btn" onClick={shufflePlay}>🔀 Shuffle</button>
                </div>
              </div>

              {isSearching ? (
                <div className="loading-state">
                  <div className="music-spinner"></div>
                  <p>Loading charts...</p>
                </div>
              ) : (
                <div className="tracks-list">
                  {searchResults.map((track, index) => (
                    <div 
                      key={track.id} 
                      className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                    >
                      <div className={`track-number ${index < 3 ? 'top-three' : ''}`}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                      </div>
                      <img 
                        src={track.album?.cover_small || '/placeholder.jpg'} 
                        alt={track.title}
                        className="track-cover"
                        onClick={() => track.preview && playTrack(track)}
                      />
                      <div className="track-info" onClick={() => track.preview && playTrack(track)}>
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist?.name}</div>
                      </div>
                      <div className="track-duration">{formatTime(track.duration)}</div>
                      <div className="track-actions">
                        <button 
                          className={`track-btn ${favorites.find(t => t.id === track.id) ? 'active' : ''}`}
                          onClick={() => toggleFavorite(track)}
                        >
                          {favorites.find(t => t.id === track.id) ? '❤️' : '🤍'}
                        </button>
                        <button className="track-btn" onClick={() => addToQueue(track)}>➕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Radio Tab */}
        {activeTab === 'radio' && (
          <div className="radio-section">
            <h3>📻 Live Radio Stations</h3>
            <p className="radio-description">24/7 live streams - click to tune in</p>
            
            <div className="radio-grid">
              {RADIO_STATIONS.map(station => (
                <div 
                  key={station.id}
                  className={`radio-card ${activeRadio?.id === station.id ? 'active' : ''}`}
                  onClick={() => playRadio(station)}
                >
                  <span className="radio-icon">{station.icon}</span>
                  <span className="radio-name">{station.name}</span>
                  {station.type === 'live' && <span className="live-badge">● LIVE</span>}
                </div>
              ))}
            </div>

            {activeRadio && (
              <div className="radio-player">
                <div className="radio-player-header">
                  <span className="radio-playing-icon">{activeRadio.icon}</span>
                  <div className="radio-playing-info">
                    <span className="radio-playing-name">{activeRadio.name}</span>
                    <span className="live-indicator">● Live</span>
                  </div>
                  <button className="stop-radio-btn" onClick={stopRadio}>⏹️ Stop</button>
                </div>
                <div className="radio-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeRadio.youtube}?autoplay=1`}
                    title={activeRadio.name}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="external-radio">
              <h3>🌐 More Radio</h3>
              <div className="external-links">
                <a href="https://radio.garden/" target="_blank" rel="noopener noreferrer">🌍 Radio Garden</a>
                <a href="https://somafm.com/" target="_blank" rel="noopener noreferrer">📻 SomaFM</a>
                <a href="https://www.internet-radio.com/" target="_blank" rel="noopener noreferrer">📡 Internet Radio</a>
                <a href="https://www.di.fm/" target="_blank" rel="noopener noreferrer">🎧 DI.FM</a>
                <a href="https://poolside.fm/" target="_blank" rel="noopener noreferrer">🏖️ Poolside FM</a>
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="library-section">
            <div className="library-category">
              <div className="category-header">
                <h3>❤️ Favorites ({favorites.length})</h3>
                {favorites.length > 0 && (
                  <div className="category-actions">
                    <button className="action-btn" onClick={() => {
                      const playable = favorites.filter(t => t.preview);
                      setQueue(playable);
                      if (playable.length) playTrack(playable[0], false);
                    }}>
                      ▶️ Play
                    </button>
                  </div>
                )}
              </div>
              
              {favorites.length > 0 ? (
                <div className="tracks-list">
                  {favorites.map((track, index) => (
                    <div 
                      key={track.id} 
                      className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                    >
                      <div className="track-number">{index + 1}</div>
                      <img 
                        src={track.album?.cover_small || '/placeholder.jpg'} 
                        alt={track.title}
                        className="track-cover"
                        onClick={() => track.preview && playTrack(track)}
                      />
                      <div className="track-info" onClick={() => track.preview && playTrack(track)}>
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist?.name}</div>
                      </div>
                      <button 
                        className="track-btn active"
                        onClick={() => toggleFavorite(track)}
                      >
                        ❤️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-category">
                  <span>🤍</span>
                  <p>No favorites yet. Start adding songs you love!</p>
                </div>
              )}
            </div>

            <div className="library-category">
              <div className="category-header">
                <h3>🕐 Recently Played ({recentlyPlayed.length})</h3>
                {recentlyPlayed.length > 0 && (
                  <button 
                    className="clear-btn"
                    onClick={() => { setRecentlyPlayed([]); localStorage.removeItem('movienights_music_recent'); }}
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {recentlyPlayed.length > 0 ? (
                <div className="tracks-list">
                  {recentlyPlayed.slice(0, 20).map((track, index) => (
                    <div 
                      key={`${track.id}-${index}`} 
                      className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                    >
                      <img 
                        src={track.album?.cover_small || '/placeholder.jpg'} 
                        alt={track.title}
                        className="track-cover"
                        onClick={() => track.preview && playTrack(track)}
                      />
                      <div className="track-info" onClick={() => track.preview && playTrack(track)}>
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist?.name}</div>
                      </div>
                      <button 
                        className={`track-btn ${favorites.find(t => t.id === track.id) ? 'active' : ''}`}
                        onClick={() => toggleFavorite(track)}
                      >
                        {favorites.find(t => t.id === track.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-category">
                  <span>🎵</span>
                  <p>Start listening to build your history!</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="playlists-section">
            <div className="playlists-header">
              <h3>📁 Your Playlists</h3>
              <button 
                className="create-playlist-btn"
                onClick={() => setShowPlaylistModal(true)}
              >
                ➕ New Playlist
              </button>
            </div>
            
            {playlists.length > 0 ? (
              <div className="playlists-grid">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="playlist-card">
                    <div className="playlist-cover">
                      {playlist.tracks.length > 0 ? (
                        <div className="playlist-covers-grid">
                          {playlist.tracks.slice(0, 4).map((track, i) => (
                            <img 
                              key={i}
                              src={track.album?.cover_small || '/placeholder.jpg'}
                              alt=""
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="playlist-empty-icon">🎵</span>
                      )}
                    </div>
                    <div className="playlist-info">
                      <div className="playlist-name">{playlist.name}</div>
                      <div className="playlist-count">{playlist.tracks.length} tracks</div>
                    </div>
                    <div className="playlist-actions">
                      <button 
                        className="playlist-btn play"
                        onClick={() => playPlaylist(playlist)}
                        disabled={playlist.tracks.length === 0}
                      >
                        ▶️
                      </button>
                      <button 
                        className="playlist-btn view"
                        onClick={() => setSelectedPlaylist(playlist)}
                      >
                        👁️
                      </button>
                      <button 
                        className="playlist-btn delete"
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-playlists">
                <span>📁</span>
                <p>No playlists yet. Create your first playlist!</p>
                <button 
                  className="create-first-btn"
                  onClick={() => setShowPlaylistModal(true)}
                >
                  Create Playlist
                </button>
              </div>
            )}
            
            {/* Selected Playlist Detail */}
            {selectedPlaylist && (
              <div className="playlist-detail">
                <div className="detail-header">
                  <button className="back-btn" onClick={() => setSelectedPlaylist(null)}>
                    ← Back
                  </button>
                  <h3>{selectedPlaylist.name}</h3>
                  <span>{selectedPlaylist.tracks.length} tracks</span>
                </div>
                
                {selectedPlaylist.tracks.length > 0 ? (
                  <>
                    <div className="detail-actions">
                      <button className="action-btn" onClick={() => playPlaylist(selectedPlaylist)}>
                        ▶️ Play All
                      </button>
                      <button className="action-btn" onClick={() => {
                        const shuffled = [...selectedPlaylist.tracks].sort(() => Math.random() - 0.5);
                        const playable = shuffled.filter(t => t.preview);
                        setQueue(playable);
                        if (playable.length) playTrack(playable[0], false);
                      }}>
                        🔀 Shuffle
                      </button>
                    </div>
                    <div className="tracks-list">
                      {selectedPlaylist.tracks.map((track, index) => (
                        <div 
                          key={track.id}
                          className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                        >
                          <div className="track-number">{index + 1}</div>
                          <img 
                            src={track.album?.cover_small || '/placeholder.jpg'} 
                            alt={track.title}
                            className="track-cover"
                            onClick={() => track.preview && playTrack(track)}
                          />
                          <div className="track-info" onClick={() => track.preview && playTrack(track)}>
                            <div className="track-title">{track.title}</div>
                            <div className="track-artist">{track.artist?.name}</div>
                          </div>
                          <button 
                            className="track-btn"
                            onClick={() => removeFromPlaylist(selectedPlaylist.id, track.id)}
                            title="Remove from playlist"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="empty-category">
                    <span>🎵</span>
                    <p>This playlist is empty. Add some tracks!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div className="now-playing-bar">
          <div className="now-playing-track">
            <img 
              src={currentTrack.album?.cover_small || '/placeholder.jpg'} 
              alt={currentTrack.title}
              className="now-playing-cover"
            />
            <div className="now-playing-info">
              <div className="now-playing-title">{currentTrack.title}</div>
              <div className="now-playing-artist">{currentTrack.artist?.name}</div>
            </div>
            <button 
              className={`now-playing-fav ${favorites.find(t => t.id === currentTrack.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(currentTrack)}
            >
              {favorites.find(t => t.id === currentTrack.id) ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="player-controls">
            <div className="control-buttons">
              <button 
                className={`control-btn ${isShuffle ? 'active' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title="Shuffle"
              >
                🔀
              </button>
              <button className="control-btn" onClick={prevTrack} title="Previous">⏮️</button>
              <button className="control-btn play-btn" onClick={togglePlay}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button className="control-btn" onClick={nextTrack} title="Next">⏭️</button>
              <button 
                className={`control-btn ${repeatMode !== 'none' ? 'active' : ''}`}
                onClick={() => setRepeatMode(m => m === 'none' ? 'all' : m === 'all' ? 'one' : 'none')}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? '🔂' : '🔁'}
              </button>
            </div>

            <div className="progress-container">
              <span className="time-current">{formatTime(progress)}</span>
              <div className="progress-bar" onClick={handleSeek}>
                <div 
                  className="progress-fill"
                  style={{ width: `${(progress / duration) * 100}%` }}
                />
                <div 
                  className="progress-thumb"
                  style={{ left: `${(progress / duration) * 100}%` }}
                />
              </div>
              <span className="time-total">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="extra-controls">
            <button 
              className="extra-btn"
              onClick={() => setTrackToAdd(currentTrack)}
              title="Add to Playlist"
            >
              ➕
            </button>
            <button 
              className="extra-btn"
              onClick={() => shareTrack(currentTrack)}
              title="Share"
            >
              📤
            </button>
            <button 
              className={`extra-btn ${showEqualizer ? 'active' : ''}`}
              onClick={() => setShowEqualizer(!showEqualizer)}
              title="Equalizer"
            >
              🎛️
            </button>
            <button 
              className={`extra-btn ${showLyrics ? 'active' : ''}`}
              onClick={() => setShowLyrics(!showLyrics)}
              title="Lyrics"
            >
              📝
            </button>
            <button 
              className={`extra-btn ${showQueue ? 'active' : ''}`}
              onClick={() => setShowQueue(!showQueue)}
              title="Queue"
            >
              📋
            </button>
            <button 
              className={`extra-btn ${showVisualizer ? 'active' : ''}`}
              onClick={() => setShowVisualizer(!showVisualizer)}
              title="Visualizer"
            >
              📊
            </button>
            <div className="volume-control">
              <button 
                className="volume-btn"
                onClick={() => setVolume(v => v > 0 ? 0 : 0.7)}
              >
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* Queue Panel */}
      {showQueue && (
        <div className="queue-panel">
          <div className="queue-header">
            <h3>📋 Queue ({queue.length})</h3>
            <div className="queue-actions">
              <button onClick={clearQueue}>Clear</button>
              <button onClick={() => setShowQueue(false)}>✕</button>
            </div>
          </div>
          <div className="queue-list">
            {queue.map((track, index) => (
              <div 
                key={`${track.id}-${index}`}
                className={`queue-item ${index === queueIndex ? 'current' : ''}`}
                onClick={() => { setQueueIndex(index); playTrack(track, false); }}
              >
                <span className="queue-index">{index === queueIndex ? '▶️' : index + 1}</span>
                <img src={track.album?.cover_small || '/placeholder.jpg'} alt="" />
                <div className="queue-info">
                  <div className="queue-title">{track.title}</div>
                  <div className="queue-artist">{track.artist?.name}</div>
                </div>
                <button 
                  className="queue-remove"
                  onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lyrics Panel */}
      {showLyrics && currentTrack && (
        <div className="lyrics-panel">
          <div className="lyrics-header">
            <h3>📝 Lyrics</h3>
            <button onClick={() => setShowLyrics(false)}>✕</button>
          </div>
          <div className="lyrics-content">
            {lyricsLoading ? (
              <div className="lyrics-loading">Loading lyrics...</div>
            ) : (
              <pre className="lyrics-text">{lyrics}</pre>
            )}
          </div>
          <div className="lyrics-footer">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(`${currentTrack.title} ${currentTrack.artist?.name} lyrics`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              🔍 Search lyrics on Google
            </a>
          </div>
        </div>
      )}

      {/* Visualizer */}
      {showVisualizer && currentTrack && (
        <div className="visualizer-panel">
          <canvas ref={canvasRef} width={300} height={100} />
        </div>
      )}

      {/* Equalizer Panel */}
      {showEqualizer && (
        <div className="equalizer-panel">
          <div className="eq-header">
            <h3>🎛️ Equalizer</h3>
            <button onClick={() => setShowEqualizer(false)}>✕</button>
          </div>
          <div className="eq-presets">
            {Object.entries(EQ_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={`eq-preset-btn ${eqPreset === key ? 'active' : ''}`}
                onClick={() => applyEqPreset(key)}
              >
                {preset.icon} {preset.name}
              </button>
            ))}
          </div>
          <div className="eq-sliders">
            {['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'].map((freq, index) => (
              <div key={freq} className="eq-band">
                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={customEq[index]}
                  onChange={(e) => {
                    const newEq = [...customEq];
                    newEq[index] = parseInt(e.target.value);
                    setCustomEq(newEq);
                  }}
                  className="eq-slider"
                />
                <span className="eq-freq">{freq}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sleep Timer Panel */}
      {sleepTimeRemaining && (
        <div className="sleep-timer-indicator">
          <span>💤 Sleep in {formatSleepTime(sleepTimeRemaining)}</span>
          <button onClick={cancelSleepTimer}>✕</button>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showPlaylistModal && (
        <div className="modal-backdrop" onClick={() => setShowPlaylistModal(false)}>
          <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Playlist</h3>
              <button onClick={() => setShowPlaylistModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowPlaylistModal(false)}>
                Cancel
              </button>
              <button 
                className="create-btn" 
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {trackToAdd && (
        <div className="modal-backdrop" onClick={() => setTrackToAdd(null)}>
          <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add to Playlist</h3>
              <button onClick={() => setTrackToAdd(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="track-to-add">
                <img src={trackToAdd.album?.cover_small || '/placeholder.jpg'} alt="" />
                <div>
                  <div className="track-title">{trackToAdd.title}</div>
                  <div className="track-artist">{trackToAdd.artist?.name}</div>
                </div>
              </div>
              
              {playlists.length > 0 ? (
                <div className="playlist-select-list">
                  {playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      className="playlist-select-btn"
                      onClick={() => addToPlaylist(playlist.id, trackToAdd)}
                    >
                      📁 {playlist.name} ({playlist.tracks.length})
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-playlists">No playlists yet. Create one first!</p>
              )}
              
              <button 
                className="create-new-playlist-btn"
                onClick={() => { setTrackToAdd(null); setShowPlaylistModal(true); }}
              >
                ➕ Create New Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel for Sleep Timer, Speed, etc */}
      <div className="player-settings">
        <div className="settings-row">
          <label>⏰ Sleep Timer</label>
          <select 
            value={sleepTimer}
            onChange={(e) => {
              setSleepTimer(parseInt(e.target.value));
              setSleepTimerEnd(null);
            }}
          >
            {SLEEP_TIMER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className="settings-row">
          <label>⚡ Speed</label>
          <select 
            value={playbackSpeed}
            onChange={(e) => changeSpeed(parseFloat(e.target.value))}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        
        <button 
          className={`settings-btn ${showEqualizer ? 'active' : ''}`}
          onClick={() => setShowEqualizer(!showEqualizer)}
        >
          🎛️ EQ
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="keyboard-hints">
        <span>Space: Play/Pause</span>
        <span>Shift+←→: Prev/Next</span>
        <span>↑↓: Volume</span>
        <span>M: Mute</span>
      </div>
    </div>
  );
}

export default MusicSection;
