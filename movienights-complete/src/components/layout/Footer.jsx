/* ========================================
   Footer.jsx - Footer Component
   ======================================== */

import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">🎬</span>
          <span className="footer-title">MovieNights Ultimate</span>
        </div>
        <div className="footer-info">
          <p className="footer-creator">
            Created by <span className="creator-name">Morpheus</span>
          </p>
          <p className="footer-text">
            Powered by <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a> & <a href="https://anilist.co" target="_blank" rel="noopener noreferrer">AniList</a>
          </p>
          <p className="footer-copyright">
            © {new Date().getFullYear()} MovieNights Ultimate
          </p>
        </div>
        <div className="footer-shortcuts">
          <span className="shortcut-hint">Press <kbd>?</kbd> for keyboard shortcuts</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
