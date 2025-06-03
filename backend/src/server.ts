import dotenv from 'dotenv'
import path from 'path'

// Load environment variables first
dotenv.config()

import app from './app'
import { connectDatabase } from './config/database.config'
import { logger } from './utils/logger'

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // Connect to database
    await connectDatabase()
    logger.info('✅ Database connected successfully')

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📱 Environment: ${process.env.NODE_ENV}`)
      logger.info(`🌐 API Base URL: http://localhost:${PORT}/api/v1`)
    })

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`📴 Received ${signal}. Graceful shutdown initiated...`)
      
      server.close(() => {
        logger.info('💤 HTTP server closed')
        process.exit(0)
      })

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('⛔ Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error)
      gracefulShutdown('UNCAUGHT_EXCEPTION')
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
      gracefulShutdown('UNHANDLED_REJECTION')
    })

  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
