/* ========================================
   ReadingSection.jsx - eBooks & Comics Hub
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ReadingSection.css';

// eBook sources
const EBOOK_SOURCES = {
  free: {
    name: '📖 Free eBooks',
    description: 'Legal free books',
    sites: [
      { id: 'gutenberg', name: 'Project Gutenberg', icon: '📚', url: 'https://www.gutenberg.org/', description: '70,000+ free classics' },
      { id: 'archive', name: 'Internet Archive', icon: '🏛️', url: 'https://archive.org/details/texts', description: 'Millions of free texts' },
      { id: 'openlibrary', name: 'Open Library', icon: '📖', url: 'https://openlibrary.org/', description: 'Borrow free books' },
      { id: 'standardebooks', name: 'Standard Ebooks', icon: '✨', url: 'https://standardebooks.org/', description: 'Beautifully formatted classics' },
      { id: 'manybooks', name: 'ManyBooks', icon: '📕', url: 'https://manybooks.net/', description: '50,000+ free titles' },
      { id: 'feedbooks', name: 'Feedbooks', icon: '📗', url: 'https://www.feedbooks.com/publicdomain', description: 'Public domain books' },
      { id: 'librivox', name: 'LibriVox', icon: '🎧', url: 'https://librivox.org/', description: 'Free audiobooks' },
      { id: 'loyalbooks', name: 'Loyal Books', icon: '🔊', url: 'http://www.loyalbooks.com/', description: 'Free audiobooks & ebooks' }
    ]
  },
  libraries: {
    name: '🏛️ Digital Libraries',
    description: 'Library resources',
    sites: [
      { id: 'overdrive', name: 'OverDrive/Libby', icon: '📱', url: 'https://www.overdrive.com/', description: 'Library ebooks & audiobooks' },
      { id: 'hoopla', name: 'Hoopla', icon: '🎬', url: 'https://www.hoopladigital.com/', description: 'Library streaming' },
      { id: 'kanopy', name: 'Kanopy', icon: '🎥', url: 'https://www.kanopy.com/', description: 'Library films' },
      { id: 'worldcat', name: 'WorldCat', icon: '🌍', url: 'https://www.worldcat.org/', description: 'Find library books' }
    ]
  },
  stores: {
    name: '🛒 Book Stores',
    description: 'Buy ebooks',
    sites: [
      { id: 'kindle', name: 'Kindle Store', icon: '📘', url: 'https://www.amazon.com/kindle-dbs/storefront', description: 'Amazon Kindle' },
      { id: 'kobo', name: 'Kobo', icon: '📙', url: 'https://www.kobo.com/', description: 'Kobo eBooks' },
      { id: 'google-books', name: 'Google Books', icon: '📚', url: 'https://books.google.com/', description: 'Google Play Books' },
      { id: 'apple-books', name: 'Apple Books', icon: '🍎', url: 'https://www.apple.com/apple-books/', description: 'Apple Books' },
      { id: 'scribd', name: 'Scribd', icon: '📜', url: 'https://www.scribd.com/', description: 'Subscription service' },
      { id: 'audible', name: 'Audible', icon: '🎧', url: 'https://www.audible.com/', description: 'Audiobooks' }
    ]
  }
};

// Comic sources
const COMIC_SOURCES = {
  manga: {
    name: '🎌 Manga',
    description: 'Read manga online',
    sites: [
      { id: 'mangadex', name: 'MangaDex', icon: '📖', url: 'https://mangadex.org/', description: 'Free manga reader', featured: true },
      { id: 'mangaplus', name: 'MANGA Plus', icon: '🔴', url: 'https://mangaplus.shueisha.co.jp/', description: 'Official Shueisha', featured: true },
      { id: 'viz', name: 'VIZ Manga', icon: '📕', url: 'https://www.viz.com/shonenjump', description: 'Shonen Jump official' },
      { id: 'crunchyroll-manga', name: 'Crunchyroll Manga', icon: '🟠', url: 'https://www.crunchyroll.com/comics/manga', description: 'Crunchyroll manga' },
      { id: 'mangasee', name: 'MangaSee', icon: '👁️', url: 'https://mangasee123.com/', description: 'Large manga library' },
      { id: 'manganato', name: 'MangaNato', icon: '📗', url: 'https://manganato.com/', description: 'Popular manga site' },
      { id: 'webtoon', name: 'Webtoon', icon: '📱', url: 'https://www.webtoons.com/', description: 'Korean webcomics', featured: true },
      { id: 'tapas', name: 'Tapas', icon: '🎨', url: 'https://tapas.io/', description: 'Webcomics & novels' }
    ]
  },
  comics: {
    name: '🦸 Comics',
    description: 'Western comics',
    sites: [
      { id: 'marvel-unlimited', name: 'Marvel Unlimited', icon: '🔴', url: 'https://www.marvel.com/unlimited', description: 'Marvel comics subscription' },
      { id: 'dc-universe', name: 'DC Universe', icon: '🔵', url: 'https://www.dcuniverseinfinite.com/', description: 'DC comics subscription' },
      { id: 'comixology', name: 'Comixology', icon: '📚', url: 'https://www.comixology.com/', description: 'Digital comics store' },
      { id: 'comic-book-plus', name: 'Comic Book Plus', icon: '💫', url: 'https://comicbookplus.com/', description: 'Free golden age comics' },
      { id: 'digital-comic-museum', name: 'Digital Comic Museum', icon: '🏛️', url: 'https://digitalcomicmuseum.com/', description: 'Public domain comics' },
      { id: 'getcomics', name: 'GetComics', icon: '📥', url: 'https://getcomics.org/', description: 'Comic downloads' }
    ]
  },
  webcomics: {
    name: '🌐 Webcomics',
    description: 'Online comics',
    sites: [
      { id: 'xkcd', name: 'xkcd', icon: '🔬', url: 'https://xkcd.com/', description: 'Science & tech humor' },
      { id: 'smbc', name: 'SMBC', icon: '😄', url: 'https://www.smbc-comics.com/', description: 'Saturday Morning Breakfast Cereal' },
      { id: 'oatmeal', name: 'The Oatmeal', icon: '🐱', url: 'https://theoatmeal.com/', description: 'Humor comics' },
      { id: 'explosm', name: 'Cyanide & Happiness', icon: '😈', url: 'https://explosm.net/', description: 'Dark humor' },
      { id: 'dilbert', name: 'Dilbert', icon: '👔', url: 'https://dilbert.com/', description: 'Office humor' },
      { id: 'gocomics', name: 'GoComics', icon: '📰', url: 'https://www.gocomics.com/', description: 'Newspaper comics' },
      { id: 'webtoons', name: 'Webtoons', icon: '📱', url: 'https://www.webtoons.com/', description: 'Vertical scroll comics' },
      { id: 'comicfury', name: 'Comic Fury', icon: '🔥', url: 'https://comicfury.com/', description: 'Indie webcomics' }
    ]
  }
};

// Popular manga list
const POPULAR_MANGA = [
  { id: 'one-piece', name: 'One Piece', icon: '🏴‍☠️', chapters: '1100+', status: 'Ongoing' },
  { id: 'jjk', name: 'Jujutsu Kaisen', icon: '👁️', chapters: '250+', status: 'Ongoing' },
  { id: 'chainsaw-man', name: 'Chainsaw Man', icon: '⛓️', chapters: '160+', status: 'Ongoing' },
  { id: 'my-hero', name: 'My Hero Academia', icon: '💪', chapters: '420+', status: 'Completed' },
  { id: 'demon-slayer', name: 'Demon Slayer', icon: '🗡️', chapters: '205', status: 'Completed' },
  { id: 'spy-x-family', name: 'Spy x Family', icon: '🕵️', chapters: '100+', status: 'Ongoing' },
  { id: 'aot', name: 'Attack on Titan', icon: '⚔️', chapters: '139', status: 'Completed' },
  { id: 'hxh', name: 'Hunter x Hunter', icon: '🎯', chapters: '400+', status: 'Hiatus' },
  { id: 'solo-leveling', name: 'Solo Leveling', icon: '⬆️', chapters: '179', status: 'Completed' },
  { id: 'naruto', name: 'Naruto', icon: '🍥', chapters: '700', status: 'Completed' },
  { id: 'bleach', name: 'Bleach', icon: '☠️', chapters: '686', status: 'Completed' },
  { id: 'dragon-ball', name: 'Dragon Ball', icon: '🐉', chapters: '520', status: 'Completed' }
];

// Reading list categories
const READING_CATEGORIES = [
  { id: 'classic', name: 'Classic Literature', icon: '📜' },
  { id: 'scifi', name: 'Science Fiction', icon: '🚀' },
  { id: 'fantasy', name: 'Fantasy', icon: '🧙' },
  { id: 'mystery', name: 'Mystery & Thriller', icon: '🔍' },
  { id: 'romance', name: 'Romance', icon: '💕' },
  { id: 'horror', name: 'Horror', icon: '👻' },
  { id: 'nonfiction', name: 'Non-Fiction', icon: '📊' },
  { id: 'philosophy', name: 'Philosophy', icon: '🤔' }
];

function ReadingSection() {
  const { actions } = useApp();
  const [activeTab, setActiveTab] = useState('ebooks');
  const [activeCategory, setActiveCategory] = useState('free');
  const [comicCategory, setComicCategory] = useState('manga');
  const [favorites, setFavorites] = useState([]);
  const [readingList, setReadingList] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('movienights_reading_favorites');
      const savedList = localStorage.getItem('movienights_reading_list');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedList) setReadingList(JSON.parse(savedList));
    } catch (e) {
      console.error('Error loading reading data:', e);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = (item) => {
    const key = `${item.type || 'site'}-${item.id}`;
    const newFavorites = favorites.includes(key)
      ? favorites.filter(f => f !== key)
      : [...favorites, key];
    
    setFavorites(newFavorites);
    localStorage.setItem('movienights_reading_favorites', JSON.stringify(newFavorites));
  };

  // Add to reading list
  const addToReadingList = (manga) => {
    if (readingList.find(m => m.id === manga.id)) {
      actions.addNotification(`${manga.name} is already in your list`, 'info');
      return;
    }
    
    const newList = [...readingList, { ...manga, addedAt: Date.now() }];
    setReadingList(newList);
    localStorage.setItem('movienights_reading_list', JSON.stringify(newList));
    actions.addNotification(`Added ${manga.name} to reading list!`, 'success');
  };

  // Remove from reading list
  const removeFromReadingList = (mangaId) => {
    const newList = readingList.filter(m => m.id !== mangaId);
    setReadingList(newList);
    localStorage.setItem('movienights_reading_list', JSON.stringify(newList));
  };

  // Open site
  const openSite = (url) => {
    window.open(url, '_blank');
  };

  // Search manga
  const searchManga = (name) => {
    window.open(`https://mangadex.org/search?q=${encodeURIComponent(name)}`, '_blank');
  };

  return (
    <div className="reading-section">
      <h2 className="section-title">📚 eBooks & Comics</h2>

      {/* Main Tabs */}
      <div className="main-tabs">
        <button
          className={`main-tab ${activeTab === 'ebooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('ebooks')}
        >
          📖 eBooks
        </button>
        <button
          className={`main-tab ${activeTab === 'comics' ? 'active' : ''}`}
          onClick={() => setActiveTab('comics')}
        >
          🦸 Comics & Manga
        </button>
      </div>

      {/* eBooks Section */}
      {activeTab === 'ebooks' && (
        <div className="ebooks-content">
          {/* Category Tabs */}
          <div className="category-tabs">
            {Object.entries(EBOOK_SOURCES).map(([key, category]) => (
              <button
                key={key}
                className={`category-tab ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sites Grid */}
          <div className="sites-section">
            <p className="section-description">{EBOOK_SOURCES[activeCategory].description}</p>
            <div className="sites-grid">
              {EBOOK_SOURCES[activeCategory].sites.map((site) => (
                <div
                  key={site.id}
                  className="site-card"
                  onClick={() => openSite(site.url)}
                >
                  <span className="site-icon">{site.icon}</span>
                  <div className="site-info">
                    <h4>{site.name}</h4>
                    <p>{site.description}</p>
                  </div>
                  <span className="external-arrow">↗</span>
                </div>
              ))}
            </div>
          </div>

          {/* Genre Categories */}
          <div className="genre-section">
            <h3>📚 Browse by Genre</h3>
            <div className="genre-grid">
              {READING_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className="genre-btn"
                  onClick={() => openSite(`https://www.gutenberg.org/ebooks/bookshelf/${category.id}`)}
                >
                  <span className="genre-icon">{category.icon}</span>
                  <span className="genre-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comics Section */}
      {activeTab === 'comics' && (
        <div className="comics-content">
          {/* Comic Category Tabs */}
          <div className="category-tabs">
            {Object.entries(COMIC_SOURCES).map(([key, category]) => (
              <button
                key={key}
                className={`category-tab ${comicCategory === key ? 'active' : ''}`}
                onClick={() => setComicCategory(key)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sites Grid */}
          <div className="sites-section">
            <p className="section-description">{COMIC_SOURCES[comicCategory].description}</p>
            <div className="sites-grid">
              {COMIC_SOURCES[comicCategory].sites.map((site) => (
                <div
                  key={site.id}
                  className={`site-card ${site.featured ? 'featured' : ''}`}
                  onClick={() => openSite(site.url)}
                >
                  {site.featured && <span className="featured-badge">⭐ Recommended</span>}
                  <span className="site-icon">{site.icon}</span>
                  <div className="site-info">
                    <h4>{site.name}</h4>
                    <p>{site.description}</p>
                  </div>
                  <span className="external-arrow">↗</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Manga */}
          {comicCategory === 'manga' && (
            <div className="popular-manga">
              <h3>🔥 Popular Manga</h3>
              <div className="manga-grid">
                {POPULAR_MANGA.map((manga) => (
                  <div key={manga.id} className="manga-card">
                    <span className="manga-icon">{manga.icon}</span>
                    <div className="manga-info">
                      <h4>{manga.name}</h4>
                      <div className="manga-meta">
                        <span className="chapters">{manga.chapters} chapters</span>
                        <span className={`status ${manga.status.toLowerCase()}`}>
                          {manga.status}
                        </span>
                      </div>
                    </div>
                    <div className="manga-actions">
                      <button
                        className="manga-btn read-btn"
                        onClick={() => searchManga(manga.name)}
                        title="Read on MangaDex"
                      >
                        📖
                      </button>
                      <button
                        className={`manga-btn list-btn ${readingList.find(m => m.id === manga.id) ? 'in-list' : ''}`}
                        onClick={() => readingList.find(m => m.id === manga.id) 
                          ? removeFromReadingList(manga.id) 
                          : addToReadingList(manga)}
                        title={readingList.find(m => m.id === manga.id) ? 'Remove from list' : 'Add to reading list'}
                      >
                        {readingList.find(m => m.id === manga.id) ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reading List */}
          {readingList.length > 0 && (
            <div className="reading-list-section">
              <h3>📋 Your Reading List ({readingList.length})</h3>
              <div className="reading-list">
                {readingList.map((manga) => (
                  <div key={manga.id} className="reading-list-item">
                    <span className="item-icon">{manga.icon}</span>
                    <span className="item-name">{manga.name}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromReadingList(manga.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="quick-links">
        <h3>🔗 More Resources</h3>
        <div className="quick-links-grid">
          <a href="https://www.goodreads.com/" target="_blank" rel="noopener noreferrer">Goodreads</a>
          <a href="https://www.bookdepository.com/" target="_blank" rel="noopener noreferrer">Book Depository</a>
          <a href="https://myanimelist.net/manga.php" target="_blank" rel="noopener noreferrer">MyAnimeList Manga</a>
          <a href="https://anilist.co/search/manga" target="_blank" rel="noopener noreferrer">AniList Manga</a>
          <a href="https://www.reddit.com/r/manga/" target="_blank" rel="noopener noreferrer">r/manga</a>
          <a href="https://www.reddit.com/r/books/" target="_blank" rel="noopener noreferrer">r/books</a>
        </div>
      </div>
    </div>
  );
}

export default ReadingSection;
