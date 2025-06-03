import { Router } from 'express'
import v1Routes from './v1'

const router = Router()

// Mount v1 routes
router.use('/v1', v1Routes)

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'D&D Encounter Tracker API',
      version: '1.0.0',
      description: 'RESTful API for managing D&D encounters, parties, and creatures',
      endpoints: {
        health: '/health',
        auth: '/v1/auth',
        users: '/v1/users',
        parties: '/v1/parties',
        encounters: '/v1/encounters',
        creatures: '/v1/creatures',
        subscriptions: '/v1/subscriptions'
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  })
})

export default router
