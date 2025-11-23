import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { purchaseCard } from '../utils/firebase';
import { SHOP_ITEMS } from '../data/items';

const ShopPage = ({ user, grimoire, updateGrimoire }) => {
  const [items, setItems] = useState([]);
  const [purchasing, setPurchasing] = useState(null);
  
  useEffect(() => {
    setItems(Object.values(SHOP_ITEMS));
  }, []);
  
  const handlePurchase = async (item) => {
    if (grimoire.soulSparks < item.cost) {
      alert('Not enough Soul Sparks!');
      return;
    }
    
    setPurchasing(item.id);
    
    try {
      const result = await purchaseCard(user.uid, item.id, item.cost);
      if (result.success) {
        updateGrimoire({ soulSparks: grimoire.soulSparks - item.cost });
        alert(`Purchased ${item.name}!`);
      } else {
        alert('Purchase failed: ' + result.error);
      }
    } catch (error) {
      alert('Purchase error: ' + error.message);
    } finally {
      setPurchasing(null);
    }
  };
  
  return (
    <>
      <Header user={user} />
      <div className="shop-page">
        <div className="shop-header">
          <h1>🏦 Celestial Shop</h1>
          <div className="currency">
            <span>💰 Soul Sparks: {grimoire?.soulSparks || 0}</span>
          </div>
        </div>
        
        <div className="shop-categories">
          <div className="category">
            <h2>🧪 Potions & Elixirs</h2>
            <div className="items-grid">
              {items.filter(item => item.type === 'consumable').map(item => (
                <div key={item.id} className="shop-item">
                  <div className="item-icon">{item.icon}</div>
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-cost">💰 {item.cost}</div>
                  <button 
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing === item.id || grimoire.soulSparks < item.cost}
                    className="purchase-btn"
                  >
                    {purchasing === item.id ? 'Purchasing...' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="category">
            <h2>📜 Spell Scrolls</h2>
            <div className="items-grid">
              {items.filter(item => item.type === 'spell').map(item => (
                <div key={item.id} className="shop-item rare">
                  <div className="item-icon">{item.icon}</div>
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-cost">💰 {item.cost}</div>
                  <button 
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing === item.id || grimoire.soulSparks < item.cost}
                    className="purchase-btn"
                  >
                    {purchasing === item.id ? 'Purchasing...' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="earning-info">
          <h3>💰 How to Earn Soul Sparks</h3>
          <div className="earning-methods">
            <div className="method">⚔️ Win Battle: +50</div>
            <div className="method">💪 Lose Battle: +10</div>
            <div className="method">🎆 Level Up: +100</div>
            <div className="method">🏆 Achievement: +75</div>
          </div>
        </div>
      </div>
      
      <style>{`
        .shop-page { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .shop-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .shop-header h1 { color: #d4b3ff; text-shadow: 0 0 10px #a06bff; }
        .currency { background: rgba(20, 15, 40, 0.8); padding: 10px 20px; border-radius: 20px; border: 1px solid #6d47ff; }
        .category { margin-bottom: 40px; }
        .category h2 { color: #eae5ff; margin-bottom: 20px; }
        .items-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .shop-item { background: rgba(20, 15, 40, 0.85); border: 1px solid #6d47ff; border-radius: 15px; padding: 20px; text-align: center; transition: all 0.3s; }
        .shop-item:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(120, 80, 255, 0.3); }
        .shop-item.rare { border-color: #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
        .item-icon { font-size: 3rem; margin-bottom: 10px; }
        .shop-item h3 { color: #d4b3ff; margin-bottom: 10px; }
        .item-description { color: #b8b8b8; font-size: 0.9rem; margin-bottom: 15px; }
        .item-cost { color: #ffd700; font-weight: bold; font-size: 1.1rem; margin-bottom: 15px; }
        .purchase-btn { background: linear-gradient(135deg, #7b4bff, #5120c7); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
        .purchase-btn:hover:not(:disabled) { background: linear-gradient(135deg, #9a65ff, #6430f5); transform: translateY(-2px); }
        .purchase-btn:disabled { background: #666; cursor: not-allowed; }
        .earning-info { background: rgba(20, 15, 40, 0.6); padding: 20px; border-radius: 15px; border: 1px solid #6d47ff; }
        .earning-methods { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; }
        .method { background: rgba(60, 35, 120, 0.4); padding: 8px 15px; border-radius: 20px; border: 1px solid #9c7bff; }
      `}</style>
    </>
  );
};

export default ShopPage;