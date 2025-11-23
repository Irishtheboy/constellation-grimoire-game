export const SPELLS = {
  // Basic Attacks
  ASTRAL_STRIKE: {
    name: 'Astral Strike',
    type: 'attack',
    baseDamage: 1.0,
    statMultiplier: 'attack',
    manaCost: 0,
    actionCost: 1,
    levelRequired: 1,
    animation: 'slash',
    description: 'Channel celestial energy into a basic attack'
  },
  
  // Elemental Spells
  PHOENIX_FLAME: {
    name: 'Phoenix Flame',
    type: 'attack',
    baseDamage: 1.2,
    statMultiplier: 'magic',
    manaCost: 10,
    actionCost: 1,
    levelRequired: 1,
    animation: 'fire',
    description: 'Summon flames of the eternal phoenix'
  },
  
  GLACIAL_SHARD: {
    name: 'Glacial Shard',
    type: 'attack',
    baseDamage: 1.1,
    statMultiplier: 'magic',
    manaCost: 8,
    actionCost: 1,
    levelRequired: 1,
    animation: 'ice',
    description: 'Launch razor-sharp ice from frozen realms'
  },
  
  THUNDEROUS_WRATH: {
    name: 'Thunderous Wrath',
    type: 'attack',
    baseDamage: 1.3,
    statMultiplier: 'magic',
    manaCost: 12,
    actionCost: 2,
    levelRequired: 3,
    animation: 'lightning',
    description: 'Call upon the fury of storm gods'
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
  ARIES: ['ASTRAL_STRIKE', 'PHOENIX_FLAME', 'THUNDEROUS_WRATH'],
  TAURUS: ['ASTRAL_STRIKE', 'SHIELD_BARRIER', 'GLACIAL_SHARD'],
  GEMINI: ['CURSED_WIND', 'THUNDEROUS_WRATH', 'GLACIAL_SHARD'],
  CANCER: ['HEALING_LIGHT', 'SHIELD_BARRIER', 'GLACIAL_SHARD'],
  LEO: ['PHOENIX_FLAME', 'THUNDEROUS_WRATH', 'ASTRAL_STRIKE'],
  VIRGO: ['HEALING_LIGHT', 'CURSED_WIND', 'SHIELD_BARRIER'],
  LIBRA: ['SHIELD_BARRIER', 'HEALING_LIGHT', 'GLACIAL_SHARD'],
  SCORPIO: ['CURSED_WIND', 'PHOENIX_FLAME', 'THUNDEROUS_WRATH'],
  SAGITTARIUS: ['THUNDEROUS_WRATH', 'PHOENIX_FLAME', 'ASTRAL_STRIKE'],
  CAPRICORN: ['SHIELD_BARRIER', 'GLACIAL_SHARD', 'ASTRAL_STRIKE'],
  AQUARIUS: ['CURSED_WIND', 'THUNDEROUS_WRATH', 'HEALING_LIGHT'],
  PISCES: ['HEALING_LIGHT', 'GLACIAL_SHARD', 'CURSED_WIND']
};

export const getDefaultSpellLoadout = (constellation, level) => {
  const availableSpells = CONSTELLATION_SPELLS[constellation] || [];
  return availableSpells.filter(spellId => {
    const spell = SPELLS[spellId];
    return spell && spell.levelRequired <= level;
  }).slice(0, 3);
};