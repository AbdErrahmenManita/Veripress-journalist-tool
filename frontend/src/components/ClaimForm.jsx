import React, { useState } from 'react';

/**
 * ClaimForm Component
 * Handles user input for claims and triggers the verification process.
 */
function ClaimForm({ onVerify, loading }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onVerify(text);
    }
  };

  return (
    <div className="card input-card">
      <div className="card-header">
        <h2>Start Verification</h2>
        <div className="indicator">Live</div>
      </div>
      <p className="subtitle">
        Enter a political statement, news headline, or rumor below to cross-reference it against global fact-checking databases.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="textarea-wrapper">
          <textarea
            placeholder="e.g. 'The Eiffel Tower was sold twice by a con artist in 1925.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            disabled={loading}
            className="claim-input"
          />
        </div>
        
        <div className="form-actions">
          <span className="helper-text">
            Powered by Google Fact Check & ClaimBuster
          </span>
          <button 
            type="submit" 
            className={`btn-primary ${loading ? 'loading' : ''}`} 
            disabled={loading || !text}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              "Verify Claim"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClaimForm;