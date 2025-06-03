import mongoose from 'mongoose'
import { logger } from '../utils/logger'

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_encounter_tracker'
    
    await mongoose.connect(mongoUri, {
      // Connection options for better performance and reliability
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    })

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected successfully')
    })

    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      logger.info('💤 MongoDB connection closed through app termination')
      process.exit(0)
    })

  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error)
    throw error
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    logger.info('💤 MongoDB connection closed')
  } catch (error) {
    logger.error('❌ Error closing MongoDB connection:', error)
    throw error
  }
}

// Database health check
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1
}

export default {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected
}
