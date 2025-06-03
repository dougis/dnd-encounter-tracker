import winston from 'winston'
import path from 'path'

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}`
    }
    return `${timestamp} [${level}]: ${message}`
  })
)

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'dnd-encounter-tracker-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' ? consoleFormat : logFormat,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    }),

    // File transports for production
    ...(process.env.NODE_ENV === 'production' ? [
      // Error log file
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),

      // Combined log file
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ] : [])
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'exceptions.log')
      })
    ] : [])
  ],

  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'rejections.log')
      })
    ] : [])
  ]
})

// Create logs directory if it doesn't exist (for production)
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs')
  const logsDir = path.join(process.cwd(), 'logs')
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }
}

// HTTP request logger middleware
export const httpLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

export default logger
