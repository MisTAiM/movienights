/* ========================================
   CastCard.jsx - Cast Card Component
   ======================================== */

import React from 'react';
import './CastCard.css';

function CastCard({ actor }) {
  const profileUrl = actor.profile || actor.image || 'https://via.placeholder.com/120x150?text=No+Image';

  return (
    <div className="cast-card">
      <div className="cast-image">
        <img 
          src={profileUrl} 
          alt={actor.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/120x150?text=No+Image';
          }}
        />
      </div>
      <div className="cast-card-info">
        <div className="cast-name">{actor.name}</div>
        <div className="cast-character">{actor.character || actor.role || 'Unknown Role'}</div>
      </div>
    </div>
  );
}

export function CrewMember({ role, names }) {
  return (
    <div className="crew-member">
      <div className="crew-role">{role}</div>
      <div className="crew-name">{Array.isArray(names) ? names.join(', ') : names}</div>
    </div>
  );
}

export default CastCard;
