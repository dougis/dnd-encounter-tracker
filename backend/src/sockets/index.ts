import { Server as SocketIOServer, Socket } from 'socket.io'
import { JwtUtils } from '../utils/jwt.utils'
import { UserService } from '../services/user.service'
import { logger } from '../utils/logger'

interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: any
}

export const initializeSocket = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        logger.warn('Socket connection attempted without token')
        return next(new Error('Authentication token required'))
      }

      // Verify JWT token
      const payload = JwtUtils.verifyAccessToken(token)
      
      // Get user details
      const user = await UserService.findById(payload.userId)
      if (!user) {
        logger.warn(`Socket connection attempted with invalid user ID: ${payload.userId}`)
        return next(new Error('User not found'))
      }

      // Attach user info to socket
      socket.userId = user._id
      socket.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }

      logger.info(`Socket authenticated for user: ${user.username} (${user._id})`)
      next()
    } catch (error) {
      logger.error('Socket authentication failed:', error)
      next(new Error('Authentication failed'))
    }
  })

  // Handle connections
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId
    const username = socket.user?.username || 'Unknown'
    
    logger.info(`User connected via Socket.IO: ${username} (${userId})`)

    // Join user to their personal room
    if (userId) {
      socket.join(`user:${userId}`)
    }

    // Handle encounter room joining
    socket.on('join:encounter', (data: { encounterId: string }) => {
      const { encounterId } = data
      
      if (!encounterId) {
        socket.emit('error', { message: 'Encounter ID is required' })
        return
      }

      // TODO: Verify user has access to this encounter
      socket.join(`encounter:${encounterId}`)
      socket.emit('joined:encounter', { encounterId })
      
      logger.info(`User ${username} joined encounter: ${encounterId}`)
    })

    // Handle leaving encounter room
    socket.on('leave:encounter', (data: { encounterId: string }) => {
      const { encounterId } = data
      
      if (!encounterId) {
        socket.emit('error', { message: 'Encounter ID is required' })
        return
      }

      socket.leave(`encounter:${encounterId}`)
      socket.emit('left:encounter', { encounterId })
      
      logger.info(`User ${username} left encounter: ${encounterId}`)
    })

    // Handle initiative updates
    socket.on('encounter:initiative:update', (data: {
      encounterId: string
      participantId: string
      initiative: number
    }) => {
      const { encounterId, participantId, initiative } = data
      
      if (!encounterId || !participantId || initiative === undefined) {
        socket.emit('error', { message: 'Missing required fields' })
        return
      }

      // TODO: Validate user has permission to update this encounter
      // TODO: Update database with new initiative

      // Broadcast to all users in the encounter room
      socket.to(`encounter:${encounterId}`).emit('encounter:initiative:updated', {
        participantId,
        initiative,
        updatedBy: socket.user
      })

      logger.info(`Initiative updated for participant ${participantId} in encounter ${encounterId}`)
    })

    // Handle health updates
    socket.on('encounter:health:update', (data: {
      encounterId: string
      participantId: string
      currentHP: number
      maxHP?: number
    }) => {
      const { encounterId, participantId, currentHP, maxHP } = data
      
      if (!encounterId || !participantId || currentHP === undefined) {
        socket.emit('error', { message: 'Missing required fields' })
        return
      }

      // TODO: Validate user has permission to update this encounter
      // TODO: Update database with new health values

      // Broadcast to all users in the encounter room
      socket.to(`encounter:${encounterId}`).emit('encounter:health:updated', {
        participantId,
        currentHP,
        maxHP,
        updatedBy: socket.user
      })

      logger.info(`Health updated for participant ${participantId} in encounter ${encounterId}`)
    })

    // Handle turn advancement
    socket.on('encounter:turn:next', (data: { encounterId: string }) => {
      const { encounterId } = data
      
      if (!encounterId) {
        socket.emit('error', { message: 'Encounter ID is required' })
        return
      }

      // TODO: Validate user has permission to control this encounter
      // TODO: Update database with next turn
      // TODO: Get current turn information

      // Broadcast to all users in the encounter room
      socket.to(`encounter:${encounterId}`).emit('encounter:turn:advanced', {
        currentTurn: 0, // TODO: Get actual current turn
        currentRound: 1, // TODO: Get actual current round
        activeParticipant: null, // TODO: Get actual active participant
        advancedBy: socket.user
      })

      logger.info(`Turn advanced in encounter ${encounterId} by ${username}`)
    })

    // Handle condition updates
    socket.on('encounter:condition:update', (data: {
      encounterId: string
      participantId: string
      conditions: string[]
    }) => {
      const { encounterId, participantId, conditions } = data
      
      if (!encounterId || !participantId || !Array.isArray(conditions)) {
        socket.emit('error', { message: 'Invalid condition update data' })
        return
      }

      // TODO: Validate user has permission to update this encounter
      // TODO: Update database with new conditions

      // Broadcast to all users in the encounter room
      socket.to(`encounter:${encounterId}`).emit('encounter:condition:updated', {
        participantId,
        conditions,
        updatedBy: socket.user
      })

      logger.info(`Conditions updated for participant ${participantId} in encounter ${encounterId}`)
    })

    // Handle participant addition
    socket.on('encounter:participant:add', (data: {
      encounterId: string
      participant: any
    }) => {
      const { encounterId, participant } = data
      
      if (!encounterId || !participant) {
        socket.emit('error', { message: 'Missing required fields' })
        return
      }

      // TODO: Validate user has permission to update this encounter
      // TODO: Add participant to database

      // Broadcast to all users in the encounter room
      socket.to(`encounter:${encounterId}`).emit('encounter:participant:added', {
        participant,
        addedBy: socket.user
      })

      logger.info(`Participant added to encounter ${encounterId} by ${username}`)
    })

    // Handle participant removal
    socket.on('encounter:participant:remove', (data: {
      encounterId: string
      participantId: string
    }) => {
      const { encounterId, participantId } = data
      
      if (!encounterId || !participantId) {
        socket.emit('error', { message: 'Missing required fields' })
        return
      }

      // TODO: Validate user has permission to update this encounter
      // TODO: Remove participant from database

      // Broadcast to all users in the encounter room
      socket.to(`encounter:${encounterId}`).emit('encounter:participant:removed', {
        participantId,
        removedBy: socket.user
      })

      logger.info(`Participant removed from encounter ${encounterId} by ${username}`)
    })

    // Handle chat messages
    socket.on('encounter:chat:message', (data: {
      encounterId: string
      message: string
      type?: 'public' | 'dm' | 'system'
    }) => {
      const { encounterId, message, type = 'public' } = data
      
      if (!encounterId || !message) {
        socket.emit('error', { message: 'Message and encounter ID are required' })
        return
      }

      // TODO: Validate user has access to this encounter
      // TODO: Save message to database if needed

      const chatMessage = {
        id: Date.now().toString(), // TODO: Use proper UUID
        encounterId,
        message,
        type,
        sender: socket.user,
        timestamp: new Date().toISOString()
      }

      // Broadcast to all users in the encounter room
      io.to(`encounter:${encounterId}`).emit('encounter:chat:message', chatMessage)

      logger.info(`Chat message sent in encounter ${encounterId} by ${username}`)
    })

    // Handle dice rolls
    socket.on('encounter:dice:roll', (data: {
      encounterId: string
      dice: string
      reason?: string
      isPrivate?: boolean
    }) => {
      const { encounterId, dice, reason, isPrivate = false } = data
      
      if (!encounterId || !dice) {
        socket.emit('error', { message: 'Dice notation and encounter ID are required' })
        return
      }

      // TODO: Implement actual dice rolling logic
      const rollResult = {
        id: Date.now().toString(),
        dice,
        result: Math.floor(Math.random() * 20) + 1, // Placeholder
        breakdown: [], // TODO: Actual dice breakdown
        total: Math.floor(Math.random() * 20) + 1, // Placeholder
        reason,
        roller: socket.user,
        timestamp: new Date().toISOString(),
        isPrivate
      }

      if (isPrivate) {
        // Send only to the roller
        socket.emit('encounter:dice:rolled', rollResult)
      } else {
        // Broadcast to all users in the encounter room
        io.to(`encounter:${encounterId}`).emit('encounter:dice:rolled', rollResult)
      }

      logger.info(`Dice roll (${dice}) in encounter ${encounterId} by ${username}`)
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${username} (${userId}) - Reason: ${reason}`)
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${username}:`, error)
    })

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to D&D Encounter Tracker',
      user: socket.user,
      timestamp: new Date().toISOString()
    })
  })

  // Handle connection errors
  io.on('connect_error', (error) => {
    logger.error('Socket.IO connection error:', error)
  })

  logger.info('Socket.IO server initialized')
  
  return io
}

// Utility functions for emitting to specific rooms
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data)
}

export const emitToEncounter = (io: SocketIOServer, encounterId: string, event: string, data: any) => {
  io.to(`encounter:${encounterId}`).emit(event, data)
}

export default {
  initializeSocket,
  emitToUser,
  emitToEncounter
}