import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { ZODIAC_SIGNS } from '../data/constellations';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZSDDFVBYpJQAmLfvl57xkXpN35u4LE-A",
  authDomain: "wizarddb-ede9c.firebaseapp.com",
  projectId: "wizarddb-ede9c",
  storageBucket: "wizarddb-ede9c.firebasestorage.app",
  messagingSenderId: "676724338416",
  appId: "1:676724338416:web:ac5a5fcd79aab412ee1c35",
  measurementId: "G-9ML7VX6WLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Utility function to determine zodiac sign from birth date
export const getZodiacSign = (birthMonth, birthDay) => {
  for (const [key, sign] of Object.entries(ZODIAC_SIGNS)) {
    const [startMonth, startDay] = sign.dates.start;
    const [endMonth, endDay] = sign.dates.end;
    
    if (
      (birthMonth === startMonth && birthDay >= startDay) ||
      (birthMonth === endMonth && birthDay <= endDay) ||
      (startMonth > endMonth && (birthMonth === startMonth || birthMonth === endMonth))
    ) {
      return key;
    }
  }
  return 'ARIES'; // Default fallback
};

// Generate starting grimoire based on zodiac sign and preferences
export const generateGrimoire = (zodiacSign, preferences = {}) => {
  const constellation = ZODIAC_SIGNS[zodiacSign];
  const baseStats = { ...constellation.baseStats };
  
  // Modify stats based on preferences
  if (preferences.favoriteElement) {
    if (preferences.favoriteElement === constellation.element) {
      baseStats.magic += 2;
    }
  }
  
  if (preferences.playStyle === 'aggressive') {
    baseStats.attack += 2;
    baseStats.defense -= 1;
  } else if (preferences.playStyle === 'defensive') {
    baseStats.defense += 2;
    baseStats.attack -= 1;
  } else if (preferences.playStyle === 'magical') {
    baseStats.magic += 2;
    baseStats.speed -= 1;
  }

  // Generate random starting power level (1-3)
  const powerLevel = Math.floor(Math.random() * 3) + 1;
  
  return {
    constellation: zodiacSign,
    level: 1,
    experience: 0,
    soulSparks: 50, // Starting currency
    stats: baseStats,
    powerLevel,
    school: constellation.school,
    primaryMagic: constellation.primaryMagic,
    secondaryMagic: constellation.secondaryMagic,
    startingAbilities: constellation.startingAbilities,
    deck: [], // Will be populated with starting cards
    unlockedCards: constellation.startingAbilities.map(ability => ability.toLowerCase().replace(/[^a-z0-9]/g, '_')),
    battleStats: {
      wins: 0,
      losses: 0,
      totalBattles: 0,
      winStreak: 0,
      bestWinStreak: 0
    },
    achievements: [],
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
};

// Authentication functions
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      username: userData.username || user.email.split('@')[0],
      ...userData,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Grimoire functions
export const createUserGrimoire = async (userId, birthMonth, birthDay, preferences) => {
  try {
    const zodiacSign = getZodiacSign(birthMonth, birthDay);
    const grimoire = generateGrimoire(zodiacSign, preferences);
    
    await setDoc(doc(db, 'grimoires', userId), grimoire);
    return { success: true, grimoire };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserGrimoire = async (userId) => {
  try {
    const docRef = doc(db, 'grimoires', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, grimoire: docSnap.data() };
    } else {
      return { success: false, error: 'Grimoire not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateGrimoire = async (userId, updates) => {
  try {
    const docRef = doc(db, 'grimoires', userId);
    await updateDoc(docRef, {
      ...updates,
      lastActive: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Battle functions
export const recordBattleResult = async (userId, result, sparksEarned, expEarned, battleData = {}) => {
  try {
    const grimoire = await getUserGrimoire(userId);
    if (!grimoire.success) return grimoire;
    
    const currentStats = grimoire.grimoire.battleStats;
    const newStats = {
      ...currentStats,
      totalBattles: currentStats.totalBattles + 1,
      wins: result === 'win' ? currentStats.wins + 1 : currentStats.wins,
      losses: result === 'loss' ? currentStats.losses + 1 : currentStats.losses,
      winStreak: result === 'win' ? currentStats.winStreak + 1 : 0,
      bestWinStreak: result === 'win' ? Math.max(currentStats.bestWinStreak, currentStats.winStreak + 1) : currentStats.bestWinStreak
    };
    
    const newExp = grimoire.grimoire.experience + expEarned;
    const newLevel = Math.floor(newExp / 100) + 1;
    const leveledUp = newLevel > grimoire.grimoire.level;
    
    const updates = {
      battleStats: newStats,
      soulSparks: grimoire.grimoire.soulSparks + sparksEarned + (leveledUp ? 100 : 0),
      experience: newExp,
      level: newLevel
    };
    
    // Boost stats on level up
    if (leveledUp) {
      const statBoost = Math.floor(newLevel / 5) + 1;
      updates.stats = {
        attack: grimoire.grimoire.stats.attack + statBoost,
        defense: grimoire.grimoire.stats.defense + statBoost,
        magic: grimoire.grimoire.stats.magic + statBoost,
        speed: grimoire.grimoire.stats.speed + statBoost
      };
    }
    
    // Generate and save story entry
    const { generateBattleStory, generateLevelUpStory } = await import('./storyGenerator');
    
    const playerData = {
      constellation: grimoire.grimoire.constellation,
      level: grimoire.grimoire.level,
      battleStats: newStats
    };
    
    const battleResult = {
      result,
      spellsUsed: battleData.spellsUsed || [],
      itemsUsed: battleData.itemsUsed || []
    };
    
    const storyEntry = generateBattleStory(playerData, battleResult, battleData.opponent);
    await addStoryEntry(userId, storyEntry);
    
    // Generate level up story if leveled up
    if (leveledUp) {
      const levelUpStory = generateLevelUpStory(playerData, newLevel);
      await addStoryEntry(userId, levelUpStory);
    }
    
    return await updateGrimoire(userId, updates);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Leaderboard functions
export const getLeaderboard = async (type = 'wins', limitCount = 10) => {
  try {
    let q;
    
    if (type === 'level') {
      q = query(
        collection(db, 'grimoires'),
        orderBy('level', 'desc'),
        limit(limitCount)
      );
    } else {
      // For battle stats, we'll get all and sort in JavaScript to avoid index requirements
      q = query(
        collection(db, 'grimoires'),
        limit(50) // Get more to sort properly
      );
    }
    
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      leaderboard.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in JavaScript if needed
    if (type !== 'level') {
      leaderboard.sort((a, b) => {
        const aValue = type === 'wins' ? a.battleStats?.wins || 0 : a.battleStats?.bestWinStreak || 0;
        const bValue = type === 'wins' ? b.battleStats?.wins || 0 : b.battleStats?.bestWinStreak || 0;
        return bValue - aValue;
      });
    }
    
    return { success: true, leaderboard: leaderboard.slice(0, limitCount) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Shop functions
export const purchaseItem = async (userId, itemId, cost) => {
  try {
    const grimoire = await getUserGrimoire(userId);
    if (!grimoire.success) return grimoire;
    
    if (grimoire.grimoire.soulSparks < cost) {
      return { success: false, error: 'Insufficient Soul Sparks' };
    }
    
    const currentInventory = grimoire.grimoire.inventory || {};
    const updates = {
      soulSparks: grimoire.grimoire.soulSparks - cost,
      inventory: {
        ...currentInventory,
        [itemId]: (currentInventory[itemId] || 0) + 1
      }
    };
    
    return await updateGrimoire(userId, updates);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Legacy function for compatibility
export const purchaseCard = purchaseItem;

// Adventure Log functions
export const addStoryEntry = async (userId, storyEntry) => {
  try {
    const docRef = doc(db, 'adventureLogs', userId);
    const docSnap = await getDoc(docRef);
    
    let currentEntries = [];
    if (docSnap.exists()) {
      currentEntries = docSnap.data().entries || [];
    }
    
    const newEntries = [storyEntry, ...currentEntries].slice(0, 50); // Keep last 50 entries
    
    await setDoc(docRef, {
      userId,
      entries: newEntries,
      lastUpdated: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAdventureLog = async (userId) => {
  try {
    const docRef = doc(db, 'adventureLogs', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, log: docSnap.data() };
    } else {
      return { success: true, log: { entries: [] } };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Battle penalty functions
export const applyBattleStrike = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    
    const currentStrikes = userData.battleStrikes || 0;
    const newStrikes = currentStrikes + 1;
    
    let updates = {
      battleStrikes: newStrikes,
      lastStrikeDate: new Date().toISOString()
    };
    
    // 3 strikes = 2 day ban
    if (newStrikes >= 3) {
      const banUntil = new Date();
      banUntil.setDate(banUntil.getDate() + 2);
      updates.bannedUntil = banUntil.toISOString();
      updates.battleStrikes = 0; // Reset strikes after ban
    }
    
    await updateDoc(userRef, updates);
    return { success: true, strikes: newStrikes, banned: newStrikes >= 3 };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const endBattleByAbandon = async (roomId, abandonedUserId) => {
  try {
    const roomRef = doc(db, 'battleRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return { success: false, error: 'Room not found' };
    
    const roomData = roomSnap.data();
    const isHostAbandoned = roomData.hostUserId === abandonedUserId;
    const winner = isHostAbandoned ? 'opponent' : 'host';
    const winnerId = isHostAbandoned ? roomData.opponentUserId : roomData.hostUserId;
    const loserId = abandonedUserId;
    
    // End the battle
    await updateDoc(roomRef, {
      status: 'completed',
      winner: winner,
      endReason: 'abandonment',
      battleLog: [...(roomData.battleLog || []), `Battle ended - ${isHostAbandoned ? roomData.hostGrimoire.constellation : roomData.opponentGrimoire.constellation} abandoned the match`]
    });
    
    // Apply strike to abandoner
    const strikeResult = await applyBattleStrike(loserId);
    
    // Award win to remaining player
    if (winnerId) {
      await recordBattleResult(winnerId, 'win', 75, 150); // Bonus rewards for opponent abandoning
    }
    
    // Record loss for abandoner
    await recordBattleResult(loserId, 'loss', 0, 0); // No rewards for abandoning
    
    return { success: true, strikes: strikeResult.strikes, banned: strikeResult.banned };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Legacy function - now applies strike instead of immediate ban
export const applyBattlePenalty = async (userId) => {
  return await applyBattleStrike(userId);
};

export const getUserStrikes = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return { 
        success: true, 
        strikes: userData.battleStrikes || 0,
        lastStrike: userData.lastStrikeDate
      };
    }
    
    return { success: true, strikes: 0 };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkUserBan = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.bannedUntil) {
        const banDate = new Date(userData.bannedUntil);
        const now = new Date();
        
        if (now < banDate) {
          return { 
            banned: true, 
            until: banDate,
            strikes: userData.battleStrikes || 0
          };
        }
      }
      
      return { 
        banned: false, 
        strikes: userData.battleStrikes || 0 
      };
    }
    
    return { banned: false, strikes: 0 };
  } catch (error) {
    return { banned: false, error: error.message };
  }
};

// Profile functions
export const updateUserProfile = async (userId, profileData) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, profileData);
    
    // Also update grimoire with username
    if (profileData.username) {
      const grimoireRef = doc(db, 'grimoires', userId);
      await updateDoc(grimoireRef, { username: profileData.username, profileImage: profileData.profileImage });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};