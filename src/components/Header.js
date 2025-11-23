import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/firebase';

const Header = ({ user, grimoire }) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logoutUser();
    // Clear browser cache and redirect to home
    window.location.href = '/';
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <span className="user-info">Welcome, {grimoire?.username || user?.displayName || user?.email}</span>
          <span className="studio-credit">Alchemy Studio</span>
        </div>
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
        
        @media (max-width: 768px) {
          .app-header {
            padding: 8px 15px;
          }
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .studio-credit {
          color: rgba(234, 229, 255, 0.6);
          font-size: 0.7rem;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .header-left {
            flex: 1;
            min-width: 0;
          }
        }
        
        .user-info {
          color: #eae5ff;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .user-info {
            font-size: 0.8rem;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
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
          min-height: 36px;
        }
        
        @media (max-width: 768px) {
          .logout-btn {
            padding: 10px 14px;
            font-size: 0.8rem;
            min-height: 40px;
          }
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