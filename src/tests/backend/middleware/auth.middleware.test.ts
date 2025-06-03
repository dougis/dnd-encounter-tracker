import { authenticateToken, requireAdmin, requireFeature } from '@/middleware/auth.middleware';
import { tokenService } from '@/utils/jwt.utils';
import { User } from '@/models/User.model';

// Mock dependencies
jest.mock('@/utils/jwt.utils', () => ({
  tokenService: {
    verifyAccessToken: jest.fn(),
  },
}));

jest.mock('@/models/User.model', () => ({
  User: {
    findById: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    test('should pass with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        subscription: {
          tier: 'premium',
          status: 'active',
        },
      };

      req.headers.authorization = 'Bearer valid_token';
      (tokenService.verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user123',
        subscription: {
          tier: 'premium',
          status: 'active',
        },
      });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await authenticateToken(req, res, next);

      expect(tokenService.verifyAccessToken).toHaveBeenCalledWith('valid_token');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should return 401 when token is missing', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'MISSING_TOKEN',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid_token';
      (tokenService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw { name: 'JsonWebTokenError' };
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_TOKEN',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when token is expired', async () => {
      req.headers.authorization = 'Bearer expired_token';
      (tokenService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw { name: 'TokenExpiredError' };
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'TOKEN_EXPIRED',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when user not found', async () => {
      req.headers.authorization = 'Bearer valid_token';
      (tokenService.verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user123',
        subscription: {
          tier: 'premium',
          status: 'active',
        },
      });
      (User.findById as jest.Mock).mockResolvedValue(null);

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'USER_NOT_FOUND',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when subscription status has changed', async () => {
      req.headers.authorization = 'Bearer valid_token';
      (tokenService.verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user123',
        subscription: {
          tier: 'premium',
          status: 'active',
        },
      });
      (User.findById as jest.Mock).mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        subscription: {
          tier: 'premium',
          status: 'canceled', // Different from token
        },
      });

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'TOKEN_STALE',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    test('should pass with admin user', async () => {
      req.user = {
        isAdmin: true,
      };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should return 403 for non-admin user', async () => {
      req.user = {
        isAdmin: false,
      };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INSUFFICIENT_PRIVILEGES',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireFeature', () => {
    test('should pass when user has feature', async () => {
      req.user = {
        isAdmin: false,
        features: {
          advancedCombatLog: true,
        },
      };

      requireFeature('advancedCombatLog')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should pass when user is admin', async () => {
      req.user = {
        isAdmin: true,
        features: {
          advancedCombatLog: false,
        },
      };

      requireFeature('advancedCombatLog')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should return 403 when user does not have feature', async () => {
      req.user = {
        isAdmin: false,
        features: {
          advancedCombatLog: false,
        },
      };

      requireFeature('advancedCombatLog')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'FEATURE_NOT_AVAILABLE',
            upgradeRequired: true,
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
