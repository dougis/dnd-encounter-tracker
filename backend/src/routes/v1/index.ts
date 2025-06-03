import { Router } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './users.routes'
import partyRoutes from './parties.routes'
import encounterRoutes from './encounters.routes'
import creatureRoutes from './creatures.routes'
import subscriptionRoutes from './subscriptions.routes'
import adminRoutes from './admin.routes'

const router = Router()

// Mount route modules
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/parties', partyRoutes)
router.use('/encounters', encounterRoutes)
router.use('/creatures', creatureRoutes)
router.use('/subscriptions', subscriptionRoutes)
router.use('/admin', adminRoutes)

export default router
