import mongoose, { Schema, Document } from 'mongoose'
import {
  Creature as ICreature,
  Ability
} from '@dnd-encounter-tracker/shared'

// Create interface that extends mongoose Document
export interface CreatureDocument extends Omit<ICreature, '_id'>, Document {
  _id: string
}

// Ability schema for special abilities, actions, etc.
const abilitySchema = new Schema<Ability>({
  name: {
    type: String,
    required: [true, 'Ability name is required'],
    trim: true,
    maxlength: [100, 'Ability name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Ability description is required'],
    maxlength: [2000, 'Ability description cannot exceed 2000 characters']
  },
  attackBonus: {
    type: Number,
    min: [-10, 'Attack bonus cannot be less than -10'],
    max: [20, 'Attack bonus cannot exceed 20']
  },
  damageDice: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic dice notation validation (e.g., "1d6", "2d8+3")
        return !v || /^\d*d\d+([+-]\d+)?$/i.test(v)
      },
      message: 'Invalid dice notation format'
    }
  },
  damageType: {
    type: String,
    trim: true,
    enum: [
      'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
      'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 
      'slashing', 'thunder', ''
    ]
  },
  dcType: {
    type: String,
    trim: true,
    enum: [
      'strength', 'dexterity', 'constitution', 'intelligence', 
      'wisdom', 'charisma', ''
    ]
  },
  dcValue: {
    type: Number,
    min: [1, 'DC value must be at least 1'],
    max: [30, 'DC value cannot exceed 30']
  },
  dcSuccess: {
    type: String,
    trim: true,
    maxlength: [200, 'DC success description cannot exceed 200 characters']
  },
  usage: {
    type: {
      type: String,
      enum: ['rechargeOnRoll', 'perDay', 'rechargeAfterRest', 'rechargeOnTick', 'atWill']
    },
    times: {
      type: Number,
      min: [1, 'Usage times must be at least 1']
    },
    minRoll: {
      type: Number,
      min: [1, 'Minimum roll must be at least 1'],
      max: [20, 'Minimum roll cannot exceed 20']
    },
    restTypes: [{
      type: String,
      enum: ['short', 'long']
    }]
  },
  isAttack: {
    type: Boolean,
    default: false
  },
  isLegacy: {
    type: Boolean,
    default: false
  },
  isMythic: {
    type: Boolean,
    default: false
  },
  isLair: {
    type: Boolean,
    default: false
  },
  isReaction: {
    type: Boolean,
    default: false
  },
  isBonusAction: {
    type: Boolean,
    default: false
  },
  isAction: {
    type: Boolean,
    default: true
  },
  isMultiattack: {
    type: Boolean,
    default: false
  },
  isLegendaryAction: {
    type: Boolean,
    default: false
  },
  legendaryActionCost: {
    type: Number,
    min: [1, 'Legendary action cost must be at least 1'],
    max: [3, 'Legendary action cost cannot exceed 3'],
    default: 1
  }
}, { _id: false })

// Speed schema
const speedSchema = new Schema({
  walk: {
    type: String,
    default: '30 ft'
  },
  burrow: String,
  climb: String,
  fly: String,
  swim: String
}, { _id: false })

// Stats schema
const statsSchema = new Schema({
  strength: {
    type: Number,
    required: [true, 'Strength is required'],
    min: [1, 'Strength must be at least 1'],
    max: [30, 'Strength cannot exceed 30']
  },
  dexterity: {
    type: Number,
    required: [true, 'Dexterity is required'],
    min: [1, 'Dexterity must be at least 1'],
    max: [30, 'Dexterity cannot exceed 30']
  },
  constitution: {
    type: Number,
    required: [true, 'Constitution is required'],
    min: [1, 'Constitution must be at least 1'],
    max: [30, 'Constitution cannot exceed 30']
  },
  intelligence: {
    type: Number,
    required: [true, 'Intelligence is required'],
    min: [1, 'Intelligence must be at least 1'],
    max: [30, 'Intelligence cannot exceed 30']
  },
  wisdom: {
    type: Number,
    required: [true, 'Wisdom is required'],
    min: [1, 'Wisdom must be at least 1'],
    max: [30, 'Wisdom cannot exceed 30']
  },
  charisma: {
    type: Number,
    required: [true, 'Charisma is required'],
    min: [1, 'Charisma must be at least 1'],
    max: [30, 'Charisma cannot exceed 30']
  }
}, { _id: false })

// Saving throws schema
const savingThrowsSchema = new Schema({
  strength: Number,
  dexterity: Number,
  constitution: Number,
  intelligence: Number,
  wisdom: Number,
  charisma: Number
}, { _id: false })

// Senses schema
const sensesSchema = new Schema({
  darkvision: String,
  blindsight: String,
  tremorsense: String,
  truesight: String,
  passivePerception: {
    type: Number,
    required: [true, 'Passive Perception is required'],
    min: [1, 'Passive Perception must be at least 1'],
    max: [30, 'Passive Perception cannot exceed 30']
  }
}, { _id: false })

// Main creature schema
const creatureSchema = new Schema<CreatureDocument>({
  userId: {
    type: String,
    index: true,
    default: null // null for global templates
  },
  name: {
    type: String,
    required: [true, 'Creature name is required'],
    trim: true,
    maxlength: [100, 'Creature name cannot exceed 100 characters'],
    index: true
  },
  type: {
    type: String,
    enum: ['monster', 'npc'],
    required: [true, 'Creature type is required'],
    index: true
  },
  size: {
    type: String,
    enum: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'],
    default: 'Medium'
  },
  alignment: {
    type: String,
    trim: true,
    maxlength: [50, 'Alignment cannot exceed 50 characters']
  },
  armorClass: {
    type: Number,
    required: [true, 'Armor Class is required'],
    min: [1, 'AC must be at least 1'],
    max: [30, 'AC cannot exceed 30']
  },
  armorType: {
    type: String,
    trim: true,
    maxlength: [100, 'Armor type cannot exceed 100 characters']
  },
  hitPoints: {
    type: Number,
    required: [true, 'Hit Points is required'],
    min: [1, 'Hit Points must be at least 1']
  },
  hitDice: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validate hit dice format (e.g., "8d10+16")
        return !v || /^\d+d\d+([+-]\d+)?$/i.test(v)
      },
      message: 'Invalid hit dice format'
    }
  },
  speed: {
    type: speedSchema,
    default: () => ({ walk: '30 ft' })
  },
  stats: {
    type: statsSchema,
    required: [true, 'Stats are required']
  },
  savingThrows: {
    type: savingThrowsSchema,
    default: () => ({})
  },
  skills: {
    type: Map,
    of: Number,
    default: new Map()
  },
  damageVulnerabilities: [{
    type: String,
    trim: true,
    enum: [
      'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
      'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 
      'slashing', 'thunder'
    ]
  }],
  damageResistances: [{
    type: String,
    trim: true,
    enum: [
      'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
      'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 
      'slashing', 'thunder'
    ]
  }],
  damageImmunities: [{
    type: String,
    trim: true,
    enum: [
      'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
      'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 
      'slashing', 'thunder'
    ]
  }],
  conditionImmunities: [{
    type: String,
    trim: true,
    enum: [
      'blinded', 'charmed', 'deafened', 'exhaustion', 'frightened',
      'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified',
      'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'
    ]
  }],
  senses: {
    type: sensesSchema,
    default: () => ({ passivePerception: 10 })
  },
  languages: [{
    type: String,
    trim: true,
    maxlength: [50, 'Language cannot exceed 50 characters']
  }],
  challengeRating: {
    type: String,
    trim: true,
    default: '1',
    index: true,
    validate: {
      validator: function(v: string) {
        // Validate CR format (e.g., "1", "1/2", "1/4", "1/8")
        return /^(\d+|\d+\/\d+)$/.test(v)
      },
      message: 'Invalid challenge rating format'
    }
  },
  xp: {
    type: Number,
    min: [0, 'XP cannot be negative'],
    default: 200
  },
  specialAbilities: {
    type: [abilitySchema],
    default: []
  },
  actions: {
    type: [abilitySchema],
    default: []
  },
  legendaryActions: {
    type: [abilitySchema],
    default: []
  },
  legendaryActionPoints: {
    type: Number,
    min: [0, 'Legendary action points cannot be negative'],
    max: [5, 'Legendary action points cannot exceed 5'],
    default: 0
  },
  reactions: {
    type: [abilitySchema],
    default: []
  },
  isLegendary: {
    type: Boolean,
    default: false,
    index: true
  },
  isMythic: {
    type: Boolean,
    default: false
  },
  isLair: {
    type: Boolean,
    default: false
  },
  isSwarm: {
    type: Boolean,
    default: false
  },
  swarmSize: {
    type: String,
    enum: ['Tiny', 'Small', 'Medium', '']
  },
  isTemplate: {
    type: Boolean,
    default: false,
    index: true
  },
  source: {
    type: String,
    trim: true,
    maxlength: [100, 'Source cannot exceed 100 characters'],
    default: 'Homebrew'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString()
      // Convert Map to Object for JSON serialization
      if (ret.skills instanceof Map) {
        ret.skills = Object.fromEntries(ret.skills)
      }
      delete ret.__v
      return ret
    }
  }
})

// Indexes for better performance
creatureSchema.index({ userId: 1, type: 1, createdAt: -1 })
creatureSchema.index({ name: 'text', notes: 'text' })
creatureSchema.index({ challengeRating: 1, type: 1 })
creatureSchema.index({ size: 1, type: 1 })
creatureSchema.index({ tags: 1 })
creatureSchema.index({ isTemplate: 1, userId: 1 })
creatureSchema.index({ source: 1 })

// Virtual for ability score modifiers
creatureSchema.virtual('abilityModifiers').get(function() {
  return {
    strength: Math.floor((this.stats.strength - 10) / 2),
    dexterity: Math.floor((this.stats.dexterity - 10) / 2),
    constitution: Math.floor((this.stats.constitution - 10) / 2),
    intelligence: Math.floor((this.stats.intelligence - 10) / 2),
    wisdom: Math.floor((this.stats.wisdom - 10) / 2),
    charisma: Math.floor((this.stats.charisma - 10) / 2)
  }
})

// Virtual for proficiency bonus based on CR
creatureSchema.virtual('proficiencyBonus').get(function() {
  const cr = this.challengeRating
  if (cr === '0' || cr === '1/8' || cr === '1/4' || cr === '1/2') return 2
  const crNum = parseFloat(cr)
  if (crNum <= 4) return 2
  if (crNum <= 8) return 3
  if (crNum <= 12) return 4
  if (crNum <= 16) return 5
  if (crNum <= 20) return 6
  if (crNum <= 24) return 7
  if (crNum <= 28) return 8
  return 9
})

// Instance methods
creatureSchema.methods.getAbilityModifier = function(ability: string) {
  const score = this.stats[ability]
  return Math.floor((score - 10) / 2)
}

creatureSchema.methods.getSavingThrow = function(ability: string) {
  const baseModifier = this.getAbilityModifier(ability)
  const savingThrowBonus = this.savingThrows?.[ability]
  
  if (savingThrowBonus !== undefined) {
    return savingThrowBonus
  }
  
  return baseModifier
}

creatureSchema.methods.getSkillModifier = function(skill: string) {
  const skillBonus = this.skills?.get?.(skill)
  if (skillBonus !== undefined) {
    return skillBonus
  }
  
  // Return base ability modifier if no skill bonus defined
  // This would need a skill-to-ability mapping
  return 0
}

creatureSchema.methods.hasResistance = function(damageType: string) {
  return this.damageResistances?.includes(damageType) || false
}

creatureSchema.methods.hasImmunity = function(damageType: string) {
  return this.damageImmunities?.includes(damageType) || false
}

creatureSchema.methods.hasVulnerability = function(damageType: string) {
  return this.damageVulnerabilities?.includes(damageType) || false
}

creatureSchema.methods.isImmuneToCondition = function(condition: string) {
  return this.conditionImmunities?.includes(condition) || false
}

creatureSchema.methods.clone = function() {
  const clonedData = this.toObject()
  delete clonedData._id
  delete clonedData.createdAt
  delete clonedData.updatedAt
  clonedData.name = `${clonedData.name} (Copy)`
  
  return new this.constructor(clonedData)
}

// Static methods
creatureSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

creatureSchema.statics.findGlobalTemplates = function() {
  return this.find({ userId: null, isTemplate: true }).sort({ name: 1 })
}

creatureSchema.statics.findByUserAndGlobal = function(userId: string) {
  return this.find({
    $or: [
      { userId },
      { userId: null, isTemplate: true }
    ]
  }).sort({ name: 1 })
}

creatureSchema.statics.searchByUser = function(userId: string, searchTerm: string) {
  return this.find({
    $and: [
      {
        $or: [
          { userId },
          { userId: null, isTemplate: true }
        ]
      },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { notes: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  }).sort({ name: 1 })
}

creatureSchema.statics.findByChallengeRating = function(cr: string, userId?: string) {
  const query: any = { challengeRating: cr }
  
  if (userId) {
    query.$or = [
      { userId },
      { userId: null, isTemplate: true }
    ]
  } else {
    query.userId = null
    query.isTemplate = true
  }
  
  return this.find(query).sort({ name: 1 })
}

creatureSchema.statics.findByType = function(type: string, userId?: string) {
  const query: any = { type }
  
  if (userId) {
    query.$or = [
      { userId },
      { userId: null, isTemplate: true }
    ]
  } else {
    query.userId = null
    query.isTemplate = true
  }
  
  return this.find(query).sort({ name: 1 })
}

export const Creature = mongoose.model<CreatureDocument>('Creature', creatureSchema)
export default Creature