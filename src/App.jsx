/* ========================================
   App.jsx - Main Application Component
   ======================================== */

import React, { useEffect, useCallback, useState } from 'react';
import { useApp } from './context/AppContext';
import { parseShareLink } from './utils/helpers';

// Layout Components
import Header from './components/layout/Header';
import Toolbar from './components/layout/Toolbar';
import Footer from './components/layout/Footer';

// Section Components
import DiscoverSection from './components/sections/DiscoverSection';
import MoviesSection from './components/sections/MoviesSection';
import AnimeSection from './components/sections/AnimeSection';
import TVShowsSection from './components/sections/TVShowsSection';
import LiveTVSection from './components/sections/LiveTVSection';
import GamesSection from './components/sections/GamesSection';
import MusicSection from './components/sections/MusicSection';
import ReadingSection from './components/sections/ReadingSection';
import FocusSection from './components/sections/FocusSection';
import CollectionSection from './components/sections/CollectionSection';
import WatchlistsSection from './components/sections/WatchlistsSection';
import ListsSection from './components/sections/ListsSection';
import StatsSection from './components/sections/StatsSection';

// Common Components
import Notification from './components/common/Notification';
import IntroOverlay from './components/intro/IntroOverlay';

// UI Components
import CustomCursor from './components/ui/CustomCursor';
import CursorTrail from './components/ui/CursorTrail';
import PiPWindow from './components/ui/PiPWindow';
import SmartClock from './components/ui/SmartClock';
import WeatherWidget from './components/ui/WeatherWidget';

// Modal Components
import PlayerModal from './components/modals/PlayerModal';
import CastCrewModal from './components/modals/CastCrewModal';
import ShareModal from './components/modals/ShareModal';
import SettingsModal from './components/modals/SettingsModal';

function App() {
  const { state, actions } = useApp();
  const { currentSection, theme, isMobile, isIntroComplete } = state;

  // Modal states
  const [isPlayerModalOpen, setPlayerModalOpen] = useState(false);
  const [isCastCrewModalOpen, setCastCrewModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // PiP state
  const [pipItem, setPipItem] = useState(null);
  const [pipSource, setPipSource] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for shared collection on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
      try {
        const data = parseShareLink(sharedData);
        if (data && data.collection) {
          const confirmImport = window.confirm(
            `Import shared collection with ${data.collection.length} items?`
          );
          if (confirmImport) {
            actions.importData(data);
            actions.addNotification('Collection imported successfully!', 'success');
            actions.unlockAchievement('importMaster');
          }
        }
        // Clear the URL parameter
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('Failed to parse shared data:', error);
      }
    }
  }, [actions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'Escape':
          // Close all modals
          setPlayerModalOpen(false);
          setCastCrewModalOpen(false);
          setShareModalOpen(false);
          setSettingsModalOpen(false);
          break;
        case '1':
          actions.setSection('discover');
          break;
        case '2':
          actions.setSection('movies');
          break;
        case '3':
          actions.setSection('anime');
          break;
        case '4':
          actions.setSection('tvshows');
          break;
        case '5':
          actions.setSection('livetv');
          break;
        case '6':
          actions.setSection('collection');
          break;
        case '7':
          actions.setSection('watchlists');
          break;
        case '8':
          actions.setSection('lists');
          break;
        case '9':
          actions.setSection('stats');
          break;
        case 't':
        case 'T':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            actions.toggleTheme();
          }
          break;
        case '/':
          e.preventDefault();
          document.querySelector('.search-input')?.focus();
          break;
        case '?':
          // Could show keyboard shortcuts modal
          break;
        case 'c':
        case 'C':
          // Toggle clock
          if (window.toggleSmartClock) {
            window.toggleSmartClock();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  // Handle play (open player modal)
  const handlePlay = useCallback((item) => {
    setCurrentItem(item);
    setPlayerModalOpen(true);
  }, []);

  // Handle edit (open settings modal)
  const handleEdit = useCallback((item) => {
    setEditItem(item);
    setSettingsModalOpen(true);
  }, []);

  // Handle cast/crew modal
  const handleShowCastCrew = useCallback((item) => {
    setCurrentItem(item);
    setCastCrewModalOpen(true);
  }, []);

  // Handle PiP
  const handleOpenPiP = useCallback((item, source) => {
    setPipItem(item);
    setPipSource(source);
    setPlayerModalOpen(false);
  }, []);

  const handleClosePiP = useCallback(() => {
    setPipItem(null);
    setPipSource(null);
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Switch to appropriate section based on current section
    if (currentSection === 'collection' || currentSection === 'watchlists' || 
        currentSection === 'lists' || currentSection === 'stats') {
      actions.setSection('discover');
    }
  }, [currentSection, actions]);

  // Render current section
  const renderSection = () => {
    const sectionProps = {
      onPlay: handlePlay,
      onEdit: handleEdit,
      searchQuery: searchQuery
    };

    switch (currentSection) {
      case 'discover':
        return <DiscoverSection {...sectionProps} />;
      case 'movies':
        return <MoviesSection {...sectionProps} />;
      case 'anime':
        return <AnimeSection {...sectionProps} />;
      case 'tvshows':
        return <TVShowsSection {...sectionProps} />;
      case 'livetv':
        return <LiveTVSection />;
      case 'games':
        return <GamesSection />;
      case 'music':
        return <MusicSection />;
      case 'reading':
        return <ReadingSection />;
      case 'focus':
        return <FocusSection />;
      case 'collection':
        return <CollectionSection {...sectionProps} />;
      case 'watchlists':
        return <WatchlistsSection {...sectionProps} />;
      case 'lists':
        return <ListsSection {...sectionProps} onShare={() => setShareModalOpen(true)} />;
      case 'stats':
        return <StatsSection />;
      default:
        return <DiscoverSection {...sectionProps} />;
    }
  };

  return (
    <div className="app" data-theme={theme}>
      {/* Intro Overlay */}
      {!isIntroComplete && <IntroOverlay />}

      {/* Custom Cursor (desktop only) */}
      {!isMobile && <CustomCursor />}
      {!isMobile && <CursorTrail />}

      {/* Notifications */}
      <Notification />

      {/* Header with Navigation */}
      <Header />

      {/* Toolbar */}
      <Toolbar onSearch={handleSearch} />

      {/* Main Content */}
      <main className="main-content">
        {renderSection()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Picture-in-Picture Window */}
      {pipItem && (
        <PiPWindow
          item={pipItem}
          source={pipSource}
          onClose={handleClosePiP}
        />
      )}

      {/* Smart Clock */}
      <SmartClock currentItem={currentItem} />

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Modals */}
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setPlayerModalOpen(false)}
        item={currentItem}
        onShowCastCrew={handleShowCastCrew}
        onOpenPiP={handleOpenPiP}
      />

      <CastCrewModal
        isOpen={isCastCrewModalOpen}
        onClose={() => setCastCrewModalOpen(false)}
        item={currentItem}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        item={editItem}
      />
    </div>
  );
}

export default App;
