import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { SPELLS, CONSTELLATION_SPELLS } from '../data/spells';
import { updateGrimoire } from '../utils/firebase';

const SpellsPage = ({ user, grimoire, updateGrimoire: updateGrimoireState }) => {
  const [availableSpells, setAvailableSpells] = useState([]);
  const [currentLoadout, setCurrentLoadout] = useState(grimoire?.spellLoadout || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const constellationSpells = CONSTELLATION_SPELLS[grimoire?.constellation] || [];
    const spells = constellationSpells.filter(spellId => {
      const spell = SPELLS[spellId];
      return spell && spell.levelRequired <= (grimoire?.level || 1);
    });
    setAvailableSpells(spells);
    
    if (!grimoire?.spellLoadout) {
      const defaultLoadout = spells.slice(0, 3);
      setCurrentLoadout(defaultLoadout);
    }
  }, [grimoire]);

  const addToLoadout = (spellId) => {
    if (currentLoadout.length < 3 && !currentLoadout.includes(spellId)) {
      setCurrentLoadout([...currentLoadout, spellId]);
    }
  };

  const removeFromLoadout = (spellId) => {
    setCurrentLoadout(currentLoadout.filter(id => id !== spellId));
  };

  const saveLoadout = async () => {
    setSaving(true);
    try {
      const result = await updateGrimoire(user.uid, { spellLoadout: currentLoadout });
      if (result.success) {
        updateGrimoireState({ spellLoadout: currentLoadout });
        alert('Spell loadout saved!');
      } else {
        alert('Failed to save loadout: ' + result.error);
      }
    } catch (error) {
      alert('Error saving loadout: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header user={user} grimoire={grimoire} />
      <div className="spells-page">
        <BackButton to="/" />
        <h1>🔮 Spell Management</h1>
        
        <div className="current-loadout">
          <h2>Current Loadout (Max 3)</h2>
          <div className="loadout-slots">
            {[0, 1, 2].map(index => {
              const spellId = currentLoadout[index];
              const spell = spellId ? SPELLS[spellId] : null;
              
              return (
                <div key={index} className={`loadout-slot ${spell ? 'filled' : 'empty'}`}>
                  {spell ? (
                    <>
                      <div className="spell-name">{spell.name}</div>
                      <div className="spell-cost">{spell.manaCost} MP | {spell.actionCost} AP</div>
                      <button onClick={() => removeFromLoadout(spellId)} className="remove-btn">×</button>
                    </>
                  ) : (
                    <div className="empty-text">Empty Slot</div>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={saveLoadout} disabled={saving} className="save-btn">
            {saving ? 'Saving...' : 'Save Loadout'}
          </button>
        </div>

        <div className="available-spells">
          <h2>Available Spells</h2>
          <div className="spells-grid">
            {availableSpells.map(spellId => {
              const spell = SPELLS[spellId];
              const inLoadout = currentLoadout.includes(spellId);
              
              return (
                <div key={spellId} className={`spell-card ${inLoadout ? 'in-loadout' : ''}`}>
                  <h3>{spell.name}</h3>
                  <p className="spell-description">{spell.description}</p>
                  <div className="spell-stats">
                    <span>Level {spell.levelRequired}</span>
                    <span>{spell.manaCost} MP</span>
                    <span>{spell.actionCost} AP</span>
                  </div>
                  <button 
                    onClick={() => inLoadout ? removeFromLoadout(spellId) : addToLoadout(spellId)}
                    disabled={!inLoadout && currentLoadout.length >= 3}
                    className={inLoadout ? 'remove-spell-btn' : 'add-spell-btn'}
                  >
                    {inLoadout ? 'Remove' : 'Add to Loadout'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style>{`
        .spells-page { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .current-loadout { background: rgba(20, 15, 40, 0.8); padding: 20px; border-radius: 15px; margin-bottom: 30px; }
        .loadout-slots { display: flex; gap: 15px; margin: 20px 0; }
        .loadout-slot { flex: 1; height: 120px; border: 2px dashed #6d47ff; border-radius: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; }
        .loadout-slot.filled { border: 2px solid #7b4bff; background: rgba(60, 35, 120, 0.4); }
        .loadout-slot.empty { border: 2px dashed #666; }
        .spell-name { font-weight: bold; color: #d4b3ff; margin-bottom: 5px; }
        .spell-cost { font-size: 0.8rem; color: #b8b8b8; }
        .remove-btn { position: absolute; top: 5px; right: 5px; background: #ff4757; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; }
        .empty-text { color: #666; font-style: italic; }
        .save-btn { background: linear-gradient(135deg, #7b4bff, #5120c7); color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
        .save-btn:disabled { background: #666; cursor: not-allowed; }
        .available-spells h2 { margin-bottom: 20px; }
        .spells-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .spell-card { background: rgba(20, 15, 40, 0.8); border: 1px solid #6d47ff; border-radius: 15px; padding: 20px; }
        .spell-card.in-loadout { border-color: #7b4bff; box-shadow: 0 0 15px rgba(123, 75, 255, 0.3); }
        .spell-card h3 { color: #d4b3ff; margin-bottom: 10px; }
        .spell-description { color: #b8b8b8; margin-bottom: 15px; font-size: 0.9rem; }
        .spell-stats { display: flex; gap: 15px; margin-bottom: 15px; }
        .spell-stats span { background: rgba(60, 35, 120, 0.4); padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; }
        .add-spell-btn { background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .remove-spell-btn { background: linear-gradient(135deg, #dc3545, #fd7e14); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .add-spell-btn:disabled { background: #666; cursor: not-allowed; }
      `}</style>
    </>
  );
};

export default SpellsPage;