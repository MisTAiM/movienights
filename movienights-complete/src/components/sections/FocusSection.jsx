/* ========================================
   FocusSection.jsx - Focus Zone with Pomodoro & Ambient Sounds
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './FocusSection.css';

// Timer presets
const TIMER_PRESETS = [
  { id: 'pomodoro', name: 'Pomodoro', work: 25, break: 5, longBreak: 15, sessions: 4 },
  { id: 'deep-work', name: 'Deep Work', work: 50, break: 10, longBreak: 30, sessions: 2 },
  { id: '52-17', name: '52/17 Method', work: 52, break: 17, longBreak: 30, sessions: 3 },
  { id: 'short', name: 'Short Focus', work: 15, break: 3, longBreak: 10, sessions: 4 },
  { id: 'custom', name: 'Custom', work: 25, break: 5, longBreak: 15, sessions: 4 }
];

// Ambient sound categories
const AMBIENT_SOUNDS = {
  nature: {
    name: '🌿 Nature',
    sounds: [
      { id: 'rain', name: 'Rain', icon: '🌧️', youtube: 'mPZkdNFkNps' },
      { id: 'thunderstorm', name: 'Thunderstorm', icon: '⛈️', youtube: 'gVKEM4K8J8A' },
      { id: 'ocean', name: 'Ocean Waves', icon: '🌊', youtube: 'WHPEKLQID4U' },
      { id: 'forest', name: 'Forest', icon: '🌲', youtube: 'xNN7iTA57jM' },
      { id: 'birds', name: 'Bird Songs', icon: '🐦', youtube: 'rYoZgpAEkFs' },
      { id: 'wind', name: 'Wind', icon: '💨', youtube: '2Tjfy2LnKT8' },
      { id: 'creek', name: 'Creek', icon: '💧', youtube: 'IvjMgVS6kng' },
      { id: 'campfire', name: 'Campfire', icon: '🔥', youtube: 'UgHKb_7884o' }
    ]
  },
  urban: {
    name: '🏙️ Urban',
    sounds: [
      { id: 'coffee-shop', name: 'Coffee Shop', icon: '☕', youtube: 'gaGrHUekGrc' },
      { id: 'library', name: 'Library', icon: '📚', youtube: '3sL0omwElxw' },
      { id: 'train', name: 'Train Journey', icon: '🚂', youtube: 'QXNBmYuTqo0' },
      { id: 'city', name: 'City Ambience', icon: '🌆', youtube: 'O-cX_SVPnHM' },
      { id: 'office', name: 'Office', icon: '🏢', youtube: 'D7ZZp8XuUTE' }
    ]
  },
  focus: {
    name: '🧠 Focus',
    sounds: [
      { id: 'white-noise', name: 'White Noise', icon: '📻', youtube: 'nMfPqeZjc2c' },
      { id: 'brown-noise', name: 'Brown Noise', icon: '🟤', youtube: 'RqzGzwTY-6w' },
      { id: 'pink-noise', name: 'Pink Noise', icon: '💗', youtube: 'ZXtimhT-ff4' },
      { id: 'binaural', name: 'Binaural Beats', icon: '🎧', youtube: 'WPni755-Krg' },
      { id: 'lo-fi', name: 'Lo-Fi Study', icon: '🎵', youtube: 'jfKfPfyJRdk' }
    ]
  },
  space: {
    name: '🌌 Space',
    sounds: [
      { id: 'space-ambience', name: 'Space Station', icon: '🛸', youtube: '4sLAY9dHLe8' },
      { id: 'spaceship', name: 'Spaceship', icon: '🚀', youtube: 'gpvznAiKblU' },
      { id: 'alien', name: 'Alien World', icon: '👽', youtube: '_gqF0qYs6CY' }
    ]
  }
};

// Focus tips
const FOCUS_TIPS = [
  { icon: '🎯', tip: 'Set a clear intention before starting your focus session' },
  { icon: '📵', tip: 'Put your phone in another room or use Do Not Disturb' },
  { icon: '💧', tip: 'Stay hydrated - keep water nearby' },
  { icon: '🧘', tip: 'Take 3 deep breaths before starting' },
  { icon: '📝', tip: 'Write down distracting thoughts to address later' },
  { icon: '🪟', tip: 'Natural light improves focus and mood' },
  { icon: '🌡️', tip: 'Keep room temperature around 70°F (21°C)' },
  { icon: '🎵', tip: 'Instrumental music helps maintain focus' },
  { icon: '⏰', tip: 'Work with your energy - tackle hard tasks when alert' },
  { icon: '🚶', tip: 'A short walk during breaks boosts creativity' }
];

// Quick tasks/notes
const DEFAULT_TASKS = [];

function FocusSection() {
  const { actions } = useApp();
  
  // Timer state
  const [timerMode, setTimerMode] = useState('work'); // work, break, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[0]);
  const [currentSession, setCurrentSession] = useState(1);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [dailyStats, setDailyStats] = useState({ sessions: 0, focusMinutes: 0 });
  
  // Custom timer settings
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [customLongBreak, setCustomLongBreak] = useState(15);
  
  // Ambient sound state
  const [activeSound, setActiveSound] = useState(null);
  const [soundVolume, setSoundVolume] = useState(50);
  const [activeCategory, setActiveCategory] = useState('nature');
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [newTask, setNewTask] = useState('');
  const [currentTip, setCurrentTip] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  
  // Refs
  const timerRef = useRef(null);
  const audioNotificationRef = useRef(null);
  
  // Load saved data
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('movienights_focus_stats');
      const savedTasks = localStorage.getItem('movienights_focus_tasks');
      const savedVolume = localStorage.getItem('movienights_ambient_volume');
      
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        // Check if it's a new day
        const today = new Date().toDateString();
        if (stats.date === today) {
          setDailyStats(stats);
        } else {
          // Reset for new day but keep total
          setTotalFocusTime(stats.totalMinutes || 0);
        }
      }
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedVolume) setSoundVolume(parseInt(savedVolume));
    } catch (e) {
      console.error('Error loading focus data:', e);
    }
  }, []);
  
  // Save stats
  const saveStats = useCallback((newStats) => {
    const today = new Date().toDateString();
    const toSave = { ...newStats, date: today, totalMinutes: totalFocusTime + newStats.focusMinutes };
    localStorage.setItem('movienights_focus_stats', JSON.stringify(toSave));
    setDailyStats(newStats);
  }, [totalFocusTime]);
  
  // Save tasks
  useEffect(() => {
    localStorage.setItem('movienights_focus_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Save volume
  useEffect(() => {
    localStorage.setItem('movienights_ambient_volume', soundVolume.toString());
  }, [soundVolume]);
  
  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);
  
  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    // Play notification sound
    playNotification();
    
    if (timerMode === 'work') {
      // Update stats
      const newStats = {
        ...dailyStats,
        sessions: dailyStats.sessions + 1,
        focusMinutes: dailyStats.focusMinutes + selectedPreset.work
      };
      saveStats(newStats);
      
      actions.addNotification(`🎉 Focus session complete! Time for a break.`, 'success');
      
      // Check if long break
      if (currentSession >= selectedPreset.sessions) {
        setTimerMode('longBreak');
        setTimeLeft(selectedPreset.longBreak * 60);
        setCurrentSession(1);
      } else {
        setTimerMode('break');
        setTimeLeft(selectedPreset.break * 60);
        setCurrentSession(prev => prev + 1);
      }
    } else {
      actions.addNotification(`⏰ Break's over! Ready to focus?`, 'info');
      setTimerMode('work');
      setTimeLeft(selectedPreset.work * 60);
    }
  }, [timerMode, currentSession, selectedPreset, dailyStats, saveStats, actions]);
  
  // Play notification sound
  const playNotification = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQtAj9LYqXs/XXPC36VoFRZKsujZhikEY7HwzHoXJnW8/9yLJSVft+rgjyAEb77/3IckJ2a+9+aFGgxovfPhgxQIY7r22ncODVqz7dV1CABUQ6rl0HMNCVhFq+PPcQ0JS0em4s5wDApKQ6PgzG4MDEtDoN7JawwMSkSh3chpCg1JRKHbyGgJDUlFotzHZwkNSkWi3MZnCQ5KRaLcxmcJDkpFotzGZwkOSkWi3MZmCA5KRaLbxWUIEEtFotvFZQgPS0ai28VkCA9LRqPcxWQID0xGo9zFZAgQS0aj3MVkCA9MRqPcxWQID0xGo9zFZQgPTEaj3MVkCA9MRqTcxWMHD0xGpNzFYwcPTEal3cVjBw9MRqXdxWMHD0xGpd3FYwcPTEal3cVjBw9MR6XdxGMHD01Hpt3EYwYPTUem3cRjBg9NR6bdxGMGD01Hpt3EYwYPTUem3cRjBg9NR6bdw2MFD01Hpt3DYwUPTUem3cNjBQ9NR6bdw2MFD01Ip97DYgUPTkio3sNiBQ9OSKjew2IFD05IqN7DYgUPTkio3sNiBQ9OSKjew2IFD05IqN7DYQQPTkio3sNhBA9OSKjew2EED05JqN/CYQQPT0mp38JhBA9PSanfwmEED09Jqd/CYQQPT0mp38JhBA9PSanfwmEED09Jqd/BYAMP');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.log('Notification sound not available');
    }
  };
  
  // Start/pause timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimerMode('work');
    setTimeLeft(selectedPreset.work * 60);
    setCurrentSession(1);
  };
  
  // Skip to next phase
  const skipPhase = () => {
    setIsRunning(false);
    if (timerMode === 'work') {
      if (currentSession >= selectedPreset.sessions) {
        setTimerMode('longBreak');
        setTimeLeft(selectedPreset.longBreak * 60);
        setCurrentSession(1);
      } else {
        setTimerMode('break');
        setTimeLeft(selectedPreset.break * 60);
        setCurrentSession(prev => prev + 1);
      }
    } else {
      setTimerMode('work');
      setTimeLeft(selectedPreset.work * 60);
    }
  };
  
  // Change preset
  const changePreset = (preset) => {
    setSelectedPreset(preset);
    setTimeLeft(preset.work * 60);
    setTimerMode('work');
    setCurrentSession(1);
    setIsRunning(false);
  };
  
  // Apply custom settings
  const applyCustomSettings = () => {
    const custom = {
      ...TIMER_PRESETS.find(p => p.id === 'custom'),
      work: customWork,
      break: customBreak,
      longBreak: customLongBreak
    };
    changePreset(custom);
    setShowSettings(false);
  };
  
  // Play ambient sound
  const playSound = (sound) => {
    if (activeSound?.id === sound.id) {
      setActiveSound(null);
    } else {
      setActiveSound(sound);
    }
  };
  
  // Stop sound
  const stopSound = () => {
    setActiveSound(null);
  };
  
  // Add task
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    setTasks(prev => [...prev, { id: Date.now(), text: newTask, done: false }]);
    setNewTask('');
  };
  
  // Toggle task
  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };
  
  // Delete task
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  // Clear completed tasks
  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.done));
  };
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % FOCUS_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Breathing exercise
  useEffect(() => {
    if (!showBreathingExercise) return;
    
    const phases = ['inhale', 'hold', 'exhale', 'hold'];
    const durations = [4000, 4000, 4000, 4000];
    let phaseIndex = 0;
    
    const cycle = () => {
      setBreathingPhase(phases[phaseIndex]);
      phaseIndex = (phaseIndex + 1) % phases.length;
    };
    
    cycle();
    const interval = setInterval(cycle, durations[phaseIndex]);
    
    return () => clearInterval(interval);
  }, [showBreathingExercise]);
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Calculate progress
  const getProgress = () => {
    const total = timerMode === 'work' ? selectedPreset.work * 60 :
                  timerMode === 'break' ? selectedPreset.break * 60 :
                  selectedPreset.longBreak * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className={`focus-section ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <h2 className="section-title">🧘 Focus Zone</h2>
      
      <div className="focus-layout">
        {/* Main Timer Area */}
        <div className="timer-area">
          {/* Preset Selector */}
          <div className="preset-selector">
            {TIMER_PRESETS.filter(p => p.id !== 'custom').map(preset => (
              <button
                key={preset.id}
                className={`preset-btn ${selectedPreset.id === preset.id ? 'active' : ''}`}
                onClick={() => changePreset(preset)}
              >
                {preset.name}
              </button>
            ))}
            <button 
              className={`preset-btn ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings(!showSettings)}
            >
              ⚙️
            </button>
          </div>
          
          {/* Custom Settings */}
          {showSettings && (
            <div className="custom-settings">
              <div className="setting-row">
                <label>Work (min)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customWork}
                  onChange={(e) => setCustomWork(parseInt(e.target.value) || 25)}
                />
              </div>
              <div className="setting-row">
                <label>Break (min)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customBreak}
                  onChange={(e) => setCustomBreak(parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="setting-row">
                <label>Long Break (min)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customLongBreak}
                  onChange={(e) => setCustomLongBreak(parseInt(e.target.value) || 15)}
                />
              </div>
              <button className="apply-btn" onClick={applyCustomSettings}>
                Apply
              </button>
            </div>
          )}
          
          {/* Timer Display */}
          <div className="timer-display">
            <div className="timer-ring">
              <svg viewBox="0 0 100 100">
                <circle
                  className="timer-ring-bg"
                  cx="50"
                  cy="50"
                  r="45"
                />
                <circle
                  className="timer-ring-progress"
                  cx="50"
                  cy="50"
                  r="45"
                  style={{
                    strokeDasharray: `${getProgress() * 2.83} 283`,
                    stroke: timerMode === 'work' ? 'var(--accent)' : '#28a745'
                  }}
                />
              </svg>
              <div className="timer-content">
                <div className={`timer-mode ${timerMode}`}>
                  {timerMode === 'work' ? '🎯 Focus' : 
                   timerMode === 'break' ? '☕ Break' : '🌴 Long Break'}
                </div>
                <div className="timer-time">{formatTime(timeLeft)}</div>
                <div className="timer-session">
                  Session {currentSession} of {selectedPreset.sessions}
                </div>
              </div>
            </div>
          </div>
          
          {/* Timer Controls */}
          <div className="timer-controls">
            <button className="timer-btn secondary" onClick={resetTimer} title="Reset">
              🔄
            </button>
            <button 
              className={`timer-btn primary ${isRunning ? 'pause' : 'play'}`}
              onClick={toggleTimer}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Start'}
            </button>
            <button className="timer-btn secondary" onClick={skipPhase} title="Skip">
              ⏭️
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              className={`quick-btn ${showBreathingExercise ? 'active' : ''}`}
              onClick={() => setShowBreathingExercise(!showBreathingExercise)}
            >
              🧘 Breathe
            </button>
            <button className="quick-btn" onClick={toggleFullscreen}>
              {isFullscreen ? '🔲 Exit' : '⛶ Fullscreen'}
            </button>
          </div>
          
          {/* Breathing Exercise */}
          {showBreathingExercise && (
            <div className="breathing-exercise">
              <div className={`breathing-circle ${breathingPhase}`}>
                <span className="breathing-text">
                  {breathingPhase === 'inhale' ? 'Breathe In' :
                   breathingPhase === 'exhale' ? 'Breathe Out' : 'Hold'}
                </span>
              </div>
              <button 
                className="close-breathing"
                onClick={() => setShowBreathingExercise(false)}
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Daily Stats */}
          <div className="daily-stats">
            <div className="stat">
              <span className="stat-value">{dailyStats.sessions}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat">
              <span className="stat-value">{dailyStats.focusMinutes}</span>
              <span className="stat-label">Focus Minutes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.floor((dailyStats.focusMinutes || 0) / 60)}h {(dailyStats.focusMinutes || 0) % 60}m</span>
              <span className="stat-label">Total Time</span>
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="side-panel">
          {/* Ambient Sounds */}
          <div className="ambient-section">
            <h3>🎵 Ambient Sounds</h3>
            
            <div className="sound-categories">
              {Object.entries(AMBIENT_SOUNDS).map(([key, category]) => (
                <button
                  key={key}
                  className={`category-btn ${activeCategory === key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="sounds-grid">
              {AMBIENT_SOUNDS[activeCategory].sounds.map(sound => (
                <button
                  key={sound.id}
                  className={`sound-btn ${activeSound?.id === sound.id ? 'active' : ''}`}
                  onClick={() => playSound(sound)}
                >
                  <span className="sound-icon">{sound.icon}</span>
                  <span className="sound-name">{sound.name}</span>
                </button>
              ))}
            </div>
            
            {activeSound && (
              <div className="sound-player">
                <div className="sound-info">
                  <span>{activeSound.icon} {activeSound.name}</span>
                  <button className="stop-btn" onClick={stopSound}>⏹️</button>
                </div>
                <div className="volume-control">
                  <span>🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseInt(e.target.value))}
                  />
                  <span>{soundVolume}%</span>
                </div>
                <div className="sound-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeSound.youtube}?autoplay=1&loop=1&playlist=${activeSound.youtube}`}
                    title={activeSound.name}
                    allow="autoplay"
                    style={{ opacity: 0, height: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Task List */}
          <div className="tasks-section">
            <h3>📝 Focus Tasks</h3>
            
            <form className="task-form" onSubmit={addTask}>
              <input
                type="text"
                placeholder="What are you working on?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button type="submit">+</button>
            </form>
            
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                  <button 
                    className="task-check"
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.done ? '✓' : '○'}
                  </button>
                  <span className="task-text">{task.text}</span>
                  <button 
                    className="task-delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            {tasks.some(t => t.done) && (
              <button className="clear-completed" onClick={clearCompleted}>
                Clear completed
              </button>
            )}
          </div>
          
          {/* Focus Tip */}
          <div className="focus-tip">
            <span className="tip-icon">{FOCUS_TIPS[currentTip].icon}</span>
            <p className="tip-text">{FOCUS_TIPS[currentTip].tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FocusSection;
