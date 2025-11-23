import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_CARDS } from '../data/cards';
import { ZODIAC_SIGNS } from '../data/constellations';
import { recordBattleResult } from '../utils/firebase';
import './GameBoard.css';

const GameBoard = ({ user, grimoire, onBattleComplete }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, ended
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [playerHP, setPlayerHP] = useState(30);
  const [opponentHP, setOpponentHP] = useState(30);
  const [playerMana, setPlayerMana] = useState(3);
  const [opponentMana, setOpponentMana] = useState(3);
  const [turn, setTurn] = useState('player');
  const [selectedCard, setSelectedCard] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [opponent, setOpponent] = useState(null);
  const [turnTimer, setTurnTimer] = useState(30);

  // Initialize game
  useEffect(() => {
    if (gameState === 'waiting') {
      initializeGame();
    }
  }, [gameState]);

  // Turn timer
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && turnTimer > 0) {
      timer = setTimeout(() => {
        setTurnTimer(prev => prev - 1);
      }, 1000);
    } else if (turnTimer === 0) {
      endTurn();
    }
    return () => clearTimeout(timer);
  }, [turnTimer, gameState]);

  const initializeGame = () => {
    // Generate random opponent
    const zodiacKeys = Object.keys(ZODIAC_SIGNS);
    const randomZodiac = zodiacKeys[Math.floor(Math.random() * zodiacKeys.length)];
    const opponentData = {
      name: generateOpponentName(),
      constellation: randomZodiac,
      level: Math.max(1, grimoire.level + Math.floor(Math.random() * 3) - 1),
      ...ZODIAC_SIGNS[randomZodiac]
    };
    setOpponent(opponentData);

    // Create starting hands
    const playerDeck = createDeck(grimoire.constellation);
    const opponentDeck = createDeck(randomZodiac);
    
    setPlayerHand(shuffleArray(playerDeck).slice(0, 5));
    setOpponentHand(shuffleArray(opponentDeck).slice(0, 5));
    
    // Reset game state
    setPlayerHP(30);
    setOpponentHP(30);
    setPlayerMana(3);
    setOpponentMana(3);
    setTurn('player');
    setTurnTimer(30);
    setBattleLog(['⚔️ Battle begins! May the stars guide you.']);
    setGameState('playing');
  };

  const generateOpponentName = () => {
    const prefixes = ['Astral', 'Cosmic', 'Stellar', 'Celestial', 'Mystic', 'Arcane'];
    const suffixes = ['Sage', 'Mage', 'Wizard', 'Sorcerer', 'Enchanter', 'Warlock'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  };

  const createDeck = (constellation) => {
    const constellationCards = Object.values(BASE_CARDS).filter(
      card => card.constellation === constellation
    );
    
    // Create deck with multiple copies of each card
    const deck = [];
    constellationCards.forEach(card => {
      for (let i = 0; i < 3; i++) {
        deck.push({ ...card, id: `${card.id}_${i}` });
      }
    });
    
    return deck;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playCard = (card) => {
    if (turn !== 'player' || playerMana < card.manaCost) return;

    setPlayerMana(prev => prev - card.manaCost);
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    // Execute card effect
    executeCardEffect(card, 'player');
    
    // Add to battle log
    addToBattleLog(`🔮 You cast ${card.name}!`);
    
    setSelectedCard(null);
    
    // Check for game end
    setTimeout(() => {
      if (opponentHP <= 0) {
        endGame('win');
      } else {
        endTurn();
      }
    }, 1000);
  };

  const executeCardEffect = (card, caster) => {
    const isPlayer = caster === 'player';
    
    switch (card.type) {
      case 'Attack':
        const damage = card.damage || 0;
        if (isPlayer) {
          setOpponentHP(prev => Math.max(0, prev - damage));
          addToBattleLog(`⚔️ Dealt ${damage} damage to opponent!`);
        } else {
          setPlayerHP(prev => Math.max(0, prev - damage));
          addToBattleLog(`💥 Opponent dealt ${damage} damage to you!`);
        }
        break;
        
      case 'Defense':
        const healing = card.defense || 0;
        if (isPlayer) {
          setPlayerHP(prev => Math.min(30, prev + Math.floor(healing / 2)));
          addToBattleLog(`🛡️ You gained ${Math.floor(healing / 2)} HP!`);
        } else {
          setOpponentHP(prev => Math.min(30, prev + Math.floor(healing / 2)));
          addToBattleLog(`🛡️ Opponent gained ${Math.floor(healing / 2)} HP!`);
        }
        break;
        
      case 'Spell':
        addToBattleLog(`✨ ${card.name} effect activated!`);
        // Implement specific spell effects here
        break;
    }
  };

  const opponentTurn = () => {
    if (opponentHand.length === 0) {
      endTurn();
      return;
    }

    // Simple AI: play random affordable card
    const affordableCards = opponentHand.filter(card => card.manaCost <= opponentMana);
    
    if (affordableCards.length > 0) {
      const randomCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
      
      setTimeout(() => {
        setOpponentMana(prev => prev - randomCard.manaCost);
        setOpponentHand(prev => prev.filter(c => c.id !== randomCard.id));
        executeCardEffect(randomCard, 'opponent');
        addToBattleLog(`🤖 Opponent casts ${randomCard.name}!`);
        
        setTimeout(() => {
          if (playerHP <= 0) {
            endGame('loss');
          } else {
            endTurn();
          }
        }, 1000);
      }, 1500);
    } else {
      setTimeout(() => {
        addToBattleLog('🤖 Opponent passes turn.');
        endTurn();
      }, 1000);
    }
  };

  const endTurn = () => {
    if (turn === 'player') {
      setTurn('opponent');
      setOpponentMana(prev => Math.min(10, prev + 1));
      setTurnTimer(30);
      setTimeout(opponentTurn, 500);
    } else {
      setTurn('player');
      setPlayerMana(prev => Math.min(10, prev + 1));
      setTurnTimer(30);
      
      // Draw card for player
      if (playerHand.length < 7) {
        const newCard = createDeck(grimoire.constellation)[Math.floor(Math.random() * 9)];
        setPlayerHand(prev => [...prev, { ...newCard, id: `${newCard.id}_${Date.now()}` }]);
      }
    }
  };

  const endGame = async (result) => {
    setGameState('ended');
    
    const sparksEarned = result === 'win' ? 
      15 + Math.floor(Math.random() * 10) : 
      5 + Math.floor(Math.random() * 5);
    
    addToBattleLog(
      result === 'win' ? 
        `🎉 Victory! You earned ${sparksEarned} Soul Sparks!` :
        `💀 Defeat... You earned ${sparksEarned} Soul Sparks for trying.`
    );
    
    // Record battle result in Firebase
    await recordBattleResult(user.uid, result, sparksEarned);
    
    setTimeout(() => {
      onBattleComplete(result, sparksEarned);
    }, 3000);
  };

  const addToBattleLog = (message) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  const forfeit = () => {
    endGame('loss');
  };

  if (gameState === 'waiting') {
    return (
      <div className="game-board loading">
        <div className="loading-content">
          <div className="constellation-spinner">⭐</div>
          <h2>Seeking Worthy Opponent...</h2>
          <p>The stars are aligning for battle</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="battle-header">
        <div className="player-info">
          <h3>{ZODIAC_SIGNS[grimoire.constellation].symbol} You</h3>
          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${(playerHP / 30) * 100}%` }}></div>
            <span>{playerHP}/30 HP</span>
          </div>
          <div className="mana-display">⚡ {playerMana} Mana</div>
        </div>

        <div className="battle-center">
          <div className="turn-indicator">
            {turn === 'player' ? '🔮 Your Turn' : '🤖 Opponent\'s Turn'}
          </div>
          <div className="timer">⏱️ {turnTimer}s</div>
        </div>

        <div className="opponent-info">
          <h3>{opponent?.symbol} {opponent?.name}</h3>
          <div className="hp-bar">
            <div className="hp-fill opponent" style={{ width: `${(opponentHP / 30) * 100}%` }}></div>
            <span>{opponentHP}/30 HP</span>
          </div>
          <div className="mana-display">⚡ {opponentMana} Mana</div>
        </div>
      </div>

      <div className="battlefield">
        <div className="opponent-hand">
          {opponentHand.map((_, index) => (
            <div key={index} className="card-back">
              <div className="card-symbol">🌟</div>
            </div>
          ))}
        </div>

        <div className="battle-log">
          <AnimatePresence>
            {battleLog.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="log-message"
              >
                {message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="player-hand">
          {playerHand.map((card) => (
            <motion.div
              key={card.id}
              className={`game-card ${selectedCard?.id === card.id ? 'selected' : ''} ${
                playerMana < card.manaCost || turn !== 'player' ? 'disabled' : ''
              }`}
              onClick={() => turn === 'player' && setSelectedCard(card)}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="card-header">
                <span className="card-name">{card.name}</span>
                <span className="card-cost">⚡{card.manaCost}</span>
              </div>
              
              <div className="card-artwork">{card.artwork}</div>
              
              <div className="card-stats">
                {card.damage && <span className="attack">⚔️{card.damage}</span>}
                {card.defense && <span className="defense">🛡️{card.defense}</span>}
              </div>
              
              <div className="card-description">{card.description}</div>
              
              <div className="card-type">{card.type}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="game-controls">
        {selectedCard && turn === 'player' && playerMana >= selectedCard.manaCost && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="play-card-btn"
            onClick={() => playCard(selectedCard)}
          >
            Cast {selectedCard.name}
          </motion.button>
        )}
        
        <button className="end-turn-btn" onClick={endTurn} disabled={turn !== 'player'}>
          End Turn
        </button>
        
        <button className="forfeit-btn" onClick={forfeit}>
          Forfeit
        </button>
      </div>

      {gameState === 'ended' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="game-over-overlay"
        >
          <div className="game-over-content">
            <h2>{playerHP > 0 ? '🎉 Victory!' : '💀 Defeat'}</h2>
            <p>Returning to grimoire...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameBoard;