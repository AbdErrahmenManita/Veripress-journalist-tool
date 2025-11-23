import React from 'react';

/**
 * ResultCard Component
 * Displays the detailed analysis of the verification request.
 * Includes dynamic color coding based on the credibility score.
 */
function ResultCard({ result }) {
  if (!result) return null;

  // Helper to determine color theme based on score
  const getScoreColor = (score) => {
    if (score >= 80) return { color: '#3bb273', label: 'High Credibility' }; // Green
    if (score >= 50) return { color: '#e1ad01', label: 'Caution' };          // Yellow/Orange
    return { color: '#e63946', label: 'Low Credibility' };                   // Red
  };

  const { color, label } = getScoreColor(result.credibility_score);

  return (
    <div className="card result-card fade-in">
      {/* Header Section: Score and Verdict */}
      <div className="result-header">
        <div className="score-container">
          <div 
            className="score-ring" 
            style={{ borderColor: color, boxShadow: `0 0 15px ${color}40` }}
          >
            <span className="score-value" style={{ color: color }}>
              {result.credibility_score}
            </span>
          </div>
          <span className="score-label" style={{ color: color }}>{label}</span>
        </div>
        
        <div className="verdict-container">
          <h3>Verdict</h3>
          <div className="verdict-badge" style={{ backgroundColor: color }}>
            {result.verdict.toUpperCase()}
          </div>
        </div>
      </div>
      
      {/* Explanation Section */}
      <div className="explanation-section">
        <h4>Analysis</h4>
        <p className="explanation-text">{result.explanation}</p>
      </div>

      {/* Sources Section */}
      <div className="sources-section">
        <h4>Sources & References</h4>
        {result.sources.length > 0 ? (
          <ul className="sources-list">
            {result.sources.map((source, idx) => (
              <li key={idx} className="source-item">
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <span className="source-name">{source.name}</span>
                  {source.snippet && <span className="source-snippet"> — {source.snippet}</span>}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-sources">No direct web sources found via standard APIs.</p>
        )}
      </div>

      {/* Metadata Section */}
      <div className="meta-data">
        <div className="hash-row">
          <strong>SHA-256 Signature:</strong>
          <code className="hash-code" title={result.hash}>{result.hash}</code>
        </div>
      </div>
    </div>
  );
}

export default ResultCard;