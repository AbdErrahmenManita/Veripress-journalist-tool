import React from 'react';

/**
 * ArchiveList Component
 * Renders a grid of previously verified claims.
 */
function ArchiveList({ archive }) {
  
  // Helper for status dot color
  const getStatusColor = (score) => {
    if (score >= 80) return '#3bb273';
    if (score >= 50) return '#e1ad01';
    return '#e63946';
  };

  return (
    <div className="archive-section">
      <div className="section-title">
        <h2>Verification Log</h2>
        <span className="badge">{archive.length} records</span>
      </div>
      
      <div className="archive-grid">
        {archive.map((item) => (
          <div key={item.id} className="card archive-card">
            <div className="archive-header">
              <div className="status-indicator">
                 <span 
                   className="status-dot" 
                   style={{ backgroundColor: getStatusColor(item.credibility_score) }}
                 ></span>
                 <span className="verdict-text">{item.verdict}</span>
              </div>
              <span className="timestamp">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <p className="archive-claim">"{item.claim_text}"</p>
            
            <div className="archive-footer">
              <div className="archive-hash" title="Immutable Hash">
                ID: {item.hash.substring(0, 8)}...
              </div>
              <span className="score-small">Score: {item.credibility_score}</span>
            </div>
          </div>
        ))}
        
        {archive.length === 0 && (
          <div className="empty-state">
            <p>No claims have been archived yet. Verify your first claim above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchiveList;