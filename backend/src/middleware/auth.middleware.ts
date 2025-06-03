import { Request, Response, NextFunction } from 'express'
import { JwtUtils } from '../utils/jwt.utils'
import { AppError } from './error.middleware'
import { UserService } from '../services/user.service'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        isAdmin: boolean
        subscription?: any
        features?: any
      }
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: string
    email: string
    isAdmin: boolean
    subscription?: any
    features?: any
  }
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401, 'MISSING_TOKEN')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw new AppError('Access token is required', 401, 'MISSING_TOKEN')
    }

    // Verify token
    const payload = JwtUtils.verifyAccessToken(token)
    
    // Get user details
    const user = await UserService.findById(payload.userId)
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND')
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      subscription: user.subscription,
      features: user.features
    }

    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
    } else {
      next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'))
    }
  }
}

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isAdmin) {
    throw new AppError('Admin access required', 403, 'INSUFFICIENT_PERMISSIONS')
  }
  next()
}

/**
 * Middleware to check subscription tier and features
 */
export const requireSubscription = (requiredTier?: string, requiredFeature?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user
    if (!user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED')
    }

    // Check subscription tier if specified
    if (requiredTier && user.subscription?.tier !== requiredTier) {
      throw new AppError(
        `${requiredTier} subscription required`,
        403,
        'INSUFFICIENT_SUBSCRIPTION'
      )
    }

    // Check specific feature if specified
    if (requiredFeature && !user.features?.[requiredFeature]) {
      throw new AppError(
        `Feature not available in your subscription plan`,
        403,
        'FEATURE_NOT_AVAILABLE'
      )
    }

    next()
  }
}

/**
 * Middleware to check usage limits
 */
export const checkUsageLimit = (resourceType: 'parties' | 'encounters' | 'creatures') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user
      if (!user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED')
      }

      // Get current usage and limits
      const currentUser = await UserService.findById(user.id)
      if (!currentUser) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      const usage = currentUser.usage
      const features = currentUser.features

      let currentCount = 0
      let maxLimit = 0

      switch (resourceType) {
        case 'parties':
          currentCount = usage?.partiesCreated || 0
          maxLimit = features?.maxParties || 0
          break
        case 'encounters':
          currentCount = usage?.encountersCreated || 0
          maxLimit = features?.maxEncounters || 0
          break
        case 'creatures':
          currentCount = usage?.creaturesCreated || 0
          maxLimit = features?.maxCreatures || 0
          break
      }

      // Check if limit is exceeded (maxLimit of -1 means unlimited)
      if (maxLimit !== -1 && currentCount >= maxLimit) {
        throw new AppError(
          `You have reached the maximum limit of ${maxLimit} ${resourceType}. Please upgrade your subscription to create more.`,
          403,
          'USAGE_LIMIT_EXCEEDED'
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Optional authentication middleware (doesn't fail if no token provided)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      if (token) {
        const payload = JwtUtils.verifyAccessToken(token)
        const user = await UserService.findById(payload.userId)
        
        if (user) {
          req.user = {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            subscription: user.subscription,
            features: user.features
          }
        }
      }
    }
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

export default {
  authenticate,
  requireAdmin,
  requireSubscription,
  checkUsageLimit,
  optionalAuth
}
