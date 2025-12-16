/* ========================================
   ModalBackdrop.jsx - Modal Backdrop Component
   ======================================== */

import React, { useEffect, useCallback } from 'react';
import './ModalBackdrop.css';

function ModalBackdrop({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true 
}) {
  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose?.();
    }
  }, [onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  // Add escape listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-backdrop ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

export function ModalContent({ children, className = '', maxWidth = '900px' }) {
  return (
    <div 
      className={`modal-content ${className}`}
      style={{ maxWidth }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function ModalHeader({ children, onClose }) {
  return (
    <div className="modal-header">
      {children}
      {onClose && (
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>
      )}
    </div>
  );
}

export function ModalBody({ children, className = '' }) {
  return (
    <div className={`modal-body ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`modal-footer ${className}`}>
      {children}
    </div>
  );
}

export default ModalBackdrop;
