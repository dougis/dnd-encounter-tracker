import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { ApiResponse } from '@dnd-encounter-tracker/shared'

/**
 * Middleware to validate request data using Zod schemas
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the request body
      const validatedData = schema.parse(req.body)
      
      // Replace the request body with validated data
      req.body = validatedData
      
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code,
              expected: (err as any).expected,
              received: (err as any).received
            }))
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1'
          }
        }
        
        res.status(400).json(response)
        return
      }
      
      // Handle other validation errors
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }
      
      res.status(400).json(response)
    }
  }
}

/**
 * Middleware to validate query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query)
      req.query = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'QUERY_VALIDATION_ERROR',
            message: 'Query parameter validation failed',
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
        
        res.status(400).json(response)
        return
      }
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'QUERY_VALIDATION_ERROR',
          message: 'Query parameter validation failed'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }
      
      res.status(400).json(response)
    }
  }
}

/**
 * Middleware to validate URL parameters
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params)
      req.params = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'PARAMS_VALIDATION_ERROR',
            message: 'URL parameter validation failed',
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
        
        res.status(400).json(response)
        return
      }
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'PARAMS_VALIDATION_ERROR',
          message: 'URL parameter validation failed'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }
      
      res.status(400).json(response)
    }
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
}

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export const searchSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export default {
  validateRequest,
  validateQuery,
  validateParams,
  commonSchemas,
  paginationSchema,
  searchSchema
}