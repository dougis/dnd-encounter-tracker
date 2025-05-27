import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SearchParams,
  ErrorResponse,
  SuccessResponse,
  MutationResponse,
  DeleteResponse,
  ValidationError,
  ValidationErrorResponse,
  NotFoundErrorResponse,
  UnauthorizedErrorResponse,
  ForbiddenErrorResponse,
  RateLimitErrorResponse,
  ServerErrorResponse,
  BadRequestErrorResponse,
  ConflictErrorResponse,
} from '../../src/types/api';

describe('API Types', () => {
  describe('ApiResponse', () => {
    it('should create a success response', () => {
      const successResponse: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: '123' },
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toEqual({ id: '123' });
      expect(successResponse.error).toBeUndefined();
    });

    it('should create an error response', () => {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          validationErrors: [
            { field: 'id', message: 'Not found', code: 'not_found' }
          ]
        },
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.error?.code).toBe('NOT_FOUND');
      expect(errorResponse.error?.message).toBe('Resource not found');
      expect(errorResponse.error?.validationErrors).toBeDefined();
      expect(errorResponse.data).toBeUndefined();
    });
  });

  describe('SuccessResponse', () => {
    it('should create a success response with data', () => {
      const response: SuccessResponse<{ id: string }> = {
        success: true,
        data: { id: '123' },
        timestamp: '2023-01-01T00:00:00Z',
        requestId: 'req_123'
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '123' });
      expect(response.timestamp).toBeDefined();
      expect(response.requestId).toBeDefined();
    });
  });

  describe('ErrorResponse', () => {
    it('should create an error response with default values', () => {
      const response: ErrorResponse = {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/test',
        requestId: 'req_123'
      };

      expect(response.status).toBe(500);
      expect(response.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.message).toBe('An error occurred');
      expect(response.timestamp).toBeDefined();
      expect(response.path).toBeDefined();
      expect(response.requestId).toBeDefined();
    });

    it('should include validation errors', () => {
      const response: ValidationErrorResponse = {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [
          { field: 'email', code: 'invalid_email', message: 'Invalid email format' }
        ],
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/test',
        requestId: 'req_123'
      };

      expect(response.status).toBe(400);
      expect(response.code).toBe('VALIDATION_ERROR');
      expect(response.errors).toHaveLength(1);
      expect(response.errors[0].field).toBe('email');
    });
  });

  describe('Pagination', () => {
    it('should define pagination parameters', () => {
      const params: PaginationParams = {
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc'
      };

      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(10);
      expect(params.sortBy).toBe('name');
      expect(params.sortOrder).toBe('asc');
    });

    it('should define a paginated response', () => {
      const response: PaginatedResponse<{ id: string }> = {
        items: [{ id: '1' }, { id: '2' }],
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      expect(response.items).toHaveLength(2);
      expect(response.pagination.total).toBe(2);
      expect(response.pagination.page).toBe(1);
    });
  });

  describe('Search', () => {
    it('should define search parameters', () => {
      const params: SearchParams = {
        query: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          status: 'active'
        }
      };

      expect(params.query).toBe('test');
      expect(params.page).toBe(1);
      expect(params.filters?.status).toBe('active');
    });
  });

  describe('MutationResponse', () => {
    it('should define a mutation response', () => {
      const response: MutationResponse<{ id: string }> = {
        success: true,
        data: { id: '123' },
        message: 'Created successfully',
        warnings: ['Deprecated field used']
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '123' });
      expect(response.message).toBe('Created successfully');
      expect(response.warnings).toContain('Deprecated field used');
    });
  });

  describe('DeleteResponse', () => {
    it('should define a delete response', () => {
      const response: DeleteResponse = {
        success: true,
        message: 'Deleted successfully',
        id: '123',
        timestamp: '2023-01-01T00:00:00Z'
      };

      expect(response.success).toBe(true);
      expect(response.id).toBe('123');
      expect(response.message).toBe('Deleted successfully');
    });
  });

  describe('Error Responses', () => {
    it('should define a not found error response', () => {
      const response: NotFoundErrorResponse = {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Resource not found',
        resource: 'User',
        id: '123',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/users/123',
        requestId: 'req_123'
      };

      expect(response.status).toBe(404);
      expect(response.code).toBe('NOT_FOUND');
      expect(response.resource).toBe('User');
    });

    it('should define an unauthorized error response', () => {
      const response: UnauthorizedErrorResponse = {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/protected',
        requestId: 'req_123'
      };

      expect(response.status).toBe(401);
      expect(response.code).toBe('UNAUTHORIZED');
    });

    it('should define a forbidden error response', () => {
      const response: ForbiddenErrorResponse = {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        requiredRole: 'ADMIN',
        requiredPermission: 'users:delete',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/admin/users/123',
        requestId: 'req_123'
      };

      expect(response.status).toBe(403);
      expect(response.requiredRole).toBe('ADMIN');
      expect(response.requiredPermission).toBe('users:delete');
    });

    it('should define a rate limit error response', () => {
      const response: RateLimitErrorResponse = {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfter: 60,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/endpoint',
        requestId: 'req_123'
      };

      expect(response.status).toBe(429);
      expect(response.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.retryAfter).toBe(60);
    });
  });
});
