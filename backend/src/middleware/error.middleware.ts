import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '@dnd-encounter-tracker/shared'
import { logger } from '../utils/logger'
import { ZodError } from 'zod'
import mongoose from 'mongoose'

export interface CustomError extends Error {
  statusCode?: number
  code?: string
  isOperational?: boolean
}

export class AppError extends Error implements CustomError {
  public statusCode: number
  public code: string
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code || 'INTERNAL_SERVER_ERROR'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error handler middleware
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal Server Error'
  let code = error.code || 'INTERNAL_SERVER_ERROR'

  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  })

  // Handle specific error types
  if (error instanceof ZodError) {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = 'Validation failed'
    
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(statusCode).json(response)
    return
  }

  // Handle Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = 'Database validation failed'
    
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: (err as any).value
    }))

    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details: validationErrors
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    res.status(statusCode).json(response)
    return
  }

  // Handle Mongoose cast errors
  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400
    code = 'INVALID_ID_FORMAT'
    message = 'Invalid ID format'
  }

  // Handle MongoDB duplicate key errors
  if ((error as any).code === 11000) {
    statusCode = 409
    code = 'DUPLICATE_ENTRY'
    message = 'Resource already exists'
    
    const field = Object.keys((error as any).keyValue)[0]
    message = `${field} already exists`
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    code = 'INVALID_TOKEN'
    message = 'Invalid authentication token'
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    code = 'TOKEN_EXPIRED'
    message = 'Authentication token has expired'
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    message = 'Something went wrong'
    code = 'INTERNAL_SERVER_ERROR'
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  }

  res.status(statusCode).json(response)
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND')
  next(error)
}

export default {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler
}
