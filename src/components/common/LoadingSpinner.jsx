/* ========================================
   LoadingSpinner.jsx - Loading Spinner Component
   ======================================== */

import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', text = '' }) {
  return (
    <div className={`loading-spinner-container loading-${size}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-core"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export function InlineSpinner() {
  return <span className="inline-spinner"></span>;
}

export default LoadingSpinner;
