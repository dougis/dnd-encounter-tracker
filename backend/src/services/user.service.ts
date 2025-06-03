import { Types } from 'mongoose'
import { User, UserDocument } from '../models/User.model'
import { 
  User as IUser, 
  RegisterData, 
  SubscriptionTier, 
  FeatureFlags,
  UsageStats 
} from '@dnd-encounter-tracker/shared'
import { AppError } from '../middleware/error.middleware'
import { PasswordUtils } from '../utils/password.utils'

export class UserService {
  /**
   * Create a new user
   */
  static async create(userData: RegisterData): Promise<UserDocument> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email.toLowerCase() },
          { username: userData.username }
        ]
      })

      if (existingUser) {
        if (existingUser.email === userData.email.toLowerCase()) {
          throw new AppError('Email already exists', 409, 'EMAIL_EXISTS')
        }
        if (existingUser.username === userData.username) {
          throw new AppError('Username already exists', 409, 'USERNAME_EXISTS')
        }
      }

      // Validate password strength
      const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password)
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`,
          400,
          'WEAK_PASSWORD'
        )
      }

      // Create user with default subscription and features
      const user = new User({
        username: userData.username,
        email: userData.email.toLowerCase(),
        password: userData.password,
        subscription: {
          tier: SubscriptionTier.FREE,
          userId: '', // Will be set in pre-save middleware
        },
        features: this.getFeaturesByTier(SubscriptionTier.FREE),
        usage: {
          partiesCreated: 0,
          encountersCreated: 0,
          creaturesCreated: 0,
          sessionsThisMonth: 0,
          storageUsedMB: 0,
          encounters: { current: 0, max: 3 },
          players: { current: 0, max: 6 },
          storage: { used: 0, max: 100 }
        }
      })

      await user.save()
      return user
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to create user', 500, 'USER_CREATION_FAILED')
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return null
      }
      return await User.findById(id)
    } catch (error) {
      throw new AppError('Failed to find user', 500, 'USER_FIND_FAILED')
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() }).select('+password')
    } catch (error) {
      throw new AppError('Failed to find user', 500, 'USER_FIND_FAILED')
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ username })
    } catch (error) {
      throw new AppError('Failed to find user', 500, 'USER_FIND_FAILED')
    }
  }

  /**
   * Find user by email verification token
   */
  static async findByEmailVerificationToken(token: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ emailVerificationToken: token })
    } catch (error) {
      throw new AppError('Failed to find user by verification token', 500, 'USER_FIND_FAILED')
    }
  }

  /**
   * Find user by password reset token
   */
  static async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ 
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      })
    } catch (error) {
      throw new AppError('Failed to find user by reset token', 500, 'USER_FIND_FAILED')
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string, 
    updateData: Partial<Pick<IUser, 'username' | 'email' | 'preferences'>>
  ): Promise<UserDocument> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Check for conflicts if updating email or username
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ email: updateData.email.toLowerCase() })
        if (existingUser) {
          throw new AppError('Email already exists', 409, 'EMAIL_EXISTS')
        }
      }

      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await User.findOne({ username: updateData.username })
        if (existingUser) {
          throw new AppError('Username already exists', 409, 'USERNAME_EXISTS')
        }
      }

      // Update user
      Object.assign(user, updateData)
      await user.save()
      
      return user
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to update user', 500, 'USER_UPDATE_FAILED')
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password')
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD')
      }

      // Validate new password strength
      const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword)
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`,
          400,
          'WEAK_PASSWORD'
        )
      }

      // Update password
      user.password = newPassword
      await user.save()
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to change password', 500, 'PASSWORD_CHANGE_FAILED')
    }
  }

  /**
   * Update subscription tier and features
   */
  static async updateSubscription(
    userId: string, 
    tier: SubscriptionTier,
    subscriptionData?: Partial<any>
  ): Promise<UserDocument> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Update subscription tier
      user.subscription.tier = tier
      user.features = this.getFeaturesByTier(tier)
      
      // Update additional subscription data if provided
      if (subscriptionData) {
        Object.assign(user.subscription, subscriptionData)
      }

      await user.save()
      return user
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to update subscription', 500, 'SUBSCRIPTION_UPDATE_FAILED')
    }
  }

  /**
   * Update usage statistics
   */
  static async updateUsage(
    userId: string, 
    usageUpdate: Partial<UsageStats>
  ): Promise<UserDocument> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Update usage statistics
      Object.assign(user.usage, usageUpdate)
      user.usage.lastUpdated = new Date().toISOString()

      await user.save()
      return user
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to update usage', 500, 'USAGE_UPDATE_FAILED')
    }
  }

  /**
   * Increment usage counter
   */
  static async incrementUsage(
    userId: string, 
    type: 'partiesCreated' | 'encountersCreated' | 'creaturesCreated' | 'sessionsThisMonth'
  ): Promise<UserDocument> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Increment the specified counter
      if (user.usage) {
        user.usage[type] = (user.usage[type] || 0) + 1
        user.usage.lastUpdated = new Date().toISOString()
      }

      await user.save()
      return user
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to increment usage', 500, 'USAGE_INCREMENT_FAILED')
    }
  }

  /**
   * Delete user
   */
  static async delete(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      await User.findByIdAndDelete(userId)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to delete user', 500, 'USER_DELETE_FAILED')
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAll(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<{ users: UserDocument[], total: number, pages: number }> {
    try {
      const skip = (page - 1) * limit
      const query = search 
        ? {
            $or: [
              { username: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        : {}

      const [users, total] = await Promise.all([
        User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(query)
      ])

      return {
        users,
        total,
        pages: Math.ceil(total / limit)
      }
    } catch (error) {
      throw new AppError('Failed to fetch users', 500, 'USERS_FETCH_FAILED')
    }
  }

  /**
   * Get features by subscription tier
   */
  static getFeaturesByTier(tier: SubscriptionTier): FeatureFlags {
    const features: Record<SubscriptionTier, FeatureFlags> = {
      [SubscriptionTier.FREE]: {
        maxParties: 1,
        maxEncounters: 3,
        maxCreatures: 10,
        maxParticipantsPerEncounter: 6,
        cloudSync: false,
        advancedCombatLog: false,
        customThemes: false,
        exportFeatures: false,
        prioritySupport: false,
        betaAccess: false,
        collaborativeMode: false,
        automatedBackups: false
      },
      [SubscriptionTier.SEASONED]: {
        maxParties: 3,
        maxEncounters: 15,
        maxCreatures: 50,
        maxParticipantsPerEncounter: 10,
        cloudSync: true,
        advancedCombatLog: true,
        customThemes: false,
        exportFeatures: true,
        prioritySupport: false,
        betaAccess: false,
        collaborativeMode: false,
        automatedBackups: true
      },
      [SubscriptionTier.EXPERT]: {
        maxParties: 10,
        maxEncounters: 50,
        maxCreatures: 200,
        maxParticipantsPerEncounter: 20,
        cloudSync: true,
        advancedCombatLog: true,
        customThemes: true,
        exportFeatures: true,
        prioritySupport: true,
        betaAccess: true,
        collaborativeMode: true,
        automatedBackups: true
      },
      [SubscriptionTier.MASTER]: {
        maxParties: 25,
        maxEncounters: 100,
        maxCreatures: 500,
        maxParticipantsPerEncounter: 30,
        cloudSync: true,
        advancedCombatLog: true,
        customThemes: true,
        exportFeatures: true,
        prioritySupport: true,
        betaAccess: true,
        collaborativeMode: true,
        automatedBackups: true
      },
      [SubscriptionTier.GUILD_MASTER]: {
        maxParties: -1, // unlimited
        maxEncounters: -1, // unlimited
        maxCreatures: -1, // unlimited
        maxParticipantsPerEncounter: 50,
        cloudSync: true,
        advancedCombatLog: true,
        customThemes: true,
        exportFeatures: true,
        prioritySupport: true,
        betaAccess: true,
        collaborativeMode: true,
        automatedBackups: true
      },
      // Legacy tiers
      [SubscriptionTier.BASIC]: {
        maxParties: 3,
        maxEncounters: 15,
        maxCreatures: 50,
        maxParticipantsPerEncounter: 10,
        cloudSync: true,
        advancedCombatLog: true,
        customThemes: false,
        exportFeatures: true,
        prioritySupport: false,
        betaAccess: false,
        collaborativeMode: false,
        automatedBackups: true
      },
      [SubscriptionTier.PREMIUM]: {
        maxParties: 10,
        maxEncounters: 50,
        maxCreatures: 200,
        maxParticipantsPerEncounter: 20,
        cloudSync: true,
        advancedCombatLog: true,
        customThemes: true,
        exportFeatures: true,
        prioritySupport: true,
        betaAccess: true,
        collaborativeMode: true,
        automatedBackups: true
      },
      [SubscriptionTier.ULTIMATE]: {
        maxParties: -1, // unlimited
        maxEncounters: -1, // unlimited
        maxCreatures: -1, // unlimited
        maxParticipantsPerEncounter: 50,
        cloudSync: true,
        advancedCombatLog: true,
        customThemes: true,
        exportFeatures: true,
        prioritySupport: true,
        betaAccess: true,
        collaborativeMode: true,
        automatedBackups: true
      }
    }

    return features[tier]
  }
}

export default UserService