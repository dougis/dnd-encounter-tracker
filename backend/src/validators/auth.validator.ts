import { z } from 'zod'
import { commonSchemas } from '../middleware/validation.middleware'

export const authValidators = {
  /**
   * Register validation schema
   */
  register: z.object({
    username: commonSchemas.username,
    email: commonSchemas.email,
    password: commonSchemas.password
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters')
      .refine(
        (password) => {
          // Check for at least one lowercase letter
          if (!/[a-z]/.test(password)) return false
          // Check for at least one uppercase letter or number
          if (!/[A-Z0-9]/.test(password)) return false
          return true
        },
        {
          message: 'Password must contain at least one lowercase letter and one uppercase letter or number'
        }
      )
  }).strict(),

  /**
   * Login validation schema
   */
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }).strict(),

  /**
   * Refresh token validation schema
   */
  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  }).strict(),

  /**
   * Email verification validation schema
   */
  verifyEmail: z.object({
    token: z.string().min(1, 'Verification token is required')
  }).strict(),

  /**
   * Resend verification email validation schema
   */
  resendVerification: z.object({
    email: commonSchemas.email
  }).strict(),

  /**
   * Forgot password validation schema
   */
  forgotPassword: z.object({
    email: commonSchemas.email
  }).strict(),

  /**
   * Reset password validation schema
   */
  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: commonSchemas.password
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters')
      .refine(
        (password) => {
          // Check for at least one lowercase letter
          if (!/[a-z]/.test(password)) return false
          // Check for at least one uppercase letter or number
          if (!/[A-Z0-9]/.test(password)) return false
          return true
        },
        {
          message: 'Password must contain at least one lowercase letter and one uppercase letter or number'
        }
      )
  }).strict(),

  /**
   * Change password validation schema
   */
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password
      .min(6, 'New password must be at least 6 characters long')
      .max(100, 'New password cannot exceed 100 characters')
      .refine(
        (password) => {
          // Check for at least one lowercase letter
          if (!/[a-z]/.test(password)) return false
          // Check for at least one uppercase letter or number
          if (!/[A-Z0-9]/.test(password)) return false
          return true
        },
        {
          message: 'New password must contain at least one lowercase letter and one uppercase letter or number'
        }
      )
  }).strict().refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: 'New password must be different from current password',
      path: ['newPassword']
    }
  )
}

export default authValidators