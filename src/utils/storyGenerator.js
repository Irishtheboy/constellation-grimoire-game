// AI-Powered Story Generation for Hollow Knight-inspired Dark Realm
export const generateBattleStory = (playerData, battleResult, opponentData) => {
  const { constellation, level, battleStats, username } = playerData;
  const { result, spellsUsed = [], itemsUsed = [] } = battleResult;
  
  // Generate contextual story based on player progression and battle context
  const storyContext = analyzePlayerContext(playerData, battleStats);
  const battleNarrative = generateDynamicNarrative(storyContext, battleResult, opponentData);
  
  return {
    title: generateTitle(result, battleStats.totalBattles, storyContext),
    story: battleNarrative,
    location: storyContext.location,
    timestamp: new Date().toISOString(),
    battleNumber: battleStats.totalBattles,
    level: level,
    result: result,
    mood: storyContext.mood,
    aiGenerated: true
  };
};

// Analyze player context for personalized storytelling
const analyzePlayerContext = (playerData, battleStats) => {
  const { constellation, level, username } = playerData;
  const winRate = battleStats.totalBattles > 0 ? battleStats.wins / battleStats.totalBattles : 0;
  
  const locations = {
    beginner: ['the Forgotten Crossroads', 'the Ancestral Mound', 'the Whispering Caverns'],
    intermediate: ['the City of Tears', 'the Crystal Peak', 'the Fungal Wastes'],
    advanced: ['the Ancient Basin', 'the Abyss', 'the White Palace'],
    master: ['the Void Realm', 'the Dream Realm', 'the Eternal Sanctum']
  };
  
  const moods = {
    triumphant: ['confident', 'determined', 'ascending'],
    struggling: ['cautious', 'learning', 'adapting'],
    desperate: ['fighting', 'surviving', 'enduring'],
    transcendent: ['enlightened', 'powerful', 'legendary']
  };
  
  let tier = 'beginner';
  if (level >= 20) tier = 'master';
  else if (level >= 10) tier = 'advanced';
  else if (level >= 5) tier = 'intermediate';
  
  let mood = 'struggling';
  if (winRate > 0.8) mood = 'triumphant';
  else if (winRate < 0.3) mood = 'desperate';
  else if (level >= 15) mood = 'transcendent';
  
  return {
    tier,
    mood,
    location: getRandomElement(locations[tier]),
    winRate,
    constellation,
    username: username || constellation,
    level
  };
};

// Generate dynamic narrative based on context
const generateDynamicNarrative = (context, battleResult, opponentData) => {
  const { result, spellsUsed = [], itemsUsed = [] } = battleResult;
  
  const narrativeElements = {
    openings: {
      triumphant: [
        `In the depths of ${context.location}, where shadows dance with ancient power, ${context.username} moved with the confidence of one who has tasted victory many times before.`,
        `The ${context.mood} warrior ${context.username} descended into ${context.location}, their ${context.constellation} essence radiating with hard-earned mastery.`
      ],
      struggling: [
        `Through the treacherous paths of ${context.location}, ${context.username} ventured forth, each step a lesson in the harsh realities of this forsaken realm.`,
        `The shadows of ${context.location} seemed to whisper doubts, but ${context.username} pressed on, driven by the need to grow stronger.`
      ],
      desperate: [
        `Battered but unbroken, ${context.username} found themselves in the unforgiving ${context.location}, where only the strongest survive.`,
        `The cruel winds of ${context.location} carried the scent of defeat, yet ${context.username} refused to yield to despair.`
      ],
      transcendent: [
        `Like a force of nature itself, ${context.username} manifested in ${context.location}, their presence bending reality to their will.`,
        `The very essence of ${context.location} seemed to acknowledge the power of ${context.username}, a being who had transcended mortal limitations.`
      ]
    },
    
    conflicts: {
      win: [
        `The ${opponentData?.constellation || 'Void Spawn'} emerged from the darkness, but ${context.username} was ready. With ${getSpellDescription(spellsUsed[0])}, they carved through shadow and bone alike.`,
        `As the ${opponentData?.constellation || 'Ancient Guardian'} unleashed its fury, ${context.username} responded with the precision of a master, their ${getSpellDescription(spellsUsed[0])} finding its mark with devastating effect.`
      ],
      loss: [
        `The ${opponentData?.constellation || 'Nightmare Entity'} proved to be a formidable adversary. Despite ${context.username}'s best efforts with ${getSpellDescription(spellsUsed[0])}, the darkness claimed victory this day.`,
        `In a clash that shook the very foundations of ${context.location}, the ${opponentData?.constellation || 'Shadow Lord'} overwhelmed ${context.username}, teaching them that power alone is not enough.`
      ]
    },
    
    conclusions: {
      win: {
        triumphant: `Victory came as naturally as breathing. The essence of the fallen foe merged with ${context.username}'s growing legend.`,
        struggling: `Hard-fought victory brought not just triumph, but wisdom. Each battle shapes the warrior within.`,
        desperate: `Against all odds, victory was seized from the jaws of defeat. Hope rekindled in the darkness.`,
        transcendent: `The outcome was never in doubt. Reality itself bent to acknowledge ${context.username}'s supremacy.`
      },
      loss: {
        triumphant: `Even legends must sometimes fall to rise again stronger. This defeat will fuel future victories.`,
        struggling: `Defeat stings, but it teaches lessons that victory cannot. The path to mastery is paved with such moments.`,
        desperate: `Another setback in a journey filled with them. Yet ${context.username} endures, for that is what defines a true warrior.`,
        transcendent: `Even transcendent beings must face humility. This defeat will only deepen ${context.username}'s understanding of power.`
      }
    }
  };
  
  const opening = getRandomElement(narrativeElements.openings[context.mood]);
  const conflict = getRandomElement(narrativeElements.conflicts[result]);
  const conclusion = narrativeElements.conclusions[result][context.mood];
  
  return `${opening} ${conflict} ${conclusion}`;
};

// Generate contextual titles
const generateTitle = (result, battleNumber, context) => {
  const titlePrefixes = {
    win: ['Triumph', 'Victory', 'Conquest', 'Ascension'],
    loss: ['Trial', 'Ordeal', 'Lesson', 'Reckoning']
  };
  
  const locationTitles = {
    'the Forgotten Crossroads': 'in the Crossroads',
    'the City of Tears': 'beneath Weeping Stones',
    'the Abyss': 'in the Void',
    'the White Palace': 'in the Pale Court'
  };
  
  const prefix = getRandomElement(titlePrefixes[result]);
  const locationSuffix = locationTitles[context.location] || `in ${context.location}`;
  
  return `${prefix} ${locationSuffix}`;
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getSpellDescription = (spellId) => {
  const spellDescriptions = {
    'ASTRAL_STRIKE': 'void-touched steel that cuts through reality itself',
    'PHOENIX_FLAME': 'soul fire that burns with the intensity of dying stars',
    'GLACIAL_SHARD': 'crystallized despair that freezes the very essence of being',
    'THUNDEROUS_WRATH': 'the rage of forgotten gods made manifest',
    'VOID_TEMPEST': 'winds from the space between worlds',
    'DIVINE_RESTORATION': 'light borrowed from realms beyond death',
    'CELESTIAL_WARD': 'barriers woven from the dreams of ancient guardians'
  };
  
  return spellDescriptions[spellId] || 'forbidden arts drawn from the deep places of the world';
};

// Generate story for friendly duels between friends
export const generateFriendlyDuelStory = (duelData) => {
  const { winner, loser, chatLog, duelEvents } = duelData;
  
  // Analyze chat for context
  const chatContext = analyzeChatContext(chatLog);
  
  const friendlyLocations = [
    'the Training Grounds of Echoing Whispers',
    'the Sparring Circle of Ancient Bonds',
    'the Dueling Sanctum of Friendly Rivalry',
    'the Practice Arena of Shared Wisdom'
  ];
  
  const duelNarratives = {
    respectful: [
      `In ${getRandomElement(friendlyLocations)}, ${winner.username} and ${loser.username} met for a test of skill born from mutual respect. ${chatContext.tone}. The duel was fierce yet honorable, with ${winner.username} emerging victorious through superior technique.`,
      `What began as friendly banter between ${winner.username} and ${loser.username} evolved into a formal challenge in ${getRandomElement(friendlyLocations)}. ${chatContext.tone}. Both warriors fought with honor, but ${winner.username}'s mastery proved decisive.`
    ],
    competitive: [
      `The competitive spirit between ${winner.username} and ${loser.username} reached its peak in ${getRandomElement(friendlyLocations)}. ${chatContext.tone}. Their rivalry pushed both to their limits, with ${winner.username} claiming victory through sheer determination.`,
      `In ${getRandomElement(friendlyLocations)}, ${winner.username} and ${loser.username} settled their friendly rivalry with steel and sorcery. ${chatContext.tone}. The battle was intense, ending with ${winner.username}'s triumph.`
    ],
    playful: [
      `Laughter echoed through ${getRandomElement(friendlyLocations)} as ${winner.username} and ${loser.username} engaged in their spirited duel. ${chatContext.tone}. Even in defeat, ${loser.username} smiled, knowing they had learned from their friend ${winner.username}.`,
      `What started as jest between friends became a delightful contest in ${getRandomElement(friendlyLocations)}. ${chatContext.tone}. ${winner.username} proved victorious, but both gained something valuable from the exchange.`
    ]
  };
  
  const narrative = getRandomElement(duelNarratives[chatContext.mood]);
  
  return {
    title: `Friendly Duel: ${winner.username} vs ${loser.username}`,
    story: narrative,
    location: getRandomElement(friendlyLocations),
    timestamp: new Date().toISOString(),
    type: 'friendlyDuel',
    participants: [winner.username, loser.username],
    aiGenerated: true
  };
};

// Analyze chat context for story generation
const analyzeChatContext = (chatLog) => {
  if (!chatLog || chatLog.length === 0) {
    return {
      mood: 'respectful',
      tone: 'Their words were few but carried the weight of mutual respect'
    };
  }
  
  const messages = chatLog.map(msg => msg.message.toLowerCase());
  const allText = messages.join(' ');
  
  // Detect mood from chat content
  const competitiveWords = ['challenge', 'beat', 'win', 'defeat', 'stronger', 'better'];
  const playfulWords = ['haha', 'lol', 'fun', 'joke', 'laugh', '😄', '😂'];
  const respectfulWords = ['honor', 'respect', 'skill', 'learn', 'teach', 'wisdom'];
  
  let mood = 'respectful';
  let competitiveScore = 0;
  let playfulScore = 0;
  let respectfulScore = 0;
  
  competitiveWords.forEach(word => {
    if (allText.includes(word)) competitiveScore++;
  });
  
  playfulWords.forEach(word => {
    if (allText.includes(word)) playfulScore++;
  });
  
  respectfulWords.forEach(word => {
    if (allText.includes(word)) respectfulScore++;
  });
  
  if (competitiveScore > playfulScore && competitiveScore > respectfulScore) {
    mood = 'competitive';
  } else if (playfulScore > respectfulScore) {
    mood = 'playful';
  }
  
  const tones = {
    competitive: 'Their words crackled with competitive fire, each seeking to prove their superiority',
    playful: 'Their banter was filled with laughter and good-natured teasing',
    respectful: 'They spoke with the reverence of true warriors acknowledging each other\'s strength'
  };
  
  return {
    mood,
    tone: tones[mood]
  };
};

export const generateLevelUpStory = (playerData, newLevel) => {
  const { constellation, username } = playerData;
  
  const ascensionNarratives = generateAscensionNarrative(username || constellation, constellation, newLevel);
  
  return {
    title: generateAscensionTitle(newLevel),
    story: ascensionNarratives,
    timestamp: new Date().toISOString(),
    level: newLevel,
    type: 'levelup',
    aiGenerated: true
  };
};

// Generate personalized ascension narratives
const generateAscensionNarrative = (username, constellation, level) => {
  const milestones = {
    5: 'apprentice',
    10: 'adept', 
    15: 'master',
    20: 'grandmaster',
    25: 'legend'
  };
  
  const milestone = Object.keys(milestones)
    .reverse()
    .find(m => level >= parseInt(m));
  
  const rank = milestone ? milestones[milestone] : 'initiate';
  
  const narratives = {
    initiate: [
      `In the quiet moments between battles, ${username} felt something stir within. The ${constellation} constellation pulsed with newfound energy, marking the beginning of a greater journey.`,
      `The shadows themselves seemed to acknowledge ${username}'s growth. Power flowed through their being like liquid starlight, transforming them from within.`
    ],
    apprentice: [
      `The ancient halls of learning whispered secrets to ${username} as they crossed the threshold into deeper understanding. The ${constellation} bloodline awakened, revealing hidden potential.`,
      `In a moment of perfect clarity, ${username} felt the weight of their destiny. The realm itself seemed to bend slightly, recognizing a new force in its midst.`
    ],
    adept: [
      `Reality rippled around ${username} as they achieved a new level of mastery. The ${constellation} constellation blazed brighter in the cosmic tapestry, its chosen vessel growing ever stronger.`,
      `The void between worlds acknowledged ${username}'s ascension. Where once there was potential, now there was undeniable power.`
    ],
    master: [
      `The very fabric of existence trembled as ${username} transcended mortal limitations. Ancient entities paused in their eternal dance to witness this moment of transformation.`,
      `In the deepest chambers of the soul, ${username} found the key to true power. The ${constellation} legacy burned within them like a star being born.`
    ],
    grandmaster: [
      `Legends speak of moments when mortals touch divinity. ${username} had become such a legend, their name destined to echo through eternity.`,
      `The boundary between ${username} and the cosmic forces they wielded began to blur. They were becoming something beyond what they once were.`
    ],
    legend: [
      `In achieving level ${level}, ${username} had transcended the very concept of mortality. They were no longer bound by the laws that govern lesser beings.`,
      `The universe itself rewrote its rules to accommodate ${username}'s ascension. They had become a force of nature, eternal and unstoppable.`
    ]
  };
  
  return getRandomElement(narratives[rank]);
};

// Generate contextual ascension titles
const generateAscensionTitle = (level) => {
  const titles = {
    5: ['First Awakening', 'The Stirring', 'Initial Transcendence'],
    10: ['The Deepening', 'Adept\'s Rise', 'Power Manifest'],
    15: ['Master\'s Threshold', 'The Great Awakening', 'Cosmic Alignment'],
    20: ['Grandmaster\'s Ascension', 'Beyond Mortality', 'Legendary Status'],
    25: ['Mythic Transformation', 'Divine Ascension', 'Eternal Legend']
  };
  
  const milestone = Object.keys(titles)
    .reverse()
    .find(m => level >= parseInt(m));
  
  if (milestone) {
    return getRandomElement(titles[milestone]);
  }
  
  return `Ascension to Level ${level}`;
};