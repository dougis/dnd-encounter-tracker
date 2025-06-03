import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { AuthTokens } from '@dnd-encounter-tracker/shared'

export interface JwtPayload {
  userId: string
  email: string
  isAdmin: boolean
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat?: number
  exp?: number
}

export class JwtUtils {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!
  private static readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'dnd-encounter-tracker',
      audience: 'dnd-encounter-tracker-users'
    })
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'dnd-encounter-tracker',
      audience: 'dnd-encounter-tracker-users'
    })
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(userId: string, email: string, isAdmin: boolean = false): AuthTokens {
    const tokenId = new Types.ObjectId().toString()
    
    const accessToken = this.generateAccessToken({
      userId,
      email,
      isAdmin
    })
    
    const refreshToken = this.generateRefreshToken({
      userId,
      tokenId
    })

    return {
      accessToken,
      refreshToken
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'dnd-encounter-tracker',
        audience: 'dnd-encounter-tracker-users'
      }) as JwtPayload
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'dnd-encounter-tracker',
        audience: 'dnd-encounter-tracker-users'
      }) as RefreshTokenPayload
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token)
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token)
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const expiration = this.getTokenExpiration(token)
      if (!expiration) return true
      return expiration < new Date()
    } catch (error) {
      return true
    }
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiration(token: string): number | null {
    try {
      const expiration = this.getTokenExpiration(token)
      if (!expiration) return null
      return expiration.getTime() - Date.now()
    } catch (error) {
      return null
    }
  }
}

export default JwtUtils
