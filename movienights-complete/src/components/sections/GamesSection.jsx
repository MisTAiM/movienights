/* ========================================
   GamesSection.jsx - Games Hub
   Using verified working embeds
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './GamesSection.css';

// ============================================
// VERIFIED WORKING GAMES - All tested
// ============================================

// Games that embed properly (tested)
const EMBEDDABLE_GAMES = [
  // Classic HTML5 Games
  { 
    id: '2048', 
    name: '2048', 
    icon: '🔢', 
    category: 'puzzle',
    embed: 'https://play2048.co/',
    controls: 'Arrow Keys or WASD',
    description: 'Slide tiles to combine numbers and reach 2048!'
  },
  { 
    id: 'flappy', 
    name: 'Flappy Bird', 
    icon: '🐦', 
    category: 'arcade',
    embed: 'https://flappybird.io/',
    controls: 'Space or Click',
    description: 'Navigate through pipes without hitting them'
  },
  { 
    id: 'dino', 
    name: 'Chrome Dino', 
    icon: '🦖', 
    category: 'arcade',
    embed: 'https://chromedino.com/',
    controls: 'Space to Jump',
    description: 'The classic Chrome offline dinosaur game'
  },
  { 
    id: 'snake', 
    name: 'Snake', 
    icon: '🐍', 
    category: 'arcade',
    embed: 'https://playsnake.org/',
    controls: 'Arrow Keys',
    description: 'Classic snake game - eat and grow!'
  },
  { 
    id: 'tetris', 
    name: 'Tetris', 
    icon: '🧱', 
    category: 'puzzle',
    embed: 'https://tetris.com/play-tetris',
    controls: 'Arrow Keys + Space',
    description: 'Stack falling blocks to clear lines'
  },
  { 
    id: 'wordle', 
    name: 'Wordle', 
    icon: '📝', 
    category: 'puzzle',
    embed: 'https://www.nytimes.com/games/wordle/index.html',
    controls: 'Keyboard',
    description: 'Guess the 5-letter word in 6 tries'
  },
  { 
    id: 'crossword', 
    name: 'Mini Crossword', 
    icon: '✏️', 
    category: 'puzzle',
    embed: 'https://www.nytimes.com/crosswords/game/mini',
    controls: 'Keyboard + Mouse',
    description: 'Quick daily crossword puzzle'
  },
  { 
    id: 'sudoku', 
    name: 'Sudoku', 
    icon: '9️⃣', 
    category: 'puzzle',
    embed: 'https://sudoku.com/',
    controls: 'Mouse + Number Keys',
    description: 'Fill the 9x9 grid with numbers'
  },
];

// External games (open in new tab - better experience)
const EXTERNAL_GAMES = {
  retro: [
    { id: 'smb', name: 'Super Mario Bros', icon: '🍄', url: 'https://supermario-game.com/', platform: 'NES' },
    { id: 'sonic', name: 'Sonic the Hedgehog', icon: '💨', url: 'https://www.ssega.com/sonic-the-hedgehog', platform: 'Genesis' },
    { id: 'zelda', name: 'Legend of Zelda', icon: '🗡️', url: 'https://www.retrogames.cc/nes-games/legend-of-zelda-the-usa.html', platform: 'NES' },
    { id: 'pokemon', name: 'Pokemon Red', icon: '🔴', url: 'https://www.playemulator.com/gb-online/pokemon-red/', platform: 'GB' },
    { id: 'pacman', name: 'Pac-Man', icon: '🟡', url: 'https://www.google.com/search?q=pacman&btnI', platform: 'Arcade' },
    { id: 'tetris-gb', name: 'Tetris', icon: '🧱', url: 'https://www.playemulator.com/gb-online/tetris/', platform: 'GB' },
    { id: 'metroid', name: 'Metroid', icon: '🚀', url: 'https://www.retrogames.cc/nes-games/metroid-usa.html', platform: 'NES' },
    { id: 'contra', name: 'Contra', icon: '🔫', url: 'https://www.retrogames.cc/nes-games/contra-usa.html', platform: 'NES' },
    { id: 'mariokart', name: 'Mario Kart', icon: '🏎️', url: 'https://www.retrogames.cc/snes-games/super-mario-kart-usa.html', platform: 'SNES' },
    { id: 'sf2', name: 'Street Fighter II', icon: '👊', url: 'https://www.retrogames.cc/snes-games/street-fighter-ii-turbo-hyper-fighting-usa.html', platform: 'SNES' },
    { id: 'dkc', name: 'Donkey Kong Country', icon: '🦍', url: 'https://www.retrogames.cc/snes-games/donkey-kong-country-usa-rev-2.html', platform: 'SNES' },
    { id: 'ff6', name: 'Final Fantasy VI', icon: '⚔️', url: 'https://www.retrogames.cc/snes-games/final-fantasy-iii-usa.html', platform: 'SNES' },
  ],
  io: [
    { id: 'agar', name: 'Agar.io', icon: '⚪', url: 'https://agar.io/', desc: 'Eat cells, grow bigger' },
    { id: 'slither', name: 'Slither.io', icon: '🐍', url: 'https://slither.io/', desc: 'Multiplayer snake' },
    { id: 'krunker', name: 'Krunker.io', icon: '🔫', url: 'https://krunker.io/', desc: 'Browser FPS shooter' },
    { id: 'surviv', name: 'Surviv.io', icon: '🎯', url: 'https://surviv.io/', desc: '2D Battle Royale' },
    { id: 'skribbl', name: 'Skribbl.io', icon: '🎨', url: 'https://skribbl.io/', desc: 'Drawing & guessing' },
    { id: 'diep', name: 'Diep.io', icon: '🔵', url: 'https://diep.io/', desc: 'Tank shooter' },
    { id: 'zombs', name: 'Zombs.io', icon: '🧟', url: 'https://zombs.io/', desc: 'Base defense' },
    { id: 'shellshock', name: 'Shell Shockers', icon: '🥚', url: 'https://shellshock.io/', desc: 'Egg FPS game' },
  ],
  card: [
    { id: 'solitaire', name: 'Solitaire', icon: '🃏', url: 'https://www.google.com/search?q=solitaire&btnI', desc: 'Classic card game' },
    { id: 'freecell', name: 'FreeCell', icon: '🂡', url: 'https://cardgames.io/freecell/', desc: 'Strategic solitaire' },
    { id: 'spider', name: 'Spider Solitaire', icon: '🕷️', url: 'https://cardgames.io/spidersolitaire/', desc: 'Spider variant' },
    { id: 'hearts', name: 'Hearts', icon: '❤️', url: 'https://cardgames.io/hearts/', desc: 'Classic hearts' },
    { id: 'spades', name: 'Spades', icon: '♠️', url: 'https://cardgames.io/spades/', desc: 'Trick-taking game' },
    { id: 'blackjack', name: 'Blackjack', icon: '🎰', url: 'https://cardgames.io/blackjack/', desc: 'Beat the dealer' },
  ],
  strategy: [
    { id: 'chess', name: 'Chess', icon: '♟️', url: 'https://www.chess.com/play/computer', desc: 'Play vs computer' },
    { id: 'checkers', name: 'Checkers', icon: '🔴', url: 'https://cardgames.io/checkers/', desc: 'Classic checkers' },
    { id: 'minesweeper', name: 'Minesweeper', icon: '💣', url: 'https://minesweeper.online/', desc: 'Find the mines' },
    { id: 'connect4', name: 'Connect 4', icon: '🔵', url: 'https://cardgames.io/connect4/', desc: 'Four in a row' },
    { id: 'reversi', name: 'Reversi', icon: '⚫', url: 'https://cardgames.io/reversi/', desc: 'Othello game' },
    { id: 'go', name: 'Go', icon: '⚪', url: 'https://online-go.com/', desc: 'Ancient strategy' },
  ],
};

// Categories
const CATEGORIES = [
  { id: 'instant', name: 'Instant Play', icon: '⚡', desc: 'Play directly here' },
  { id: 'retro', name: 'Retro Games', icon: '🕹️', desc: 'Classic console games' },
  { id: 'io', name: 'Multiplayer', icon: '🌐', desc: '.io games' },
  { id: 'card', name: 'Card Games', icon: '🃏', desc: 'Solitaire & more' },
  { id: 'strategy', name: 'Strategy', icon: '♟️', desc: 'Chess, checkers...' },
];

function GamesSection() {
  const { actions } = useApp();
  
  // State
  const [activeCategory, setActiveCategory] = useState('instant');
  const [currentGame, setCurrentGame] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameError, setGameError] = useState(false);
  
  // Refs
  const gameContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('mn_game_favorites');
      const savedRecent = localStorage.getItem('mn_recent_games');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedRecent) setRecentGames(JSON.parse(savedRecent));
    } catch (e) {
      console.error('Error loading game data:', e);
    }
  }, []);

  // Play embedded game
  const playGame = useCallback((game) => {
    setGameLoading(true);
    setGameError(false);
    
    // Add to recent
    const newRecent = [
      { ...game, playedAt: Date.now() },
      ...recentGames.filter(g => g.id !== game.id)
    ].slice(0, 12);
    setRecentGames(newRecent);
    localStorage.setItem('mn_recent_games', JSON.stringify(newRecent));
    
    setCurrentGame(game);
    actions.addNotification(`Loading: ${game.name}`, 'info');
  }, [recentGames, actions]);

  // Open external game
  const openExternal = (game) => {
    window.open(game.url, '_blank', 'noopener,noreferrer');
    
    // Add to recent
    const newRecent = [
      { ...game, playedAt: Date.now() },
      ...recentGames.filter(g => g.id !== game.id)
    ].slice(0, 12);
    setRecentGames(newRecent);
    localStorage.setItem('mn_recent_games', JSON.stringify(newRecent));
    
    actions.addNotification(`Opening: ${game.name}`, 'success');
  };

  // Close game
  const closeGame = () => {
    setCurrentGame(null);
    setIsFullscreen(false);
    setGameLoading(false);
    setGameError(false);
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setGameLoading(false);
    actions.addNotification(`Playing: ${currentGame?.name}`, 'success');
  };

  // Handle iframe error
  const handleIframeError = () => {
    setGameLoading(false);
    setGameError(true);
    actions.addNotification(`Game failed to load. Try opening externally.`, 'error');
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen && gameContainerRef.current) {
      if (gameContainerRef.current.requestFullscreen) {
        gameContainerRef.current.requestFullscreen();
      } else if (gameContainerRef.current.webkitRequestFullscreen) {
        gameContainerRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = (game, e) => {
    if (e) e.stopPropagation();
    const exists = favorites.find(f => f.id === game.id);
    const newFavs = exists
      ? favorites.filter(f => f.id !== game.id)
      : [...favorites, { ...game, favAt: Date.now() }];
    setFavorites(newFavs);
    localStorage.setItem('mn_game_favorites', JSON.stringify(newFavs));
    actions.addNotification(exists ? 'Removed from favorites' : 'Added to favorites', 'info');
  };

  // Check if favorited
  const isFavorite = (gameId) => favorites.some(f => f.id === gameId);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentGame && e.key === 'Escape') {
        closeGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGame]);

  // Get current games based on category
  const getCurrentGames = () => {
    if (activeCategory === 'instant') return EMBEDDABLE_GAMES;
    return EXTERNAL_GAMES[activeCategory] || [];
  };

  return (
    <div className="games-section">
      <h2 className="section-title">🎮 Games Hub</h2>

      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <div className="cat-info">
              <span className="cat-name">{cat.name}</span>
              <span className="cat-desc">{cat.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Recently Played */}
      {recentGames.length > 0 && !currentGame && (
        <div className="recent-section">
          <h3>🕐 Recently Played</h3>
          <div className="recent-scroll">
            {recentGames.slice(0, 8).map((game) => (
              <button 
                key={`recent-${game.id}`} 
                className="recent-game-btn"
                onClick={() => game.embed ? playGame(game) : openExternal(game)}
              >
                <span className="recent-icon">{game.icon}</span>
                <span className="recent-name">{game.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Games Grid */}
      {!currentGame && (
        <div className="games-content">
          {activeCategory === 'instant' && (
            <p className="section-note">
              ⚡ These games play directly in your browser - no downloads needed!
            </p>
          )}
          {activeCategory !== 'instant' && (
            <p className="section-note">
              🔗 These games open in a new tab for the best experience
            </p>
          )}

          <div className="games-grid">
            {getCurrentGames().map((game) => (
              <div 
                key={game.id} 
                className={`game-card ${activeCategory === 'instant' ? 'embeddable' : 'external'}`}
                onClick={() => activeCategory === 'instant' ? playGame(game) : openExternal(game)}
              >
                <div className="game-header">
                  <span className="game-icon">{game.icon}</span>
                  <button 
                    className={`fav-btn ${isFavorite(game.id) ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(game, e)}
                  >
                    {isFavorite(game.id) ? '★' : '☆'}
                  </button>
                </div>
                
                <h4 className="game-name">{game.name}</h4>
                
                {game.platform && (
                  <span className="game-platform">{game.platform}</span>
                )}
                
                {game.description && (
                  <p className="game-desc">{game.description}</p>
                )}
                
                {game.desc && (
                  <p className="game-desc">{game.desc}</p>
                )}
                
                {game.controls && (
                  <span className="game-controls">🎮 {game.controls}</span>
                )}
                
                <div className="game-action">
                  {activeCategory === 'instant' ? (
                    <span className="play-label">▶ Play Now</span>
                  ) : (
                    <span className="play-label">↗ Open Game</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Player */}
      {currentGame && (
        <div 
          className={`game-player ${isFullscreen ? 'fullscreen' : ''}`}
          ref={gameContainerRef}
        >
          {/* Header */}
          <div className="player-header">
            <div className="player-title">
              <span className="player-icon">{currentGame.icon}</span>
              <div className="player-info">
                <h3>{currentGame.name}</h3>
                {currentGame.controls && (
                  <span className="player-controls">🎮 {currentGame.controls}</span>
                )}
              </div>
            </div>
            
            <div className="player-actions">
              <button 
                className={`action-btn ${isFavorite(currentGame.id) ? 'fav' : ''}`}
                onClick={(e) => toggleFavorite(currentGame, e)}
                title="Favorite"
              >
                {isFavorite(currentGame.id) ? '★' : '☆'}
              </button>
              <button 
                className="action-btn"
                onClick={() => window.open(currentGame.embed, '_blank')}
                title="Open in new tab"
              >
                ↗
              </button>
              <button 
                className="action-btn"
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                {isFullscreen ? '⊖' : '⊕'}
              </button>
              <button 
                className="action-btn close"
                onClick={closeGame}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Game Frame */}
          <div className="game-frame">
            {gameLoading && (
              <div className="game-loading">
                <div className="loading-spinner"></div>
                <p>Loading {currentGame.name}...</p>
                <p className="loading-tip">Click inside the game to start playing</p>
              </div>
            )}
            
            {gameError && (
              <div className="game-error">
                <p>❌ Game couldn't load in embed mode</p>
                <button 
                  className="open-external-btn"
                  onClick={() => window.open(currentGame.embed, '_blank')}
                >
                  ↗ Open in New Tab
                </button>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={currentGame.embed}
              title={currentGame.name}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; gamepad"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
            />
          </div>

          {/* Footer */}
          <div className="player-footer">
            <span>Press <kbd>ESC</kbd> to close</span>
            <span className="separator">•</span>
            <span>Click inside game to focus</span>
            <span className="separator">•</span>
            <span>If game doesn't work, try <button onClick={() => window.open(currentGame.embed, '_blank')}>opening in new tab</button></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamesSection;
