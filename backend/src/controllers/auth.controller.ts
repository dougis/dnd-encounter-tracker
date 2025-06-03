import { Request, Response, NextFunction } from 'express'
import { ApiResponse, LoginCredentials, RegisterData } from '@dnd-encounter-tracker/shared'
import { AuthService } from '../services/auth.service'
import { asyncHandler } from '../middleware/error.middleware'

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userData: RegisterData = req.body
    
    const { user, tokens } = await AuthService.register(userData)
    
    const response: ApiResponse = {
      success: true,
      data: {
        user,
        tokens
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(201).json(response)
  })

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const credentials: LoginCredentials = req.body
    
    const { user, tokens } = await AuthService.login(credentials)
    
    const response: ApiResponse = {
      success: true,
      data: {
        user,
        tokens
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    const { user, tokens } = await AuthService.refreshToken(refreshToken)
    
    const response: ApiResponse = {
      success: true,
      data: {
        user,
        tokens
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    const { refreshToken } = req.body
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    await AuthService.logout(userId, refreshToken)
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Logged out successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Logout from all devices
   */
  static logoutAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    await AuthService.logoutAll(userId)
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Logged out from all devices successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Get current user profile
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    const user = await AuthService.getCurrentUser(userId)
    
    const response: ApiResponse = {
      success: true,
      data: user,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Verify email address
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Verification token is required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    const user = await AuthService.verifyEmail(token)
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Email verified successfully',
        user
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Resend verification email
   */
  static resendVerificationEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email address is required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    await AuthService.resendVerificationEmail(email)
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Verification email sent successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Request password reset
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email address is required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    await AuthService.forgotPassword(email)
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'If an account with that email exists, a password reset link has been sent'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Reset password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Reset token and new password are required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    await AuthService.resetPassword(token, password)
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Password reset successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })

  /**
   * Change password (authenticated)
   */
  static changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Current password and new password are required'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      })
    }
    
    await AuthService.changePassword(userId, currentPassword, newPassword)
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Password changed successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(200).json(response)
  })
}

export default AuthController