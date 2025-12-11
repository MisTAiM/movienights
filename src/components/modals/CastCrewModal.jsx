/* ========================================
   CastCrewModal.jsx - Cast & Crew Modal Component
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useTMDB } from '../../hooks/useTMDB';
import ModalBackdrop, { ModalContent, ModalHeader, ModalBody } from '../common/ModalBackdrop';
import CastCard, { CrewMember } from '../cards/CastCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './CastCrewModal.css';

function CastCrewModal({ isOpen, onClose, item }) {
  const tmdb = useTMDB();
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && item && item.type !== 'anime') {
      loadCredits();
    }
  }, [isOpen, item]);

  const loadCredits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const type = item.type === 'tv' ? 'tv' : 'movie';
      const credits = await tmdb.getCredits(item.id, type);
      setCast(credits.cast || []);
      setCrew(credits.crew || {});
    } catch (err) {
      setError('Failed to load cast & crew');
      console.error('Credits error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const title = item.title || item.name;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <ModalContent maxWidth="900px">
        <ModalHeader onClose={onClose}>
          <h2>{title} - Cast & Crew</h2>
        </ModalHeader>

        <ModalBody>
          {loading && <LoadingSpinner text="Loading cast & crew..." />}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {/* Cast Section */}
              <section className="credits-section">
                <h3>Cast</h3>
                {cast.length > 0 ? (
                  <div className="cast-grid">
                    {cast.map((actor) => (
                      <CastCard key={actor.id} actor={actor} />
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No cast information available</p>
                )}
              </section>

              {/* Crew Section */}
              <section className="credits-section">
                <h3>Crew</h3>
                {Object.keys(crew).length > 0 ? (
                  <div className="crew-list">
                    {Object.entries(crew).map(([role, names]) => (
                      <CrewMember key={role} role={role} names={names} />
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No crew information available</p>
                )}
              </section>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalBackdrop>
  );
}

export default CastCrewModal;
