export const SHOP_ITEMS = {
  HEALTH_POTION: {
    id: 'health_potion',
    name: 'Health Potion',
    type: 'consumable',
    effect: 'heal',
    value: 50,
    cost: 25,
    actionCost: 1,
    description: 'Restores 50 HP instantly',
    icon: '🧪'
  },
  
  MANA_POTION: {
    id: 'mana_potion',
    name: 'Mana Potion',
    type: 'consumable',
    effect: 'mana',
    value: 30,
    cost: 20,
    actionCost: 1,
    description: 'Restores 30 Mana',
    icon: '💙'
  },
  
  STRENGTH_ELIXIR: {
    id: 'strength_elixir',
    name: 'Strength Elixir',
    type: 'consumable',
    effect: 'attack_boost',
    value: 5,
    duration: 5,
    cost: 40,
    actionCost: 0,
    description: '+5 Attack for 5 turns (Free Action)',
    icon: '💪'
  },
  
  MAGIC_CRYSTAL: {
    id: 'magic_crystal',
    name: 'Magic Crystal',
    type: 'consumable',
    effect: 'magic_boost',
    value: 5,
    duration: 5,
    cost: 40,
    actionCost: 0,
    description: '+5 Magic for 5 turns (Free Action)',
    icon: '💎'
  },
  
  CURSED_SCROLL: {
    id: 'cursed_scroll',
    name: 'Cursed Scroll',
    type: 'spell',
    spell: 'CURSED_WIND',
    cost: 100,
    description: 'Unlocks Cursed Wind ability',
    icon: '📜'
  },
  
  HEALING_TOME: {
    id: 'healing_tome',
    name: 'Healing Tome',
    type: 'spell',
    spell: 'HEALING_LIGHT',
    cost: 120,
    description: 'Unlocks Healing Light spell',
    icon: '📖'
  }
};

export const EARNING_SYSTEM = {
  BATTLE_WIN: 50,
  BATTLE_LOSS: 10,
  DAILY_LOGIN: 25,
  LEVEL_UP: 100,
  ACHIEVEMENT: 75
};