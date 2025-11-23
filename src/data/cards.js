import { CARD_TYPES, RARITY_LEVELS } from './constellations';

export const BASE_CARDS = {
  // Aries Cards
  STELLAR_FLAME: {
    id: 'stellar_flame',
    name: 'Stellar Flame',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'ARIES',
    manaCost: 2,
    damage: 3,
    description: 'Channel the fire of distant stars into a focused blast.',
    effect: 'Deal 3 damage. If target is defending, deal +1 damage.',
    artwork: '🔥⭐'
  },
  RAMS_CHARGE: {
    id: 'rams_charge',
    name: 'Ram\'s Charge',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'ARIES',
    manaCost: 3,
    damage: 4,
    description: 'Rush forward with the unstoppable force of the celestial ram.',
    effect: 'Deal 4 damage. Gain +1 attack next turn.',
    artwork: '🐏💨'
  },
  FIRE_SHIELD: {
    id: 'fire_shield',
    name: 'Fire Shield',
    type: CARD_TYPES.DEFENSE,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'ARIES',
    manaCost: 2,
    defense: 3,
    description: 'Surround yourself with protective flames.',
    effect: 'Block 3 damage. Deal 1 damage to attacker.',
    artwork: '🛡️🔥'
  },

  // Taurus Cards
  STONE_WALL: {
    id: 'stone_wall',
    name: 'Stone Wall',
    type: CARD_TYPES.DEFENSE,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'TAURUS',
    manaCost: 2,
    defense: 4,
    description: 'Raise an impenetrable barrier of living stone.',
    effect: 'Block 4 damage. Lasts 2 turns.',
    artwork: '🧱⛰️'
  },
  BULLS_STRENGTH: {
    id: 'bulls_strength',
    name: 'Bull\'s Strength',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'TAURUS',
    manaCost: 1,
    description: 'Channel the unwavering power of the celestial bull.',
    effect: 'Gain +2 attack and +1 defense for 3 turns.',
    artwork: '🐂💪'
  },
  EARTH_TREMOR: {
    id: 'earth_tremor',
    name: 'Earth Tremor',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.UNCOMMON,
    constellation: 'TAURUS',
    manaCost: 4,
    damage: 2,
    description: 'Shake the ground beneath all enemies.',
    effect: 'Deal 2 damage to all enemies. Stun for 1 turn.',
    artwork: '🌍💥'
  },

  // Gemini Cards
  MIRROR_IMAGE: {
    id: 'mirror_image',
    name: 'Mirror Image',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'GEMINI',
    manaCost: 2,
    description: 'Create a perfect duplicate of yourself.',
    effect: 'Next attack against you hits the mirror instead.',
    artwork: '👥✨'
  },
  TWIN_STRIKE: {
    id: 'twin_strike',
    name: 'Twin Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'GEMINI',
    manaCost: 3,
    damage: 2,
    description: 'Attack from two directions simultaneously.',
    effect: 'Deal 2 damage twice. Cannot be blocked.',
    artwork: '⚔️👥'
  },
  CONFUSION: {
    id: 'confusion',
    name: 'Confusion',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'GEMINI',
    manaCost: 2,
    description: 'Scramble your opponent\'s thoughts.',
    effect: 'Enemy discards 1 random card and draws 1 card.',
    artwork: '🌀🧠'
  },

  // Cancer Cards
  TIDAL_WAVE: {
    id: 'tidal_wave',
    name: 'Tidal Wave',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.UNCOMMON,
    constellation: 'CANCER',
    manaCost: 4,
    damage: 3,
    description: 'Summon a crushing wave powered by lunar energy.',
    effect: 'Deal 3 damage. Push enemy back, preventing counter-attack.',
    artwork: '🌊🌙'
  },
  SHELL_SHIELD: {
    id: 'shell_shield',
    name: 'Shell Shield',
    type: CARD_TYPES.DEFENSE,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'CANCER',
    manaCost: 1,
    defense: 2,
    description: 'Retreat into a protective shell.',
    effect: 'Block 2 damage. Heal 1 HP.',
    artwork: '🦀🛡️'
  },
  LUNAR_HEAL: {
    id: 'lunar_heal',
    name: 'Lunar Heal',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'CANCER',
    manaCost: 2,
    description: 'Channel moonlight to restore vitality.',
    effect: 'Heal 4 HP. Gain +1 defense next turn.',
    artwork: '🌙💚'
  },

  // Leo Cards
  SOLAR_FLARE: {
    id: 'solar_flare',
    name: 'Solar Flare',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.RARE,
    constellation: 'LEO',
    manaCost: 5,
    damage: 6,
    description: 'Unleash the raw power of a solar explosion.',
    effect: 'Deal 6 damage. Blind enemy for 2 turns (-2 accuracy).',
    artwork: '☀️💥'
  },
  LIONS_ROAR: {
    id: 'lions_roar',
    name: 'Lion\'s Roar',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'LEO',
    manaCost: 2,
    description: 'Let out a mighty roar that shakes the battlefield.',
    effect: 'Intimidate enemy (-1 attack for 3 turns). Boost ally morale (+1 attack).',
    artwork: '🦁📢'
  },
  RADIANT_AURA: {
    id: 'radiant_aura',
    name: 'Radiant Aura',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.UNCOMMON,
    constellation: 'LEO',
    manaCost: 3,
    description: 'Emanate an aura of solar majesty.',
    effect: 'All your cards cost 1 less mana this turn. Heal 2 HP.',
    artwork: '✨👑'
  },

  // Virgo Cards
  PERFECT_STRIKE: {
    id: 'perfect_strike',
    name: 'Perfect Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.UNCOMMON,
    constellation: 'VIRGO',
    manaCost: 3,
    damage: 4,
    description: 'A flawlessly executed attack that never misses.',
    effect: 'Deal 4 damage. Cannot be blocked or dodged.',
    artwork: '🎯⚔️'
  },
  PURIFY: {
    id: 'purify',
    name: 'Purify',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'VIRGO',
    manaCost: 2,
    description: 'Cleanse all negative effects with pristine magic.',
    effect: 'Remove all debuffs from yourself. Heal 2 HP.',
    artwork: '✨🕊️'
  },
  ANALYZE_WEAKNESS: {
    id: 'analyze_weakness',
    name: 'Analyze Weakness',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.COMMON,
    constellation: 'VIRGO',
    manaCost: 1,
    description: 'Study your opponent to find their vulnerabilities.',
    effect: 'Next attack deals double damage. Draw 1 card.',
    artwork: '🔍📊'
  }
};

export const ADVANCED_CARDS = {
  // Epic and Legendary cards unlocked through progression
  CONSTELLATION_STORM: {
    id: 'constellation_storm',
    name: 'Constellation Storm',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY_LEVELS.LEGENDARY,
    constellation: 'ANY',
    manaCost: 8,
    damage: 10,
    description: 'Call upon all the stars to rain destruction.',
    effect: 'Deal 10 damage. Damage increases by 1 for each different constellation card in your deck.',
    artwork: '⭐🌟💫'
  },
  ZODIAC_FUSION: {
    id: 'zodiac_fusion',
    name: 'Zodiac Fusion',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.EPIC,
    constellation: 'ANY',
    manaCost: 6,
    description: 'Temporarily merge with another constellation\'s power.',
    effect: 'Gain access to 3 random cards from a different constellation this battle.',
    artwork: '♈♉♊'
  },
  STELLAR_ASCENSION: {
    id: 'stellar_ascension',
    name: 'Stellar Ascension',
    type: CARD_TYPES.SPELL,
    rarity: RARITY_LEVELS.LEGENDARY,
    constellation: 'ANY',
    manaCost: 10,
    description: 'Transcend mortal limits and become one with the stars.',
    effect: 'Transform into stellar form: +5 to all stats, immune to debuffs for 5 turns.',
    artwork: '🌟👤✨'
  }
};

export const DECK_LIMITS = {
  1: { maxCards: 15, maxRare: 2, maxEpic: 0, maxLegendary: 0 },
  5: { maxCards: 20, maxRare: 4, maxEpic: 1, maxLegendary: 0 },
  10: { maxCards: 25, maxRare: 6, maxEpic: 2, maxLegendary: 0 },
  15: { maxCards: 30, maxRare: 8, maxEpic: 3, maxLegendary: 1 },
  20: { maxCards: 35, maxRare: 10, maxEpic: 4, maxLegendary: 2 }
};