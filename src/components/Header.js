import React from 'react';
import { logoutUser } from '../utils/firebase';

const Header = ({ user }) => {
  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <span className="user-info">Welcome, {user?.displayName || user?.email}</span>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
      
      <style>{`
        .app-header {
          background: rgba(20, 15, 40, 0.9);
          border-bottom: 1px solid #6d47ff;
          padding: 10px 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .user-info {
          color: #eae5ff;
          font-size: 0.9rem;
        }
        
        .logout-btn {
          background: linear-gradient(135deg, #ff4757, #c44569);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: 0.2s ease;
        }
        
        .logout-btn:hover {
          background: linear-gradient(135deg, #ff6b7a, #d55a8a);
          transform: translateY(-2px);
        }
      `}</style>
    </header>
  );
};

export default Header;