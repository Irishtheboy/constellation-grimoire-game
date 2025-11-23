import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { getLeaderboard } from '../utils/firebase';
import { ZODIAC_SIGNS } from '../data/constellations';

const LeaderboardPage = ({ user }) => {
  const [leaderboards, setLeaderboards] = useState({
    wins: [],
    level: [],
    winStreak: []
  });
  const [activeTab, setActiveTab] = useState('wins');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadLeaderboards();
  }, []);
  
  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      const [winsResult, levelResult, streakResult] = await Promise.all([
        getLeaderboard('wins', 10),
        getLeaderboard('level', 10),
        getLeaderboard('bestWinStreak', 10)
      ]);
      
      setLeaderboards({
        wins: winsResult.success ? winsResult.leaderboard : [],
        level: levelResult.success ? levelResult.leaderboard : [],
        winStreak: streakResult.success ? streakResult.leaderboard : []
      });
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  const renderLeaderboard = (data, type) => {
    if (loading) {
      return <div className="loading">Loading leaderboard...</div>;
    }
    
    if (data.length === 0) {
      return <div className="no-data">No data available yet. Start battling!</div>;
    }
    
    return (
      <div className="leaderboard-list">
        {data.map((player, index) => {
          const constellation = ZODIAC_SIGNS[player.constellation];
          const isCurrentUser = player.id === user?.uid;
          
          return (
            <div key={player.id} className={`leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
              <div className="rank">{getRankIcon(index + 1)}</div>
              <div className="player-info">
                <div className="constellation">
                  {constellation?.symbol} {constellation?.name || player.constellation}
                </div>
                <div className="level">Level {player.level}</div>
              </div>
              <div className="stats">
                {type === 'wins' && <span>{player.battleStats.wins} Wins</span>}
                {type === 'level' && <span>Level {player.level}</span>}
                {type === 'winStreak' && <span>{player.battleStats.bestWinStreak} Win Streak</span>}
              </div>
              {isCurrentUser && <div className="you-badge">YOU</div>}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <>
      <Header user={user} />
      <div className="leaderboard-page">
        <BackButton to="/" />
        <div className="leaderboard-header">
          <h1>🏆 Leaderboard</h1>
          <p>Top constellation masters across the realm</p>
        </div>
        
        <div className="leaderboard-tabs">
          <button 
            className={`tab ${activeTab === 'wins' ? 'active' : ''}`}
            onClick={() => setActiveTab('wins')}
          >
            🏆 Most Wins
          </button>
          <button 
            className={`tab ${activeTab === 'level' ? 'active' : ''}`}
            onClick={() => setActiveTab('level')}
          >
            ⭐ Highest Level
          </button>
          <button 
            className={`tab ${activeTab === 'winStreak' ? 'active' : ''}`}
            onClick={() => setActiveTab('winStreak')}
          >
            🔥 Best Win Streak
          </button>
        </div>
        
        <div className="leaderboard-content">
          {renderLeaderboard(leaderboards[activeTab], activeTab)}
        </div>
        
        <button onClick={loadLeaderboards} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>
      
      <style>{`
        .leaderboard-page { max-width: 800px; margin: 0 auto; padding: 20px; }
        .leaderboard-header { text-align: center; margin-bottom: 30px; }
        .leaderboard-header h1 { color: #d4b3ff; text-shadow: 0 0 10px #a06bff; }
        .leaderboard-tabs { display: flex; justify-content: center; margin-bottom: 30px; gap: 10px; }
        .tab { background: rgba(20, 15, 40, 0.8); border: 1px solid #6d47ff; color: #eae5ff; padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: all 0.3s; }
        .tab.active { background: linear-gradient(135deg, #7b4bff, #5120c7); box-shadow: 0 0 15px rgba(123, 75, 255, 0.4); }
        .tab:hover:not(.active) { background: rgba(60, 35, 120, 0.6); }
        .leaderboard-content { background: rgba(20, 15, 40, 0.6); border-radius: 15px; padding: 20px; }
        .leaderboard-list { display: flex; flex-direction: column; gap: 10px; }
        .leaderboard-entry { display: flex; align-items: center; background: rgba(60, 35, 120, 0.4); padding: 15px; border-radius: 10px; border: 1px solid #6d47ff; transition: all 0.3s; position: relative; }
        .leaderboard-entry:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(120, 80, 255, 0.3); }
        .leaderboard-entry.current-user { border-color: #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
        .rank { font-size: 1.5rem; margin-right: 15px; min-width: 50px; text-align: center; }
        .player-info { flex: 1; }
        .constellation { font-size: 1.1rem; font-weight: bold; color: #d4b3ff; }
        .level { font-size: 0.9rem; color: #b8b8b8; }
        .stats { font-size: 1.1rem; font-weight: bold; color: #ffd700; }
        .you-badge { position: absolute; top: 5px; right: 10px; background: #ffd700; color: #000; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; }
        .loading, .no-data { text-align: center; padding: 40px; color: #b8b8b8; font-style: italic; }
        .refresh-btn { display: block; margin: 20px auto; background: linear-gradient(135deg, #7b4bff, #5120c7); color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: all 0.3s; }
        .refresh-btn:hover { background: linear-gradient(135deg, #9a65ff, #6430f5); transform: translateY(-2px); }
      `}</style>
    </>
  );
};

export default LeaderboardPage;