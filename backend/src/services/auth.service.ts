import { 
  LoginCredentials, 
  RegisterData, 
  AuthTokens,
  User as IUser 
} from '@dnd-encounter-tracker/shared'
import { UserService } from './user.service'
import { UserDocument } from '../models/User.model'
import { JwtUtils } from '../utils/jwt.utils'
import { AppError } from '../middleware/error.middleware'
import { logger } from '../utils/logger'

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<{ user: UserDocument; tokens: AuthTokens }> {
    try {
      // Create user
      const user = await UserService.create(userData)
      
      // Generate tokens
      const tokens = JwtUtils.generateTokenPair(
        user._id,
        user.email,
        user.isAdmin
      )

      // Store refresh token (for future token management)
      user.refreshTokens = user.refreshTokens || []
      user.refreshTokens.push(tokens.refreshToken)
      await user.save()

      logger.info(`User registered successfully: ${user.email}`)
      
      return { user, tokens }
    } catch (error) {
      logger.error('Registration failed:', error)
      throw error
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: UserDocument; tokens: AuthTokens }> {
    try {
      const { email, password } = credentials

      // Find user by email
      const user = await UserService.findByEmail(email)
      if (!user) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
      }

      // Check if email is verified (if verification is enabled)
      if (process.env.ENABLE_EMAIL_VERIFICATION === 'true' && !user.emailVerified) {
        throw new AppError('Please verify your email address before logging in', 401, 'EMAIL_NOT_VERIFIED')
      }

      // Generate tokens
      const tokens = JwtUtils.generateTokenPair(
        user._id,
        user.email,
        user.isAdmin
      )

      // Store refresh token
      user.refreshTokens = user.refreshTokens || []
      user.refreshTokens.push(tokens.refreshToken)
      user.lastLoginAt = new Date()
      await user.save()

      logger.info(`User logged in successfully: ${user.email}`)
      
      return { user, tokens }
    } catch (error) {
      logger.error('Login failed:', error)
      throw error
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ user: UserDocument; tokens: AuthTokens }> {
    try {
      // Verify refresh token
      const payload = JwtUtils.verifyRefreshToken(refreshToken)
      
      // Find user
      const user = await UserService.findById(payload.userId)
      if (!user) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND')
      }

      // Check if refresh token exists in user's token list
      if (!user.refreshTokens?.includes(refreshToken)) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
      }

      // Generate new tokens
      const tokens = JwtUtils.generateTokenPair(
        user._id,
        user.email,
        user.isAdmin
      )

      // Replace old refresh token with new one
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken)
      user.refreshTokens.push(tokens.refreshToken)
      await user.save()

      logger.info(`Token refreshed for user: ${user.email}`)
      
      return { user, tokens }
    } catch (error) {
      logger.error('Token refresh failed:', error)
      throw error
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      const user = await UserService.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Remove specific refresh token or all tokens
      if (refreshToken) {
        user.refreshTokens = user.refreshTokens?.filter(token => token !== refreshToken) || []
      } else {
        user.refreshTokens = []
      }
      
      await user.save()
      
      logger.info(`User logged out: ${user.email}`)
    } catch (error) {
      logger.error('Logout failed:', error)
      throw error
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(userId: string): Promise<void> {
    try {
      const user = await UserService.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Clear all refresh tokens
      user.refreshTokens = []
      await user.save()
      
      logger.info(`User logged out from all devices: ${user.email}`)
    } catch (error) {
      logger.error('Logout all failed:', error)
      throw error
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<UserDocument> {
    try {
      const user = await UserService.findByEmailVerificationToken(token)
      if (!user) {
        throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN')
      }

      // Mark email as verified
      user.emailVerified = true
      user.emailVerificationToken = undefined
      await user.save()

      logger.info(`Email verified for user: ${user.email}`)
      
      return user
    } catch (error) {
      logger.error('Email verification failed:', error)
      throw error
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await UserService.findByEmail(email)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      if (user.emailVerified) {
        throw new AppError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED')
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken()
      await user.save()

      // TODO: Send verification email
      // await EmailService.sendVerificationEmail(user.email, verificationToken)

      logger.info(`Verification email resent to: ${user.email}`)
    } catch (error) {
      logger.error('Resend verification email failed:', error)
      throw error
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      const user = await UserService.findByEmail(email)
      if (!user) {
        // Don't reveal if email exists for security
        logger.info(`Password reset requested for non-existent email: ${email}`)
        return
      }

      // Generate password reset token
      const resetToken = user.generatePasswordResetToken()
      await user.save()

      // TODO: Send password reset email
      // await EmailService.sendPasswordResetEmail(user.email, resetToken)

      logger.info(`Password reset email sent to: ${user.email}`)
    } catch (error) {
      logger.error('Forgot password failed:', error)
      throw error
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await UserService.findByPasswordResetToken(token)
      if (!user) {
        throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN')
      }

      // Update password
      user.password = newPassword
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      
      // Clear all refresh tokens for security
      user.refreshTokens = []
      
      await user.save()

      logger.info(`Password reset successfully for user: ${user.email}`)
    } catch (error) {
      logger.error('Password reset failed:', error)
      throw error
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<UserDocument> {
    try {
      const user = await UserService.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }
      
      return user
    } catch (error) {
      logger.error('Get current user failed:', error)
      throw error
    }
  }
}

export default AuthService