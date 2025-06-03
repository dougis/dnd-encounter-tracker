import bcrypt from 'bcryptjs'

export class PasswordUtils {
  private static readonly SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

  /**
   * Hash a password
   */
  static async hash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS)
      return await bcrypt.hash(password, salt)
    } catch (error) {
      throw new Error('Failed to hash password')
    }
  }

  /**
   * Verify a password against a hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      throw new Error('Failed to verify password')
    }
  }

  /**
   * Generate a random password
   */
  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    
    return password
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
    score: number
  } {
    const errors: string[] = []
    let score = 0

    // Check minimum length
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    } else if (password.length >= 8) {
      score += 1
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    } else {
      score += 1
    }

    // Check for special characters
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    } else {
      score += 1
    }

    // Check for common patterns
    const commonPatterns = [
      /(.)\1{2,}/, // repeated characters
      /123|234|345|456|567|678|789|890/, // sequential numbers
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i // sequential letters
    ]

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns that make it weak')
        score -= 1
        break
      }
    }

    // Check against common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ]

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common')
      score -= 2
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, Math.min(5, score))
    }
  }

  /**
   * Generate a secure token for password reset, email verification, etc.
   */
  static generateSecureToken(length: number = 32): string {
    const crypto = require('crypto')
    return crypto.randomBytes(length).toString('hex')
  }
}

export default PasswordUtils
