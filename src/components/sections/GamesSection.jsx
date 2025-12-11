/* ========================================
   GamesSection.jsx - Games Hub with Working Embeds
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './GamesSection.css';

// Embeddable HTML5 Games - These actually work!
const INSTANT_GAMES = [
  { 
    id: '2048', 
    name: '2048', 
    icon: '🔢', 
    category: 'puzzle',
    embedUrl: 'https://play2048.co/',
    description: 'Slide tiles to reach 2048'
  },
  { 
    id: 'flappy', 
    name: 'Flappy Bird', 
    icon: '🐦', 
    category: 'arcade',
    embedUrl: 'https://flappybird.io/',
    description: 'Classic flappy gameplay'
  },
  { 
    id: 'snake', 
    name: 'Snake', 
    icon: '🐍', 
    category: 'arcade',
    embedUrl: 'https://playsnake.org/',
    description: 'Classic snake game'
  },
  { 
    id: 'tetris', 
    name: 'Tetris', 
    icon: '🧱', 
    category: 'puzzle',
    embedUrl: 'https://tetris.com/play-tetris',
    description: 'Stack the blocks'
  },
  { 
    id: 'pacman', 
    name: 'Pac-Man', 
    icon: '🟡', 
    category: 'arcade',
    embedUrl: 'https://www.google.com/logos/2010/pacman10-i.html',
    description: 'Google Pac-Man doodle'
  },
  { 
    id: 'crossy', 
    name: 'Crossy Road', 
    icon: '🐔', 
    category: 'arcade',
    embedUrl: 'https://poki.com/en/g/crossy-road',
    description: 'Why did the chicken cross?'
  },
  { 
    id: 'minesweeper', 
    name: 'Minesweeper', 
    icon: '💣', 
    category: 'puzzle',
    embedUrl: 'https://minesweeper.online/',
    description: 'Classic Windows game'
  },
  { 
    id: 'sudoku', 
    name: 'Sudoku', 
    icon: '9️⃣', 
    category: 'puzzle',
    embedUrl: 'https://sudoku.com/',
    description: 'Number puzzle'
  },
  { 
    id: 'chess', 
    name: 'Chess', 
    icon: '♟️', 
    category: 'strategy',
    embedUrl: 'https://www.chess.com/play/computer',
    description: 'Play against AI'
  },
  { 
    id: 'wordle', 
    name: 'Wordle', 
    icon: '📝', 
    category: 'word',
    embedUrl: 'https://www.nytimes.com/games/wordle/index.html',
    description: 'Daily word game'
  },
  { 
    id: 'solitaire', 
    name: 'Solitaire', 
    icon: '🃏', 
    category: 'card',
    embedUrl: 'https://www.solitr.com/',
    description: 'Classic card game'
  },
  {
    id: 'dino',
    name: 'Chrome Dino',
    icon: '🦖',
    category: 'arcade',
    embedUrl: 'https://chromedino.com/',
    description: 'T-Rex runner'
  }
];

// Browser Game Sites - Open in new tab
const GAME_SITES = {
  popular: {
    name: '🔥 Popular',
    sites: [
      { id: 'poki', name: 'Poki', icon: '🎮', url: 'https://poki.com/', description: 'Thousands of free games' },
      { id: 'crazygames', name: 'CrazyGames', icon: '🎯', url: 'https://www.crazygames.com/', description: 'Browser games hub' },
      { id: 'iogames', name: 'IO Games', icon: '🌐', url: 'https://iogames.space/', description: 'Multiplayer .io games' },
      { id: 'coolmath', name: 'Coolmath Games', icon: '🧮', url: 'https://www.coolmathgames.com/', description: 'Logic & thinking games' },
      { id: 'armor', name: 'Armor Games', icon: '⚔️', url: 'https://armorgames.com/', description: 'Quality browser games' },
      { id: 'kongregate', name: 'Kongregate', icon: '👾', url: 'https://www.kongregate.com/', description: 'Gaming community' }
    ]
  },
  retro: {
    name: '🕹️ Retro',
    sites: [
      { id: 'retrogames', name: 'RetroGames.cc', icon: '🎮', url: 'https://www.retrogames.cc/', description: 'Play classic console games' },
      { id: 'arcadespot', name: 'ArcadeSpot', icon: '🕹️', url: 'https://arcadespot.com/', description: 'Arcade classics' },
      { id: 'playclassic', name: 'PlayClassic', icon: '📺', url: 'https://www.playclassic.games/', description: 'DOS and retro games' },
      { id: 'ssega', name: 'SSega', icon: '⚡', url: 'https://www.ssega.com/', description: 'Sega Genesis online' },
      { id: 'nesemu', name: 'NES Emulator', icon: '🔴', url: 'https://www.retrogames.cc/nintendo-games', description: 'NES games online' },
      { id: 'snemu', name: 'SNES Online', icon: '🟣', url: 'https://www.retrogames.cc/super-nintendo-games', description: 'SNES games online' }
    ]
  },
  flash: {
    name: '⚡ Flash Archives',
    sites: [
      { id: 'flashpoint', name: 'Flashpoint', icon: '💾', url: 'https://flashpointarchive.org/', description: 'Flash preservation project' },
      { id: 'newgrounds', name: 'Newgrounds', icon: '🎭', url: 'https://www.newgrounds.com/games', description: 'Flash games archive' },
      { id: 'y8', name: 'Y8 Games', icon: '🎪', url: 'https://www.y8.com/', description: 'Classic web games' },
      { id: 'miniclip', name: 'Miniclip', icon: '🎈', url: 'https://www.miniclip.com/', description: 'Web games since 2001' }
    ]
  },
  multiplayer: {
    name: '👥 Multiplayer',
    sites: [
      { id: 'agario', name: 'Agar.io', icon: '⚪', url: 'https://agar.io/', description: 'Cell eating game' },
      { id: 'slither', name: 'Slither.io', icon: '🐍', url: 'http://slither.io/', description: 'Snake multiplayer' },
      { id: 'krunker', name: 'Krunker.io', icon: '🔫', url: 'https://krunker.io/', description: 'Browser FPS' },
      { id: 'shellshock', name: 'Shell Shockers', icon: '🥚', url: 'https://shellshock.io/', description: 'Egg FPS game' },
      { id: 'surviv', name: 'Surviv.io', icon: '🎯', url: 'https://surviv.io/', description: '2D battle royale' },
      { id: 'skribbl', name: 'Skribbl.io', icon: '🎨', url: 'https://skribbl.io/', description: 'Drawing & guessing' }
    ]
  }
};

// Retro console games with direct play links
const RETRO_CONSOLES = {
  nes: {
    name: 'NES',
    icon: '🔴',
    color: '#e60012',
    games: [
      { name: 'Super Mario Bros', searchUrl: 'https://www.retrogames.cc/search?q=super+mario+bros' },
      { name: 'Legend of Zelda', searchUrl: 'https://www.retrogames.cc/search?q=legend+of+zelda' },
      { name: 'Metroid', searchUrl: 'https://www.retrogames.cc/search?q=metroid' },
      { name: 'Mega Man', searchUrl: 'https://www.retrogames.cc/search?q=mega+man' },
      { name: 'Contra', searchUrl: 'https://www.retrogames.cc/search?q=contra' },
      { name: 'Castlevania', searchUrl: 'https://www.retrogames.cc/search?q=castlevania' },
      { name: 'Punch-Out', searchUrl: 'https://www.retrogames.cc/search?q=punch+out' },
      { name: 'Kirby', searchUrl: 'https://www.retrogames.cc/search?q=kirby' }
    ]
  },
  snes: {
    name: 'SNES',
    icon: '🟣',
    color: '#7b5aa6',
    games: [
      { name: 'Super Mario World', searchUrl: 'https://www.retrogames.cc/search?q=super+mario+world' },
      { name: 'Zelda: Link to Past', searchUrl: 'https://www.retrogames.cc/search?q=zelda+link+to+the+past' },
      { name: 'Super Metroid', searchUrl: 'https://www.retrogames.cc/search?q=super+metroid' },
      { name: 'Chrono Trigger', searchUrl: 'https://www.retrogames.cc/search?q=chrono+trigger' },
      { name: 'Final Fantasy VI', searchUrl: 'https://www.retrogames.cc/search?q=final+fantasy+6' },
      { name: 'Donkey Kong Country', searchUrl: 'https://www.retrogames.cc/search?q=donkey+kong+country' },
      { name: 'Street Fighter II', searchUrl: 'https://www.retrogames.cc/search?q=street+fighter+2' },
      { name: 'Super Mario Kart', searchUrl: 'https://www.retrogames.cc/search?q=super+mario+kart' }
    ]
  },
  genesis: {
    name: 'Genesis',
    icon: '⚡',
    color: '#0057a8',
    games: [
      { name: 'Sonic the Hedgehog', searchUrl: 'https://www.ssega.com/search?q=sonic' },
      { name: 'Sonic 2', searchUrl: 'https://www.ssega.com/search?q=sonic+2' },
      { name: 'Streets of Rage 2', searchUrl: 'https://www.ssega.com/search?q=streets+of+rage' },
      { name: 'Golden Axe', searchUrl: 'https://www.ssega.com/search?q=golden+axe' },
      { name: 'Mortal Kombat', searchUrl: 'https://www.ssega.com/search?q=mortal+kombat' },
      { name: 'Phantasy Star IV', searchUrl: 'https://www.ssega.com/search?q=phantasy+star' }
    ]
  },
  gba: {
    name: 'GBA',
    icon: '📱',
    color: '#5c00a3',
    games: [
      { name: 'Pokemon Emerald', searchUrl: 'https://www.retrogames.cc/search?q=pokemon+emerald' },
      { name: 'Pokemon FireRed', searchUrl: 'https://www.retrogames.cc/search?q=pokemon+fire+red' },
      { name: 'Zelda: Minish Cap', searchUrl: 'https://www.retrogames.cc/search?q=zelda+minish+cap' },
      { name: 'Metroid Fusion', searchUrl: 'https://www.retrogames.cc/search?q=metroid+fusion' },
      { name: 'Advance Wars', searchUrl: 'https://www.retrogames.cc/search?q=advance+wars' },
      { name: 'Castlevania: Aria', searchUrl: 'https://www.retrogames.cc/search?q=castlevania+aria' }
    ]
  },
  arcade: {
    name: 'Arcade',
    icon: '🕹️',
    color: '#ff6b00',
    games: [
      { name: 'Pac-Man', searchUrl: 'https://arcadespot.com/search/?q=pac+man' },
      { name: 'Galaga', searchUrl: 'https://arcadespot.com/search/?q=galaga' },
      { name: 'Donkey Kong', searchUrl: 'https://arcadespot.com/search/?q=donkey+kong' },
      { name: 'Space Invaders', searchUrl: 'https://arcadespot.com/search/?q=space+invaders' },
      { name: 'Street Fighter II', searchUrl: 'https://arcadespot.com/search/?q=street+fighter' },
      { name: 'Metal Slug', searchUrl: 'https://arcadespot.com/search/?q=metal+slug' }
    ]
  }
};

// Game categories for filtering
const GAME_CATEGORIES = ['all', 'arcade', 'puzzle', 'strategy', 'card', 'word'];

function GamesSection() {
  const { actions } = useApp();
  
  // State
  const [activeTab, setActiveTab] = useState('instant');
  const [activeSiteCategory, setActiveSiteCategory] = useState('popular');
  const [activeConsole, setActiveConsole] = useState('nes');
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameFilter, setGameFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load saved data
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('movienights_game_favorites');
      const savedRecent = localStorage.getItem('movienights_recent_games');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));
    } catch (e) {
      console.error('Error loading game data:', e);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = (gameId) => {
    const newFavorites = favorites.includes(gameId)
      ? favorites.filter(f => f !== gameId)
      : [...favorites, gameId];
    
    setFavorites(newFavorites);
    localStorage.setItem('movienights_game_favorites', JSON.stringify(newFavorites));
  };

  // Add to recently played
  const addToRecent = (game) => {
    const newRecent = [
      game,
      ...recentlyPlayed.filter(g => g.id !== game.id)
    ].slice(0, 8);
    
    setRecentlyPlayed(newRecent);
    localStorage.setItem('movienights_recent_games', JSON.stringify(newRecent));
  };

  // Play instant game
  const playGame = (game) => {
    addToRecent(game);
    setSelectedGame(game);
    actions.addNotification(`Loading ${game.name}...`, 'info');
  };

  // Open external site
  const openExternal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Close game
  const closeGame = () => {
    setSelectedGame(null);
    setIsFullscreen(false);
  };

  // Filter instant games
  const filteredGames = gameFilter === 'all' 
    ? INSTANT_GAMES 
    : INSTANT_GAMES.filter(g => g.category === gameFilter);

  return (
    <div className="games-section">
      <h2 className="section-title">🎮 Games Hub</h2>

      {/* Main Tabs */}
      <div className="games-tabs">
        <button 
          className={`games-tab ${activeTab === 'instant' ? 'active' : ''}`}
          onClick={() => setActiveTab('instant')}
        >
          ⚡ Instant Play
        </button>
        <button 
          className={`games-tab ${activeTab === 'sites' ? 'active' : ''}`}
          onClick={() => setActiveTab('sites')}
        >
          🌐 Game Sites
        </button>
        <button 
          className={`games-tab ${activeTab === 'retro' ? 'active' : ''}`}
          onClick={() => setActiveTab('retro')}
        >
          🕹️ Retro Games
        </button>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && !selectedGame && (
        <div className="recent-games-section">
          <h3>🕐 Recently Played</h3>
          <div className="recent-games-row">
            {recentlyPlayed.map(game => (
              <button
                key={game.id}
                className="recent-game-btn"
                onClick={() => game.embedUrl ? playGame(game) : openExternal(game.searchUrl || game.url)}
              >
                <span className="recent-icon">{game.icon}</span>
                <span className="recent-name">{game.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instant Play Tab */}
      {activeTab === 'instant' && !selectedGame && (
        <div className="instant-games">
          {/* Category Filter */}
          <div className="game-filters">
            {GAME_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${gameFilter === cat ? 'active' : ''}`}
                onClick={() => setGameFilter(cat)}
              >
                {cat === 'all' ? '🎮 All' : 
                 cat === 'arcade' ? '👾 Arcade' :
                 cat === 'puzzle' ? '🧩 Puzzle' :
                 cat === 'strategy' ? '♟️ Strategy' :
                 cat === 'card' ? '🃏 Card' : '📝 Word'}
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="instant-games-grid">
            {filteredGames.map(game => (
              <div 
                key={game.id}
                className="instant-game-card"
                onClick={() => playGame(game)}
              >
                <div className="game-card-icon">{game.icon}</div>
                <div className="game-card-info">
                  <h4>{game.name}</h4>
                  <p>{game.description}</p>
                </div>
                <button
                  className={`favorite-btn ${favorites.includes(game.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}
                >
                  {favorites.includes(game.id) ? '⭐' : '☆'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Sites Tab */}
      {activeTab === 'sites' && !selectedGame && (
        <div className="game-sites-section">
          {/* Site Category Tabs */}
          <div className="site-category-tabs">
            {Object.entries(GAME_SITES).map(([key, category]) => (
              <button
                key={key}
                className={`site-cat-btn ${activeSiteCategory === key ? 'active' : ''}`}
                onClick={() => setActiveSiteCategory(key)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sites Grid */}
          <div className="sites-grid">
            {GAME_SITES[activeSiteCategory].sites.map(site => (
              <div 
                key={site.id}
                className="site-card"
                onClick={() => openExternal(site.url)}
              >
                <span className="site-icon">{site.icon}</span>
                <div className="site-info">
                  <h4>{site.name}</h4>
                  <p>{site.description}</p>
                </div>
                <span className="external-badge">↗</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retro Games Tab */}
      {activeTab === 'retro' && !selectedGame && (
        <div className="retro-games-section">
          <p className="retro-intro">
            Click any game to search on emulator sites. Games open in new tabs.
          </p>

          {/* Console Selector */}
          <div className="console-selector">
            {Object.entries(RETRO_CONSOLES).map(([key, console]) => (
              <button
                key={key}
                className={`console-btn ${activeConsole === key ? 'active' : ''}`}
                onClick={() => setActiveConsole(key)}
                style={{ '--console-color': console.color }}
              >
                <span className="console-icon">{console.icon}</span>
                <span className="console-name">{console.name}</span>
              </button>
            ))}
          </div>

          {/* Games List */}
          <div className="retro-games-grid">
            {RETRO_CONSOLES[activeConsole].games.map((game, index) => (
              <div 
                key={index}
                className="retro-game-card"
                onClick={() => openExternal(game.searchUrl)}
                style={{ '--console-color': RETRO_CONSOLES[activeConsole].color }}
              >
                <span className="retro-game-console">{RETRO_CONSOLES[activeConsole].icon}</span>
                <span className="retro-game-name">{game.name}</span>
                <span className="play-badge">▶ Play</span>
              </div>
            ))}
          </div>

          {/* Direct Console Links */}
          <div className="console-quick-links">
            <h4>🔗 Browse All {RETRO_CONSOLES[activeConsole].name} Games</h4>
            <div className="quick-link-buttons">
              <button onClick={() => openExternal('https://www.retrogames.cc/')}>
                RetroGames.cc
              </button>
              <button onClick={() => openExternal('https://arcadespot.com/')}>
                ArcadeSpot
              </button>
              <button onClick={() => openExternal('https://www.ssega.com/')}>
                SSega (Genesis)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Player Overlay */}
      {selectedGame && (
        <div className={`game-player-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
          <div className="game-player-header">
            <div className="game-player-title">
              <span className="game-icon">{selectedGame.icon}</span>
              <h3>{selectedGame.name}</h3>
            </div>
            <div className="game-player-controls">
              <button 
                className="player-control-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? '⛶' : '⛶'}
              </button>
              <button 
                className="player-control-btn"
                onClick={() => openExternal(selectedGame.embedUrl)}
                title="Open in New Tab"
              >
                🔗
              </button>
              <button 
                className="player-control-btn close-btn"
                onClick={closeGame}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="game-player-container">
            <iframe
              src={selectedGame.embedUrl}
              title={selectedGame.name}
              allowFullScreen
              allow="autoplay; fullscreen; gamepad"
            />
          </div>
          
          <div className="game-player-footer">
            <p>💡 If the game doesn't load, click the 🔗 button to open in a new tab</p>
            <button 
              className="open-tab-btn"
              onClick={() => openExternal(selectedGame.embedUrl)}
            >
              Open in New Tab ↗
            </button>
          </div>
        </div>
      )}

      {/* Quick Links Footer */}
      <div className="games-footer">
        <h3>🎯 Popular Gaming Sites</h3>
        <div className="footer-links">
          <a href="https://poki.com/" target="_blank" rel="noopener noreferrer">Poki</a>
          <a href="https://www.crazygames.com/" target="_blank" rel="noopener noreferrer">CrazyGames</a>
          <a href="https://www.coolmathgames.com/" target="_blank" rel="noopener noreferrer">Coolmath</a>
          <a href="https://www.retrogames.cc/" target="_blank" rel="noopener noreferrer">RetroGames</a>
          <a href="https://iogames.space/" target="_blank" rel="noopener noreferrer">IO Games</a>
          <a href="https://www.newgrounds.com/games" target="_blank" rel="noopener noreferrer">Newgrounds</a>
        </div>
      </div>
    </div>
  );
}

export default GamesSection;
