// MongoDB Schemas for D&D Encounter Tracker
// Using Mongoose ODM for Node.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    defaultDiceRoller: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for faster user lookups
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Password verification method
userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Character subdocument schema
const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ac: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  maxHP: {
    type: Number,
    required: true,
    min: 1
  },
  currentHP: {
    type: Number,
    required: true,
    min: 0
  },
  dexterity: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  playerName: {
    type: String,
    trim: true
  },
  classes: [{
    className: {
      type: String,
      required: true,
      enum: [
        'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
        'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
      ]
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    }
  }],
  race: {
    type: String,
    required: true,
    trim: true
  },
  subrace: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  _id: true
});

// Party Schema
const partySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  characters: [characterSchema]
}, {
  timestamps: true
});

// Index for user's parties
partySchema.index({ userId: 1 });

// Legendary Action subdocument schema
const legendaryActionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  cost: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
    default: 1
  }
}, {
  _id: false
});

// Creature Schema (Monsters/NPCs)
const creatureSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    enum: ['monster', 'npc']
  },
  ac: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  maxHP: {
    type: Number,
    required: true,
    min: 1
  },
  dexterity: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  challengeRating: {
    type: String,
    default: '1'
  },
  legendaryActions: [legendaryActionSchema],
  legendaryActionsPerTurn: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isTemplate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for user's creatures and templates
creatureSchema.index({ userId: 1 });
creatureSchema.index({ isTemplate: 1 });

// Condition subdocument schema
const conditionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
      'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
      'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Exhaustion'
    ]
  },
  duration: {
    type: Number,
    min: -1, // -1 for permanent/until removed
    default: -1
  },
  description: {
    type: String,
    maxlength: 200
  }
}, {
  _id: false
});

// Participant subdocument schema
const participantSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['character', 'creature']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  ac: {
    type: Number,
    required: true
  },
  maxHP: {
    type: Number,
    required: true
  },
  currentHP: {
    type: Number,
    required: true
  },
  dexterity: {
    type: Number,
    required: true
  },
  initiativeRoll: {
    type: Number,
    min: 1,
    max: 20
  },
  initiativeOrder: {
    type: Number,
    required: true
  },
  isManuallyOrdered: {
    type: Boolean,
    default: false
  },
  conditions: [conditionSchema],
  legendaryActionsRemaining: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  _id: true
});

// Combat log entry subdocument schema
const combatLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'damage', 'healing', 'condition_added', 'condition_removed',
      'legendary_action', 'turn_start', 'turn_end', 'initiative_change'
    ]
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  damage: {
    type: Number,
    min: 0
  },
  healing: {
    type: Number,
    min: 0
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// Encounter Schema
const encounterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    required: true,
    enum: ['planning', 'active', 'completed', 'paused'],
    default: 'planning'
  },
  participants: [participantSchema],
  currentTurn: {
    type: Number,
    default: 0,
    min: 0
  },
  round: {
    type: Number,
    default: 1,
    min: 1
  },
  combatLog: [combatLogSchema]
}, {
  timestamps: true
});

// Index for user's encounters and active sessions
encounterSchema.index({ userId: 1 });
encounterSchema.index({ status: 1 });
encounterSchema.index({ userId: 1, status: 1 });

// Initiative ordering method
encounterSchema.methods.sortInitiative = function() {
  this.participants.sort((a, b) => {
    // Primary sort: Initiative roll (descending)
    if (a.initiativeRoll !== b.initiativeRoll) {
      return b.initiativeRoll - a.initiativeRoll;
    }
    // Secondary sort: Dexterity (descending)
    return b.dexterity - a.dexterity;
  });
  
  // Update initiative order numbers
  this.participants.forEach((participant, index) => {
    if (!participant.isManuallyOrdered) {
      participant.initiativeOrder = index;
    }
  });
};

// Session Schema (for active game sessions)
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encounterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Encounter',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for active sessions
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ encounterId: 1 });

// TTL index to automatically remove inactive sessions after 24 hours
sessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

// Create and export models
const User = mongoose.model('User', userSchema);
const Party = mongoose.model('Party', partySchema);
const Creature = mongoose.model('Creature', creatureSchema);
const Encounter = mongoose.model('Encounter', encounterSchema);
const Session = mongoose.model('Session', sessionSchema);

module.exports = {
  User,
  Party,
  Creature,
  Encounter,
  Session
};