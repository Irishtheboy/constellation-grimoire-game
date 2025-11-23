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
    if (entry.type === 'levelup') return '⭐';
    return entry.result === 'win' ? '🏆' : '💀';
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
          <h1>📖 Adventure Log</h1>
          <p>Chronicles of {grimoire?.username || 'Unknown'} in the Dark Lands of South Africa</p>
        </div>

        {loading ? (
          <div className="loading">Loading your dark chronicles...</div>
        ) : (
          <div className="log-content">
            {adventureLog.entries.length === 0 ? (
              <div className="empty-log">
                <h3>🌑 The Chronicle Awaits</h3>
                <p>Your story in the dark wizardry world has yet to begin. Engage in battles to start writing your legend.</p>
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
                            <p>{entry.story}</p>
                          </div>
                          {entry.location && (
                            <div className="entry-meta">
                              <span className="location">📍 {entry.location}</span>
                              {entry.level && <span className="level">Level {entry.level}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="log-stats">
                  <h3>📊 Chronicle Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{adventureLog.entries.length}</span>
                      <span className="stat-label">Total Entries</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {adventureLog.entries.filter(e => e.result === 'win').length}
                      </span>
                      <span className="stat-label">Victories</span>
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
        .log-header { text-align: center; margin-bottom: 30px; }
        .log-header h1 { color: #d4b3ff; text-shadow: 0 0 10px #a06bff; }
        .log-header p { color: #b8b8b8; font-style: italic; }
        .loading, .empty-log { text-align: center; padding: 60px 20px; }
        .empty-log h3 { color: #d4b3ff; margin-bottom: 15px; }
        .entries-container { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        .entries-list { display: flex; flex-direction: column; gap: 15px; }
        .log-entry { background: rgba(20, 15, 40, 0.8); border: 1px solid #6d47ff; border-radius: 15px; padding: 20px; cursor: pointer; transition: all 0.3s; }
        .log-entry:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(120, 80, 255, 0.3); }
        .log-entry.selected { border-color: #7b4bff; box-shadow: 0 0 20px rgba(123, 75, 255, 0.4); }
        .victory-entry { border-left: 4px solid #4CAF50; }
        .defeat-entry { border-left: 4px solid #f44336; }
        .levelup-entry { border-left: 4px solid #ffd700; }
        .entry-header { display: flex; align-items: center; gap: 15px; }
        .entry-icon { font-size: 2rem; }
        .entry-info h3 { color: #d4b3ff; margin: 0 0 5px 0; }
        .entry-date { color: #888; font-size: 0.9rem; }
        .entry-details { margin-top: 20px; padding-top: 20px; border-top: 1px solid #444; }
        .story-content { margin-bottom: 15px; line-height: 1.6; color: #eae5ff; }
        .entry-meta { display: flex; gap: 20px; font-size: 0.9rem; color: #b8b8b8; }
        .log-stats { background: rgba(20, 15, 40, 0.6); padding: 20px; border-radius: 15px; height: fit-content; }
        .log-stats h3 { color: #d4b3ff; margin-bottom: 20px; text-align: center; }
        .stats-grid { display: flex; flex-direction: column; gap: 15px; }
        .stat-item { text-align: center; padding: 15px; background: rgba(60, 35, 120, 0.4); border-radius: 10px; }
        .stat-value { display: block; font-size: 2rem; font-weight: bold; color: #ffd700; }
        .stat-label { color: #b8b8b8; font-size: 0.9rem; }
        @media (max-width: 768px) {
          .entries-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default AdventureLogPage;