import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZODIAC_SIGNS } from '../data/constellations';
import { createUserGrimoire, getZodiacSign } from '../utils/firebase';
import './GrimoireCreation.css';

const GrimoireCreation = ({ user, onGrimoireCreated }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    birthMonth: '',
    birthDay: '',
    favoriteElement: '',
    playStyle: '',
    magicalInterests: [],
    personalityTraits: []
  });
  const [isCreating, setIsCreating] = useState(false);
  const [zodiacSign, setZodiacSign] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const elements = ['Fire', 'Earth', 'Air', 'Water'];
  const playStyles = [
    { id: 'aggressive', name: 'Aggressive', description: 'Strike fast and hard' },
    { id: 'defensive', name: 'Defensive', description: 'Protect and endure' },
    { id: 'magical', name: 'Magical', description: 'Master arcane arts' },
    { id: 'balanced', name: 'Balanced', description: 'Adapt to any situation' }
  ];

  const magicalInterests = [
    'Ancient Rituals', 'Stellar Navigation', 'Elemental Mastery', 'Dream Magic',
    'Battle Tactics', 'Healing Arts', 'Illusion Weaving', 'Time Manipulation'
  ];

  const personalityTraits = [
    'Ambitious', 'Compassionate', 'Mysterious', 'Loyal', 'Independent',
    'Intuitive', 'Analytical', 'Creative', 'Protective', 'Adventurous'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'birthMonth' || field === 'birthDay') {
      if (formData.birthMonth && formData.birthDay) {
        const month = field === 'birthMonth' ? parseInt(value) : parseInt(formData.birthMonth);
        const day = field === 'birthDay' ? parseInt(value) : parseInt(formData.birthDay);
        
        if (month && day) {
          const sign = getZodiacSign(month, day);
          setZodiacSign(sign);
        }
      }
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const createGrimoire = async () => {
    setIsCreating(true);
    
    try {
      const result = await createUserGrimoire(
        user.uid,
        parseInt(formData.birthMonth),
        parseInt(formData.birthDay),
        {
          favoriteElement: formData.favoriteElement,
          playStyle: formData.playStyle,
          magicalInterests: formData.magicalInterests,
          personalityTraits: formData.personalityTraits
        }
      );
      
      if (result.success) {
        onGrimoireCreated(result.grimoire);
      } else {
        console.error('Failed to create grimoire:', result.error);
        alert('Failed to create grimoire: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating grimoire:', error);
      alert('Error creating grimoire: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.birthMonth && formData.birthDay;
      case 2:
        return formData.favoriteElement && formData.playStyle;
      case 3:
        return formData.magicalInterests.length > 0 && formData.personalityTraits.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="grimoire-creation">
      <div className="creation-container">
        <div className="progress-bar">
          {[1, 2, 3, 4].map(num => (
            <div
              key={num}
              className={`progress-step ${step >= num ? 'active' : ''}`}
            >
              {num}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="creation-step"
            >
              <h2>🌟 Birth Constellation</h2>
              <p>Your birth date determines your celestial alignment and magical school</p>
              
              <div className="birth-inputs">
                <div className="input-group">
                  <label>Birth Month</label>
                  <select
                    value={formData.birthMonth}
                    onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                  >
                    <option value="">Select Month</option>
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Birth Day</label>
                  <select
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange('birthDay', e.target.value)}
                  >
                    <option value="">Select Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              {zodiacSign && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="zodiac-preview"
                >
                  <div className="constellation-card">
                    <h3>{ZODIAC_SIGNS[zodiacSign].symbol} {ZODIAC_SIGNS[zodiacSign].name}</h3>
                    <p className="school">{ZODIAC_SIGNS[zodiacSign].school}</p>
                    <p className="element">{ZODIAC_SIGNS[zodiacSign].element} Element</p>
                    <p className="lore">{ZODIAC_SIGNS[zodiacSign].lore}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="creation-step"
            >
              <h2>⚡ Magical Preferences</h2>
              <p>Choose your preferred element and combat style</p>
              
              <div className="preference-section">
                <h3>Favorite Element</h3>
                <div className="element-grid">
                  {elements.map(element => (
                    <button
                      key={element}
                      className={`element-btn ${formData.favoriteElement === element ? 'selected' : ''}`}
                      onClick={() => handleInputChange('favoriteElement', element)}
                    >
                      <span className="element-icon">
                        {element === 'Fire' && '🔥'}
                        {element === 'Earth' && '🌍'}
                        {element === 'Air' && '💨'}
                        {element === 'Water' && '🌊'}
                      </span>
                      {element}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-section">
                <h3>Combat Style</h3>
                <div className="style-grid">
                  {playStyles.map(style => (
                    <button
                      key={style.id}
                      className={`style-btn ${formData.playStyle === style.id ? 'selected' : ''}`}
                      onClick={() => handleInputChange('playStyle', style.id)}
                    >
                      <h4>{style.name}</h4>
                      <p>{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="creation-step"
            >
              <h2>🔮 Mystical Affinities</h2>
              <p>Select your areas of magical interest and personality traits</p>
              
              <div className="preference-section">
                <h3>Magical Interests (Choose 2-4)</h3>
                <div className="interest-grid">
                  {magicalInterests.map(interest => (
                    <button
                      key={interest}
                      className={`interest-btn ${formData.magicalInterests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => handleArrayToggle('magicalInterests', interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-section">
                <h3>Personality Traits (Choose 2-3)</h3>
                <div className="trait-grid">
                  {personalityTraits.map(trait => (
                    <button
                      key={trait}
                      className={`trait-btn ${formData.personalityTraits.includes(trait) ? 'selected' : ''}`}
                      onClick={() => handleArrayToggle('personalityTraits', trait)}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && zodiacSign && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="creation-step"
            >
              <h2>📜 Grimoire Summary</h2>
              <p>Review your magical profile before creating your grimoire</p>
              
              <div className="grimoire-summary">
                <div className="summary-card">
                  <h3>{ZODIAC_SIGNS[zodiacSign].symbol} {ZODIAC_SIGNS[zodiacSign].name} Wizard</h3>
                  
                  <div className="summary-section">
                    <h4>🏛️ Magical School</h4>
                    <p>{ZODIAC_SIGNS[zodiacSign].school}</p>
                    <p className="school-description">{ZODIAC_SIGNS[zodiacSign].schoolDescription}</p>
                  </div>

                  <div className="summary-section">
                    <h4>⚡ Magic Types</h4>
                    <p>Primary: {ZODIAC_SIGNS[zodiacSign].primaryMagic}</p>
                    <p>Secondary: {ZODIAC_SIGNS[zodiacSign].secondaryMagic}</p>
                  </div>

                  <div className="summary-section">
                    <h4>📊 Base Stats</h4>
                    <div className="stats-preview">
                      <div className="stat">Attack: {ZODIAC_SIGNS[zodiacSign].baseStats.attack}</div>
                      <div className="stat">Defense: {ZODIAC_SIGNS[zodiacSign].baseStats.defense}</div>
                      <div className="stat">Magic: {ZODIAC_SIGNS[zodiacSign].baseStats.magic}</div>
                      <div className="stat">Speed: {ZODIAC_SIGNS[zodiacSign].baseStats.speed}</div>
                    </div>
                  </div>

                  <div className="summary-section">
                    <h4>🎯 Your Preferences</h4>
                    <p>Element: {formData.favoriteElement}</p>
                    <p>Style: {formData.playStyle}</p>
                    <p>Interests: {formData.magicalInterests.join(', ')}</p>
                    <p>Traits: {formData.personalityTraits.join(', ')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="creation-controls">
          {step > 1 && (
            <button onClick={prevStep} className="control-btn secondary">
              ← Previous
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="control-btn primary"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={createGrimoire}
              disabled={isCreating}
              className="control-btn create"
            >
              {isCreating ? '✨ Creating Grimoire...' : '📜 Create Grimoire'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrimoireCreation;