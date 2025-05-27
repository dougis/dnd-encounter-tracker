import { SubscriptionTier, SubscriptionStatus } from '.';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    validationErrors?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard list response with pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard success response
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId: string;
}

/**
 * Standard create/update response
 */
export interface MutationResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  warnings?: string[];
}

/**
 * Standard delete response
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
  id: string;
  timestamp: string;
}

/**
 * Standard search parameters
 */
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  include?: string[];
  fields?: string[];
  exclude?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard search response
 */
export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
  meta: {
    took: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Standard batch operation response
 */
export interface BatchResponse<T = any> {
  success: boolean;
  processed: number;
  failed: number;
  failures: Array<{
    id: string;
    error: string;
    details?: any;
  }>;
  results: T[];
}

/**
 * Standard file upload response
 */
export interface FileUploadResponse {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  path: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard validation error
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
  children?: ValidationError[];
}

/**
 * Standard validation error response
 */
export interface ValidationErrorResponse {
  status: number;
  code: 'VALIDATION_ERROR';
  message: string;
  errors: ValidationError[];
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard not found error response
 */
export interface NotFoundErrorResponse {
  status: 404;
  code: 'NOT_FOUND';
  message: string;
  resource: string;
  id?: string;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard unauthorized error response
 */
export interface UnauthorizedErrorResponse {
  status: 401;
  code: 'UNAUTHORIZED' | 'INVALID_CREDENTIALS' | 'INVALID_TOKEN' | 'TOKEN_EXPIRED';
  message: string;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard forbidden error response
 */
export interface ForbiddenErrorResponse {
  status: 403;
  code: 'FORBIDDEN' | 'INSUFFICIENT_PERMISSIONS' | 'SUBSCRIPTION_REQUIRED';
  message: string;
  requiredRole?: string;
  requiredPermission?: string;
  requiredSubscription?: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
  };
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard rate limit error response
 */
export interface RateLimitErrorResponse {
  status: 429;
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  retryAfter: number;
  limit: number;
  remaining: number;
  reset: number;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard server error response
 */
export interface ServerErrorResponse {
  status: 500;
  code: 'INTERNAL_SERVER_ERROR' | 'SERVICE_UNAVAILABLE' | 'NOT_IMPLEMENTED';
  message: string;
  error?: string;
  stack?: string;
  timestamp: string;
  path: string;
  requestId: string;
  correlationId?: string;
}

/**
 * Standard bad request error response
 */
export interface BadRequestErrorResponse {
  status: 400;
  code: 'BAD_REQUEST' | 'INVALID_INPUT' | 'VALIDATION_ERROR' | 'MISSING_REQUIRED_FIELD';
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard conflict error response
 */
export interface ConflictErrorResponse {
  status: 409;
  code: 'CONFLICT' | 'DUPLICATE_ENTRY' | 'RESOURCE_EXISTS' | 'VERSION_MISMATCH';
  message: string;
  resource?: string;
  id?: string;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Standard error response type that includes all possible error responses
 */
export type ErrorResponseType =
  | ErrorResponse
  | ValidationErrorResponse
  | NotFoundErrorResponse
  | UnauthorizedErrorResponse
  | ForbiddenErrorResponse
  | RateLimitErrorResponse
  | ServerErrorResponse
  | BadRequestErrorResponse
  | ConflictErrorResponse;
