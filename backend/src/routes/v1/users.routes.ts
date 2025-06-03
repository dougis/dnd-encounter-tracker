import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'User profile endpoint - coming soon'
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Update user profile endpoint - coming soon'
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, requireAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Get all users endpoint - coming soon'
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

export default router