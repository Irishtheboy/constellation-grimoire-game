import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createBattleRoom, joinBattleRoom, listenForBattleRooms, makeBattleMove, useItemInBattle } from '../utils/multiplayer';
import { onSnapshot, doc } from 'firebase/firestore';
import { db, endBattleByAbandon, checkUserBan, getDoc, completeDuel, removeExpiredRooms, removeRoom } from '../utils/firebase';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { audioManager } from '../utils/audio';

const BattlePage = ({ user, grimoire, updateGrimoire }) => {
  const [battleRooms, setBattleRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDuel, setIsDuel] = useState(false);
  const [duelData, setDuelData] = useState(null);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Start lobby music (will fallback gracefully if file doesn't exist)
    audioManager.playMusic('/music/lobby-theme.mp3').catch(() => {
      console.log('Lobby music file not found - continuing without music');
    });
    
    // Check if this is a duel
    const urlParams = new URLSearchParams(location.search);
    const duelId = urlParams.get('duel');
    
    if (duelId) {
      setIsDuel(true);
      loadDuelData(duelId);
    } else {
      const unsubscribe = listenForBattleRooms(setBattleRooms);
      // Clean up expired rooms every 30 seconds
      const cleanupInterval = setInterval(() => {
        removeExpiredRooms();
      }, 30000);
      return () => {
        unsubscribe();
        clearInterval(cleanupInterval);
        audioManager.stopMusic();
      };
    }
  }, [location]);

  const loadDuelData = async (duelId) => {
    try {
      const duelRef = doc(db, 'friendlyDuels', duelId);
      const duelSnap = await getDoc(duelRef);
      
      if (duelSnap.exists()) {
        const data = duelSnap.data();
        setDuelData(data);
        
        // For duels, redirect to regular battle system
        alert(`Duel accepted! ${data.challengerGrimoire.username} vs ${data.opponentGrimoire.username}`);
        window.location.href = '/battle';
      }
    } catch (error) {
      console.error('Error loading duel:', error);
    }
  };



  // Listen to current room changes
  useEffect(() => {
    if (!currentRoom) return;
    
    const unsubscribe = onSnapshot(doc(db, 'battleRooms', currentRoom), (doc) => {
      if (doc.exists()) {
        setRoomData(doc.data());
      }
    });
    
    return () => unsubscribe();
  }, [currentRoom]);

  const handleCreateRoom = async () => {
    setLoading(true);
    // Ensure grimoire has inventory
    const grimoireWithInventory = {
      ...grimoire,
      inventory: grimoire.inventory || {}
    };
    const result = await createBattleRoom(user.uid, grimoireWithInventory);
    if (result.success) {
      setCurrentRoom(result.roomId);
    }
    setLoading(false);
  };

  const handleJoinRoom = async (roomId) => {
    setLoading(true);
    // Ensure grimoire has inventory
    const grimoireWithInventory = {
      ...grimoire,
      inventory: grimoire.inventory || {}
    };
    const result = await joinBattleRoom(roomId, user.uid, grimoireWithInventory);
    if (result.success) {
      setCurrentRoom(roomId);
    }
    setLoading(false);
  };
  
  const handleRemoveRoom = async (roomId) => {
    const result = await removeRoom(roomId, user.uid);
    if (result.success) {
      // Room list will update automatically via listener
    }
  };

  return (
    <>
      <Header user={user} />
      <div className="battle-page">
        <button 
          className="music-toggle"
          onClick={() => {
            if (musicEnabled) {
              audioManager.pauseMusic();
              setMusicEnabled(false);
            } else {
              audioManager.resumeMusic();
              setMusicEnabled(true);
            }
          }}
        >
          {musicEnabled ? '🔊' : '🔇'}
        </button>
        <BackButton 
          to="/" 
          warningMessage={roomData?.status === 'active' ? 'Leaving an active battle will give you a strike and end the match. Are you sure?' : null}
          onBack={async () => {
            if (roomData?.status === 'active') {
              const result = await endBattleByAbandon(currentRoom, user.uid);
              if (result.success) {
                if (result.banned) {
                  alert(`Strike ${result.strikes}/3! You have been banned for 2 days!`);
                } else {
                  alert(`Strike ${result.strikes}/3 for abandoning battle. 3 strikes = 2 day ban!`);
                }
              }
            }
            setCurrentRoom(null);
            setRoomData(null);
            window.location.href = '/';
          }}
        />


      {!currentRoom ? (
        <div className="battle-lobby">
          <div className="lobby-header">
            <h2>⚔️ Battle Arena Lobby</h2>
            <p>Challenge other wizards to magical combat</p>
          </div>

          <div className="create-room-section">
            <button 
              onClick={handleCreateRoom} 
              disabled={loading}
              className="create-room-btn"
            >
              <div className="btn-icon">🏟️</div>
              <div className="btn-content">
                <div className="btn-title">{loading ? 'Creating Room...' : 'Create Battle Room'}</div>
                <div className="btn-subtitle">Host a new battle for others to join</div>
              </div>
            </button>
          </div>

          <div className="available-rooms">
            <div className="rooms-header">
              <h3>🎯 Available Battles</h3>
              <span className="room-count">{battleRooms.length} active</span>
            </div>
            
            {battleRooms.length === 0 ? (
              <div className="no-rooms">
                <div className="no-rooms-icon">🏜️</div>
                <h4>No Active Battles</h4>
                <p>Be the first to create a battle room!</p>
              </div>
            ) : (
              <div className="rooms-grid">
                {battleRooms.map(room => (
                  <div key={room.id} className="room-card">
                    <div className="room-header">
                      <div className="host-info">
                        {room.hostGrimoire.profileImage ? (
                          <img src={room.hostGrimoire.profileImage} alt="Host" className="host-avatar" />
                        ) : (
                          <div className="host-avatar constellation">{room.hostGrimoire.constellation}</div>
                        )}
                        <div className="host-details">
                          <h4>{room.hostGrimoire.username || room.hostGrimoire.constellation}</h4>
                          <span className="host-level">Level {room.hostGrimoire.level}</span>
                        </div>
                      </div>
                      <div className="room-status">
                        <span className="status-badge waiting">Waiting</span>
                      </div>
                    </div>
                    
                    <div className="room-stats">
                      <div className="stat">
                        <span className="stat-label">School</span>
                        <span className="stat-value">{room.hostGrimoire.school}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Element</span>
                        <span className="stat-value">{room.hostGrimoire.primaryMagic}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={loading}
                      className="join-room-btn"
                    >
                      <span className="btn-icon">⚔️</span>
                      {loading ? 'Joining...' : 'Join Battle'}
                    </button>
                    
                    {room.hostUserId === user.uid && (
                      <div className="room-actions">
                        <button 
                          className="remove-room-btn"
                          onClick={() => handleRemoveRoom(room.id)}
                        >
                          🗑️ Remove Room
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="battle-room">
          <h2>🎮 Battle Room: {currentRoom}</h2>
          {roomData?.status === 'waiting' ? (
            <div>
              <p>⏳ Waiting for opponent...</p>
              <p>Share this room ID with a friend: <strong>{currentRoom}</strong></p>
            </div>
          ) : roomData?.status === 'active' ? (
            <BattleInterface 
              roomData={roomData} 
              user={user} 
              grimoire={grimoire}
              roomId={currentRoom}
            />
          ) : roomData?.status === 'completed' ? (
            <BattleComplete 
              roomData={roomData} 
              user={user} 
              grimoire={grimoire}
              updateGrimoire={updateGrimoire}
              isDuel={isDuel}
              duelData={duelData}
            />
          ) : (
            <p>Loading room...</p>
          )}
          <button 
            onClick={async () => {
              if (roomData?.status === 'active') {
                const result = await endBattleByAbandon(currentRoom, user.uid);
                if (result.success) {
                  if (result.banned) {
                    alert(`Strike ${result.strikes}/3! You have been banned for 2 days!`);
                  } else {
                    alert(`Strike ${result.strikes}/3 for abandoning battle. 3 strikes = 2 day ban!`);
                  }
                }
              }
              setCurrentRoom(null); 
              setRoomData(null);
            }}
          >
            Leave Room
          </button>
        </div>
      )}
      </div>
      
      <style>{`
        .battle-page { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 20px;
        }
        
        @media (max-width: 768px) {
          .battle-page {
            padding: 10px;
            max-width: 100vw;
          }
        }
        .battle-lobby { 
          padding: 20px 0; 
        }
        
        @media (max-width: 768px) {
          .battle-lobby {
            padding: 15px 0;
          }
        }
        .lobby-header { text-align: center; margin-bottom: 40px; }
        .lobby-header h2 { color: #d4c4b0; margin-bottom: 10px; }
        .lobby-header p { color: #a09080; }
        
        .create-room-section { margin-bottom: 50px; display: flex; justify-content: center; }
        .create-room-btn { 
          display: flex; 
          align-items: center; 
          gap: 20px; 
          background: linear-gradient(145deg, rgba(60, 50, 40, 0.9), rgba(45, 35, 25, 0.9));
          border: 2px solid rgba(200, 180, 160, 0.3);
          border-radius: 15px;
          padding: 25px 35px;
          color: #d4c4b0;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 400px;
        }
        
        @media (max-width: 768px) {
          .create-room-btn {
            min-width: auto;
            width: 100%;
            padding: 20px 25px;
            gap: 15px;
            margin: 0 10px;
          }
        }
        
        @media (max-width: 480px) {
          .create-room-btn {
            padding: 18px 20px;
            gap: 12px;
            flex-direction: column;
            text-align: center;
          }
          
          .btn-icon {
            font-size: 2.5rem !important;
          }
        }
        .create-room-btn:hover { 
          border-color: rgba(200, 180, 160, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }
        .create-room-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-icon { font-size: 3rem; }
        .btn-content { text-align: left; }
        .btn-title { font-size: 1.3rem; font-weight: bold; margin-bottom: 5px; }
        .btn-subtitle { font-size: 0.9rem; color: #a09080; }
        
        .available-rooms { }
        .rooms-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(100, 80, 90, 0.3);
        }
        .rooms-header h3 { color: #d4c4b0; margin: 0; }
        .room-count { 
          background: rgba(60, 35, 120, 0.4);
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          color: #c8b4a0;
        }
        
        .no-rooms { 
          text-align: center; 
          padding: 60px 20px;
          background: linear-gradient(145deg, rgba(25, 20, 30, 0.6), rgba(15, 12, 20, 0.6));
          border-radius: 15px;
          border: 1px solid rgba(100, 80, 90, 0.2);
        }
        .no-rooms-icon { font-size: 4rem; margin-bottom: 20px; }
        .no-rooms h4 { color: #d4c4b0; margin-bottom: 10px; }
        .no-rooms p { color: #a09080; }
        
        .rooms-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
          gap: 20px; 
        }
        
        @media (max-width: 768px) {
          .rooms-grid {
            grid-template-columns: 1fr;
            gap: 15px;
            padding: 0 10px;
          }
        }
        .room-card { 
          background: linear-gradient(145deg, rgba(25, 20, 30, 0.9), rgba(15, 12, 20, 0.9));
          border: 1px solid rgba(100, 80, 90, 0.3);
          border-radius: 15px;
          padding: 25px;
          transition: all 0.3s ease;
        }
        .room-card:hover { 
          border-color: rgba(150, 130, 110, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }
        
        .room-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 20px; 
        }
        .host-info { display: flex; align-items: center; gap: 15px; }
        .host-avatar { 
          width: 50px; 
          height: 50px; 
          border-radius: 50%; 
          object-fit: cover;
          border: 2px solid rgba(150, 130, 110, 0.3);
        }
        .host-avatar.constellation { 
          background: linear-gradient(135deg, #7b4bff, #5120c7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: bold;
          color: white;
        }
        .host-details h4 { color: #d4c4b0; margin: 0 0 5px 0; }
        .host-level { color: #a09080; font-size: 0.9rem; }
        
        .status-badge { 
          padding: 5px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .status-badge.waiting { 
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        }
        
        .room-stats { 
          display: flex; 
          gap: 20px; 
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(35, 30, 40, 0.6);
          border-radius: 10px;
        }
        .stat { text-align: center; flex: 1; }
        .stat-label { 
          display: block; 
          font-size: 0.8rem; 
          color: #a09080; 
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-value { 
          display: block; 
          font-weight: bold; 
          color: #d4c4b0;
        }
        
        .join-room-btn { 
          width: 100%;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border: none;
          border-radius: 10px;
          padding: 15px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .join-room-btn:hover { 
          background: linear-gradient(135deg, #f7931e, #ff6b35);
          transform: translateY(-1px);
        }
        .join-room-btn:disabled { 
          opacity: 0.6; 
          cursor: not-allowed;
          transform: none;
        }
        .join-room-btn .btn-icon { font-size: 1.2rem; }
        
        .room-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        .remove-room-btn {
          background: linear-gradient(135deg, #dc3545, #c82333);
          border: none;
          border-radius: 8px;
          padding: 8px 15px;
          color: white;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .remove-room-btn:hover {
          background: linear-gradient(135deg, #c82333, #dc3545);
          transform: translateY(-1px);
        }
        .music-toggle {
          position: fixed;
          top: 80px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .music-toggle {
            top: 70px;
            right: 15px;
            width: 45px;
            height: 45px;
            font-size: 1.3rem;
          }
        }
        .music-toggle:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
};

const BattleInterface = ({ roomData, user, grimoire, roomId }) => {
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [animationActive, setAnimationActive] = useState(false);
  
  const isHost = roomData.hostUserId === user.uid;
  const isMyTurn = (isHost && roomData.currentTurn === 'host') || (!isHost && roomData.currentTurn === 'opponent');
  const myHP = isHost ? roomData.hostHP : roomData.opponentHP;
  const enemyHP = isHost ? roomData.opponentHP : roomData.hostHP;
  const maxMyHP = isHost ? roomData.maxHostHP : roomData.maxOpponentHP;
  const maxEnemyHP = isHost ? roomData.maxOpponentHP : roomData.maxHostHP;
  const myMana = isHost ? roomData.hostMana : roomData.opponentMana;
  const maxMana = roomData.maxMana || 100;
  const myAP = isHost ? roomData.hostActionPoints : roomData.opponentActionPoints;
  const maxAP = roomData.maxActionPoints || 3;
  const myInventory = isHost ? roomData.hostInventory : roomData.opponentInventory;
  const myBuffs = isHost ? roomData.hostBuffs : roomData.opponentBuffs;
  const enemyBuffs = isHost ? roomData.opponentBuffs : roomData.hostBuffs;
  
  // Import spells and items dynamically
  const [spells, setSpells] = useState({});
  const [availableSpells, setAvailableSpells] = useState([]);
  const [items, setItems] = useState({});
  
  useEffect(() => {
    import('../data/spells').then(({ SPELLS, getDefaultSpellLoadout }) => {
      setSpells(SPELLS);
      const mySpells = grimoire.spellLoadout || getDefaultSpellLoadout(grimoire.constellation, grimoire.level);
      setAvailableSpells(mySpells);
    });
    
    import('../data/items').then(({ SHOP_ITEMS }) => {
      setItems(SHOP_ITEMS);
    });
  }, [grimoire.constellation]);
  
  // Animation effect
  useEffect(() => {
    if (roomData.lastAnimation) {
      setAnimationActive(true);
      setTimeout(() => setAnimationActive(false), 1000);
    }
  }, [roomData.lastAnimation]);
  
  // Battle music
  useEffect(() => {
    if (roomData?.status === 'active') {
      audioManager.playMusic('/music/battle-theme.mp3').catch(() => {
        console.log('Battle music file not found - continuing without music');
      });
    }
  }, [roomData?.status]);
  
  const handleCastSpell = async (spellId) => {
    if (!isMyTurn) return;
    const spell = spells[spellId];
    if (!spell || myMana < spell.manaCost || myAP < spell.actionCost) return;
    
    audioManager.playSound(spell.animation);
    await makeBattleMove(roomId, user.uid, spellId, grimoire);
    setSelectedSpell(null);
  };
  
  const handleUseItem = async (itemId) => {
    if (!isMyTurn) return;
    const item = items[itemId.toUpperCase()] || items[itemId];
    if (!item || !myInventory[itemId] || myInventory[itemId] <= 0 || myAP < item.actionCost) return;
    
    audioManager.playSound('potion');
    await useItemInBattle(roomId, user.uid, itemId);
  };
  
  return (
    <div className="battle-interface">
      <div className="battle-arena">
        <div className="player-side">
          <div className="character-avatar my-character">
            {grimoire.profileImage ? (
              <img 
                src={grimoire.profileImage} 
                alt={grimoire.username}
                className={`profile-image ${animationActive && !isMyTurn ? 'taking-damage' : ''}`}
              />
            ) : (
              <div className={`constellation-symbol ${animationActive && !isMyTurn ? 'taking-damage' : ''}`}>
                {grimoire.constellation}
              </div>
            )}
          </div>
          <div className="player-stats">
            <h4>You</h4>
            <div className="hp-bar">
              <div className="hp-fill" style={{width: `${(myHP/maxMyHP)*100}%`}}></div>
              <span>{myHP}/{maxMyHP} HP</span>
            </div>
            <div className="mana-bar">
              <div className="mana-fill" style={{width: `${(myMana/maxMana)*100}%`}}></div>
              <span>{myMana}/{maxMana} MP</span>
            </div>
            <div className="ap-bar">
              <div className="ap-fill" style={{width: `${(myAP/maxAP)*100}%`}}></div>
              <span>{myAP}/{maxAP} AP</span>
            </div>
            {myBuffs && Object.keys(myBuffs).length > 0 && (
              <div className="buffs-display">
                <h5>Active Buffs:</h5>
                {Object.values(myBuffs).map((buff, i) => (
                  <div key={i} className="buff-item">
                    {getBuffIcon(buff.type)} +{buff.value} ({buff.turnsLeft})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="battle-center">
          <div className={`spell-effect ${animationActive ? roomData.lastAnimation : ''}`}>
            {animationActive && (
              <div className="animation-container">
                {roomData.lastAnimationType === 'item' ? (
                  <div className="potion-sip">
                    <img 
                      src={getPotionImage(roomData.lastAnimation)} 
                      alt="potion"
                      className="potion-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="emoji-fallback" style={{display: 'none', fontSize: '3rem'}}>🧪</div>
                    <div className="sip-effect">💫</div>
                  </div>
                ) : (
                  <div className="spell-projectile">
                    <img 
                      src={getProjectileImage(roomData.lastAnimation)} 
                      alt={roomData.lastAnimation}
                      className="projectile-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="emoji-fallback" style={{display: 'none', fontSize: '4rem'}}>
                      {getAnimationEmoji(roomData.lastAnimation)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="player-side enemy-side">
          <div className="character-avatar enemy-character">
            {(isHost ? roomData.opponentGrimoire.profileImage : roomData.hostGrimoire.profileImage) ? (
              <img 
                src={isHost ? roomData.opponentGrimoire.profileImage : roomData.hostGrimoire.profileImage}
                alt={isHost ? roomData.opponentGrimoire.username : roomData.hostGrimoire.username}
                className={`profile-image ${animationActive && isMyTurn ? 'taking-damage' : ''}`}
              />
            ) : (
              <div className={`constellation-symbol ${animationActive && isMyTurn ? 'taking-damage' : ''}`}>
                {isHost ? roomData.opponentGrimoire.constellation : roomData.hostGrimoire.constellation}
              </div>
            )}
          </div>
          <div className="player-stats">
            <h4>Enemy</h4>
            <div className="hp-bar">
              <div className="hp-fill enemy" style={{width: `${(enemyHP/maxEnemyHP)*100}%`}}></div>
              <span>{enemyHP}/{maxEnemyHP} HP</span>
            </div>
            {enemyBuffs && Object.keys(enemyBuffs).length > 0 && (
              <div className="buffs-display">
                <h5>Enemy Buffs:</h5>
                {Object.values(enemyBuffs).map((buff, i) => (
                  <div key={i} className="buff-item">
                    {getBuffIcon(buff.type)} +{buff.value} ({buff.turnsLeft})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="turn-indicator">
        {isMyTurn ? '🎯 Your Turn!' : '⏳ Enemy Turn'}
      </div>
      
      <div className="battle-actions-container">
        <div className="spell-selection">
          <h4>Spells:</h4>
          <div className="spell-grid">
            {availableSpells.map(spellId => {
              const spell = spells[spellId];
              if (!spell) return null;
              const canCast = myMana >= spell.manaCost && myAP >= spell.actionCost && isMyTurn && (grimoire.level >= spell.levelRequired);
              
              return (
                <button
                  key={spellId}
                  className={`spell-btn ${!canCast ? 'disabled' : ''}`}
                  onClick={() => handleCastSpell(spellId)}
                  disabled={!canCast}
                >
                  <div className="spell-icon">{getSpellIcon(spell.animation)}</div>
                  <div className="spell-name">{spell.name}</div>
                  <div className="spell-cost">{spell.manaCost} MP | {spell.actionCost} AP</div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="item-selection">
          <h4>Items:</h4>
          <div className="item-grid">
            {Object.entries(myInventory || {}).map(([itemId, count]) => {
              if (count <= 0) return null;
              const item = items[itemId.toUpperCase()] || items[itemId]; // Try both cases
              if (!item) {
                console.log('Item not found:', itemId, 'Available items:', Object.keys(items));
                return null;
              }
              const canUse = myAP >= item.actionCost && isMyTurn;
              
              return (
                <button
                  key={itemId}
                  className={`item-btn ${!canUse ? 'disabled' : ''}`}
                  onClick={() => handleUseItem(itemId)}
                  disabled={!canUse}
                >
                  <div className="item-icon">{item.icon}</div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-count">x{count} | {item.actionCost} AP</div>
                </button>
              );
            })}
            {(!myInventory || Object.keys(myInventory).filter(key => myInventory[key] > 0).length === 0) && (
              <p className="no-items">No items available. Visit the shop!</p>
            )}
            <div className="debug-info" style={{fontSize: '0.8rem', color: '#888', marginTop: '10px'}}>
              Debug: Inventory = {JSON.stringify(myInventory)}<br/>
              Available Items = {JSON.stringify(Object.keys(items))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="battle-log">
        <h4>Battle Log:</h4>
        <div className="log-content">
          {roomData.battleLog?.slice(-4).map((log, i) => <p key={i}>{log}</p>)}
        </div>
      </div>
      
      <style>{`
        .battle-interface { 
          padding: 20px; 
          max-width: 800px; 
          margin: 0 auto; 
        }
        
        @media (max-width: 768px) {
          .battle-interface {
            padding: 15px 10px;
            max-width: 100vw;
          }
        }
        .battle-arena { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 30px; 
          background: rgba(0,0,0,0.3); 
          padding: 20px; 
          border-radius: 15px; 
        }
        
        @media (max-width: 768px) {
          .battle-arena {
            flex-direction: column;
            gap: 20px;
            padding: 15px;
            margin-bottom: 20px;
          }
        }
        .player-side { display: flex; flex-direction: column; align-items: center; }
        .enemy-side { align-items: flex-end; }
        .character-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #7b4bff, #5120c7); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; overflow: hidden; }
        .profile-image { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; transition: all 0.3s; }
        .constellation-symbol { font-size: 1.2rem; font-weight: bold; transition: all 0.3s; }
        .taking-damage { animation: shake 0.5s, flash 0.5s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes flash { 0%, 100% { background: inherit; } 50% { background: #ff4757; } }
        .battle-center { flex: 1; display: flex; justify-content: center; align-items: center; height: 100px; }
        .spell-effect { font-size: 3rem; opacity: 0; transition: all 0.5s; position: relative; }
        .spell-effect.fire, .spell-effect.lightning, .spell-effect.ice, .spell-effect.wind, .spell-effect.heal, .spell-effect.shield, .spell-effect.slash { opacity: 1; }
        .animation-container { position: relative; display: flex; flex-direction: column; align-items: center; }
        .projectile-image { width: 80px; height: 80px; object-fit: contain; animation: projectileFly 1.2s ease-out; }
        .potion-sip { position: relative; display: flex; flex-direction: column; align-items: center; }
        .potion-image { width: 60px; height: 60px; object-fit: contain; animation: potionDrink 1.5s ease-out; }
        .emoji-fallback { animation: projectileFly 1.2s ease-out; }
        .potion-sip .emoji-fallback { animation: potionDrink 1.5s ease-out; }
        .sip-effect { font-size: 2rem; position: absolute; top: -20px; animation: sipBubbles 1.5s ease-out 0.5s; }
        .spell-effect.fire .projectile-image { animation: fireProjectile 1.2s ease-out; }
        .spell-effect.ice .projectile-image { animation: iceProjectile 1.2s ease-out; }
        .spell-effect.lightning .projectile-image { animation: lightningProjectile 1.2s ease-out; }
        .spell-effect.wind .projectile-image { animation: windProjectile 1.2s ease-out; }
        .spell-effect.heal .projectile-image { animation: healProjectile 1.2s ease-out; }
        .spell-effect.shield .projectile-image { animation: shieldProjectile 1.2s ease-out; }
        .spell-effect.slash .projectile-image { animation: slashProjectile 1.2s ease-out; }
        @keyframes projectileFly { 0% { transform: translateX(-100px) scale(0.5); opacity: 0; } 50% { transform: translateX(0) scale(1.2); opacity: 1; } 100% { transform: translateX(100px) scale(0.8); opacity: 0; } }
        @keyframes potionDrink { 0% { transform: scale(1) rotate(0deg); } 30% { transform: scale(1.1) rotate(-10deg); } 60% { transform: scale(0.9) rotate(10deg); } 100% { transform: scale(1) rotate(0deg); } }
        @keyframes sipBubbles { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 50% { transform: translateY(-30px) scale(1); opacity: 1; } 100% { transform: translateY(-60px) scale(0.3); opacity: 0; } }
        @keyframes fireProjectile { 0% { transform: translateX(-100px) scale(0.5) rotate(0deg); opacity: 0; filter: hue-rotate(0deg); } 50% { transform: translateX(0) scale(1.2) rotate(180deg); opacity: 1; filter: hue-rotate(30deg); } 100% { transform: translateX(100px) scale(0.8) rotate(360deg); opacity: 0; filter: hue-rotate(60deg); } }
        @keyframes iceProjectile { 0% { transform: translateX(-100px) scale(0.5); opacity: 0; filter: brightness(1); } 50% { transform: translateX(0) scale(1.2); opacity: 1; filter: brightness(1.5) saturate(1.3); } 100% { transform: translateX(100px) scale(0.8); opacity: 0; filter: brightness(0.8); } }
        @keyframes lightningProjectile { 0% { transform: translateX(-100px) scale(0.5); opacity: 0; filter: brightness(1); } 25% { transform: translateX(-25px) scale(1.1); opacity: 1; filter: brightness(2); } 50% { transform: translateX(0) scale(0.9); opacity: 0.7; filter: brightness(1); } 75% { transform: translateX(25px) scale(1.3); opacity: 1; filter: brightness(2.5); } 100% { transform: translateX(100px) scale(0.8); opacity: 0; filter: brightness(1); } }
        @keyframes windProjectile { 0% { transform: translateX(-100px) scale(0.5); opacity: 0.3; } 50% { transform: translateX(0) scale(1.2); opacity: 0.8; } 100% { transform: translateX(100px) scale(0.8); opacity: 0; } }
        @keyframes healProjectile { 0% { transform: translateY(-50px) scale(0.5); opacity: 0; filter: brightness(1); } 50% { transform: translateY(0) scale(1.2); opacity: 1; filter: brightness(1.8) saturate(1.5); } 100% { transform: translateY(50px) scale(0.8); opacity: 0; filter: brightness(1); } }
        @keyframes shieldProjectile { 0% { transform: scale(0.3) rotate(-90deg); opacity: 0; } 50% { transform: scale(1.3) rotate(0deg); opacity: 1; } 100% { transform: scale(1) rotate(90deg); opacity: 0; } }
        @keyframes slashProjectile { 0% { transform: translateX(-100px) rotate(-45deg) scale(0.5); opacity: 0; } 50% { transform: translateX(0) rotate(0deg) scale(1.3); opacity: 1; } 100% { transform: translateX(100px) rotate(45deg) scale(0.8); opacity: 0; } }
        .player-stats { text-align: center; }
        .hp-bar, .mana-bar, .ap-bar { background: #333; border-radius: 10px; height: 15px; position: relative; margin: 5px 0; width: 120px; }
        .hp-fill { background: #4CAF50; height: 100%; border-radius: 10px; transition: width 0.5s; }
        .hp-fill.enemy { background: #f44336; }
        .mana-fill { background: #2196F3; height: 100%; border-radius: 10px; transition: width 0.5s; }
        .ap-fill { background: #FF9800; height: 100%; border-radius: 10px; transition: width 0.5s; }
        .hp-bar span, .mana-bar span, .ap-bar span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 0.7rem; }
        .turn-indicator { text-align: center; font-size: 1.3rem; margin: 20px 0; }
        .battle-actions-container { 
          display: flex; 
          gap: 20px; 
          margin: 20px 0; 
        }
        
        @media (max-width: 768px) {
          .battle-actions-container {
            flex-direction: column;
            gap: 15px;
            margin: 15px 0;
          }
        }
        .spell-selection, .item-selection { flex: 1; }
        .spell-grid, .item-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
          gap: 10px; 
        }
        
        @media (max-width: 768px) {
          .spell-grid, .item-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .spell-grid, .item-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
        }
        .spell-btn, .item-btn { background: linear-gradient(135deg, #7b4bff, #5120c7); border: none; border-radius: 10px; padding: 10px; color: white; cursor: pointer; transition: all 0.3s; }
        .item-btn { background: linear-gradient(135deg, #ff6b35, #f7931e); }
        .spell-btn:hover:not(.disabled), .item-btn:hover:not(.disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(123, 75, 255, 0.4); }
        .spell-btn.disabled, .item-btn.disabled { background: #666; cursor: not-allowed; opacity: 0.5; }
        .spell-icon, .item-icon { font-size: 1.5rem; margin-bottom: 5px; }
        .spell-name, .item-name { font-size: 0.8rem; font-weight: bold; }
        .spell-cost, .item-count { font-size: 0.7rem; opacity: 0.8; }
        .no-items { text-align: center; color: #888; font-style: italic; }
        .battle-log { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; }
        .log-content { max-height: 80px; overflow-y: auto; }
        .log-content p { margin: 5px 0; font-size: 0.9rem; }
        .buffs-display { margin-top: 10px; }
        .buffs-display h5 { color: #d4c4b0; font-size: 0.8rem; margin: 5px 0; }
        .buff-item { 
          background: rgba(123, 75, 255, 0.2);
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.7rem;
          margin: 2px 0;
          color: #c8b4a0;
        }
      `}</style>
    </div>
  );
};

const getSpellIcon = (animation) => {
  const icons = {
    fire: '🔥', ice: '❄️', lightning: '⚡', wind: '💨',
    heal: '✨', shield: '🛡️', slash: '⚔️'
  };
  return icons[animation] || '💫';
};

const getProjectileImage = (animation) => {
  const projectiles = {
    fire: '/images/projectiles/fireball.png',
    ice: '/images/projectiles/iceshard.png', 
    lightning: '/images/projectiles/lightning.png',
    wind: '/images/projectiles/windblast.png',
    slash: '/images/projectiles/sword.png',
    heal: '/images/projectiles/healorb.png',
    shield: '/images/projectiles/barrier.png'
  };
  return projectiles[animation] || '/images/projectiles/default.png';
};

const getPotionImage = (itemType) => {
  const potions = {
    health_potion: '/images/potions/health.png',
    mana_potion: '/images/potions/mana.png',
    strength_boost: '/images/potions/strength.png',
    defense_boost: '/images/potions/defense.png',
    speed_boost: '/images/potions/speed.png'
  };
  return potions[itemType] || '/images/potions/default.png';
};

const getAnimationEmoji = (animation) => {
  const effects = {
    fire: '🔥', ice: '❄️', lightning: '⚡', wind: '💨',
    heal: '✨', shield: '🛡️', slash: '⚔️'
  };
  return effects[animation] || '💫';
};

const getBuffIcon = (buffType) => {
  const icons = {
    attack_boost: '⚔️',
    magic_boost: '🔮',
    defense_boost: '🛡️',
    speed_boost: '⚡'
  };
  return icons[buffType] || '✨';
};

const BattleComplete = ({ roomData, user, grimoire, updateGrimoire, isDuel, duelData }) => {
  const [rewardsProcessed, setRewardsProcessed] = useState(false);
  const isHost = roomData.hostUserId === user.uid;
  const isWinner = (isHost && roomData.winner === 'host') || (!isHost && roomData.winner === 'opponent');
  const winnerName = roomData.winner === 'host' ? roomData.hostGrimoire.constellation : roomData.opponentGrimoire.constellation;
  
  useEffect(() => {
    if (!rewardsProcessed) {
      processRewards();
    }
    
    // Play victory/defeat music
    if (isWinner) {
      audioManager.playMusic('/music/victory-theme.mp3', false).catch(() => {
        console.log('Victory music file not found');
      });
    } else {
      audioManager.playMusic('/music/defeat-theme.mp3', false).catch(() => {
        console.log('Defeat music file not found');
      });
    }
  }, [rewardsProcessed, isWinner]);
  
  const processRewards = async () => {
    const sparksEarned = isWinner ? (isDuel ? 25 : 50) : (isDuel ? 5 : 10);
    const expEarned = isWinner ? (isDuel ? 50 : 100) : (isDuel ? 15 : 25);
    
    try {
      if (isDuel) {
        // Complete the duel and generate AI story
        const winnerId = isWinner ? user.uid : (isHost ? roomData.opponentUserId : roomData.hostUserId);
        const duelEvents = roomData.battleLog || [];
        
        const { completeDuel } = await import('../utils/firebase');
        await completeDuel(roomData.id, winnerId, duelEvents);
      } else {
        // Regular battle
        const result = await import('../utils/firebase').then(({ recordBattleResult }) => 
          recordBattleResult(user.uid, isWinner ? 'win' : 'loss', sparksEarned, expEarned)
        );
      }
      
      // Update local grimoire state
      const newExp = grimoire.experience + expEarned;
      const newLevel = Math.floor(newExp / 100) + 1;
      const leveledUp = newLevel > grimoire.level;
      
      updateGrimoire({
        experience: newExp,
        level: newLevel,
        soulSparks: grimoire.soulSparks + sparksEarned + (leveledUp ? 100 : 0),
        battleStats: {
          ...grimoire.battleStats,
          [isWinner ? 'wins' : 'losses']: grimoire.battleStats[isWinner ? 'wins' : 'losses'] + 1,
          totalBattles: grimoire.battleStats.totalBattles + 1,
          winStreak: isWinner ? grimoire.battleStats.winStreak + 1 : 0
        }
      });
      
      setRewardsProcessed(true);
    } catch (error) {
      console.error('Error processing rewards:', error);
    }
  };
  
  return (
    <div className="battle-complete">
      <h3>🏆 Battle Complete!</h3>
      <div className="winner-announcement">
        <h2>{isWinner ? '🎉 Victory!' : '😔 Defeat'}</h2>
        <p>Winner: {winnerName}</p>
      </div>
      
      <div className="rewards">
        <h4>🎁 Rewards:</h4>
        <div className="reward-item">💰 +{isWinner ? (isDuel ? 25 : 50) : (isDuel ? 5 : 10)} Soul Sparks</div>
        <div className="reward-item">⭐ +{isWinner ? (isDuel ? 50 : 100) : (isDuel ? 15 : 25)} Experience</div>
        {isDuel && <div className="reward-item">📖 AI Story Generated!</div>}
        {Math.floor((grimoire.experience + (isWinner ? (isDuel ? 50 : 100) : (isDuel ? 15 : 25))) / 100) + 1 > grimoire.level && (
          <div className="reward-item level-up">🎆 Level Up! +100 Bonus Sparks</div>
        )}
      </div>
      
      <div className="battle-log">
        <h4>Battle Summary:</h4>
        {roomData.battleLog?.slice(-5).map((log, i) => <p key={i}>{log}</p>)}
      </div>
      
      <style>{`
        .battle-complete { text-align: center; padding: 20px; }
        .winner-announcement { margin: 20px 0; }
        .winner-announcement h2 { font-size: 2rem; margin-bottom: 10px; }
        .rewards { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin: 20px 0; }
        .reward-item { margin: 5px 0; font-size: 1.1rem; }
        .level-up { color: #ffd700; font-weight: bold; animation: glow 1s infinite alternate; }
        @keyframes glow { from { text-shadow: 0 0 5px #ffd700; } to { text-shadow: 0 0 20px #ffd700; } }
        .battle-log { background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; }
      `}</style>
    </div>
  );
};

export default BattlePage;