import React from "react";
import { Link } from "react-router-dom";
import { ZODIAC_SIGNS } from "../data/constellations";
import Header from "../components/Header";

const GrimoirePage = ({ user, grimoire }) => {
  if (!grimoire) return <div className="loading">Loading grimoire...</div>;

  const constellation = ZODIAC_SIGNS[grimoire.constellation];

  return (
    <>
      {/* ===========================
          Magical Card Game CSS
         =========================== */}
      <style>{`
        body {
          background: radial-gradient(circle at center, #0c0a18, #05040e 70%);
          font-family: 'Cinzel', serif;
          color: #eae5ff;
        }

        .grimoire-page {
          max-width: 900px;
          margin: auto;
          padding: 20px;
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .grimoire-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .grimoire-header h1 {
          font-size: 2.5rem;
          text-shadow: 0 0 12px #a06bff;
        }

        .card {
          background: rgba(20, 15, 40, 0.85);
          border: 1px solid #6d47ff;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 0 15px rgba(120, 80, 255, 0.4);
          backdrop-filter: blur(6px);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 0 25px rgba(150, 100, 255, 0.75);
        }

        .constellation-card h2 {
          font-size: 1.7rem;
          margin-bottom: 10px;
          color: #d4b3ff;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .stat-card {
          background: rgba(60, 35, 120, 0.4);
          border: 1px solid #9c7bff;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          font-size: 1.1rem;
          box-shadow: 0 0 10px rgba(120, 90, 255, 0.3);
          transition: 0.2s ease;
        }

        .stat-card:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(150, 120, 255, 0.6);
        }

        .grimoire-nav {
          display: flex;
          justify-content: space-evenly;
          margin-top: 25px;
        }

        .nav-btn {
          background: linear-gradient(135deg, #7b4bff, #5120c7);
          color: white;
          padding: 12px 22px;
          border-radius: 18px;
          font-size: 1.1rem;
          text-decoration: none;
          border: 1px solid #a68cff;
          box-shadow: 0 0 15px rgba(110, 60, 255, 0.6);
          transition: 0.25s ease-in-out;
        }

        .nav-btn:hover {
          background: linear-gradient(135deg, #9a65ff, #6430f5);
          transform: translateY(-4px);
          box-shadow: 0 0 25px rgba(160, 120, 255, 0.9);
        }

        .loading {
          text-align: center;
          font-size: 1.5rem;
        }
      `}</style>

      {/* ===========================
              Page Content
         =========================== */}
      <Header user={user} grimoire={grimoire} />
      <div className="grimoire-page">
        <header className="grimoire-header">
          <h1>📜 Your Grimoire</h1>
        </header>

        <div className="grimoire-content">
          <div className="card constellation-card">
            <h2>
              {constellation.symbol} {constellation.name}
            </h2>
            <p><strong>School:</strong> {constellation.school}</p>
            <p><strong>Element:</strong> {constellation.element}</p>
            <p><strong>Level:</strong> {grimoire.level}</p>
            <p><strong>Experience:</strong> {grimoire.experience}</p>
            <p><strong>Soul Sparks:</strong> {grimoire.soulSparks}</p>
          </div>

          <div className="card stats-section">
            <h3>📊 Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">Attack: {grimoire.stats.attack}</div>
              <div className="stat-card">Defense: {grimoire.stats.defense}</div>
              <div className="stat-card">Magic: {grimoire.stats.magic}</div>
              <div className="stat-card">Speed: {grimoire.stats.speed}</div>
            </div>
          </div>

          <div className="card battle-stats">
            <h3>⚔️ Battle Record</h3>
            <p>Wins: {grimoire.battleStats.wins}</p>
            <p>Losses: {grimoire.battleStats.losses}</p>
            <p>Win Streak: {grimoire.battleStats.winStreak}</p>
          </div>

          <nav className="grimoire-nav">
            <Link to="/battle" className="nav-btn">⚔️ Battle</Link>
            <Link to="/spells" className="nav-btn">🔮 Spells</Link>
            <Link to="/shop" className="nav-btn">🛒 Shop</Link>
            <Link to="/adventure-log" className="nav-btn">📜 Chronicle</Link>
            <Link to="/friends" className="nav-btn">👥 Friends</Link>
            <Link to="/leaderboard" className="nav-btn">🏆 Leaderboard</Link>
            <Link to="/profile" className="nav-btn">👤 Profile</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default GrimoirePage;
