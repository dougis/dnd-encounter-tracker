import mongoose, { Schema, Document } from 'mongoose'
import {
  Encounter as IEncounter,
  EncounterParticipant
} from '@dnd-encounter-tracker/shared'

// Create interface that extends mongoose Document
export interface EncounterDocument extends Omit<IEncounter, '_id' | 'participants'>, Document {
  _id: string
  participants: Map<string, EncounterParticipant>
}

// Participant schema
const participantSchema = new Schema<EncounterParticipant>({
  id: {
    type: String,
    required: [true, 'Participant ID is required']
  },
  type: {
    type: String,
    enum: ['character', 'creature', 'npc', 'hazard', 'trap', 'other'],
    required: [true, 'Participant type is required']
  },
  name: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  referenceId: {
    type: String,
    index: true
  },
  initiative: {
    type: Number,
    required: [true, 'Initiative is required'],
    min: [-10, 'Initiative cannot be less than -10'],
    max: [50, 'Initiative cannot exceed 50']
  },
  dexterity: {
    type: Number,
    required: [true, 'Dexterity is required'],
    min: [1, 'Dexterity must be at least 1'],
    max: [30, 'Dexterity cannot exceed 30']
  },
  isSurprised: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isPlayerCharacter: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFriendly: {
    type: Boolean,
    default: false
  },
  isAlive: {
    type: Boolean,
    default: true
  },
  isConcentrating: {
    type: Boolean,
    default: false
  },
  concentrationSpell: {
    type: String,
    trim: true
  },
  concentrationDC: {
    type: Number,
    min: [1, 'Concentration DC must be at least 1'],
    max: [30, 'Concentration DC cannot exceed 30']
  },
  conditions: [{
    type: String,
    enum: [
      'blinded', 'charmed', 'deafened', 'exhaustion', 'frightened',
      'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified',
      'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'
    ]
  }],
  status: {
    type: String,
    enum: ['alive', 'unconscious', 'dead', 'stable', 'dying'],
    default: 'alive'
  },
  health: {
    current: {
      type: Number,
      required: [true, 'Current health is required'],
      min: [0, 'Current health cannot be negative']
    },
    max: {
      type: Number,
      required: [true, 'Max health is required'],
      min: [1, 'Max health must be at least 1']
    },
    temporary: {
      type: Number,
      default: 0,
      min: [0, 'Temporary health cannot be negative']
    }
  },
  armorClass: {
    type: Number,
    required: [true, 'Armor Class is required'],
    min: [1, 'AC must be at least 1'],
    max: [30, 'AC cannot exceed 30']
  },
  speed: {
    type: Number,
    default: 30,
    min: [0, 'Speed cannot be negative']
  },
  stats: {
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
  },
  savingThrows: {
    strength: Number,
    dexterity: Number,
    constitution: Number,
    intelligence: Number,
    wisdom: Number,
    charisma: Number
  },
  resistances: [String],
  immunities: [String],
  vulnerabilities: [String],
  conditionImmunities: [String],
  legendaryActions: {
    type: Number,
    default: 0,
    min: [0, 'Legendary actions cannot be negative']
  },
  legendaryResistances: {
    type: Number,
    default: 0,
    min: [0, 'Legendary resistances cannot be negative']
  },
  reactions: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  tokenUrl: {
    type: String,
    trim: true
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 1,
    min: [1, 'Size must be at least 1']
  },
  layer: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isPlayerVisible: {
    type: Boolean,
    default: true
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  _id: false 
})

// Environment schema
const environmentSchema = new Schema({
  lighting: {
    type: String,
    enum: ['bright', 'dim', 'darkness', 'magical_darkness']
  },
  lightLevel: {
    type: String,
    enum: ['bright', 'dim', 'dark']
  },
  timeOfDay: {
    type: String,
    enum: ['dawn', 'day', 'dusk', 'night']
  },
  visibility: {
    type: String,
    enum: ['clear', 'light', 'moderate', 'heavy', 'obscured']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'deadly', 'extreme']
  },
  terrain: [String],
  weather: String,
  elevation: String,
  cover: {
    type: Map,
    of: Number
  },
  notes: {
    type: String,
    maxlength: [1000, 'Environment notes cannot exceed 1000 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Environment description cannot exceed 1000 characters']
  },
  hazards: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    effect: {
      type: String,
      required: true
    },
    damage: String,
    save: {
      ability: String,
      dc: Number,
      saveSuccess: String,
      saveFail: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    position: {
      x: Number,
      y: Number
    }
  }]
}, { _id: false })

// Main encounter schema
const encounterSchema = new Schema<EncounterDocument>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Encounter name is required'],
    trim: true,
    maxlength: [100, 'Encounter name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['preparing', 'active', 'completed', 'paused'],
    default: 'preparing',
    index: true
  },
  currentRound: {
    type: Number,
    default: 1,
    min: [1, 'Round must be at least 1']
  },
  currentTurn: {
    type: Number,
    default: 0,
    min: [0, 'Turn cannot be negative']
  },
  turnOrder: [{
    type: String,
    required: true
  }],
  participants: {
    type: Map,
    of: participantSchema,
    default: new Map()
  },
  id: {
    type: String,
    required: true
  },
  environment: {
    type: environmentSchema,
    default: () => ({})
  },
  mapUrl: {
    type: String,
    trim: true
  },
  mapGridSize: {
    type: Number,
    default: 5,
    min: [1, 'Grid size must be at least 1']
  },
  mapDimensions: {
    width: {
      type: Number,
      min: [1, 'Map width must be at least 1']
    },
    height: {
      type: Number,
      min: [1, 'Map height must be at least 1']
    }
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  partyId: {
    type: String,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString()
      // Convert Map to Object for JSON serialization
      if (ret.participants instanceof Map) {
        ret.participants = Object.fromEntries(ret.participants)
      }
      delete ret.__v
      return ret
    }
  }
})

// Indexes for better performance
encounterSchema.index({ userId: 1, status: 1, createdAt: -1 })
encounterSchema.index({ userId: 1, partyId: 1 })
encounterSchema.index({ name: 'text', description: 'text', notes: 'text' })
encounterSchema.index({ tags: 1 })

// Instance methods
encounterSchema.methods.addParticipant = function(participant: EncounterParticipant) {
  this.participants.set(participant.id, participant)
  if (!this.turnOrder.includes(participant.id)) {
    this.turnOrder.push(participant.id)
  }
  return this.save()
}

encounterSchema.methods.removeParticipant = function(participantId: string) {
  this.participants.delete(participantId)
  this.turnOrder = this.turnOrder.filter(id => id !== participantId)
  
  // Adjust current turn if needed
  if (this.currentTurn >= this.turnOrder.length) {
    this.currentTurn = Math.max(0, this.turnOrder.length - 1)
  }
  
  return this.save()
}

encounterSchema.methods.updateParticipant = function(participantId: string, updates: Partial<EncounterParticipant>) {
  const participant = this.participants.get(participantId)
  if (!participant) {
    throw new Error('Participant not found')
  }
  
  Object.assign(participant, updates)
  this.participants.set(participantId, participant)
  return this.save()
}

encounterSchema.methods.sortInitiative = function() {
  const participantArray = Array.from(this.participants.values())
  
  // Sort by initiative (descending), then by dexterity (descending)
  participantArray.sort((a, b) => {
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative
    }
    return b.dexterity - a.dexterity
  })
  
  this.turnOrder = participantArray.map(p => p.id)
  this.currentTurn = 0
  return this.save()
}

encounterSchema.methods.nextTurn = function() {
  this.currentTurn += 1
  
  if (this.currentTurn >= this.turnOrder.length) {
    this.currentTurn = 0
    this.currentRound += 1
  }
  
  return this.save()
}

encounterSchema.methods.previousTurn = function() {
  this.currentTurn -= 1
  
  if (this.currentTurn < 0) {
    if (this.currentRound > 1) {
      this.currentTurn = this.turnOrder.length - 1
      this.currentRound -= 1
    } else {
      this.currentTurn = 0
    }
  }
  
  return this.save()
}

encounterSchema.methods.getCurrentParticipant = function() {
  const currentId = this.turnOrder[this.currentTurn]
  return currentId ? this.participants.get(currentId) : null
}

encounterSchema.methods.startEncounter = function() {
  this.status = 'active'
  this.startedAt = new Date()
  this.sortInitiative()
  return this.save()
}

encounterSchema.methods.completeEncounter = function() {
  this.status = 'completed'
  this.completedAt = new Date()
  return this.save()
}

encounterSchema.methods.getParticipantCount = function() {
  return this.participants.size
}

encounterSchema.methods.getAliveParticipants = function() {
  return Array.from(this.participants.values()).filter(p => 
    p.status !== 'dead' && p.status !== 'unconscious'
  )
}

// Static methods
encounterSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

encounterSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ userId, status: 'active' }).sort({ updatedAt: -1 })
}

encounterSchema.statics.findByUserAndParty = function(userId: string, partyId: string) {
  return this.find({ userId, partyId }).sort({ createdAt: -1 })
}

encounterSchema.statics.searchByUser = function(userId: string, searchTerm: string) {
  return this.find({
    userId,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { notes: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  }).sort({ createdAt: -1 })
}

export const Encounter = mongoose.model<EncounterDocument>('Encounter', encounterSchema)
export default Encounter