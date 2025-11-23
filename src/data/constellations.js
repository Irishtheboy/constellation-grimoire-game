// Constellation data with magical schools and abilities
export const ZODIAC_SIGNS = {
  ARIES: {
    name: 'Aries',
    element: 'Fire',
    dates: { start: [3, 21], end: [4, 19] },
    school: 'Ignis Academy',
    primaryMagic: 'Pyromancy',
    secondaryMagic: 'Battle Magic',
    symbol: '♈',
    constellation: '🐏',
    baseStats: { attack: 8, defense: 5, magic: 6, speed: 7 },
    lore: 'The Ram constellation houses the most aggressive battle mages. Ignis Academy trains warriors who channel stellar fire into devastating attacks.',
    schoolDescription: 'A fortress-like academy built into an active volcano, where students learn to harness the raw power of cosmic flames.',
    startingAbilities: ['Stellar Flame', 'Ram\'s Charge', 'Fire Shield']
  },
  TAURUS: {
    name: 'Taurus',
    element: 'Earth',
    dates: { start: [4, 20], end: [5, 20] },
    school: 'Terra Sanctum',
    primaryMagic: 'Geomancy',
    secondaryMagic: 'Nature Magic',
    symbol: '♉',
    constellation: '🐂',
    baseStats: { attack: 6, defense: 9, magic: 5, speed: 4 },
    lore: 'The Bull constellation grants unbreakable defense and connection to earth\'s ancient wisdom. Terra Sanctum stands as an impenetrable fortress.',
    schoolDescription: 'An underground academy carved from living stone, where students commune with earth spirits and learn patience.',
    startingAbilities: ['Stone Wall', 'Bull\'s Strength', 'Earth Tremor']
  },
  GEMINI: {
    name: 'Gemini',
    element: 'Air',
    dates: { start: [5, 21], end: [6, 20] },
    school: 'Aether Twins Institute',
    primaryMagic: 'Illusion Magic',
    secondaryMagic: 'Mind Magic',
    symbol: '♊',
    constellation: '👥',
    baseStats: { attack: 6, defense: 5, magic: 8, speed: 9 },
    lore: 'The Twins constellation masters duality and deception. The Aether Twins Institute teaches the art of being in two places at once.',
    schoolDescription: 'A floating academy that exists in multiple dimensions simultaneously, accessible only to those who understand duality.',
    startingAbilities: ['Mirror Image', 'Twin Strike', 'Confusion']
  },
  CANCER: {
    name: 'Cancer',
    element: 'Water',
    dates: { start: [6, 21], end: [7, 22] },
    school: 'Lunar Tides Academy',
    primaryMagic: 'Hydromancy',
    secondaryMagic: 'Healing Magic',
    symbol: '♋',
    constellation: '🦀',
    baseStats: { attack: 5, defense: 7, magic: 8, speed: 5 },
    lore: 'The Crab constellation flows with lunar tides and emotional depths. Lunar Tides Academy teaches protective and healing arts.',
    schoolDescription: 'A crystalline academy beneath the ocean, where moonlight filters through water to power ancient healing rituals.',
    startingAbilities: ['Tidal Wave', 'Shell Shield', 'Lunar Heal']
  },
  LEO: {
    name: 'Leo',
    element: 'Fire',
    dates: { start: [7, 23], end: [8, 22] },
    school: 'Solar Crown University',
    primaryMagic: 'Solar Magic',
    secondaryMagic: 'Leadership Magic',
    symbol: '♌',
    constellation: '🦁',
    baseStats: { attack: 9, defense: 6, magic: 7, speed: 6 },
    lore: 'The Lion constellation radiates solar majesty and natural leadership. Solar Crown University trains the most charismatic battle leaders.',
    schoolDescription: 'A golden palace floating in the sky, powered by concentrated sunlight and ruled by the most prestigious magical nobility.',
    startingAbilities: ['Solar Flare', 'Lion\'s Roar', 'Radiant Aura']
  },
  VIRGO: {
    name: 'Virgo',
    element: 'Earth',
    dates: { start: [8, 23], end: [9, 22] },
    school: 'Precision Arcanum',
    primaryMagic: 'Analytical Magic',
    secondaryMagic: 'Purification Magic',
    symbol: '♍',
    constellation: '👩',
    baseStats: { attack: 6, defense: 6, magic: 9, speed: 7 },
    lore: 'The Maiden constellation perfects magical precision and purity. Precision Arcanum teaches flawless spellcasting through meticulous study.',
    schoolDescription: 'A pristine library-academy where every spell is catalogued and perfected through centuries of careful research.',
    startingAbilities: ['Perfect Strike', 'Purify', 'Analyze Weakness']
  },
  LIBRA: {
    name: 'Libra',
    element: 'Air',
    dates: { start: [9, 23], end: [10, 22] },
    school: 'Equilibrium Institute',
    primaryMagic: 'Balance Magic',
    secondaryMagic: 'Justice Magic',
    symbol: '♎',
    constellation: '⚖️',
    baseStats: { attack: 7, defense: 7, magic: 7, speed: 7 },
    lore: 'The Scales constellation maintains cosmic balance and justice. Equilibrium Institute teaches harmony between opposing forces.',
    schoolDescription: 'A perfectly symmetrical academy suspended between dimensions, where students learn to balance all magical energies.',
    startingAbilities: ['Balance Beam', 'Justice Strike', 'Equilibrium']
  },
  SCORPIO: {
    name: 'Scorpio',
    element: 'Water',
    dates: { start: [10, 23], end: [11, 21] },
    school: 'Venom Shadow Academy',
    primaryMagic: 'Shadow Magic',
    secondaryMagic: 'Poison Magic',
    symbol: '♏',
    constellation: '🦂',
    baseStats: { attack: 8, defense: 6, magic: 8, speed: 6 },
    lore: 'The Scorpion constellation strikes from darkness with lethal precision. Venom Shadow Academy trains the most feared magical assassins.',
    schoolDescription: 'A hidden academy in the shadow realm, where students learn to harness darkness and deadly toxins.',
    startingAbilities: ['Venom Strike', 'Shadow Cloak', 'Sting of Death']
  },
  SAGITTARIUS: {
    name: 'Sagittarius',
    element: 'Fire',
    dates: { start: [11, 22], end: [12, 21] },
    school: 'Archer\'s Horizon Academy',
    primaryMagic: 'Projectile Magic',
    secondaryMagic: 'Adventure Magic',
    symbol: '♐',
    constellation: '🏹',
    baseStats: { attack: 8, defense: 5, magic: 6, speed: 9 },
    lore: 'The Archer constellation never misses its target. Archer\'s Horizon Academy teaches long-range magical combat and exploration.',
    schoolDescription: 'A mobile academy that travels across dimensions, teaching students to hit any target across space and time.',
    startingAbilities: ['Stellar Arrow', 'Hunter\'s Mark', 'Swift Shot']
  },
  CAPRICORN: {
    name: 'Capricorn',
    element: 'Earth',
    dates: { start: [12, 22], end: [1, 19] },
    school: 'Mountain Peak Conservatory',
    primaryMagic: 'Structure Magic',
    secondaryMagic: 'Time Magic',
    symbol: '♑',
    constellation: '🐐',
    baseStats: { attack: 7, defense: 8, magic: 7, speed: 5 },
    lore: 'The Goat constellation climbs to impossible heights through determination. Mountain Peak Conservatory teaches patience and mastery.',
    schoolDescription: 'An ancient academy carved into the highest mountain peak, where time moves differently and students learn eternal patience.',
    startingAbilities: ['Mountain Climb', 'Temporal Shield', 'Steady Advance']
  },
  AQUARIUS: {
    name: 'Aquarius',
    element: 'Air',
    dates: { start: [1, 20], end: [2, 18] },
    school: 'Innovation Nexus',
    primaryMagic: 'Technology Magic',
    secondaryMagic: 'Invention Magic',
    symbol: '♒',
    constellation: '🏺',
    baseStats: { attack: 6, defense: 6, magic: 9, speed: 8 },
    lore: 'The Water Bearer constellation pours forth revolutionary ideas. Innovation Nexus combines ancient magic with futuristic technology.',
    schoolDescription: 'A constantly evolving academy that rebuilds itself daily, where students invent new forms of magic.',
    startingAbilities: ['Tech Surge', 'Innovation Blast', 'Future Sight']
  },
  PISCES: {
    name: 'Pisces',
    element: 'Water',
    dates: { start: [2, 19], end: [3, 20] },
    school: 'Mystic Depths Academy',
    primaryMagic: 'Dream Magic',
    secondaryMagic: 'Empathy Magic',
    symbol: '♓',
    constellation: '🐟',
    baseStats: { attack: 5, defense: 6, magic: 9, speed: 7 },
    lore: 'The Fish constellation swims in dreams and intuition. Mystic Depths Academy teaches magic through emotional connection and dreams.',
    schoolDescription: 'An ethereal academy that exists between dreams and reality, where students learn to navigate the collective unconscious.',
    startingAbilities: ['Dream Wave', 'Empathic Bond', 'Intuitive Strike']
  }
};

export const MAGIC_SCHOOLS = {
  PYROMANCY: { name: 'Pyromancy', color: '#ff4444', description: 'Control over fire and heat' },
  GEOMANCY: { name: 'Geomancy', color: '#8b4513', description: 'Mastery of earth and stone' },
  HYDROMANCY: { name: 'Hydromancy', color: '#4169e1', description: 'Command over water and ice' },
  AEROMANCY: { name: 'Aeromancy', color: '#87ceeb', description: 'Manipulation of air and wind' },
  SHADOW: { name: 'Shadow Magic', color: '#2f2f2f', description: 'Darkness and stealth arts' },
  LIGHT: { name: 'Light Magic', color: '#ffd700', description: 'Radiance and purification' },
  NATURE: { name: 'Nature Magic', color: '#228b22', description: 'Life force and growth' },
  MIND: { name: 'Mind Magic', color: '#9370db', description: 'Telepathy and illusion' }
};

export const CARD_TYPES = {
  ATTACK: 'Attack',
  DEFENSE: 'Defense',
  SPELL: 'Spell',
  SUMMON: 'Summon',
  ARTIFACT: 'Artifact'
};

export const RARITY_LEVELS = {
  COMMON: { name: 'Common', color: '#808080', sparkCost: 10 },
  UNCOMMON: { name: 'Uncommon', color: '#00ff00', sparkCost: 25 },
  RARE: { name: 'Rare', color: '#0080ff', sparkCost: 50 },
  EPIC: { name: 'Epic', color: '#8000ff', sparkCost: 100 },
  LEGENDARY: { name: 'Legendary', color: '#ff8000', sparkCost: 250 }
};