export const SPELLS = {
  // Basic Attacks
  PHYSICAL_STRIKE: {
    name: 'Physical Strike',
    type: 'attack',
    baseDamage: 1.0,
    statMultiplier: 'attack',
    manaCost: 0,
    actionCost: 1,
    animation: 'slash',
    description: 'A basic physical attack'
  },
  
  // Elemental Spells
  FIRE_BOLT: {
    name: 'Fire Bolt',
    type: 'attack',
    baseDamage: 1.2,
    statMultiplier: 'magic',
    manaCost: 10,
    actionCost: 1,
    animation: 'fire',
    description: 'Launches a bolt of fire'
  },
  
  ICE_SHARD: {
    name: 'Ice Shard',
    type: 'attack',
    baseDamage: 1.1,
    statMultiplier: 'magic',
    manaCost: 8,
    actionCost: 1,
    animation: 'ice',
    description: 'Fires sharp ice projectiles'
  },
  
  LIGHTNING_STRIKE: {
    name: 'Lightning Strike',
    type: 'attack',
    baseDamage: 1.3,
    statMultiplier: 'magic',
    manaCost: 12,
    actionCost: 2,
    animation: 'lightning',
    description: 'Calls down lightning'
  },
  
  // Special Abilities
  CURSED_WIND: {
    name: 'Cursed Wind',
    type: 'debuff',
    baseDamage: 0.8,
    statMultiplier: 'magic',
    manaCost: 15,
    actionCost: 2,
    animation: 'wind',
    effect: 'poison',
    duration: 3,
    description: 'Poisonous winds that deal damage over time'
  },
  
  HEALING_LIGHT: {
    name: 'Healing Light',
    type: 'heal',
    baseHeal: 1.5,
    statMultiplier: 'magic',
    manaCost: 20,
    actionCost: 1,
    animation: 'heal',
    description: 'Restores health with divine light'
  },
  
  SHIELD_BARRIER: {
    name: 'Shield Barrier',
    type: 'buff',
    statMultiplier: 'defense',
    manaCost: 18,
    actionCost: 1,
    animation: 'shield',
    effect: 'defense_boost',
    duration: 5,
    description: 'Increases defense temporarily'
  }
};

export const CONSTELLATION_SPELLS = {
  ARIES: ['PHYSICAL_STRIKE', 'FIRE_BOLT', 'LIGHTNING_STRIKE'],
  TAURUS: ['PHYSICAL_STRIKE', 'SHIELD_BARRIER', 'ICE_SHARD'],
  GEMINI: ['CURSED_WIND', 'LIGHTNING_STRIKE', 'ICE_SHARD'],
  CANCER: ['HEALING_LIGHT', 'SHIELD_BARRIER', 'ICE_SHARD'],
  LEO: ['FIRE_BOLT', 'LIGHTNING_STRIKE', 'PHYSICAL_STRIKE'],
  VIRGO: ['HEALING_LIGHT', 'CURSED_WIND', 'SHIELD_BARRIER'],
  LIBRA: ['SHIELD_BARRIER', 'HEALING_LIGHT', 'ICE_SHARD'],
  SCORPIO: ['CURSED_WIND', 'FIRE_BOLT', 'LIGHTNING_STRIKE'],
  SAGITTARIUS: ['LIGHTNING_STRIKE', 'FIRE_BOLT', 'PHYSICAL_STRIKE'],
  CAPRICORN: ['SHIELD_BARRIER', 'ICE_SHARD', 'PHYSICAL_STRIKE'],
  AQUARIUS: ['CURSED_WIND', 'LIGHTNING_STRIKE', 'HEALING_LIGHT'],
  PISCES: ['HEALING_LIGHT', 'ICE_SHARD', 'CURSED_WIND']
};