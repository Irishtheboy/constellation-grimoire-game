import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createBattleRoom, joinBattleRoom, listenForBattleRooms, makeBattleMove, useItemInBattle } from '../utils/multiplayer';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import Header from '../components/Header';

const BattlePage = ({ user, grimoire, updateGrimoire }) => {
  const [battleRooms, setBattleRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = listenForBattleRooms(setBattleRooms);
    return () => unsubscribe();
  }, []);

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

  return (
    <>
      <Header user={user} />
      <div className="battle-page">
        <header>
          <h1>⚔️ Battle Arena</h1>
          <Link to="/" className="back-btn">← Back to Grimoire</Link>
        </header>

      {!currentRoom ? (
        <div className="battle-lobby">
          <div className="battle-options">
            <button 
              onClick={handleCreateRoom} 
              disabled={loading}
              className="create-room-btn"
            >
              {loading ? 'Creating...' : '🏟️ Create Battle Room'}
            </button>
          </div>

          <div className="available-rooms">
            <h2>🎯 Available Battles</h2>
            {battleRooms.length === 0 ? (
              <p>No battles available. Create one!</p>
            ) : (
              battleRooms.map(room => (
                <div key={room.id} className="room-card">
                  <h3>Battle vs {room.hostGrimoire.constellation}</h3>
                  <p>Level {room.hostGrimoire.level}</p>
                  <button 
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={loading}
                  >
                    Join Battle
                  </button>
                </div>
              ))
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
            />
          ) : (
            <p>Loading room...</p>
          )}
          <button onClick={() => { setCurrentRoom(null); setRoomData(null); }}>Leave Room</button>
        </div>
      )}
      </div>
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
  
  // Import spells and items dynamically
  const [spells, setSpells] = useState({});
  const [availableSpells, setAvailableSpells] = useState([]);
  const [items, setItems] = useState({});
  
  useEffect(() => {
    import('../data/spells').then(({ SPELLS, CONSTELLATION_SPELLS }) => {
      setSpells(SPELLS);
      const mySpells = CONSTELLATION_SPELLS[grimoire.constellation] || ['PHYSICAL_STRIKE'];
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
  
  const handleCastSpell = async (spellId) => {
    if (!isMyTurn) return;
    const spell = spells[spellId];
    if (!spell || myMana < spell.manaCost || myAP < spell.actionCost) return;
    
    await makeBattleMove(roomId, user.uid, spellId, grimoire);
    setSelectedSpell(null);
  };
  
  const handleUseItem = async (itemId) => {
    if (!isMyTurn) return;
    const item = items[itemId.toUpperCase()] || items[itemId];
    if (!item || !myInventory[itemId] || myInventory[itemId] <= 0 || myAP < item.actionCost) return;
    
    await useItemInBattle(roomId, user.uid, itemId);
  };
  
  return (
    <div className="battle-interface">
      <div className="battle-arena">
        <div className="player-side">
          <div className="character-avatar my-character">
            <div className={`constellation-symbol ${animationActive && !isMyTurn ? 'taking-damage' : ''}`}>
              {grimoire.constellation}
            </div>
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
          </div>
        </div>
        
        <div className="battle-center">
          <div className={`spell-effect ${animationActive ? roomData.lastAnimation : ''}`}>
            {animationActive && getAnimationEmoji(roomData.lastAnimation)}
          </div>
        </div>
        
        <div className="player-side enemy-side">
          <div className="character-avatar enemy-character">
            <div className={`constellation-symbol ${animationActive && isMyTurn ? 'taking-damage' : ''}`}>
              {isHost ? roomData.opponentGrimoire.constellation : roomData.hostGrimoire.constellation}
            </div>
          </div>
          <div className="player-stats">
            <h4>Enemy</h4>
            <div className="hp-bar">
              <div className="hp-fill enemy" style={{width: `${(enemyHP/maxEnemyHP)*100}%`}}></div>
              <span>{enemyHP}/{maxEnemyHP} HP</span>
            </div>
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
              const canCast = myMana >= spell.manaCost && myAP >= spell.actionCost && isMyTurn;
              
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
        .battle-interface { padding: 20px; max-width: 800px; margin: 0 auto; }
        .battle-arena { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px; }
        .player-side { display: flex; flex-direction: column; align-items: center; }
        .enemy-side { align-items: flex-end; }
        .character-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #7b4bff, #5120c7); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .constellation-symbol { font-size: 1.2rem; font-weight: bold; transition: all 0.3s; }
        .taking-damage { animation: shake 0.5s, flash 0.5s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes flash { 0%, 100% { background: inherit; } 50% { background: #ff4757; } }
        .battle-center { flex: 1; display: flex; justify-content: center; align-items: center; height: 100px; }
        .spell-effect { font-size: 3rem; opacity: 0; transition: all 0.5s; }
        .spell-effect.fire, .spell-effect.lightning, .spell-effect.ice, .spell-effect.wind, .spell-effect.heal, .spell-effect.shield, .spell-effect.slash { opacity: 1; animation: spellCast 1s; }
        @keyframes spellCast { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
        .player-stats { text-align: center; }
        .hp-bar, .mana-bar, .ap-bar { background: #333; border-radius: 10px; height: 15px; position: relative; margin: 5px 0; width: 120px; }
        .hp-fill { background: #4CAF50; height: 100%; border-radius: 10px; transition: width 0.5s; }
        .hp-fill.enemy { background: #f44336; }
        .mana-fill { background: #2196F3; height: 100%; border-radius: 10px; transition: width 0.5s; }
        .ap-fill { background: #FF9800; height: 100%; border-radius: 10px; transition: width 0.5s; }
        .hp-bar span, .mana-bar span, .ap-bar span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 0.7rem; }
        .turn-indicator { text-align: center; font-size: 1.3rem; margin: 20px 0; }
        .battle-actions-container { display: flex; gap: 20px; margin: 20px 0; }
        .spell-selection, .item-selection { flex: 1; }
        .spell-grid, .item-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
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

const getAnimationEmoji = (animation) => {
  const effects = {
    fire: '🔥💥', ice: '❄️💎', lightning: '⚡💫', wind: '💨🌪️',
    heal: '✨💚', shield: '🛡️✨', slash: '⚔️💥'
  };
  return effects[animation] || '💫';
};

const BattleComplete = ({ roomData, user, grimoire, updateGrimoire }) => {
  const [rewardsProcessed, setRewardsProcessed] = useState(false);
  const isHost = roomData.hostUserId === user.uid;
  const isWinner = (isHost && roomData.winner === 'host') || (!isHost && roomData.winner === 'opponent');
  const winnerName = roomData.winner === 'host' ? roomData.hostGrimoire.constellation : roomData.opponentGrimoire.constellation;
  
  useEffect(() => {
    if (!rewardsProcessed) {
      processRewards();
    }
  }, [rewardsProcessed]);
  
  const processRewards = async () => {
    const sparksEarned = isWinner ? 50 : 10;
    const expEarned = isWinner ? 100 : 25;
    
    try {
      const result = await import('../utils/firebase').then(({ recordBattleResult }) => 
        recordBattleResult(user.uid, isWinner ? 'win' : 'loss', sparksEarned, expEarned)
      );
      
      if (result.success) {
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
      }
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
        <div className="reward-item">💰 +{isWinner ? 50 : 10} Soul Sparks</div>
        <div className="reward-item">⭐ +{isWinner ? 100 : 25} Experience</div>
        {Math.floor((grimoire.experience + (isWinner ? 100 : 25)) / 100) + 1 > grimoire.level && (
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