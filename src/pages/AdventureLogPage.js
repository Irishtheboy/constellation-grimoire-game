import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { getAdventureLog } from '../utils/firebase';

const AdventureLogPage = ({ user, grimoire }) => {
  const [adventureLog, setAdventureLog] = useState({ entries: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    loadAdventureLog();
  }, [user]);

  const loadAdventureLog = async () => {
    setLoading(true);
    try {
      const result = await getAdventureLog(user.uid);
      if (result.success) {
        setAdventureLog(result.log);
      }
    } catch (error) {
      console.error('Error loading adventure log:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryIcon = (entry) => {
    if (entry.type === 'levelup') return '✦';
    return entry.result === 'win' ? '⚡' : '⚫';
  };

  const getEntryClass = (entry) => {
    if (entry.type === 'levelup') return 'levelup-entry';
    return entry.result === 'win' ? 'victory-entry' : 'defeat-entry';
  };

  return (
    <>
      <Header user={user} grimoire={grimoire} />
      <div className="adventure-log-page">
        <BackButton to="/" />
        <div className="log-header">
          <h1>⚫ Chronicle of the Void</h1>
          <p className="ancient-text">The eternal record of {grimoire?.username || 'Unknown Wanderer'}'s journey through the forgotten realms</p>
          <div className="ai-indicator">
            <span className="ai-badge">✦ AI-Generated Narratives ✦</span>
          </div>
        </div>

        {loading ? (
          <div className="loading">The void stirs, awakening ancient memories...</div>
        ) : (
          <div className="log-content">
            {adventureLog.entries.length === 0 ? (
              <div className="empty-log">
                <h3>⚫ The Void Remembers Nothing</h3>
                <p className="ancient-text">No tales have been carved into the eternal stone. Venture forth into battle, and let the realm witness your deeds.</p>
              </div>
            ) : (
              <div className="entries-container">
                <div className="entries-list">
                  {adventureLog.entries.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`log-entry ${getEntryClass(entry)} ${selectedEntry === index ? 'selected' : ''}`}
                      onClick={() => setSelectedEntry(selectedEntry === index ? null : index)}
                    >
                      <div className="entry-header">
                        <span className="entry-icon">{getEntryIcon(entry)}</span>
                        <div className="entry-info">
                          <h3>{entry.title}</h3>
                          <span className="entry-date">{formatDate(entry.timestamp)}</span>
                        </div>
                      </div>
                      
                      {selectedEntry === index && (
                        <div className="entry-details">
                          <div className="story-content">
                            <p className="ancient-text">{entry.story}</p>
                            {entry.aiGenerated && (
                              <div className="ai-signature">
                                <span>✦ Chronicled by the Void's Memory ✦</span>
                              </div>
                            )}
                          </div>
                          {entry.location && (
                            <div className="entry-meta">
                              <span className="location">⚫ {entry.location}</span>
                              {entry.level && <span className="level">Essence Level {entry.level}</span>}
                              {entry.mood && <span className="mood">{entry.mood}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="log-stats">
                  <h3>⚡ Essence Records</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{adventureLog.entries.length}</span>
                      <span className="stat-label">Chronicles</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {adventureLog.entries.filter(e => e.result === 'win').length}
                      </span>
                      <span className="stat-label">Triumphs</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {adventureLog.entries.filter(e => e.type === 'levelup').length}
                      </span>
                      <span className="stat-label">Ascensions</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .adventure-log-page { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .log-header { text-align: center; margin-bottom: 40px; }
        .log-header h1 { color: #d4c4b0; margin-bottom: 15px; }
        .log-header p { color: #a09080; margin-bottom: 20px; }
        .ai-indicator { margin-top: 15px; }
        .ai-badge { 
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(145deg, rgba(40, 35, 50, 0.8), rgba(25, 20, 35, 0.8));
          border: 1px solid rgba(150, 130, 110, 0.3);
          border-radius: 2px;
          color: #c8b4a0;
          font-size: 0.8rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          animation: soulPulse 3s ease-in-out infinite;
        }
        .loading, .empty-log { text-align: center; padding: 60px 20px; }
        .empty-log h3 { color: #d4c4b0; margin-bottom: 15px; }
        .entries-container { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        .entries-list { display: flex; flex-direction: column; gap: 12px; }
        .log-entry { 
          background: linear-gradient(145deg, rgba(25, 20, 30, 0.9), rgba(15, 12, 20, 0.9));
          border: 1px solid rgba(100, 80, 90, 0.3);
          border-radius: 3px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
        .log-entry:hover { 
          transform: translateY(-1px);
          border-color: rgba(150, 130, 110, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        }
        .log-entry.selected { 
          border-color: rgba(200, 180, 160, 0.6);
          box-shadow: 0 0 15px rgba(150, 130, 110, 0.2);
        }
        .victory-entry { border-left: 3px solid rgba(120, 140, 100, 0.8); }
        .defeat-entry { border-left: 3px solid rgba(140, 100, 100, 0.8); }
        .levelup-entry { border-left: 3px solid rgba(160, 140, 100, 0.8); }
        .entry-header { display: flex; align-items: center; gap: 15px; }
        .entry-icon { font-size: 1.8rem; color: #c8b4a0; }
        .entry-info h3 { color: #d4c4b0; margin: 0 0 5px 0; font-size: 1.1rem; }
        .entry-date { color: #888; font-size: 0.85rem; }
        .entry-details { margin-top: 18px; padding-top: 18px; border-top: 1px solid rgba(100, 80, 90, 0.3); }
        .story-content { margin-bottom: 15px; }
        .ai-signature {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid rgba(100, 80, 90, 0.2);
        }
        .ai-signature span {
          font-size: 0.75rem;
          color: #a09080;
          letter-spacing: 0.5px;
          opacity: 0.7;
        }
        .entry-meta { 
          display: flex; 
          gap: 20px; 
          font-size: 0.85rem; 
          color: #a09080;
          flex-wrap: wrap;
        }
        .entry-meta .mood {
          text-transform: capitalize;
          font-style: italic;
        }
        .log-stats { 
          background: linear-gradient(145deg, rgba(25, 20, 30, 0.8), rgba(15, 12, 20, 0.8));
          border: 1px solid rgba(100, 80, 90, 0.2);
          border-radius: 3px;
          padding: 20px;
          height: fit-content;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .log-stats h3 { color: #d4c4b0; margin-bottom: 20px; text-align: center; }
        .stats-grid { display: flex; flex-direction: column; gap: 12px; }
        .stat-item { 
          text-align: center;
          padding: 15px;
          background: linear-gradient(145deg, rgba(35, 30, 40, 0.6), rgba(25, 20, 30, 0.6));
          border: 1px solid rgba(100, 80, 90, 0.2);
          border-radius: 2px;
        }
        .stat-value { 
          display: block;
          font-size: 1.8rem;
          font-weight: bold;
          color: #d4c4b0;
          text-shadow: 0 0 5px rgba(200, 180, 160, 0.3);
        }
        .stat-label { color: #a09080; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
        @media (max-width: 768px) {
          .entries-container { grid-template-columns: 1fr; }
          .entry-meta { gap: 15px; }
        }
      `}</style>
    </>
  );
};

export default AdventureLogPage;