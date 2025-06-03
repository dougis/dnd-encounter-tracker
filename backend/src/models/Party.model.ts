import mongoose, { Schema, Document } from 'mongoose'
import {
  Party as IParty,
  Character
} from '@dnd-encounter-tracker/shared'

// Create interface that extends mongoose Document
export interface PartyDocument extends Omit<IParty, '_id'>, Document {
  _id: string
}

// Character schema
const characterSchema = new Schema<Character>({
  _id: { 
    type: String, 
    default: () => new mongoose.Types.ObjectId().toString() 
  },
  name: {
    type: String,
    required: [true, 'Character name is required'],
    trim: true,
    maxlength: [100, 'Character name cannot exceed 100 characters']
  },
  ac: {
    type: Number,
    required: [true, 'Armor Class is required'],
    min: [1, 'AC must be at least 1'],
    max: [30, 'AC cannot exceed 30']
  },
  maxHP: {
    type: Number,
    required: [true, 'Max HP is required'],
    min: [1, 'Max HP must be at least 1']
  },
  currentHP: {
    type: Number,
    required: [true, 'Current HP is required'],
    min: [0, 'Current HP cannot be negative']
  },
  dexterity: {
    type: Number,
    required: [true, 'Dexterity is required'],
    min: [1, 'Dexterity must be at least 1'],
    max: [30, 'Dexterity cannot exceed 30']
  },
  playerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Player name cannot exceed 100 characters']
  },
  classes: [{
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true
    },
    level: {
      type: Number,
      required: [true, 'Class level is required'],
      min: [1, 'Level must be at least 1'],
      max: [20, 'Level cannot exceed 20']
    }
  }],
  race: {
    type: String,
    required: [true, 'Race is required'],
    trim: true,
    maxlength: [50, 'Race cannot exceed 50 characters']
  },
  subrace: {
    type: String,
    trim: true,
    maxlength: [50, 'Subrace cannot exceed 50 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, { _id: false })

// Main party schema
const partySchema = new Schema<PartyDocument>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
    maxlength: [100, 'Party name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  characters: {
    type: [characterSchema],
    default: [],
    validate: {
      validator: function(characters: Character[]) {
        return characters.length <= 20 // Reasonable limit for party size
      },
      message: 'Party cannot have more than 20 characters'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString()
      delete ret.__v
      return ret
    }
  }
})

// Indexes for better performance
partySchema.index({ userId: 1, createdAt: -1 })
partySchema.index({ name: 'text', description: 'text' })

// Instance methods
partySchema.methods.addCharacter = function(character: Omit<Character, '_id'>) {
  const newCharacter = {
    ...character,
    _id: new mongoose.Types.ObjectId().toString()
  }
  this.characters.push(newCharacter)
  return this.save()
}

partySchema.methods.updateCharacter = function(characterId: string, updates: Partial<Character>) {
  const character = this.characters.id(characterId)
  if (!character) {
    throw new Error('Character not found')
  }
  
  Object.assign(character, updates)
  return this.save()
}

partySchema.methods.removeCharacter = function(characterId: string) {
  this.characters = this.characters.filter((char: Character) => char._id !== characterId)
  return this.save()
}

partySchema.methods.getCharacterCount = function() {
  return this.characters.length
}

partySchema.methods.getTotalPartyLevel = function() {
  return this.characters.reduce((total: number, char: Character) => {
    return total + char.classes.reduce((classTotal, cls) => classTotal + cls.level, 0)
  }, 0)
}

partySchema.methods.getAverageLevel = function() {
  if (this.characters.length === 0) return 0
  return Math.round(this.getTotalPartyLevel() / this.characters.length)
}

// Static methods
partySchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

partySchema.statics.findByUserWithPagination = function(
  userId: string, 
  page: number = 1, 
  limit: number = 10
) {
  const skip = (page - 1) * limit
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

partySchema.statics.searchByUser = function(userId: string, searchTerm: string) {
  return this.find({
    userId,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'characters.name': { $regex: searchTerm, $options: 'i' } },
      { 'characters.playerName': { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 })
}

export const Party = mongoose.model<PartyDocument>('Party', partySchema)
export default Party