/* ========================================
   ReadingSection.jsx - eBooks & Comics Hub (Fixed)
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ReadingSection.css';

// eBook sources with correct URLs
const EBOOK_SOURCES = {
  free: {
    name: '📖 Free eBooks',
    sites: [
      { id: 'gutenberg', name: 'Project Gutenberg', icon: '📚', url: 'https://www.gutenberg.org/', desc: '70,000+ free classics' },
      { id: 'archive', name: 'Internet Archive', icon: '🏛️', url: 'https://archive.org/details/texts', desc: 'Millions of free texts' },
      { id: 'openlibrary', name: 'Open Library', icon: '📖', url: 'https://openlibrary.org/', desc: 'Borrow free books' },
      { id: 'standardebooks', name: 'Standard Ebooks', icon: '✨', url: 'https://standardebooks.org/', desc: 'Beautifully formatted' },
      { id: 'manybooks', name: 'ManyBooks', icon: '📕', url: 'https://manybooks.net/', desc: '50,000+ free titles' },
      { id: 'feedbooks', name: 'Feedbooks', icon: '📗', url: 'https://www.feedbooks.com/publicdomain', desc: 'Public domain books' },
      { id: 'librivox', name: 'LibriVox', icon: '🎧', url: 'https://librivox.org/', desc: 'Free audiobooks' },
      { id: 'loyalbooks', name: 'Loyal Books', icon: '🔊', url: 'http://www.loyalbooks.com/', desc: 'Audiobooks & ebooks' }
    ]
  },
  libraries: {
    name: '🏛️ Digital Libraries',
    sites: [
      { id: 'overdrive', name: 'OverDrive/Libby', icon: '📱', url: 'https://www.overdrive.com/', desc: 'Library ebooks' },
      { id: 'hoopla', name: 'Hoopla', icon: '🎬', url: 'https://www.hoopladigital.com/', desc: 'Library streaming' },
      { id: 'kanopy', name: 'Kanopy', icon: '🎥', url: 'https://www.kanopy.com/', desc: 'Library films' },
      { id: 'worldcat', name: 'WorldCat', icon: '🌍', url: 'https://www.worldcat.org/', desc: 'Find library books' }
    ]
  },
  stores: {
    name: '🛒 Book Stores',
    sites: [
      { id: 'kindle', name: 'Kindle Store', icon: '📘', url: 'https://www.amazon.com/kindle-dbs/storefront', desc: 'Amazon Kindle' },
      { id: 'kobo', name: 'Kobo', icon: '📙', url: 'https://www.kobo.com/', desc: 'Kobo eBooks' },
      { id: 'google-books', name: 'Google Books', icon: '📚', url: 'https://books.google.com/', desc: 'Google Play Books' },
      { id: 'apple-books', name: 'Apple Books', icon: '🍎', url: 'https://www.apple.com/apple-books/', desc: 'Apple Books' },
      { id: 'scribd', name: 'Scribd', icon: '📜', url: 'https://www.scribd.com/', desc: 'Subscription service' },
      { id: 'audible', name: 'Audible', icon: '🎧', url: 'https://www.audible.com/', desc: 'Audiobooks' }
    ]
  }
};

// Comic/Manga sources
const COMIC_SOURCES = {
  manga: {
    name: '🎌 Manga',
    sites: [
      { id: 'mangadex', name: 'MangaDex', icon: '📖', url: 'https://mangadex.org/', desc: 'Free manga reader', featured: true },
      { id: 'mangaplus', name: 'MANGA Plus', icon: '🔴', url: 'https://mangaplus.shueisha.co.jp/', desc: 'Official Shueisha', featured: true },
      { id: 'viz', name: 'VIZ Manga', icon: '📕', url: 'https://www.viz.com/shonenjump', desc: 'Shonen Jump official' },
      { id: 'mangasee', name: 'MangaSee', icon: '👁️', url: 'https://mangasee123.com/', desc: 'Large manga library' },
      { id: 'manganato', name: 'MangaNato', icon: '📗', url: 'https://manganato.com/', desc: 'Popular manga site' },
      { id: 'webtoon', name: 'Webtoon', icon: '📱', url: 'https://www.webtoons.com/', desc: 'Korean webcomics', featured: true },
      { id: 'tapas', name: 'Tapas', icon: '🎨', url: 'https://tapas.io/', desc: 'Webcomics & novels' }
    ]
  },
  comics: {
    name: '🦸 Comics',
    sites: [
      { id: 'marvel', name: 'Marvel Unlimited', icon: '🔴', url: 'https://www.marvel.com/unlimited', desc: 'Marvel subscription' },
      { id: 'dc', name: 'DC Universe', icon: '🔵', url: 'https://www.dcuniverseinfinite.com/', desc: 'DC subscription' },
      { id: 'comixology', name: 'Comixology', icon: '📚', url: 'https://www.amazon.com/kindle-dbs/comics-store/', desc: 'Digital comics' },
      { id: 'comicbookplus', name: 'Comic Book Plus', icon: '💫', url: 'https://comicbookplus.com/', desc: 'Free golden age' },
      { id: 'digitalcomic', name: 'Digital Comic Museum', icon: '🏛️', url: 'https://digitalcomicmuseum.com/', desc: 'Public domain' }
    ]
  },
  webcomics: {
    name: '🌐 Webcomics',
    sites: [
      { id: 'xkcd', name: 'xkcd', icon: '🔬', url: 'https://xkcd.com/', desc: 'Science & tech humor' },
      { id: 'smbc', name: 'SMBC', icon: '😄', url: 'https://www.smbc-comics.com/', desc: 'Saturday Morning' },
      { id: 'oatmeal', name: 'The Oatmeal', icon: '🐱', url: 'https://theoatmeal.com/', desc: 'Humor comics' },
      { id: 'explosm', name: 'Cyanide & Happiness', icon: '😈', url: 'https://explosm.net/', desc: 'Dark humor' },
      { id: 'gocomics', name: 'GoComics', icon: '📰', url: 'https://www.gocomics.com/', desc: 'Newspaper comics' },
      { id: 'webtoons', name: 'Webtoons', icon: '📱', url: 'https://www.webtoons.com/', desc: 'Vertical scroll' }
    ]
  }
};

// Popular manga with direct MangaDex links
const POPULAR_MANGA = [
  { id: 'one-piece', name: 'One Piece', icon: '🏴‍☠️', chapters: '1100+', status: 'Ongoing', searchQuery: 'one piece' },
  { id: 'jjk', name: 'Jujutsu Kaisen', icon: '👁️', chapters: '250+', status: 'Ended', searchQuery: 'jujutsu kaisen' },
  { id: 'chainsaw', name: 'Chainsaw Man', icon: '⛓️', chapters: '160+', status: 'Ongoing', searchQuery: 'chainsaw man' },
  { id: 'mha', name: 'My Hero Academia', icon: '💪', chapters: '420+', status: 'Ended', searchQuery: 'my hero academia' },
  { id: 'demon-slayer', name: 'Demon Slayer', icon: '🗡️', chapters: '205', status: 'Ended', searchQuery: 'demon slayer' },
  { id: 'spy', name: 'Spy x Family', icon: '🕵️', chapters: '100+', status: 'Ongoing', searchQuery: 'spy x family' },
  { id: 'aot', name: 'Attack on Titan', icon: '⚔️', chapters: '139', status: 'Ended', searchQuery: 'attack on titan' },
  { id: 'hxh', name: 'Hunter x Hunter', icon: '🎯', chapters: '400+', status: 'Hiatus', searchQuery: 'hunter x hunter' },
  { id: 'solo', name: 'Solo Leveling', icon: '⬆️', chapters: '179', status: 'Ended', searchQuery: 'solo leveling' },
  { id: 'naruto', name: 'Naruto', icon: '🍥', chapters: '700', status: 'Ended', searchQuery: 'naruto' },
  { id: 'bleach', name: 'Bleach', icon: '☠️', chapters: '686', status: 'Ended', searchQuery: 'bleach' },
  { id: 'db', name: 'Dragon Ball', icon: '🐉', chapters: '520', status: 'Ended', searchQuery: 'dragon ball' }
];

// Book genres with correct Gutenberg URLs
const BOOK_GENRES = [
  { id: 'classic', name: 'Classic Literature', icon: '📜', url: 'https://www.gutenberg.org/ebooks/bookshelf/153' },
  { id: 'scifi', name: 'Science Fiction', icon: '🚀', url: 'https://www.gutenberg.org/ebooks/bookshelf/68' },
  { id: 'fantasy', name: 'Fantasy', icon: '🧙', url: 'https://www.gutenberg.org/ebooks/bookshelf/46' },
  { id: 'mystery', name: 'Mystery', icon: '🔍', url: 'https://www.gutenberg.org/ebooks/bookshelf/42' },
  { id: 'romance', name: 'Romance', icon: '💕', url: 'https://www.gutenberg.org/ebooks/bookshelf/56' },
  { id: 'horror', name: 'Horror', icon: '👻', url: 'https://www.gutenberg.org/ebooks/bookshelf/32' },
  { id: 'adventure', name: 'Adventure', icon: '🗺️', url: 'https://www.gutenberg.org/ebooks/bookshelf/26' },
  { id: 'philosophy', name: 'Philosophy', icon: '🤔', url: 'https://www.gutenberg.org/ebooks/bookshelf/51' }
];

// Classic books quick access
const CLASSIC_BOOKS = [
  { name: 'Pride and Prejudice', author: 'Jane Austen', url: 'https://www.gutenberg.org/ebooks/1342' },
  { name: '1984', author: 'George Orwell', url: 'https://www.gutenberg.org/ebooks/67474' },
  { name: 'Frankenstein', author: 'Mary Shelley', url: 'https://www.gutenberg.org/ebooks/84' },
  { name: 'Dracula', author: 'Bram Stoker', url: 'https://www.gutenberg.org/ebooks/345' },
  { name: 'The Great Gatsby', author: 'F. Scott Fitzgerald', url: 'https://www.gutenberg.org/ebooks/64317' },
  { name: 'Moby Dick', author: 'Herman Melville', url: 'https://www.gutenberg.org/ebooks/2701' },
  { name: 'War and Peace', author: 'Leo Tolstoy', url: 'https://www.gutenberg.org/ebooks/2600' },
  { name: 'The Odyssey', author: 'Homer', url: 'https://www.gutenberg.org/ebooks/1727' }
];

function ReadingSection() {
  const { actions } = useApp();
  const [activeTab, setActiveTab] = useState('ebooks');
  const [ebookCategory, setEbookCategory] = useState('free');
  const [comicCategory, setComicCategory] = useState('manga');
  const [readingList, setReadingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load reading list
  useEffect(() => {
    try {
      const savedList = localStorage.getItem('movienights_reading_list');
      if (savedList) setReadingList(JSON.parse(savedList));
    } catch (e) {
      console.error('Error loading reading list:', e);
    }
  }, []);

  // Open external site
  const openSite = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Search for manga on MangaDex
  const searchManga = (query) => {
    openSite(`https://mangadex.org/search?q=${encodeURIComponent(query)}`);
  };

  // Search for books
  const searchBooks = () => {
    if (!searchQuery.trim()) return;
    openSite(`https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(searchQuery)}`);
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
  const removeFromReadingList = (id) => {
    const newList = readingList.filter(m => m.id !== id);
    setReadingList(newList);
    localStorage.setItem('movienights_reading_list', JSON.stringify(newList));
    actions.addNotification('Removed from reading list', 'info');
  };

  return (
    <div className="reading-section">
      <h2 className="section-title">📚 Reading Hub</h2>

      {/* Main Tabs */}
      <div className="reading-tabs">
        <button 
          className={`reading-tab ${activeTab === 'ebooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('ebooks')}
        >
          📖 eBooks
        </button>
        <button 
          className={`reading-tab ${activeTab === 'comics' ? 'active' : ''}`}
          onClick={() => setActiveTab('comics')}
        >
          🎨 Comics & Manga
        </button>
      </div>

      {/* eBooks Section */}
      {activeTab === 'ebooks' && (
        <div className="ebooks-content">
          {/* Search */}
          <div className="book-search">
            <input
              type="text"
              placeholder="Search for books on Project Gutenberg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
            />
            <button onClick={searchBooks}>🔍</button>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            {Object.entries(EBOOK_SOURCES).map(([key, category]) => (
              <button
                key={key}
                className={`category-tab ${ebookCategory === key ? 'active' : ''}`}
                onClick={() => setEbookCategory(key)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sites Grid */}
          <div className="sites-grid">
            {EBOOK_SOURCES[ebookCategory].sites.map((site) => (
              <div
                key={site.id}
                className="site-card"
                onClick={() => openSite(site.url)}
              >
                <span className="site-icon">{site.icon}</span>
                <div className="site-info">
                  <h4>{site.name}</h4>
                  <p>{site.desc}</p>
                </div>
                <span className="external-arrow">↗</span>
              </div>
            ))}
          </div>

          {/* Book Genres */}
          <div className="genres-section">
            <h3>📚 Browse by Genre</h3>
            <div className="genres-grid">
              {BOOK_GENRES.map((genre) => (
                <button
                  key={genre.id}
                  className="genre-btn"
                  onClick={() => openSite(genre.url)}
                >
                  <span className="genre-icon">{genre.icon}</span>
                  <span className="genre-name">{genre.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Classic Books */}
          <div className="classics-section">
            <h3>📖 Popular Classics</h3>
            <div className="classics-grid">
              {CLASSIC_BOOKS.map((book, index) => (
                <div
                  key={index}
                  className="classic-card"
                  onClick={() => openSite(book.url)}
                >
                  <h4>{book.name}</h4>
                  <p>{book.author}</p>
                  <span className="read-badge">Read Free →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comics/Manga Section */}
      {activeTab === 'comics' && (
        <div className="comics-content">
          {/* Category Tabs */}
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
                  <p>{site.desc}</p>
                </div>
                <span className="external-arrow">↗</span>
              </div>
            ))}
          </div>

          {/* Popular Manga */}
          {comicCategory === 'manga' && (
            <div className="manga-section">
              <h3>🔥 Popular Manga</h3>
              <div className="manga-grid">
                {POPULAR_MANGA.map((manga) => (
                  <div key={manga.id} className="manga-card">
                    <span className="manga-icon">{manga.icon}</span>
                    <div className="manga-info">
                      <h4>{manga.name}</h4>
                      <div className="manga-meta">
                        <span className="chapters">{manga.chapters} ch</span>
                        <span className={`status ${manga.status.toLowerCase()}`}>
                          {manga.status}
                        </span>
                      </div>
                    </div>
                    <div className="manga-actions">
                      <button
                        className="manga-btn read"
                        onClick={() => searchManga(manga.searchQuery)}
                        title="Read on MangaDex"
                      >
                        📖 Read
                      </button>
                      <button
                        className={`manga-btn list ${readingList.find(m => m.id === manga.id) ? 'in-list' : ''}`}
                        onClick={() => readingList.find(m => m.id === manga.id) 
                          ? removeFromReadingList(manga.id) 
                          : addToReadingList(manga)}
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
                      className="item-read"
                      onClick={() => searchManga(manga.searchQuery || manga.name)}
                    >
                      📖
                    </button>
                    <button
                      className="item-remove"
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
      <div className="quick-links-section">
        <h3>🔗 More Resources</h3>
        <div className="quick-links">
          <a href="https://www.goodreads.com/" target="_blank" rel="noopener noreferrer">Goodreads</a>
          <a href="https://myanimelist.net/manga.php" target="_blank" rel="noopener noreferrer">MAL Manga</a>
          <a href="https://anilist.co/search/manga" target="_blank" rel="noopener noreferrer">AniList</a>
          <a href="https://www.reddit.com/r/manga/" target="_blank" rel="noopener noreferrer">r/manga</a>
          <a href="https://www.reddit.com/r/books/" target="_blank" rel="noopener noreferrer">r/books</a>
          <a href="https://www.reddit.com/r/FreeEBOOKS/" target="_blank" rel="noopener noreferrer">r/FreeEBOOKS</a>
        </div>
      </div>
    </div>
  );
}

export default ReadingSection;
