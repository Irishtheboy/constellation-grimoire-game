import React, { useState } from 'react';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { updateUserProfile } from '../utils/firebase';

const VULGAR_WORDS = ['damn', 'hell', 'stupid', 'idiot', 'noob', 'loser'];

const ProfilePage = ({ user, grimoire, updateGrimoire }) => {
  const [username, setUsername] = useState(grimoire?.username || '');
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const isVulgar = (text) => {
    return VULGAR_WORDS.some(word => text.toLowerCase().includes(word));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large. Please choose an image under 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize to max 300x300
          const maxSize = 300;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProfileImage(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      alert('Username is required!');
      return;
    }
    
    if (isVulgar(username)) {
      alert('Username contains inappropriate language. Please choose another.');
      return;
    }

    setSaving(true);
    try {
      const result = await updateUserProfile(user.uid, {
        username: username.trim(),
        profileImage: profileImage || grimoire?.profileImage
      });
      
      if (result.success) {
        updateGrimoire({ 
          username: username.trim(),
          profileImage: profileImage || grimoire?.profileImage
        });
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header user={user} grimoire={grimoire} />
      <div className="profile-page">
        <BackButton to="/" />
        <h1>👤 Profile Settings</h1>
        
        <div className="profile-form">
          <div className="profile-image-section">
            <div className="current-image">
              {(profileImage || grimoire?.profileImage) ? (
                <img src={profileImage || grimoire?.profileImage} alt="Profile" />
              ) : (
                <div className="placeholder">📷</div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="image-upload"
            />
          </div>
          
          <div className="username-section">
            <label>Username:</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
            />
          </div>
          
          <button onClick={handleSave} disabled={saving} className="save-btn">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="inventory-section">
          <h2>🎒 Your Inventory</h2>
          <div className="inventory-grid">
            {Object.entries(grimoire?.inventory || {}).map(([itemId, count]) => {
              if (count <= 0) return null;
              return (
                <div key={itemId} className="inventory-item">
                  <div className="item-count">x{count}</div>
                  <div className="item-name">{itemId.replace('_', ' ')}</div>
                </div>
              );
            })}
            {(!grimoire?.inventory || Object.keys(grimoire.inventory).length === 0) && (
              <p>No items in inventory. Visit the shop!</p>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .profile-page { max-width: 600px; margin: 0 auto; padding: 20px; }
        .profile-form { background: rgba(20, 15, 40, 0.8); padding: 30px; border-radius: 15px; margin-bottom: 30px; }
        .profile-image-section { text-align: center; margin-bottom: 20px; }
        .current-image { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 15px; overflow: hidden; border: 3px solid #6d47ff; }
        .current-image img { width: 100%; height: 100%; object-fit: cover; }
        .placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: rgba(60, 35, 120, 0.4); }
        .image-upload { margin-top: 10px; }
        .username-section { margin-bottom: 20px; }
        .username-section label { display: block; margin-bottom: 5px; color: #d4b3ff; }
        .username-section input { width: 100%; padding: 10px; border: 1px solid #6d47ff; border-radius: 8px; background: rgba(60, 35, 120, 0.4); color: white; }
        .save-btn { background: linear-gradient(135deg, #7b4bff, #5120c7); color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
        .save-btn:disabled { background: #666; cursor: not-allowed; }
        .inventory-section { background: rgba(20, 15, 40, 0.6); padding: 20px; border-radius: 15px; }
        .inventory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .inventory-item { background: rgba(60, 35, 120, 0.4); padding: 15px; border-radius: 10px; text-align: center; }
        .item-count { font-size: 1.2rem; font-weight: bold; color: #ffd700; }
        .item-name { text-transform: capitalize; color: #eae5ff; }
      `}</style>
    </>
  );
};

export default ProfilePage;