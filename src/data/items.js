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
    duration: 3,
    cost: 40,
    actionCost: 0,
    description: '+5 Attack for 3 turns (Free Action)',
    icon: '💪'
  },
  
  MAGIC_CRYSTAL: {
    id: 'magic_crystal',
    name: 'Magic Crystal',
    type: 'consumable',
    effect: 'magic_boost',
    value: 5,
    duration: 3,
    cost: 40,
    actionCost: 0,
    description: '+5 Magic for 3 turns (Free Action)',
    icon: '💎'
  },
  
  DEFENSE_POTION: {
    id: 'defense_potion',
    name: 'Defense Potion',
    type: 'consumable',
    effect: 'defense_boost',
    value: 3,
    duration: 4,
    cost: 35,
    actionCost: 1,
    description: '+3 Defense for 4 turns',
    icon: '🛡️'
  },
  
  SPEED_ELIXIR: {
    id: 'speed_elixir',
    name: 'Speed Elixir',
    type: 'consumable',
    effect: 'speed_boost',
    value: 4,
    duration: 2,
    cost: 30,
    actionCost: 0,
    description: '+4 Speed for 2 turns (Free Action)',
    icon: '⚡'
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

// Add lowercase aliases for easier access
SHOP_ITEMS.health_potion = SHOP_ITEMS.HEALTH_POTION;
SHOP_ITEMS.mana_potion = SHOP_ITEMS.MANA_POTION;
SHOP_ITEMS.strength_elixir = SHOP_ITEMS.STRENGTH_ELIXIR;
SHOP_ITEMS.magic_crystal = SHOP_ITEMS.MAGIC_CRYSTAL;
SHOP_ITEMS.defense_potion = SHOP_ITEMS.DEFENSE_POTION;
SHOP_ITEMS.speed_elixir = SHOP_ITEMS.SPEED_ELIXIR;
SHOP_ITEMS.cursed_scroll = SHOP_ITEMS.CURSED_SCROLL;
SHOP_ITEMS.healing_tome = SHOP_ITEMS.HEALING_TOME;

export const EARNING_SYSTEM = {
  BATTLE_WIN: 50,
  BATTLE_LOSS: 10,
  DAILY_LOGIN: 25,
  LEVEL_UP: 100,
  ACHIEVEMENT: 75
};