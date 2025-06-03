import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validation.middleware'
import { authValidators } from '../validators/auth.validator'

const router = Router()

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateRequest(authValidators.register),
  AuthController.register
)

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validateRequest(authValidators.login),
  AuthController.login
)

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validateRequest(authValidators.refreshToken),
  AuthController.refreshToken
)

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  AuthController.logout
)

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private
 */
router.post(
  '/logout-all',
  authenticate,
  AuthController.logoutAll
)

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  AuthController.getCurrentUser
)

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post(
  '/verify-email',
  validateRequest(authValidators.verifyEmail),
  AuthController.verifyEmail
)

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  '/resend-verification',
  validateRequest(authValidators.resendVerification),
  AuthController.resendVerificationEmail
)

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  validateRequest(authValidators.forgotPassword),
  AuthController.forgotPassword
)

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateRequest(authValidators.resetPassword),
  AuthController.resetPassword
)

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validateRequest(authValidators.changePassword),
  AuthController.changePassword
)

export default router