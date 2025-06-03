/**
 * D&D 5e constants and reference data
 */

// Ability Scores
export const ABILITIES = [
  'strength',
  'dexterity', 
  'constitution',
  'intelligence',
  'wisdom',
  'charisma'
] as const

export const ABILITY_NAMES = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma'
} as const

export const ABILITY_ABBREVIATIONS = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA'
} as const

// Character Classes
export const CHARACTER_CLASSES = [
  'Artificer',
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard'
] as const

// Character Races
export const CHARACTER_RACES = [
  'Dragonborn',
  'Dwarf',
  'Elf',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Halfling',
  'Human',
  'Tiefling',
  'Aarakocra',
  'Aasimar',
  'Bugbear',
  'Firbolg',
  'Genasi',
  'Githyanki',
  'Githzerai',
  'Goblin',
  'Goliath',
  'Hobgoblin',
  'Kenku',
  'Kobold',
  'Lizardfolk',
  'Orc',
  'Tabaxi',
  'Triton',
  'Yuan-Ti'
] as const

// Conditions
export const CONDITIONS = [
  'blinded',
  'charmed',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious'
] as const

export const CONDITION_DESCRIPTIONS = {
  blinded: 'Cannot see and automatically fails sight-based checks. Attack rolls against the creature have advantage, and the creature\'s attack rolls have disadvantage.',
  charmed: 'Cannot attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on social interaction checks.',
  deafened: 'Cannot hear and automatically fails hearing-based checks.',
  exhaustion: 'Suffers penalties based on exhaustion level (1-6), potentially leading to death at level 6.',
  frightened: 'Has disadvantage on ability checks and attack rolls while the source of fear is within line of sight. Cannot willingly move closer to the source.',
  grappled: 'Speed becomes 0 and cannot benefit from bonuses to speed. Ends if the grappler is incapacitated or moved away.',
  incapacitated: 'Cannot take actions or reactions.',
  invisible: 'Impossible to see without magical means. Attack rolls against the creature have disadvantage, and the creature\'s attack rolls have advantage.',
  paralyzed: 'Incapacitated and cannot move or speak. Automatically fails Strength and Dexterity saves. Attack rolls have advantage and hits within 5 feet are critical.',
  petrified: 'Transformed into stone. Incapacitated, cannot move or speak, and is unaware of surroundings. Resistant to all damage and immune to poison and disease.',
  poisoned: 'Has disadvantage on attack rolls and ability checks.',
  prone: 'Can only crawl or stand up (costs half movement). Disadvantage on attack rolls. Attacks from within 5 feet have advantage, from farther have disadvantage.',
  restrained: 'Speed becomes 0. Disadvantage on attack rolls and Dexterity saves. Attack rolls against the creature have advantage.',
  stunned: 'Incapacitated, cannot move, and can speak only falteringly. Automatically fails Strength and Dexterity saves. Attack rolls have advantage.',
  unconscious: 'Incapacitated, cannot move or speak, unaware of surroundings. Drops what it\'s holding and falls prone. Automatically fails Strength and Dexterity saves. Attack rolls have advantage and hits within 5 feet are critical.'
} as const

// Creature Sizes
export const CREATURE_SIZES = [
  'Tiny',
  'Small', 
  'Medium',
  'Large',
  'Huge',
  'Gargantuan'
] as const

export const SIZE_MODIFIERS = {
  Tiny: { space: '2.5 ft', reach: '0 ft', hitDie: 'd4' },
  Small: { space: '5 ft', reach: '5 ft', hitDie: 'd6' },
  Medium: { space: '5 ft', reach: '5 ft', hitDie: 'd8' },
  Large: { space: '10 ft', reach: '5-10 ft', hitDie: 'd10' },
  Huge: { space: '15 ft', reach: '10-15 ft', hitDie: 'd12' },
  Gargantuan: { space: '20+ ft', reach: '15-20+ ft', hitDie: 'd20' }
} as const

// Creature Types
export const CREATURE_TYPES = [
  'aberration',
  'beast',
  'celestial',
  'construct',
  'dragon',
  'elemental',
  'fey',
  'fiend',
  'giant',
  'humanoid',
  'monstrosity',
  'ooze',
  'plant',
  'undead'
] as const

// Alignments
export const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
  'Unaligned'
] as const

// Damage Types
export const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder'
] as const

// Challenge Ratings
export const CHALLENGE_RATINGS = [
  '0', '1/8', '1/4', '1/2',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
] as const

export const CR_TO_XP = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000
} as const

// Proficiency Bonus by Character Level
export const PROFICIENCY_BY_LEVEL = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6
} as const

// Skills
export const SKILLS = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival'
] as const

export const SKILL_ABILITIES = {
  'Acrobatics': 'dexterity',
  'Animal Handling': 'wisdom',
  'Arcana': 'intelligence',
  'Athletics': 'strength',
  'Deception': 'charisma',
  'History': 'intelligence',
  'Insight': 'wisdom',
  'Intimidation': 'charisma',
  'Investigation': 'intelligence',
  'Medicine': 'wisdom',
  'Nature': 'intelligence',
  'Perception': 'wisdom',
  'Performance': 'charisma',
  'Persuasion': 'charisma',
  'Religion': 'intelligence',
  'Sleight of Hand': 'dexterity',
  'Stealth': 'dexterity',
  'Survival': 'wisdom'
} as const

// Common spells and their schools
export const SPELL_SCHOOLS = [
  'Abjuration',
  'Conjuration', 
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation'
] as const

// Environments
export const ENVIRONMENTS = [
  'Arctic',
  'Coastal',
  'Desert',
  'Forest',
  'Grassland',
  'Hill',
  'Mountain',
  'Swamp',
  'Underdark',
  'Underwater',
  'Urban'
] as const

// Time of Day
export const TIMES_OF_DAY = [
  'Dawn',
  'Day',
  'Dusk', 
  'Night'
] as const

// Weather Conditions
export const WEATHER_CONDITIONS = [
  'Clear',
  'Light Clouds',
  'Overcast',
  'Light Rain',
  'Heavy Rain',
  'Thunderstorm',
  'Light Snow',
  'Heavy Snow',
  'Blizzard',
  'Fog',
  'Wind',
  'Extreme Heat',
  'Extreme Cold'
] as const

// App-specific constants
export const APP_NAME = 'D&D Encounter Tracker'
export const APP_VERSION = '1.0.0'

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free Adventurer',
    maxParties: 1,
    maxEncounters: 3,
    maxCreatures: 10,
    maxParticipants: 6
  },
  SEASONED: {
    name: 'Seasoned Adventurer', 
    maxParties: 3,
    maxEncounters: 15,
    maxCreatures: 50,
    maxParticipants: 10
  },
  EXPERT: {
    name: 'Expert Dungeon Master',
    maxParties: 10,
    maxEncounters: 50,
    maxCreatures: 200,
    maxParticipants: 20
  },
  MASTER: {
    name: 'Master of Dungeons',
    maxParties: 25,
    maxEncounters: 100,
    maxCreatures: 500,
    maxParticipants: 30
  },
  GUILD_MASTER: {
    name: 'Guild Master',
    maxParties: -1, // unlimited
    maxEncounters: -1, // unlimited
    maxCreatures: -1, // unlimited
    maxParticipants: 50
  }
} as const

export default {
  ABILITIES,
  ABILITY_NAMES,
  ABILITY_ABBREVIATIONS,
  CHARACTER_CLASSES,
  CHARACTER_RACES,
  CONDITIONS,
  CONDITION_DESCRIPTIONS,
  CREATURE_SIZES,
  SIZE_MODIFIERS,
  CREATURE_TYPES,
  ALIGNMENTS,
  DAMAGE_TYPES,
  CHALLENGE_RATINGS,
  CR_TO_XP,
  PROFICIENCY_BY_LEVEL,
  SKILLS,
  SKILL_ABILITIES,
  SPELL_SCHOOLS,
  ENVIRONMENTS,
  TIMES_OF_DAY,
  WEATHER_CONDITIONS,
  APP_NAME,
  APP_VERSION,
  SUBSCRIPTION_TIERS
}