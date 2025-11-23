import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUserGrimoire } from './utils/firebase';
import LoginPage from './pages/LoginPage';
import GrimoirePage from './pages/GrimoirePage';
import BattlePage from './pages/BattlePage';
import ShopPage from './pages/ShopPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SpellsPage from './pages/SpellsPage';
import AdventureLogPage from './pages/AdventureLogPage';
import FriendsPage from './pages/FriendsPage';
import GrimoireCreation from './components/GrimoireCreation';
import { audioManager } from './utils/audio';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [grimoire, setGrimoire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsGrimoire, setNeedsGrimoire] = useState(false);

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = () => {
      audioManager.init();
      audioManager.playMusic();
    };
    
    document.addEventListener('click', initAudio, { once: true });
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Check if user has a grimoire
        const grimoireResult = await getUserGrimoire(user.uid);
        if (grimoireResult.success) {
          setGrimoire(grimoireResult.grimoire);
          setNeedsGrimoire(false);
        } else {
          setNeedsGrimoire(true);
        }
      } else {
        setUser(null);
        setGrimoire(null);
        setNeedsGrimoire(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGrimoireCreated = (newGrimoire) => {
    setGrimoire(newGrimoire);
    setNeedsGrimoire(false);
  };

  const updateGrimoire = (updates) => {
    setGrimoire(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="constellation-spinner">⭐</div>
          <h2>Loading Constellation Grimoire...</h2>
          <p>Connecting to the celestial realm</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (needsGrimoire) {
    return (
      <GrimoireCreation 
        user={user} 
        onGrimoireCreated={handleGrimoireCreated}
      />
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={
              <GrimoirePage 
                user={user} 
                grimoire={grimoire} 
                updateGrimoire={updateGrimoire}
              />
            } 
          />
          <Route 
            path="/battle" 
            element={
              <BattlePage 
                user={user} 
                grimoire={grimoire} 
                updateGrimoire={updateGrimoire}
              />
            } 
          />
          <Route 
            path="/shop" 
            element={
              <ShopPage 
                user={user} 
                grimoire={grimoire} 
                updateGrimoire={updateGrimoire}
              />
            } 
          />
          <Route 
            path="/leaderboard" 
            element={<LeaderboardPage user={user} />} 
          />
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                user={user} 
                grimoire={grimoire} 
                updateGrimoire={updateGrimoire}
              />
            } 
          />
          <Route 
            path="/spells" 
            element={
              <SpellsPage 
                user={user} 
                grimoire={grimoire} 
                updateGrimoire={updateGrimoire}
              />
            } 
          />
          <Route 
            path="/adventure-log" 
            element={
              <AdventureLogPage 
                user={user} 
                grimoire={grimoire}
              />
            } 
          />
          <Route 
            path="/friends" 
            element={
              <FriendsPage 
                user={user} 
                grimoire={grimoire}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;