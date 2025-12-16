/* ========================================
   ShareModal.jsx - Share Collection Modal Component
   ======================================== */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import { createShareLink, generateQRCode } from '../../utils/helpers';
import ModalBackdrop, { ModalContent, ModalHeader, ModalBody } from '../common/ModalBackdrop';
import './ShareModal.css';

function ShareModal({ isOpen, onClose }) {
  const { actions } = useApp();
  const { collection, watchlists, stats } = useCollection();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      generateShareData();
    }
  }, [isOpen, collection, watchlists]);

  const generateShareData = () => {
    const shareData = {
      collection: collection.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title || item.name,
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        userRating: item.userRating,
        status: item.status
      })),
      watchlists: watchlists,
      timestamp: Date.now(),
      user: 'MovieNights User'
    };

    const url = createShareLink(shareData);
    setShareUrl(url);

    // Generate QR code
    if (qrCanvasRef.current) {
      generateQRCode(qrCanvasRef.current, url);
    }

    // Unlock Social Butterfly achievement
    actions.unlockAchievement('socialButterfly');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      actions.addNotification('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      actions.addNotification('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <ModalContent maxWidth="500px">
        <ModalHeader onClose={onClose}>
          <h2>Share Collection</h2>
        </ModalHeader>

        <ModalBody>
          {/* Stats Preview */}
          <div className="share-stats">
            <div className="share-stat">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Items</span>
            </div>
            <div className="share-stat">
              <span className="stat-value">{stats.favorites}</span>
              <span className="stat-label">Favorites</span>
            </div>
            <div className="share-stat">
              <span className="stat-value">{stats.avgRating}</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="qr-container">
            <canvas ref={qrCanvasRef} className="qr-code"></canvas>
            <p className="qr-hint">Scan to import collection</p>
          </div>

          {/* Share Link */}
          <div className="share-link-container">
            <label>Share Link</label>
            <div className="share-link-input">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="share-link"
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="share-info">
            <p>
              Share this link with friends to let them import your collection.
              They can add your items to their own collection!
            </p>
          </div>
        </ModalBody>
      </ModalContent>
    </ModalBackdrop>
  );
}

export default ShareModal;
