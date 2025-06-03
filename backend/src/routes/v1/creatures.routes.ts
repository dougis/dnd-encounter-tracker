import { Router } from 'express'
import { authenticate, checkUsageLimit, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

/**
 * @route   GET /api/v1/creatures
 * @desc    Get creatures (user's + global templates)
 * @access  Public (with optional auth for user creatures)
 */
router.get('/', optionalAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      creatures: [],
      message: 'Get creatures endpoint - coming soon'
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

/**
 * @route   POST /api/v1/creatures
 * @desc    Create a new creature
 * @access  Private
 */
router.post('/', authenticate, checkUsageLimit('creatures'), (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Create creature endpoint - coming soon'
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

/**
 * @route   GET /api/v1/creatures/:id
 * @desc    Get creature by ID
 * @access  Public (for global templates) / Private (for user creatures)
 */
router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      message: `Get creature ${req.params.id} endpoint - coming soon`
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

/**
 * @route   PUT /api/v1/creatures/:id
 * @desc    Update creature
 * @access  Private
 */
router.put('/:id', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      message: `Update creature ${req.params.id} endpoint - coming soon`
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

/**
 * @route   DELETE /api/v1/creatures/:id
 * @desc    Delete creature
 * @access  Private
 */
router.delete('/:id', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      message: `Delete creature ${req.params.id} endpoint - coming soon`
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

/**
 * @route   GET /api/v1/creatures/search
 * @desc    Search creatures
 * @access  Public
 */
router.get('/search', optionalAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      creatures: [],
      message: 'Search creatures endpoint - coming soon'
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

export default router