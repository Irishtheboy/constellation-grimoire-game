import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = ({ to = '/', onBack, warningMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Show warning if provided
    if (warningMessage) {
      const confirmed = window.confirm(warningMessage);
      if (!confirmed) return;
    }
    
    if (onBack) {
      onBack();
    } else {
      navigate(to);
    }
  };

  return (
    <button onClick={handleBack} className="back-btn">
      ← Back
      <style>{`
        .back-btn {
          background: rgba(60, 35, 120, 0.6);
          color: #eae5ff;
          border: 1px solid #6d47ff;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.3s;
        }
        .back-btn:hover {
          background: rgba(80, 55, 140, 0.8);
          transform: translateY(-2px);
        }
      `}</style>
    </button>
  );
};

export default BackButton;