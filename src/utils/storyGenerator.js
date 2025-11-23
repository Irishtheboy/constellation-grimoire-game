// Story generation for South African dark wizardry setting
export const generateBattleStory = (playerData, battleResult, opponentData) => {
  const { constellation, level, battleStats } = playerData;
  const { result, spellsUsed = [], itemsUsed = [] } = battleResult;
  
  const locations = [
    'the haunted veld of the Eastern Cape',
    'the mystical Drakensberg mountains',
    'the ancient ruins near Table Mountain',
    'the cursed gold mines of Johannesburg',
    'the shadowy townships of the Western Cape',
    'the blood-soaked battlefields of Isandlwana',
    'the witch doctor caves of KwaZulu-Natal',
    'the diamond fields of Kimberley',
    'the ghostly Karoo desert',
    'the sacred Blyde River Canyon'
  ];
  
  const darkElements = [
    'ancestral spirits whispered warnings',
    'the bones of ancient warriors rattled',
    'sangoma magic crackled in the air',
    'tokoloshe shadows danced menacingly',
    'the muti of forgotten rituals lingered',
    'ubuntu energy pulsed through the earth',
    'the ghosts of apartheid victims watched',
    'traditional healing herbs turned toxic',
    'the power of the ancestors awakened',
    'dark colonial magic corrupted the land'
  ];
  
  const storyTemplates = {
    win: [
      `In ${getRandomElement(locations)}, ${constellation} faced the ${opponentData?.constellation || 'Shadow Mage'} as ${getRandomElement(darkElements)}. Through cunning use of ${getSpellDescription(spellsUsed[0])} and the ancient wisdom of the ${constellation} bloodline, victory was claimed. The defeated foe's essence was absorbed, strengthening the connection to the ancestral realm.`,
      
      `The battle raged across ${getRandomElement(locations)} where ${getRandomElement(darkElements)}. ${constellation} channeled the power of ${level > 5 ? 'master-level' : 'apprentice'} sorcery, wielding ${getSpellDescription(spellsUsed[0])} against the ${opponentData?.constellation || 'Dark One'}. As the enemy fell, their soul sparks scattered like fireflies in the African night.`,
      
      `Under the blood moon over ${getRandomElement(locations)}, ${constellation} confronted ancient evil. ${getRandomElement(darkElements)} as the duel commenced. Victory came through ${itemsUsed.length > 0 ? `clever use of ${itemsUsed[0]} and ` : ''}the devastating ${getSpellDescription(spellsUsed[0])}. Another step closer to mastering the dark arts of the southern continent.`
    ],
    
    loss: [
      `In the cursed lands of ${getRandomElement(locations)}, ${constellation} met their match against the ${opponentData?.constellation || 'Shadow Lord'}. Despite wielding ${getSpellDescription(spellsUsed[0])}, ${getRandomElement(darkElements)} proved too powerful. Retreat was the only option, but valuable lessons were learned in the ancient ways of combat.`,
      
      `The ${opponentData?.constellation || 'Dark Sorcerer'} proved superior in ${getRandomElement(locations)} where ${getRandomElement(darkElements)}. ${constellation}'s ${getSpellDescription(spellsUsed[0])} was not enough to overcome the enemy's dark mastery. Though defeated, the spirits of the ancestors whispered secrets for future battles.`,
      
      `Defeat came swiftly in ${getRandomElement(locations)} as ${getRandomElement(darkElements)}. The ${opponentData?.constellation || 'Shadow Warrior'} overwhelmed ${constellation} despite brave attempts with ${getSpellDescription(spellsUsed[0])}. Sometimes the path to power requires tasting bitter defeat.`
    ]
  };
  
  const template = getRandomElement(storyTemplates[result]);
  
  return {
    title: `Battle ${battleStats.totalBattles}: ${result === 'win' ? 'Victory' : 'Defeat'} in the Dark Lands`,
    story: template,
    location: getRandomElement(locations),
    timestamp: new Date().toISOString(),
    battleNumber: battleStats.totalBattles,
    level: level,
    result: result
  };
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getSpellDescription = (spellId) => {
  const spellDescriptions = {
    'ASTRAL_STRIKE': 'celestial energy channeled through ancestral weapons',
    'PHOENIX_FLAME': 'the sacred fire of the African phoenix',
    'GLACIAL_SHARD': 'ice magic from the Drakensberg peaks',
    'THUNDEROUS_WRATH': 'lightning called from the storm gods',
    'VOID_TEMPEST': 'cursed winds from the shadow realm',
    'DIVINE_RESTORATION': 'healing light blessed by ubuntu spirits',
    'CELESTIAL_WARD': 'protective magic of the star ancestors'
  };
  
  return spellDescriptions[spellId] || 'ancient dark magic';
};

export const generateLevelUpStory = (playerData, newLevel) => {
  const { constellation } = playerData;
  
  const levelUpEvents = [
    `The ancestors smiled upon ${constellation} as new power awakened. In a vision, the great sangomas of old revealed deeper mysteries of the ${constellation} constellation. The path to mastery grows clearer.`,
    
    `Under the Southern Cross, ${constellation} felt the surge of ancient power. The spirits of warrior-mages past whispered forgotten incantations. Level ${newLevel} brings new understanding of the dark arts.`,
    
    `In the sacred caves where the first magic users practiced, ${constellation} underwent a spiritual transformation. The ubuntu energy of the land flowed stronger, elevating consciousness to level ${newLevel}.`,
    
    `The tokoloshe spirits, usually mischievous, bowed in respect as ${constellation} ascended to level ${newLevel}. Even the dark entities recognize growing power in the ancient bloodline.`
  ];
  
  return {
    title: `Ascension to Level ${newLevel}`,
    story: getRandomElement(levelUpEvents),
    timestamp: new Date().toISOString(),
    level: newLevel,
    type: 'levelup'
  };
};