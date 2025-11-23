import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';

// Create a battle room
export const createBattleRoom = async (hostUserId, hostGrimoire) => {
  try {
    const battleRoom = {
      hostUserId,
      hostGrimoire,
      opponentUserId: null,
      opponentGrimoire: null,
      status: 'waiting', // waiting, active, completed
      createdAt: new Date().toISOString(),
      winner: null
    };
    
    const docRef = await addDoc(collection(db, 'battleRooms'), battleRoom);
    return { success: true, roomId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Join a battle room
export const joinBattleRoom = async (roomId, userId, grimoire) => {
  try {
    const roomRef = doc(db, 'battleRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      return { success: false, error: 'Room not found' };
    }
    
    const roomData = roomSnap.data();
    const hostGrimoire = roomData.hostGrimoire;
    
    await updateDoc(roomRef, {
      opponentUserId: userId,
      opponentGrimoire: grimoire,
      status: 'active',
      currentTurn: 'host',
      hostHP: hostGrimoire.stats.defense * 15,
      opponentHP: grimoire.stats.defense * 15,
      maxHostHP: hostGrimoire.stats.defense * 15,
      maxOpponentHP: grimoire.stats.defense * 15,
      hostMana: 100,
      opponentMana: 100,
      maxMana: 100,
      hostActionPoints: 3,
      opponentActionPoints: 3,
      maxActionPoints: 3,
      hostInventory: hostGrimoire.inventory || {},
      opponentInventory: grimoire.inventory || {},
      battleLog: [`Battle started! ${hostGrimoire.constellation} vs ${grimoire.constellation}`]
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Make a battle move with advanced mechanics
// Use item in battle
export const useItemInBattle = async (roomId, userId, itemId) => {
  try {
    const roomRef = doc(db, 'battleRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return { success: false, error: 'Room not found' };
    
    const roomData = roomSnap.data();
    const isHost = roomData.hostUserId === userId;
    const currentTurn = roomData.currentTurn;
    
    if ((isHost && currentTurn !== 'host') || (!isHost && currentTurn !== 'opponent')) {
      return { success: false, error: 'Not your turn' };
    }
    
    const { SHOP_ITEMS } = await import('../data/items');
    const item = SHOP_ITEMS[itemId];
    
    if (!item) return { success: false, error: 'Invalid item' };
    
    // Check if player has the item
    const inventory = isHost ? roomData.hostInventory : roomData.opponentInventory;
    if (!inventory[itemId] || inventory[itemId] <= 0) {
      return { success: false, error: 'Item not available' };
    }
    
    // Check action points
    const currentAP = isHost ? roomData.hostActionPoints : roomData.opponentActionPoints;
    if (currentAP < item.actionCost) {
      return { success: false, error: 'Not enough action points' };
    }
    
    let newHostHP = roomData.hostHP;
    let newOpponentHP = roomData.opponentHP;
    let newHostMana = roomData.hostMana;
    let newOpponentMana = roomData.opponentMana;
    let newHostAP = roomData.hostActionPoints;
    let newOpponentAP = roomData.opponentActionPoints;
    let newHostInventory = { ...roomData.hostInventory };
    let newOpponentInventory = { ...roomData.opponentInventory };
    
    const casterName = isHost ? roomData.hostGrimoire.constellation : roomData.opponentGrimoire.constellation;
    let logMessage = `${casterName} used ${item.name}!`;
    
    // Apply item effect
    if (item.effect === 'heal') {
      if (isHost) {
        newHostHP = Math.min(roomData.maxHostHP, roomData.hostHP + item.value);
        newHostAP -= item.actionCost;
        newHostInventory[itemId]--;
      } else {
        newOpponentHP = Math.min(roomData.maxOpponentHP, roomData.opponentHP + item.value);
        newOpponentAP -= item.actionCost;
        newOpponentInventory[itemId]--;
      }
      logMessage += ` Restored ${item.value} HP!`;
    } else if (item.effect === 'mana') {
      if (isHost) {
        newHostMana = Math.min(100, roomData.hostMana + item.value);
        newHostAP -= item.actionCost;
        newHostInventory[itemId]--;
      } else {
        newOpponentMana = Math.min(100, roomData.opponentMana + item.value);
        newOpponentAP -= item.actionCost;
        newOpponentInventory[itemId]--;
      }
      logMessage += ` Restored ${item.value} Mana!`;
    }
    
    // Check turn end
    let nextTurn = currentTurn;
    const remainingAP = isHost ? newHostAP : newOpponentAP;
    if (remainingAP <= 0) {
      nextTurn = isHost ? 'opponent' : 'host';
      if (isHost) {
        newOpponentAP = 3;
      } else {
        newHostAP = 3;
      }
    }
    
    await updateDoc(roomRef, {
      hostHP: newHostHP,
      opponentHP: newOpponentHP,
      hostMana: newHostMana,
      opponentMana: newOpponentMana,
      hostActionPoints: newHostAP,
      opponentActionPoints: newOpponentAP,
      hostInventory: newHostInventory,
      opponentInventory: newOpponentInventory,
      currentTurn: nextTurn,
      battleLog: [...(roomData.battleLog || []), logMessage]
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const makeBattleMove = async (roomId, userId, spellId, grimoire) => {
  try {
    const roomRef = doc(db, 'battleRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return { success: false, error: 'Room not found' };
    
    const roomData = roomSnap.data();
    const isHost = roomData.hostUserId === userId;
    const currentTurn = roomData.currentTurn;
    
    if ((isHost && currentTurn !== 'host') || (!isHost && currentTurn !== 'opponent')) {
      return { success: false, error: 'Not your turn' };
    }
    
    // Import spell data
    const { SPELLS } = await import('../data/spells');
    const spell = SPELLS[spellId];
    
    if (!spell) return { success: false, error: 'Invalid spell' };
    
    // Check mana and action points
    const currentMana = isHost ? (roomData.hostMana || 100) : (roomData.opponentMana || 100);
    const currentAP = isHost ? (roomData.hostActionPoints || 3) : (roomData.opponentActionPoints || 3);
    
    if (currentMana < spell.manaCost) {
      return { success: false, error: 'Not enough mana' };
    }
    
    if (currentAP < spell.actionCost) {
      return { success: false, error: 'Not enough action points' };
    }
    
    let newHostHP = roomData.hostHP;
    let newOpponentHP = roomData.opponentHP;
    let newHostMana = roomData.hostMana || 100;
    let newOpponentMana = roomData.opponentMana || 100;
    let newHostAP = roomData.hostActionPoints || 3;
    let newOpponentAP = roomData.opponentActionPoints || 3;
    let logMessage = '';
    let animation = spell.animation;
    
    const casterName = isHost ? roomData.hostGrimoire.constellation : roomData.opponentGrimoire.constellation;
    
    if (spell.type === 'attack' || spell.type === 'debuff') {
      const baseStat = grimoire.stats[spell.statMultiplier] || 10;
      const damage = Math.floor(baseStat * spell.baseDamage * (0.8 + Math.random() * 0.4));
      
      if (isHost) {
        newOpponentHP = Math.max(0, roomData.opponentHP - damage);
        newHostMana -= spell.manaCost;
        newHostAP -= spell.actionCost;
      } else {
        newHostHP = Math.max(0, roomData.hostHP - damage);
        newOpponentMana -= spell.manaCost;
        newOpponentAP -= spell.actionCost;
      }
      
      logMessage = `${casterName} cast ${spell.name} for ${damage} damage!`;
      
    } else if (spell.type === 'heal') {
      const baseStat = grimoire.stats[spell.statMultiplier] || 10;
      const healing = Math.floor(baseStat * spell.baseHeal);
      
      if (isHost) {
        const maxHP = roomData.maxHostHP;
        newHostHP = Math.min(maxHP, roomData.hostHP + healing);
        newHostMana -= spell.manaCost;
        newHostAP -= spell.actionCost;
      } else {
        const maxHP = roomData.maxOpponentHP;
        newOpponentHP = Math.min(maxHP, roomData.opponentHP + healing);
        newOpponentMana -= spell.manaCost;
        newOpponentAP -= spell.actionCost;
      }
      
      logMessage = `${casterName} cast ${spell.name} and healed for ${healing} HP!`;
    }
    
    // Check for winner and turn end
    let winner = null;
    let status = 'active';
    let nextTurn = currentTurn;
    
    if (newHostHP <= 0) {
      winner = 'opponent';
      status = 'completed';
    } else if (newOpponentHP <= 0) {
      winner = 'host';
      status = 'completed';
    } else {
      // Check if turn should end (no action points left)
      const remainingAP = isHost ? newHostAP : newOpponentAP;
      if (remainingAP <= 0) {
        nextTurn = isHost ? 'opponent' : 'host';
        // Reset action points for next turn
        if (isHost) {
          newOpponentAP = 3;
        } else {
          newHostAP = 3;
        }
      }
    }
    
    // Update room
    await updateDoc(roomRef, {
      hostHP: newHostHP,
      opponentHP: newOpponentHP,
      hostMana: newHostMana,
      opponentMana: newOpponentMana,
      hostActionPoints: newHostAP,
      opponentActionPoints: newOpponentAP,
      currentTurn: nextTurn,
      winner,
      status,
      lastAnimation: animation,
      battleLog: [...(roomData.battleLog || []), logMessage]
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen for available battle rooms
export const listenForBattleRooms = (callback) => {
  const q = query(
    collection(db, 'battleRooms'),
    where('status', '==', 'waiting')
  );
  
  return onSnapshot(q, (snapshot) => {
    const rooms = [];
    snapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() });
    });
    // Sort in JavaScript instead of Firestore
    rooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(rooms);
  });
};