import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { sendFriendRequest, getFriendsList, getFriendAdventureLog, getFriendRequests, acceptFriendRequest, rejectFriendRequest, sendMessage, getMessages, createFriendlyDuel, getPendingDuels, acceptDuel, getActiveDuels, db } from '../utils/firebase';

const FriendsPage = ({ user, grimoire }) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [pendingDuels, setPendingDuels] = useState([]);
  const [activeDuels, setActiveDuels] = useState([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendStories, setFriendStories] = useState({ entries: [] });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    loadPendingDuels();
    loadActiveDuels();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Real-time listener for active duels
    const challengerQuery = query(
      collection(db, 'friendlyDuels'),
      where('challengerId', '==', user.uid),
      where('status', '==', 'active')
    );
    
    const unsubscribe = onSnapshot(challengerQuery, (snapshot) => {
      if (!snapshot.empty) {
        const duel = snapshot.docs[0];
        window.location.href = `/battle?duel=${duel.id}`;
      }
    });
    
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedFriend]);

  const loadFriends = async () => {
    try {
      const result = await getFriendsList(user.uid);
      if (result.success) {
        setFriends(result.friends);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const result = await getFriendRequests(user.uid);
      if (result.success) {
        setFriendRequests(result.requests);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadPendingDuels = async () => {
    try {
      const result = await getPendingDuels(user.uid);
      if (result.success) {
        setPendingDuels(result.duels);
      }
    } catch (error) {
      console.error('Error loading pending duels:', error);
    }
  };

  const loadActiveDuels = async () => {
    try {
      const result = await getActiveDuels(user.uid);
      if (result.success) {
        setActiveDuels(result.duels);
        // Auto-redirect if there's an active duel
        if (result.duels.length > 0) {
          const duel = result.duels[0];
          window.location.href = `/battle?duel=${duel.id}`;
        }
      }
    } catch (error) {
      console.error('Error loading active duels:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedFriend) return;
    const chatId = [user.uid, selectedFriend.id].sort().join('_');
    try {
      const result = await getMessages(chatId);
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!friendUsername.trim()) return;
    
    setLoading(true);
    try {
      const result = await sendFriendRequest(user.uid, friendUsername.trim());
      if (result.success) {
        alert('Friend request sent!');
        setFriendUsername('');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error sending friend request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (fromUserId, toUserId) => {
    try {
      const result = await acceptFriendRequest(fromUserId, toUserId);
      if (result.success) {
        alert('Friend request accepted!');
        loadFriends();
        loadFriendRequests();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error accepting request: ' + error.message);
    }
  };

  const handleRejectRequest = async (fromUserId, toUserId) => {
    try {
      const result = await rejectFriendRequest(fromUserId, toUserId);
      if (result.success) {
        alert('Friend request rejected.');
        loadFriendRequests();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error rejecting request: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    
    const chatId = [user.uid, selectedFriend.id].sort().join('_');
    try {
      await sendMessage(chatId, user.uid, newMessage.trim());
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChallengeDuel = async () => {
    if (!selectedFriend) return;
    
    const chatId = [user.uid, selectedFriend.id].sort().join('_');
    try {
      const result = await createFriendlyDuel(user.uid, selectedFriend.id, messages);
      if (result.success) {
        alert('Duel challenge sent!');
        await sendMessage(chatId, user.uid, `⚔️ ${grimoire.username} challenges you to a friendly duel!`);
        loadMessages();
      }
    } catch (error) {
      alert('Error creating duel: ' + error.message);
    }
  };

  const handleAcceptDuel = async (duelId) => {
    try {
      const result = await acceptDuel(duelId);
      if (result.success) {
        loadPendingDuels();
        // Redirect to battle page with duel room
        window.location.href = `/battle?duel=${duelId}`;
      }
    } catch (error) {
      alert('Error accepting duel: ' + error.message);
    }
  };

  const viewFriendStories = async (friend) => {
    setSelectedFriend(friend);
    setLoading(true);
    try {
      const result = await getFriendAdventureLog(friend.id);
      if (result.success) {
        setFriendStories(result.log);
      }
    } catch (error) {
      console.error('Error loading friend stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEntryIcon = (entry) => {
    if (entry.type === 'levelup') return '⭐';
    return entry.result === 'win' ? '🏆' : '💀';
  };

  return (
    <>
      <Header user={user} grimoire={grimoire} />
      <div className="friends-page">
        <BackButton to="/" />
        <h1>👥 Friends & Chronicles</h1>

        {!selectedFriend ? (
          <>
            <div className="add-friend-section">
              <h2>📨 Send Friend Request</h2>
              <div className="friend-input">
                <input
                  type="text"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  placeholder="Enter friend's username"
                  className="username-input"
                />
                <button 
                  onClick={handleSendRequest}
                  disabled={loading || !friendUsername.trim()}
                  className="send-btn"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>

            {friendRequests.length > 0 && (
              <div className="friend-requests">
                <h2>📬 Friend Requests</h2>
                <div className="requests-list">
                  {friendRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-info">
                        <h3>{request.fromUser.username}</h3>
                        <p>Sent: {formatDate(request.createdAt)}</p>
                      </div>
                      <div className="request-actions">
                        <button 
                          onClick={() => handleAcceptRequest(request.fromUserId, request.toUserId)}
                          className="accept-btn"
                        >
                          ✓ Accept
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(request.fromUserId, request.toUserId)}
                          className="reject-btn"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingDuels.length > 0 && (
              <div className="pending-duels">
                <h2>⚔️ Duel Challenges</h2>
                <div className="duels-list">
                  {pendingDuels.map(duel => (
                    <div key={duel.id} className="duel-card">
                      <div className="duel-info">
                        <h3>{duel.challengerGrimoire.username} challenges you!</h3>
                        <p>Level {duel.challengerGrimoire.level} {duel.challengerGrimoire.constellation}</p>
                      </div>
                      <button 
                        onClick={() => handleAcceptDuel(duel.id)}
                        className="accept-duel-btn"
                      >
                        ⚔️ Accept Duel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="friends-list">
              <h2>🤝 Your Friends</h2>
              {friends.length === 0 ? (
                <p className="no-friends">No friends yet. Send some friend requests!</p>
              ) : (
                <div className="friends-grid">
                  {friends.map(friend => (
                    <div key={friend.id} className="friend-card">
                      <h3>{friend.username}</h3>
                      <p>Joined: {formatDate(friend.createdAt)}</p>
                      <button 
                        onClick={() => viewFriendStories(friend)}
                        className="view-stories-btn"
                      >
                        📖 View Chronicles
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="friend-stories-container">
            <div className="friend-stories">
              <div className="friend-header">
                <button 
                  onClick={() => setSelectedFriend(null)}
                  className="back-to-friends"
                >
                  ← Back to Friends
                </button>
                <h2>📖 {selectedFriend.username}'s Chronicles</h2>
              </div>

              {loading ? (
                <div className="loading">Loading chronicles...</div>
              ) : (
                <div className="stories-list">
                  {friendStories.entries?.length === 0 ? (
                    <p className="no-stories">No chronicles yet.</p>
                  ) : (
                    friendStories.entries?.map((entry, index) => (
                      <div key={index} className="story-entry">
                        <div className="story-header">
                          <span className="story-icon">{getEntryIcon(entry)}</span>
                          <div className="story-info">
                            <h3>{entry.title}</h3>
                            <span className="story-date">{formatDate(entry.timestamp)}</span>
                          </div>
                        </div>
                        <div className="story-content">
                          <p>{entry.story}</p>
                          {entry.location && (
                            <div className="story-meta">
                              <span className="location">📍 {entry.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="chat-sidebar">
              <div className="chat-header">
                <h3>💬 Chat with {selectedFriend.username}</h3>
                <button onClick={handleChallengeDuel} className="challenge-btn">
                  ⚔️ Challenge to Duel
                </button>
              </div>
              
              <div className="messages-container">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.userId === user.uid ? 'own' : 'other'}`}>
                    <div className="message-content">{msg.message}</div>
                    <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
              
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="chat-input"
                />
                <button onClick={handleSendMessage} className="send-message-btn">
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .friends-page { max-width: 800px; margin: 0 auto; padding: 20px; }
        .friends-page h1 { color: #d4b3ff; text-shadow: 0 0 10px #a06bff; text-align: center; margin-bottom: 30px; }
        .add-friend-section { background: rgba(20, 15, 40, 0.8); padding: 20px; border-radius: 15px; margin-bottom: 30px; }
        .add-friend-section h2 { color: #d4b3ff; margin-bottom: 15px; }
        .friend-input { display: flex; gap: 10px; }
        .username-input { flex: 1; padding: 10px; border: 1px solid #6d47ff; border-radius: 8px; background: rgba(60, 35, 120, 0.4); color: white; }
        .send-btn { background: linear-gradient(135deg, #7b4bff, #5120c7); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .send-btn:disabled { background: #666; cursor: not-allowed; }
        .friend-requests { background: rgba(20, 15, 40, 0.8); padding: 20px; border-radius: 15px; margin-bottom: 30px; }
        .friend-requests h2 { color: #d4b3ff; margin-bottom: 20px; }
        .requests-list { display: flex; flex-direction: column; gap: 15px; }
        .request-card { background: rgba(60, 35, 120, 0.4); border: 1px solid #6d47ff; border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .request-info h3 { color: #d4b3ff; margin: 0 0 5px 0; }
        .request-info p { color: #b8b8b8; margin: 0; font-size: 0.9rem; }
        .request-actions { display: flex; gap: 10px; }
        .accept-btn { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .reject-btn { background: linear-gradient(135deg, #f44336, #d32f2f); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .pending-duels { background: rgba(20, 15, 40, 0.8); padding: 20px; border-radius: 15px; margin-bottom: 30px; }
        .pending-duels h2 { color: #d4b3ff; margin-bottom: 20px; }
        .duels-list { display: flex; flex-direction: column; gap: 15px; }
        .duel-card { background: rgba(60, 35, 120, 0.4); border: 1px solid #ff6b35; border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .duel-info h3 { color: #ff6b35; margin: 0 0 5px 0; }
        .duel-info p { color: #b8b8b8; margin: 0; font-size: 0.9rem; }
        .accept-duel-btn { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .friend-stories-container { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: 70vh; }
        .friend-stories { overflow-y: auto; }
        .chat-sidebar { background: rgba(20, 15, 40, 0.8); border-radius: 15px; padding: 20px; display: flex; flex-direction: column; }
        .chat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .chat-header h3 { color: #d4b3ff; margin: 0; font-size: 1rem; }
        .challenge-btn { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
        .messages-container { flex: 1; overflow-y: auto; margin-bottom: 15px; max-height: 400px; }
        .message { margin-bottom: 10px; }
        .message.own { text-align: right; }
        .message.other { text-align: left; }
        .message-content { background: rgba(60, 35, 120, 0.6); padding: 8px 12px; border-radius: 10px; display: inline-block; max-width: 80%; color: #eae5ff; }
        .message.own .message-content { background: rgba(123, 75, 255, 0.6); }
        .message-time { font-size: 0.7rem; color: #888; margin-top: 2px; }
        .message-input { display: flex; gap: 8px; }
        .chat-input { flex: 1; padding: 8px; border: 1px solid #6d47ff; border-radius: 6px; background: rgba(60, 35, 120, 0.4); color: white; font-size: 0.9rem; }
        .send-message-btn { background: linear-gradient(135deg, #7b4bff, #5120c7); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
        @media (max-width: 768px) { .friend-stories-container { grid-template-columns: 1fr; } }
        .friends-list h2 { color: #d4b3ff; margin-bottom: 20px; }
        .no-friends { text-align: center; color: #888; font-style: italic; padding: 40px; }
        .friends-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .friend-card { background: rgba(20, 15, 40, 0.8); border: 1px solid #6d47ff; border-radius: 15px; padding: 20px; text-align: center; }
        .friend-card h3 { color: #d4b3ff; margin-bottom: 10px; }
        .friend-card p { color: #b8b8b8; margin-bottom: 15px; }
        .view-stories-btn { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .friend-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
        .back-to-friends { background: rgba(60, 35, 120, 0.6); color: #eae5ff; border: 1px solid #6d47ff; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .friend-header h2 { color: #d4b3ff; margin: 0; }
        .loading { text-align: center; padding: 40px; color: #888; }
        .no-stories { text-align: center; color: #888; font-style: italic; padding: 40px; }
        .stories-list { display: flex; flex-direction: column; gap: 20px; }
        .story-entry { background: rgba(20, 15, 40, 0.8); border: 1px solid #6d47ff; border-radius: 15px; padding: 20px; }
        .story-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .story-icon { font-size: 1.5rem; }
        .story-info h3 { color: #d4b3ff; margin: 0 0 5px 0; }
        .story-date { color: #888; font-size: 0.9rem; }
        .story-content { line-height: 1.6; color: #eae5ff; }
        .story-meta { margin-top: 10px; font-size: 0.9rem; color: #b8b8b8; }
      `}</style>
    </>
  );
};

export default FriendsPage;