// Export all types from each module
export * from './api';
export * from './creature';
export * from './encounter';
export * from './party';
export * from './subscription';
export * from './user';
export * from './utils';

// Common enums and interfaces

// Re-export enums from subscription to maintain backward compatibility
export { SubscriptionTier, SubscriptionStatus } from './subscription';

// Common response type for API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: {
      hasNext: boolean;
      hasPrev: boolean;
      cursor?: string;
      total?: number;
    };
    timestamp: string;
    version: string;
  };
}
