/* ========================================
   GamesSection.jsx - Games Hub with Retro Emulators
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './GamesSection.css';

// Game categories and sources
const GAME_CATEGORIES = {
  retro: {
    name: '🎮 Retro Games',
    description: 'Classic console games',
    subcategories: {
      nes: { name: 'NES', icon: '🕹️', color: '#e60012' },
      snes: { name: 'SNES', icon: '🎮', color: '#7b5aa6' },
      gba: { name: 'GBA', icon: '📱', color: '#5c00a3' },
      n64: { name: 'N64', icon: '🎯', color: '#009e60' },
      genesis: { name: 'Genesis', icon: '⚡', color: '#0057a8' },
      ps1: { name: 'PS1', icon: '💿', color: '#003087' },
      arcade: { name: 'Arcade', icon: '🕹️', color: '#ff6b00' }
    }
  },
  browser: {
    name: '🌐 Browser Games',
    description: 'Play instantly in browser',
    games: [
      { id: 'crazygames', name: 'CrazyGames', icon: '🎮', url: 'https://www.crazygames.com/', embed: false },
      { id: 'poki', name: 'Poki', icon: '🎯', url: 'https://poki.com/', embed: false },
      { id: 'iogames', name: 'IO Games', icon: '🌐', url: 'https://iogames.space/', embed: false },
      { id: 'armor', name: 'Armor Games', icon: '⚔️', url: 'https://armorgames.com/', embed: false },
      { id: 'kongregate', name: 'Kongregate', icon: '👾', url: 'https://www.kongregate.com/', embed: false },
      { id: 'miniclip', name: 'Miniclip', icon: '🎪', url: 'https://www.miniclip.com/', embed: false }
    ]
  },
  flash: {
    name: '⚡ Flash Classics',
    description: 'Preserved Flash games',
    games: [
      { id: 'flashpoint', name: 'Flashpoint Archive', icon: '💾', url: 'https://flashpointarchive.org/datahub/Play', embed: false },
      { id: 'newgrounds', name: 'Newgrounds', icon: '🎭', url: 'https://www.newgrounds.com/games', embed: false },
      { id: 'coolmath', name: 'Coolmath Games', icon: '🧮', url: 'https://www.coolmathgames.com/', embed: false }
    ]
  }
};

// Popular retro games with ROM sources
const RETRO_GAMES = {
  nes: [
    { id: 'smb', name: 'Super Mario Bros', icon: '🍄', year: 1985 },
    { id: 'zelda', name: 'Legend of Zelda', icon: '⚔️', year: 1986 },
    { id: 'metroid', name: 'Metroid', icon: '🚀', year: 1986 },
    { id: 'megaman', name: 'Mega Man', icon: '🤖', year: 1987 },
    { id: 'contra', name: 'Contra', icon: '🔫', year: 1988 },
    { id: 'castlevania', name: 'Castlevania', icon: '🦇', year: 1986 },
    { id: 'punchout', name: 'Punch-Out!!', icon: '🥊', year: 1987 },
    { id: 'kirby', name: 'Kirby\'s Adventure', icon: '⭐', year: 1993 },
    { id: 'tmnt', name: 'TMNT', icon: '🐢', year: 1989 },
    { id: 'ducktales', name: 'DuckTales', icon: '🦆', year: 1989 }
  ],
  snes: [
    { id: 'smw', name: 'Super Mario World', icon: '🦖', year: 1990 },
    { id: 'lttp', name: 'Zelda: Link to Past', icon: '🗡️', year: 1991 },
    { id: 'supermetroid', name: 'Super Metroid', icon: '🌌', year: 1994 },
    { id: 'chrono', name: 'Chrono Trigger', icon: '⏰', year: 1995 },
    { id: 'ff6', name: 'Final Fantasy VI', icon: '✨', year: 1994 },
    { id: 'dkc', name: 'Donkey Kong Country', icon: '🦍', year: 1994 },
    { id: 'earthbound', name: 'EarthBound', icon: '🌍', year: 1994 },
    { id: 'smk', name: 'Super Mario Kart', icon: '🏎️', year: 1992 },
    { id: 'sf2', name: 'Street Fighter II', icon: '👊', year: 1992 },
    { id: 'secretofmana', name: 'Secret of Mana', icon: '🌳', year: 1993 }
  ],
  gba: [
    { id: 'pokemon-emerald', name: 'Pokemon Emerald', icon: '💎', year: 2004 },
    { id: 'pokemon-firered', name: 'Pokemon FireRed', icon: '🔥', year: 2004 },
    { id: 'minish', name: 'Zelda: Minish Cap', icon: '🧢', year: 2004 },
    { id: 'metroid-fusion', name: 'Metroid Fusion', icon: '🔬', year: 2002 },
    { id: 'mother3', name: 'Mother 3', icon: '💔', year: 2006 },
    { id: 'advance-wars', name: 'Advance Wars', icon: '🪖', year: 2001 },
    { id: 'castlevania-aria', name: 'Castlevania: Aria', icon: '🌙', year: 2003 },
    { id: 'ffta', name: 'FF Tactics Advance', icon: '♟️', year: 2003 },
    { id: 'warioware', name: 'WarioWare', icon: '💰', year: 2003 },
    { id: 'kirby-nightmare', name: 'Kirby Nightmare', icon: '😴', year: 2002 }
  ],
  n64: [
    { id: 'sm64', name: 'Super Mario 64', icon: '⭐', year: 1996 },
    { id: 'oot', name: 'Zelda: Ocarina', icon: '🎵', year: 1998 },
    { id: 'mm', name: 'Zelda: Majora\'s Mask', icon: '🎭', year: 2000 },
    { id: 'mk64', name: 'Mario Kart 64', icon: '🏁', year: 1996 },
    { id: 'ssb', name: 'Super Smash Bros', icon: '💥', year: 1999 },
    { id: 'goldeneye', name: 'GoldenEye 007', icon: '🔫', year: 1997 },
    { id: 'banjo', name: 'Banjo-Kazooie', icon: '🐻', year: 1998 },
    { id: 'pokemon-stadium', name: 'Pokemon Stadium', icon: '🏟️', year: 1999 },
    { id: 'starfox', name: 'Star Fox 64', icon: '🦊', year: 1997 },
    { id: 'paper-mario', name: 'Paper Mario', icon: '📄', year: 2000 }
  ],
  genesis: [
    { id: 'sonic1', name: 'Sonic the Hedgehog', icon: '🦔', year: 1991 },
    { id: 'sonic2', name: 'Sonic 2', icon: '💨', year: 1992 },
    { id: 'sonic3', name: 'Sonic 3 & Knuckles', icon: '🔴', year: 1994 },
    { id: 'streets-of-rage', name: 'Streets of Rage 2', icon: '👊', year: 1992 },
    { id: 'gunstar', name: 'Gunstar Heroes', icon: '💫', year: 1993 },
    { id: 'shining-force', name: 'Shining Force II', icon: '⚔️', year: 1993 },
    { id: 'phantasy-star', name: 'Phantasy Star IV', icon: '🌟', year: 1993 },
    { id: 'comix-zone', name: 'Comix Zone', icon: '📰', year: 1995 },
    { id: 'vectorman', name: 'Vectorman', icon: '🤖', year: 1995 },
    { id: 'altered-beast', name: 'Altered Beast', icon: '🐺', year: 1988 }
  ],
  ps1: [
    { id: 'ff7', name: 'Final Fantasy VII', icon: '☁️', year: 1997 },
    { id: 'mgs', name: 'Metal Gear Solid', icon: '📦', year: 1998 },
    { id: 'crash', name: 'Crash Bandicoot', icon: '🌪️', year: 1996 },
    { id: 'spyro', name: 'Spyro the Dragon', icon: '🐲', year: 1998 },
    { id: 'resident-evil', name: 'Resident Evil', icon: '🧟', year: 1996 },
    { id: 'tekken3', name: 'Tekken 3', icon: '🥋', year: 1998 },
    { id: 'castlevania-sotn', name: 'Castlevania SOTN', icon: '🏰', year: 1997 },
    { id: 'tomb-raider', name: 'Tomb Raider', icon: '🏛️', year: 1996 },
    { id: 'gran-turismo', name: 'Gran Turismo', icon: '🏎️', year: 1997 },
    { id: 'tony-hawk', name: 'Tony Hawk\'s Pro Skater', icon: '🛹', year: 1999 }
  ],
  arcade: [
    { id: 'pacman', name: 'Pac-Man', icon: '🟡', year: 1980 },
    { id: 'galaga', name: 'Galaga', icon: '🚀', year: 1981 },
    { id: 'donkey-kong', name: 'Donkey Kong', icon: '🦍', year: 1981 },
    { id: 'space-invaders', name: 'Space Invaders', icon: '👾', year: 1978 },
    { id: 'street-fighter', name: 'Street Fighter II', icon: '🥊', year: 1991 },
    { id: 'mortal-kombat', name: 'Mortal Kombat', icon: '🐉', year: 1992 },
    { id: 'metal-slug', name: 'Metal Slug', icon: '🪖', year: 1996 },
    { id: 'bubble-bobble', name: 'Bubble Bobble', icon: '🫧', year: 1986 },
    { id: 'frogger', name: 'Frogger', icon: '🐸', year: 1981 },
    { id: 'tetris', name: 'Tetris', icon: '🧱', year: 1984 }
  ]
};

// Emulator sources - using vimm.net and other trusted sources
const EMULATOR_SOURCES = {
  playclassic: 'https://www.playclassic.games/',
  retrogames: 'https://www.retrogames.cc/',
  arcadespot: 'https://arcadespot.com/',
  ssega: 'https://www.ssega.com/',
  playroms: 'https://www.playroms.net/',
  emulatoronline: 'https://emulatoronline.com/'
};

function GamesSection() {
  const { actions } = useApp();
  const [activeCategory, setActiveCategory] = useState('retro');
  const [activeConsole, setActiveConsole] = useState('nes');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load favorites and recently played from localStorage
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

  // Save favorites
  const toggleFavorite = (game, console) => {
    const gameKey = `${console}-${game.id}`;
    const newFavorites = favorites.includes(gameKey)
      ? favorites.filter(f => f !== gameKey)
      : [...favorites, gameKey];
    
    setFavorites(newFavorites);
    localStorage.setItem('movienights_game_favorites', JSON.stringify(newFavorites));
  };

  // Add to recently played
  const addToRecent = (game, console) => {
    const gameData = { ...game, console, playedAt: Date.now() };
    const newRecent = [
      gameData,
      ...recentlyPlayed.filter(g => !(g.id === game.id && g.console === console))
    ].slice(0, 10);
    
    setRecentlyPlayed(newRecent);
    localStorage.setItem('movienights_recent_games', JSON.stringify(newRecent));
  };

  // Launch game
  const launchGame = (game, console) => {
    addToRecent(game, console);
    setSelectedGame({ ...game, console });
    actions.addNotification(`Loading ${game.name}...`, 'info');
  };

  // Get game embed URL
  const getGameUrl = (game, console) => {
    // Use retrogames.cc which has good embed support
    const consoleMap = {
      nes: 'nintendo',
      snes: 'super-nintendo',
      gba: 'gameboy-advance',
      n64: 'nintendo-64',
      genesis: 'sega-genesis',
      ps1: 'playstation',
      arcade: 'arcade'
    };
    
    // Create search-friendly game name
    const gameName = game.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    return `https://www.retrogames.cc/${consoleMap[console]}/${gameName}.html`;
  };

  // Open external game site
  const openExternalSite = (url) => {
    window.open(url, '_blank');
  };

  // Filter games by search
  const filteredGames = searchQuery
    ? Object.entries(RETRO_GAMES).flatMap(([console, games]) =>
        games.filter(g => 
          g.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(g => ({ ...g, console }))
      )
    : null;

  // Render console selector
  const renderConsoleSelector = () => (
    <div className="console-selector">
      {Object.entries(GAME_CATEGORIES.retro.subcategories).map(([key, console]) => (
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
  );

  // Render game grid
  const renderGameGrid = (games, consoleKey) => (
    <div className="game-grid">
      {games.map((game) => (
        <div 
          key={game.id} 
          className="game-card"
          onClick={() => launchGame(game, consoleKey)}
        >
          <div className="game-icon">{game.icon}</div>
          <div className="game-info">
            <h4>{game.name}</h4>
            <span className="game-year">{game.year}</span>
          </div>
          <button
            className={`game-favorite ${favorites.includes(`${consoleKey}-${game.id}`) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(game, consoleKey);
            }}
          >
            {favorites.includes(`${consoleKey}-${game.id}`) ? '⭐' : '☆'}
          </button>
        </div>
      ))}
    </div>
  );

  // Render game player
  const renderGamePlayer = () => {
    if (!selectedGame) return null;

    const gameUrl = getGameUrl(selectedGame, selectedGame.console);

    return (
      <div className={`game-player-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="game-player-header">
          <div className="game-player-info">
            <span className="game-player-icon">{selectedGame.icon}</span>
            <h3>{selectedGame.name}</h3>
            <span className="game-player-console">
              {GAME_CATEGORIES.retro.subcategories[selectedGame.console]?.name}
            </span>
          </div>
          <div className="game-player-controls">
            <button 
              className="control-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
            <button 
              className="control-btn"
              onClick={() => openExternalSite(gameUrl)}
              title="Open in New Tab"
            >
              🔗
            </button>
            <button 
              className="control-btn close-btn"
              onClick={() => setSelectedGame(null)}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="game-player-container">
          <iframe
            src={gameUrl}
            title={selectedGame.name}
            allowFullScreen
            allow="gamepad; autoplay; fullscreen"
          />
        </div>
        <div className="game-player-footer">
          <p>💡 Controls: Arrow Keys to move, Z/X for A/B buttons, Enter for Start</p>
          <button 
            className="open-external-btn"
            onClick={() => openExternalSite(gameUrl)}
          >
            🔗 Open in New Tab (if game doesn't load)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="games-section">
      <h2 className="section-title">🎮 Games Hub</h2>

      {/* Search Bar */}
      <div className="games-search">
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="games-search-input"
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Results */}
      {filteredGames && filteredGames.length > 0 && (
        <div className="search-results">
          <h3>🔍 Search Results ({filteredGames.length})</h3>
          <div className="game-grid">
            {filteredGames.map((game) => (
              <div 
                key={`${game.console}-${game.id}`} 
                className="game-card"
                onClick={() => launchGame(game, game.console)}
              >
                <div className="game-icon">{game.icon}</div>
                <div className="game-info">
                  <h4>{game.name}</h4>
                  <span className="game-console-badge">
                    {GAME_CATEGORIES.retro.subcategories[game.console]?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Played */}
      {!searchQuery && recentlyPlayed.length > 0 && (
        <div className="recent-games">
          <h3>🕐 Recently Played</h3>
          <div className="recent-games-scroll">
            {recentlyPlayed.map((game, index) => (
              <div 
                key={`recent-${index}`}
                className="recent-game-card"
                onClick={() => launchGame(game, game.console)}
              >
                <span className="recent-game-icon">{game.icon}</span>
                <span className="recent-game-name">{game.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="category-tabs">
          <button
            className={`category-tab ${activeCategory === 'retro' ? 'active' : ''}`}
            onClick={() => setActiveCategory('retro')}
          >
            🎮 Retro Games
          </button>
          <button
            className={`category-tab ${activeCategory === 'browser' ? 'active' : ''}`}
            onClick={() => setActiveCategory('browser')}
          >
            🌐 Browser Games
          </button>
          <button
            className={`category-tab ${activeCategory === 'flash' ? 'active' : ''}`}
            onClick={() => setActiveCategory('flash')}
          >
            ⚡ Flash Classics
          </button>
        </div>
      )}

      {/* Retro Games Section */}
      {!searchQuery && activeCategory === 'retro' && (
        <div className="retro-section">
          {renderConsoleSelector()}
          <div className="games-content">
            <h3>
              {GAME_CATEGORIES.retro.subcategories[activeConsole]?.icon}{' '}
              {GAME_CATEGORIES.retro.subcategories[activeConsole]?.name} Games
            </h3>
            {renderGameGrid(RETRO_GAMES[activeConsole] || [], activeConsole)}
          </div>
        </div>
      )}

      {/* Browser Games Section */}
      {!searchQuery && activeCategory === 'browser' && (
        <div className="browser-section">
          <p className="section-description">
            Click to open game sites in a new tab. These sites have thousands of free browser games!
          </p>
          <div className="browser-games-grid">
            {GAME_CATEGORIES.browser.games.map((site) => (
              <div 
                key={site.id}
                className="browser-game-card"
                onClick={() => openExternalSite(site.url)}
              >
                <span className="browser-game-icon">{site.icon}</span>
                <h4>{site.name}</h4>
                <span className="external-badge">Opens in new tab ↗</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flash Games Section */}
      {!searchQuery && activeCategory === 'flash' && (
        <div className="flash-section">
          <p className="section-description">
            Classic Flash games preserved and playable! These archives contain thousands of nostalgic games.
          </p>
          <div className="browser-games-grid">
            {GAME_CATEGORIES.flash.games.map((site) => (
              <div 
                key={site.id}
                className="browser-game-card flash-card"
                onClick={() => openExternalSite(site.url)}
              >
                <span className="browser-game-icon">{site.icon}</span>
                <h4>{site.name}</h4>
                <span className="external-badge">Opens in new tab ↗</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Player Overlay */}
      {selectedGame && renderGamePlayer()}

      {/* Quick Links */}
      <div className="quick-links">
        <h3>🔗 More Gaming Sites</h3>
        <div className="quick-links-grid">
          <a href="https://www.retrogames.cc/" target="_blank" rel="noopener noreferrer">RetroGames.cc</a>
          <a href="https://arcadespot.com/" target="_blank" rel="noopener noreferrer">ArcadeSpot</a>
          <a href="https://www.ssega.com/" target="_blank" rel="noopener noreferrer">SSega</a>
          <a href="https://emulatoronline.com/" target="_blank" rel="noopener noreferrer">Emulator Online</a>
          <a href="https://www.emulatorgames.net/" target="_blank" rel="noopener noreferrer">Emulator Games</a>
          <a href="https://www.playretrogames.com/" target="_blank" rel="noopener noreferrer">Play Retro Games</a>
        </div>
      </div>
    </div>
  );
}

export default GamesSection;
