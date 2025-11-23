import React, { useState } from 'react';
import Header from '../components/Header';
import TutorialModal from '../components/TutorialModal';

const AboutPage = ({ user, grimoire }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <Header user={user} grimoire={grimoire} />
      <div className="about-page">
        <div className="about-container">
          <h1>About Constellation Grimoire</h1>
          
          <div className="card">
            <h2>Game Overview</h2>
            <p>A mystical multiplayer card battle game where players collect spells from different constellations and engage in strategic real-time battles.</p>
          </div>

          <div className="card">
            <h2>Developer</h2>
            <p><strong>Franco Lukhele</strong></p>
            <p><strong>Alchemy Studio</strong></p>
            <p>This project showcases full-stack development skills including React, Firebase, real-time multiplayer systems, and responsive design.</p>
          </div>

          <div className="card">
            <h2>Technical Stack</h2>
            <ul>
              <li>React.js - Frontend framework</li>
              <li>Firebase - Backend and real-time database</li>
              <li>CSS3 - Custom styling and animations</li>
              <li>PWA - Progressive Web App capabilities</li>
            </ul>
          </div>

          <div className="card">
            <h2>Game Tutorial</h2>
            <p>New to the game? View the tutorial to learn how to play!</p>
            <button 
              className="btn primary"
              onClick={() => setShowTutorial(true)}
            >
              📚 View Tutorial
            </button>
          </div>
        </div>
      </div>

      <TutorialModal 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />

      <style>{`
        .about-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .about-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .about-container ul {
          color: #b8a898;
          padding-left: 20px;
        }

        .about-container li {
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .about-page {
            padding: 15px;
          }
        }

        @media (max-width: 480px) {
          .about-page {
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default AboutPage;