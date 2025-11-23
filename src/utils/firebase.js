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
export const recordBattleResult = async (userId, result, sparksEarned) => {
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
    
    const updates = {
      battleStats: newStats,
      soulSparks: grimoire.grimoire.soulSparks + sparksEarned,
      experience: grimoire.grimoire.experience + (result === 'win' ? 25 : 10)
    };
    
    // Check for level up
    const newLevel = Math.floor(updates.experience / 100) + 1;
    if (newLevel > grimoire.grimoire.level) {
      updates.level = newLevel;
      updates.soulSparks += newLevel * 10; // Bonus sparks for leveling up
    }
    
    return await updateGrimoire(userId, updates);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Leaderboard functions
export const getLeaderboard = async (type = 'wins', limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'grimoires'),
      orderBy(`battleStats.${type}`, 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      leaderboard.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, leaderboard };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Card shop functions
export const purchaseCard = async (userId, cardId, cost) => {
  try {
    const grimoire = await getUserGrimoire(userId);
    if (!grimoire.success) return grimoire;
    
    if (grimoire.grimoire.soulSparks < cost) {
      return { success: false, error: 'Insufficient Soul Sparks' };
    }
    
    const updates = {
      soulSparks: grimoire.grimoire.soulSparks - cost,
      unlockedCards: [...grimoire.grimoire.unlockedCards, cardId]
    };
    
    return await updateGrimoire(userId, updates);
  } catch (error) {
    return { success: false, error: error.message };
  }
};