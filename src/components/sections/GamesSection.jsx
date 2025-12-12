/* ========================================
   GamesSection.jsx - Games Hub
   All games playable in embedded iframe
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './GamesSection.css';

// ============================================
// GAME DATA - All with working embed URLs
// ============================================

// HTML5 Instant Games (embed-friendly)
const INSTANT_GAMES = [
  // Puzzle
  { id: '2048', name: '2048', icon: '🔢', category: 'puzzle', embed: 'https://play2048.co/', controls: '↑↓←→', tvFriendly: true },
  { id: 'sudoku', name: 'Sudoku', icon: '9️⃣', category: 'puzzle', embed: 'https://sudoku.com/', controls: 'Click' },
  { id: 'minesweeper', name: 'Minesweeper', icon: '💣', category: 'puzzle', embed: 'https://minesweeper.online/', controls: 'Click' },
  { id: 'wordle', name: 'Wordle', icon: '📝', category: 'puzzle', embed: 'https://www.nytimes.com/games/wordle/index.html', controls: 'Keyboard', tvFriendly: true },
  
  // Arcade
  { id: 'pacman', name: 'Pac-Man', icon: '🟡', category: 'arcade', embed: 'https://www.google.com/logos/2010/pacman10-i.html', controls: '↑↓←→', tvFriendly: true },
  { id: 'snake', name: 'Snake', icon: '🐍', category: 'arcade', embed: 'https://playsnake.org/', controls: '↑↓←→', tvFriendly: true },
  { id: 'dino', name: 'T-Rex Run', icon: '🦖', category: 'arcade', embed: 'https://chromedino.com/', controls: 'Space', tvFriendly: true },
  { id: 'flappy', name: 'Flappy Bird', icon: '🐦', category: 'arcade', embed: 'https://flappybird.io/', controls: 'Space/Click', tvFriendly: true },
  { id: 'tetris', name: 'Tetris', icon: '🧱', category: 'arcade', embed: 'https://tetris.com/play-tetris', controls: '↑↓←→', tvFriendly: true },
  
  // Cards
  { id: 'solitaire', name: 'Solitaire', icon: '🂡', category: 'cards', embed: 'https://www.solitr.com/', controls: 'Click' },
  { id: 'freecell', name: 'FreeCell', icon: '🂱', category: 'cards', embed: 'https://www.solitaire-klondike.com/freecell.html', controls: 'Click' },
  { id: 'spider', name: 'Spider', icon: '🕷️', category: 'cards', embed: 'https://www.solitaire-klondike.com/spider.html', controls: 'Click' },
  
  // Strategy
  { id: 'chess', name: 'Chess', icon: '♟️', category: 'strategy', embed: 'https://www.chess.com/play/computer', controls: 'Click' },
  { id: 'checkers', name: 'Checkers', icon: '🔴', category: 'strategy', embed: 'https://cardgames.io/checkers/', controls: 'Click' },
];

// Retro Games - Using correct RetroGames.cc embed URLs
const RETRO_GAMES = {
  nes: [
    { id: 'nes-mario', name: 'Super Mario Bros', icon: '🍄', embed: 'https://www.retrogames.cc/embed/16464-super-mario-bros-jue-prg-0.html' },
    { id: 'nes-zelda', name: 'Legend of Zelda', icon: '🗡️', embed: 'https://www.retrogames.cc/embed/16343-legend-of-zelda-the-usa.html' },
    { id: 'nes-metroid', name: 'Metroid', icon: '🚀', embed: 'https://www.retrogames.cc/embed/16899-metroid-usa.html' },
    { id: 'nes-megaman2', name: 'Mega Man 2', icon: '🤖', embed: 'https://www.retrogames.cc/embed/16399-mega-man-2.html' },
    { id: 'nes-contra', name: 'Contra', icon: '🔫', embed: 'https://www.retrogames.cc/embed/15950-contra-usa.html' },
    { id: 'nes-castlevania', name: 'Castlevania', icon: '🧛', embed: 'https://www.retrogames.cc/embed/15901-castlevania-usa.html' },
    { id: 'nes-punchout', name: 'Punch-Out!!', icon: '🥊', embed: 'https://www.retrogames.cc/embed/16122-mike-tysons-punch-out-usa.html' },
    { id: 'nes-duckhunt', name: 'Duck Hunt', icon: '🦆', embed: 'https://www.retrogames.cc/embed/15984-duck-hunt-usa-europe.html' },
    { id: 'nes-kirby', name: "Kirby's Adventure", icon: '⭐', embed: 'https://www.retrogames.cc/embed/16285-kirbys-adventure-usa.html' },
    { id: 'nes-dkong', name: 'Donkey Kong', icon: '🦍', embed: 'https://www.retrogames.cc/embed/15970-donkey-kong-world-rev-a.html' },
    { id: 'nes-pacman', name: 'Pac-Man', icon: '🟡', embed: 'https://www.retrogames.cc/embed/16116-pac-man-namco.html' },
    { id: 'nes-galaga', name: 'Galaga', icon: '👾', embed: 'https://www.retrogames.cc/embed/16030-galaga-usa.html' },
  ],
  snes: [
    { id: 'snes-mario', name: 'Super Mario World', icon: '🍄', embed: 'https://www.retrogames.cc/embed/42136-super-mario-world-usa.html' },
    { id: 'snes-zelda', name: 'Zelda: Link to Past', icon: '🗡️', embed: 'https://www.retrogames.cc/embed/42012-legend-of-zelda-the-a-link-to-the-past-usa.html' },
    { id: 'snes-metroid', name: 'Super Metroid', icon: '🚀', embed: 'https://www.retrogames.cc/embed/42134-super-metroid-usa-europe-japan.html' },
    { id: 'snes-chrono', name: 'Chrono Trigger', icon: '⏰', embed: 'https://www.retrogames.cc/embed/41667-chrono-trigger.html' },
    { id: 'snes-ff6', name: 'Final Fantasy VI', icon: '⚔️', embed: 'https://www.retrogames.cc/embed/41766-final-fantasy-iii-usa.html' },
    { id: 'snes-sf2', name: 'Street Fighter II', icon: '👊', embed: 'https://www.retrogames.cc/embed/42119-street-fighter-ii-turbo-hyper-fighting-usa.html' },
    { id: 'snes-dkc', name: 'Donkey Kong Country', icon: '🦍', embed: 'https://www.retrogames.cc/embed/41722-donkey-kong-country-usa-rev-2.html' },
    { id: 'snes-mariokart', name: 'Super Mario Kart', icon: '🏎️', embed: 'https://www.retrogames.cc/embed/42129-super-mario-kart-usa.html' },
    { id: 'snes-earthbound', name: 'Earthbound', icon: '🌍', embed: 'https://www.retrogames.cc/embed/41746-earthbound-usa.html' },
    { id: 'snes-megamanx', name: 'Mega Man X', icon: '🤖', embed: 'https://www.retrogames.cc/embed/42025-mega-man-x-usa.html' },
  ],
  gba: [
    { id: 'gba-emerald', name: 'Pokemon Emerald', icon: '💎', embed: 'https://www.retrogames.cc/embed/44553-pokemon-emerald-version.html' },
    { id: 'gba-firered', name: 'Pokemon FireRed', icon: '🔥', embed: 'https://www.retrogames.cc/embed/44554-pokemon-fire-red-version-v1-1.html' },
    { id: 'gba-zelda', name: 'Zelda: Minish Cap', icon: '🗡️', embed: 'https://www.retrogames.cc/embed/44319-legend-of-zelda-the-the-minish-cap.html' },
    { id: 'gba-metroid', name: 'Metroid Fusion', icon: '🚀', embed: 'https://www.retrogames.cc/embed/44389-metroid-fusion-usa.html' },
    { id: 'gba-advance', name: 'Advance Wars', icon: '🎖️', embed: 'https://www.retrogames.cc/embed/44002-advance-wars-usa.html' },
    { id: 'gba-golden', name: 'Golden Sun', icon: '☀️', embed: 'https://www.retrogames.cc/embed/44234-golden-sun-usa-europe.html' },
    { id: 'gba-mario3', name: 'Super Mario Advance 4', icon: '🍄', embed: 'https://www.retrogames.cc/embed/44708-super-mario-advance-4-super-mario-bros-3-v1-1.html' },
    { id: 'gba-kirby', name: 'Kirby Nightmare', icon: '⭐', embed: 'https://www.retrogames.cc/embed/44296-kirby-nightmare-in-dream-land-usa.html' },
    { id: 'gba-ffta', name: 'FF Tactics Advance', icon: '⚔️', embed: 'https://www.retrogames.cc/embed/44184-final-fantasy-tactics-advance-usa-australia.html' },
    { id: 'gba-sonic', name: 'Sonic Advance', icon: '💨', embed: 'https://www.retrogames.cc/embed/44665-sonic-advance-usa-europe.html' },
  ],
  genesis: [
    { id: 'gen-sonic', name: 'Sonic the Hedgehog', icon: '💨', embed: 'https://www.retrogames.cc/embed/37949-sonic-the-hedgehog-world.html' },
    { id: 'gen-sonic2', name: 'Sonic 2', icon: '💨', embed: 'https://www.retrogames.cc/embed/37950-sonic-the-hedgehog-2-world.html' },
    { id: 'gen-sonic3', name: 'Sonic 3', icon: '💨', embed: 'https://www.retrogames.cc/embed/37951-sonic-the-hedgehog-3-usa.html' },
    { id: 'gen-streets2', name: 'Streets of Rage 2', icon: '👊', embed: 'https://www.retrogames.cc/embed/37974-streets-of-rage-2-usa.html' },
    { id: 'gen-golden', name: 'Golden Axe', icon: '🪓', embed: 'https://www.retrogames.cc/embed/37481-golden-axe-world.html' },
    { id: 'gen-mk', name: 'Mortal Kombat', icon: '🐉', embed: 'https://www.retrogames.cc/embed/37676-mortal-kombat-world.html' },
    { id: 'gen-altered', name: 'Altered Beast', icon: '🐺', embed: 'https://www.retrogames.cc/embed/37189-altered-beast-usa-europe.html' },
    { id: 'gen-shinobi', name: 'Shinobi III', icon: '🥷', embed: 'https://www.retrogames.cc/embed/37920-shinobi-iii-return-of-the-ninja-master-usa.html' },
    { id: 'gen-gunstar', name: 'Gunstar Heroes', icon: '🔫', embed: 'https://www.retrogames.cc/embed/37499-gunstar-heroes-world.html' },
    { id: 'gen-toejam', name: 'ToeJam & Earl', icon: '👽', embed: 'https://www.retrogames.cc/embed/38007-toejam-and-earl-usa-europe-rev-a.html' },
  ],
  arcade: [
    { id: 'arc-pacman', name: 'Pac-Man', icon: '🟡', embed: 'https://www.retrogames.cc/embed/7718-pac-man-midway.html' },
    { id: 'arc-galaga', name: 'Galaga', icon: '👾', embed: 'https://www.retrogames.cc/embed/6918-galaga-namco-rev-b.html' },
    { id: 'arc-dkong', name: 'Donkey Kong', icon: '🦍', embed: 'https://www.retrogames.cc/embed/6566-donkey-kong-us-set-1.html' },
    { id: 'arc-sf2', name: 'Street Fighter II', icon: '👊', embed: 'https://www.retrogames.cc/embed/9306-street-fighter-ii-the-world-warrior-world-910522.html' },
    { id: 'arc-mk', name: 'Mortal Kombat', icon: '🐉', embed: 'https://www.retrogames.cc/embed/7544-mortal-kombat-rev-5-0-t-unit-03-19-93.html' },
    { id: 'arc-tmnt', name: 'TMNT', icon: '🐢', embed: 'https://www.retrogames.cc/embed/9462-teenage-mutant-ninja-turtles-world-4-players.html' },
    { id: 'arc-simpsons', name: 'The Simpsons', icon: '🍩', embed: 'https://www.retrogames.cc/embed/9224-the-simpsons-4-players-world-set-1.html' },
    { id: 'arc-metalslug', name: 'Metal Slug', icon: '🪖', embed: 'https://www.retrogames.cc/embed/39907-metal-slug-super-vehicle-001.html' },
    { id: 'arc-bubble', name: 'Bubble Bobble', icon: '🫧', embed: 'https://www.retrogames.cc/embed/6251-bubble-bobble-us-with-mode-select.html' },
    { id: 'arc-asteroids', name: 'Asteroids', icon: '☄️', embed: 'https://www.retrogames.cc/embed/6007-asteroids-rev-4.html' },
  ],
};

// IO Games (open in new tab - they don't allow embedding)
const IO_GAMES = [
  { id: 'agar', name: 'Agar.io', icon: '⚪', url: 'https://agar.io/', desc: 'Eat cells to grow' },
  { id: 'slither', name: 'Slither.io', icon: '🐍', url: 'https://slither.io/', desc: 'Snake multiplayer' },
  { id: 'krunker', name: 'Krunker.io', icon: '🔫', url: 'https://krunker.io/', desc: 'Browser FPS' },
  { id: 'surviv', name: 'Surviv.io', icon: '🎯', url: 'https://surviv.io/', desc: '2D Battle Royale' },
  { id: 'skribbl', name: 'Skribbl.io', icon: '🎨', url: 'https://skribbl.io/', desc: 'Drawing game' },
  { id: 'diep', name: 'Diep.io', icon: '🔵', url: 'https://diep.io/', desc: 'Tank shooter' },
];

// Game Categories
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🎮' },
  { id: 'arcade', name: 'Arcade', icon: '👾' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
  { id: 'cards', name: 'Cards', icon: '🃏' },
  { id: 'strategy', name: 'Strategy', icon: '♟️' },
];

// Console Info
const CONSOLES = [
  { id: 'nes', name: 'NES', icon: '🔴', color: '#e60012' },
  { id: 'snes', name: 'SNES', icon: '🟣', color: '#6b5b95' },
  { id: 'gba', name: 'GBA', icon: '🔵', color: '#2e5cb8' },
  { id: 'genesis', name: 'Genesis', icon: '⚫', color: '#333' },
  { id: 'arcade', name: 'Arcade', icon: '🕹️', color: '#ff6b35' },
];

function GamesSection() {
  const { state, actions } = useApp();
  const { isMobile } = state;
  
  // State
  const [activeTab, setActiveTab] = useState('instant');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeConsole, setActiveConsole] = useState('nes');
  const [currentGame, setCurrentGame] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Refs
  const gameFrameRef = useRef(null);
  const gameRefs = useRef([]);

  // Load saved data
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('mn_game_favorites');
      const savedRecent = localStorage.getItem('mn_recent_games');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedRecent) setRecentGames(JSON.parse(savedRecent));
    } catch (e) {}
  }, []);

  // Play game
  const playGame = useCallback((game) => {
    // Add to recent
    const newRecent = [
      { ...game, playedAt: Date.now() },
      ...recentGames.filter(g => g.id !== game.id)
    ].slice(0, 12);
    setRecentGames(newRecent);
    localStorage.setItem('mn_recent_games', JSON.stringify(newRecent));
    
    setCurrentGame(game);
    actions.addNotification(`Playing: ${game.name}`, 'success');
  }, [recentGames, actions]);

  // Open external game (IO games)
  const openExternal = useCallback((game) => {
    window.open(game.url, '_blank', 'noopener,noreferrer');
    actions.addNotification(`Opening: ${game.name}`, 'info');
  }, [actions]);

  // Close game
  const closeGame = () => {
    setCurrentGame(null);
    setIsFullscreen(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen && gameFrameRef.current) {
      if (gameFrameRef.current.requestFullscreen) {
        gameFrameRef.current.requestFullscreen();
      } else if (gameFrameRef.current.webkitRequestFullscreen) {
        gameFrameRef.current.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Toggle favorite
  const toggleFavorite = useCallback((game) => {
    const newFavs = favorites.find(f => f.id === game.id)
      ? favorites.filter(f => f.id !== game.id)
      : [...favorites, game];
    setFavorites(newFavs);
    localStorage.setItem('mn_game_favorites', JSON.stringify(newFavs));
  }, [favorites]);

  // Filter instant games
  const filteredGames = activeCategory === 'all' 
    ? INSTANT_GAMES 
    : INSTANT_GAMES.filter(g => g.category === activeCategory);

  // Get current retro games
  const currentRetroGames = RETRO_GAMES[activeConsole] || [];

  // Keyboard navigation for TV
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      // Close game on Escape
      if (currentGame && (e.key === 'Escape' || e.key === 'Backspace')) {
        e.preventDefault();
        closeGame();
        return;
      }
      
      if (currentGame) return; // Don't navigate while game is open
      
      const games = activeTab === 'instant' ? filteredGames : currentRetroGames;
      const cols = isMobile ? 2 : 4;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - cols));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(games.length - 1, prev + cols));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(games.length - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (games[focusedIndex]) {
            playGame(games[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGame, activeTab, filteredGames, currentRetroGames, focusedIndex, isMobile, playGame]);

  // Focus management
  useEffect(() => {
    if (gameRefs.current[focusedIndex]) {
      gameRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Reset focus on tab/category change
  useEffect(() => {
    setFocusedIndex(0);
    gameRefs.current = [];
  }, [activeTab, activeCategory, activeConsole]);

  return (
    <div className="games-section">
      <h2 className="section-title">🎮 Games Hub</h2>

      {/* Main Tabs */}
      <div className="game-tabs">
        {[
          { id: 'instant', label: 'Instant Play', icon: '⚡' },
          { id: 'retro', label: 'Retro Games', icon: '🕹️' },
          { id: 'io', label: 'Multiplayer', icon: '🌐' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`game-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Games */}
      {recentGames.length > 0 && !currentGame && (
        <div className="recent-games">
          <h3>🕐 Continue Playing</h3>
          <div className="recent-scroll">
            {recentGames.slice(0, 8).map((game, idx) => (
              <button key={`recent-${idx}`} className="recent-game" onClick={() => playGame(game)}>
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instant Play Tab */}
      {activeTab === 'instant' && !currentGame && (
        <div className="instant-tab">
          {/* Category Filter */}
          <div className="category-filter">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="games-grid">
            {filteredGames.map((game, idx) => (
              <button
                key={game.id}
                ref={el => gameRefs.current[idx] = el}
                className={`game-card ${focusedIndex === idx ? 'focused' : ''}`}
                onClick={() => playGame(game)}
                onFocus={() => setFocusedIndex(idx)}
              >
                <span className="game-icon">{game.icon}</span>
                <div className="game-info">
                  <h4>{game.name}</h4>
                  <span className="game-controls">{game.controls}</span>
                </div>
                {game.tvFriendly && <span className="tv-badge" title="TV Remote Friendly">📺</span>}
                <button
                  className={`fav-btn ${favorites.find(f => f.id === game.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(game); }}
                >
                  {favorites.find(f => f.id === game.id) ? '★' : '☆'}
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Retro Games Tab */}
      {activeTab === 'retro' && !currentGame && (
        <div className="retro-tab">
          {/* Console Selector */}
          <div className="console-selector">
            {CONSOLES.map(console => (
              <button
                key={console.id}
                className={`console-btn ${activeConsole === console.id ? 'active' : ''}`}
                onClick={() => setActiveConsole(console.id)}
                style={{ '--console-color': console.color }}
              >
                <span className="console-icon">{console.icon}</span>
                <span className="console-name">{console.name}</span>
              </button>
            ))}
          </div>

          {/* Retro Games Grid */}
          <div className="games-grid retro">
            {currentRetroGames.map((game, idx) => (
              <button
                key={game.id}
                ref={el => gameRefs.current[idx] = el}
                className={`game-card retro ${focusedIndex === idx ? 'focused' : ''}`}
                onClick={() => playGame(game)}
                onFocus={() => setFocusedIndex(idx)}
              >
                <span className="game-icon">{game.icon}</span>
                <div className="game-info">
                  <h4>{game.name}</h4>
                  <span className="game-platform">{CONSOLES.find(c => c.id === activeConsole)?.name}</span>
                </div>
                <button
                  className={`fav-btn ${favorites.find(f => f.id === game.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(game); }}
                >
                  {favorites.find(f => f.id === game.id) ? '★' : '☆'}
                </button>
              </button>
            ))}
          </div>

          {/* Controls Help */}
          <div className="controls-help">
            <h4>🎮 Controls</h4>
            <div className="controls-grid">
              <div><kbd>↑↓←→</kbd> D-Pad / Move</div>
              <div><kbd>Z</kbd> A Button</div>
              <div><kbd>X</kbd> B Button</div>
              <div><kbd>Enter</kbd> Start</div>
              <div><kbd>Shift</kbd> Select</div>
              <div><kbd>A/S</kbd> L/R Buttons</div>
            </div>
          </div>
        </div>
      )}

      {/* IO Games Tab */}
      {activeTab === 'io' && !currentGame && (
        <div className="io-tab">
          <p className="tab-desc">Multiplayer browser games - opens in new tab</p>
          <div className="io-grid">
            {IO_GAMES.map(game => (
              <button
                key={game.id}
                className="io-card"
                onClick={() => openExternal(game)}
              >
                <span className="io-icon">{game.icon}</span>
                <div className="io-info">
                  <h4>{game.name}</h4>
                  <p>{game.desc}</p>
                </div>
                <span className="external-icon">↗</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Player */}
      {currentGame && (
        <div className={`game-player ${isFullscreen ? 'fullscreen' : ''}`} ref={gameFrameRef}>
          {/* Player Header */}
          <div className="player-header">
            <div className="player-title">
              <span>{currentGame.icon}</span>
              <h3>{currentGame.name}</h3>
              {currentGame.controls && <span className="controls-tag">{currentGame.controls}</span>}
            </div>
            <div className="player-actions">
              <button
                className={`action-btn ${favorites.find(f => f.id === currentGame.id) ? 'fav' : ''}`}
                onClick={() => toggleFavorite(currentGame)}
                title="Favorite"
              >
                {favorites.find(f => f.id === currentGame.id) ? '★' : '☆'}
              </button>
              <button className="action-btn" onClick={toggleFullscreen} title="Fullscreen">
                {isFullscreen ? '⊖' : '⊕'}
              </button>
              <button className="action-btn close" onClick={closeGame} title="Close">
                ✕
              </button>
            </div>
          </div>

          {/* Game Frame */}
          <div className="game-frame">
            <iframe
              src={currentGame.embed}
              title={currentGame.name}
              allowFullScreen
              allow="autoplay; fullscreen; gamepad"
              frameBorder="0"
            />
          </div>

          {/* Player Footer */}
          <div className="player-footer">
            <span>Press <kbd>ESC</kbd> to close</span>
            <span>•</span>
            <span>Click inside game to focus</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamesSection;
