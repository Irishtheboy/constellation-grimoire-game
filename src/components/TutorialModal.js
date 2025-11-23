import React, { useState } from 'react';
import './TutorialModal.css';

const TutorialModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Constellation Grimoire!",
      content: "A mystical card battle game where you collect spells, battle other players, and explore the magical world of constellations.",
      image: "🌟"
    },
    {
      title: "Your Grimoire",
      content: "Collect powerful spells from different constellations. Each spell has unique abilities and costs Action Points (AP) to cast.",
      image: "📚"
    },
    {
      title: "Battle System",
      content: "Challenge other players in real-time battles. Use your spells strategically and manage your AP wisely to defeat opponents.",
      image: "⚔️"
    },
    {
      title: "Items & Buffs",
      content: "Use potions and items to boost your stats temporarily. Items are consumed when used, so use them wisely!",
      image: "🧪"
    },
    {
      title: "Friends & Duels",
      content: "Add friends, chat with them, and challenge them to friendly duels. Build your network of fellow mages!",
      image: "👥"
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <div className="tutorial-header">
          <h2>{step.title}</h2>
          <button className="tutorial-close" onClick={onClose}>×</button>
        </div>
        
        <div className="tutorial-content">
          <div className="tutorial-icon">{step.image}</div>
          <p>{step.content}</p>
        </div>
        
        <div className="tutorial-footer">
          <div className="tutorial-progress">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index} 
                className={`progress-dot ${index === currentStep ? 'active' : ''}`}
              />
            ))}
          </div>
          
          <div className="tutorial-buttons">
            {currentStep > 0 && (
              <button className="tutorial-btn secondary" onClick={prevStep}>
                Previous
              </button>
            )}
            <button className="tutorial-btn primary" onClick={nextStep}>
              {currentStep === tutorialSteps.length - 1 ? 'Start Playing!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;