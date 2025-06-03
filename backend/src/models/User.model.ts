import mongoose, { Schema, Document } from 'mongoose'
import {
  User as IUser,
  SubscriptionTier,
  SubscriptionStatus,
  FeatureFlags,
  UserPreferences,
  SubscriptionDetails,
  UsageStats
} from '@dnd-encounter-tracker/shared'

// Create interface that extends mongoose Document
export interface UserDocument extends Omit<IUser, '_id'>, Document {
  _id: string
  password: string
  emailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  lastLoginAt?: Date
  refreshTokens?: string[]
  comparePassword(candidatePassword: string): Promise<boolean>
  generateEmailVerificationToken(): string
  generatePasswordResetToken(): string
}

// Feature flags schema
const featureFlagsSchema = new Schema<FeatureFlags>({
  maxParties: { type: Number, default: 1 },
  maxEncounters: { type: Number, default: 3 },
  maxCreatures: { type: Number, default: 10 },
  maxParticipantsPerEncounter: { type: Number, default: 6 },
  cloudSync: { type: Boolean, default: false },
  advancedCombatLog: { type: Boolean, default: false },
  customThemes: { type: Boolean, default: false },
  exportFeatures: { type: Boolean, default: false },
  prioritySupport: { type: Boolean, default: false },
  betaAccess: { type: Boolean, default: false },
  collaborativeMode: { type: Boolean, default: false },
  automatedBackups: { type: Boolean, default: false }
}, { _id: false })

// User preferences schema
const userPreferencesSchema = new Schema<UserPreferences>({
  theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
  defaultDiceRoller: { type: Boolean, default: true },
  autoSave: { type: Boolean, default: true },
  notifications: {
    email: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    updates: { type: Boolean, default: true }
  }
}, { _id: false })

// Usage statistics schema
const usageStatsSchema = new Schema<UsageStats>({
  partiesCreated: { type: Number, default: 0 },
  encountersCreated: { type: Number, default: 0 },
  creaturesCreated: { type: Number, default: 0 },
  sessionsThisMonth: { type: Number, default: 0 },
  storageUsedMB: { type: Number, default: 0 },
  lastUsageReset: { type: String, default: () => new Date().toISOString() },
  encounters: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 3 }
  },
  players: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 6 }
  },
  storage: {
    used: { type: Number, default: 0 },
    max: { type: Number, default: 100 }
  },
  lastUpdated: { type: String, default: () => new Date().toISOString() }
}, { _id: false })

// Subscription details schema
const subscriptionDetailsSchema = new Schema<Partial<SubscriptionDetails>>({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true },
  tier: { 
    type: String, 
    enum: Object.values(SubscriptionTier), 
    default: SubscriptionTier.FREE 
  },
  status: { 
    type: String, 
    enum: Object.values(SubscriptionStatus), 
    default: SubscriptionStatus.ACTIVE 
  },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly'], 
    default: 'monthly' 
  },
  currentPeriodStart: { type: String, default: () => new Date().toISOString() },
  currentPeriodEnd: { type: String, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  isTrial: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  autoRenew: { type: Boolean, default: true },
  paymentProvider: { 
    type: String, 
    enum: ['stripe', 'paypal', 'apple', 'google'], 
    default: 'stripe' 
  },
  quantity: { type: Number, default: 1 },
  externalSubscriptionId: { type: String, default: '' },
  features: [{ type: String }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false })

// Main user schema
const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLoginAt: {
    type: Date
  },
  refreshTokens: [{
    type: String,
    select: false
  }],
  subscription: {
    type: subscriptionDetailsSchema,
    default: () => ({})
  },
  usage: {
    type: usageStatsSchema,
    default: () => ({})
  },
  features: {
    type: featureFlagsSchema,
    default: () => ({})
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString()
      delete ret.password
      delete ret.emailVerificationToken
      delete ret.passwordResetToken
      delete ret.passwordResetExpires
      delete ret.refreshTokens
      delete ret.__v
      return ret
    }
  }
})

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 1 }, { unique: true })
userSchema.index({ emailVerificationToken: 1 })
userSchema.index({ passwordResetToken: 1 })
userSchema.index({ 'subscription.tier': 1 })
userSchema.index({ 'subscription.status': 1 })
userSchema.index({ createdAt: 1 })

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generateEmailVerificationToken = function(): string {
  const crypto = require('crypto')
  const token = crypto.randomBytes(32).toString('hex')
  this.emailVerificationToken = token
  return token
}

userSchema.methods.generatePasswordResetToken = function(): string {
  const crypto = require('crypto')
  const token = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = token
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  return token
}

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  const bcrypt = require('bcryptjs')
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
  this.password = await bcrypt.hash(this.password, saltRounds)
  next()
})

// Pre-save middleware to set subscription userId and update timestamps
userSchema.pre('save', function(next) {
  if (this.subscription && this.subscription.userId !== this._id.toString()) {
    this.subscription.userId = this._id.toString()
  }
  
  if (this.subscription && this.isModified('subscription')) {
    this.subscription.updatedAt = new Date().toISOString()
  }
  
  if (this.usage && this.isModified('usage')) {
    this.usage.lastUpdated = new Date().toISOString()
  }
  
  next()
})

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username })
}

userSchema.statics.findByEmailVerificationToken = function(token: string) {
  return this.findOne({ emailVerificationToken: token })
}

userSchema.statics.findByPasswordResetToken = function(token: string) {
  return this.findOne({ 
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  })
}

export const User = mongoose.model<UserDocument>('User', userSchema)
export default User
