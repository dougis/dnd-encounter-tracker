import request from 'supertest';
import { app } from '@/app';
import { User } from '@/models/User.model';
import { tokenService } from '@/utils/jwt.utils';

// Mock User model
jest.mock('@/models/User.model', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  }
}));

// Mock token service
jest.mock('@/utils/jwt.utils', () => ({
  tokenService: {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  }
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        subscription: {
          tier: 'free',
          status: 'active'
        },
        isAdmin: false
      };

      (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.generateAccessToken as jest.Mock).mockReturnValue('mock_access_token');
      (tokenService.generateRefreshToken as jest.Mock).mockReturnValue('mock_refresh_token');

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.tokens).toBeDefined();
      expect(res.body.data.tokens.accessToken).toBe('mock_access_token');
      expect(res.body.data.tokens.refreshToken).toBe('mock_refresh_token');
    });

    test('should return 400 for invalid registration data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'te', // Too short
          email: 'invalid-email',
          password: 'short'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should return 409 when username is already taken', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ username: 'testuser' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USERNAME_TAKEN');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login user successfully with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        subscription: {
          tier: 'free',
          status: 'active'
        },
        isAdmin: false,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.generateAccessToken as jest.Mock).mockReturnValue('mock_access_token');
      (tokenService.generateRefreshToken as jest.Mock).mockReturnValue('mock_refresh_token');

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.tokens).toBeDefined();
      expect(res.body.data.tokens.accessToken).toBe('mock_access_token');
      expect(res.body.data.tokens.refreshToken).toBe('mock_refresh_token');
    });

    test('should return 401 for invalid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        comparePassword: jest.fn().mockResolvedValue(false) // Password doesn't match
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('should return 401 when user does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    test('should refresh tokens successfully', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        subscription: {
          tier: 'free',
          status: 'active'
        },
        isAdmin: false
      };

      const mockPayload = { userId: 'user123', tokenId: 'token123' };
      (tokenService.verifyRefreshToken as jest.Mock).mockReturnValue(mockPayload);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.generateAccessToken as jest.Mock).mockReturnValue('new_access_token');
      (tokenService.generateRefreshToken as jest.Mock).mockReturnValue('new_refresh_token');

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'old_refresh_token'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('new_access_token');
      expect(res.body.data.refreshToken).toBe('new_refresh_token');
    });

    test('should return 401 for invalid refresh token', async () => {
      (tokenService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid_token'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    test('should return 401 when user no longer exists', async () => {
      const mockPayload = { userId: 'user123', tokenId: 'token123' };
      (tokenService.verifyRefreshToken as jest.Mock).mockReturnValue(mockPayload);
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'valid_but_user_gone'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_NOT_FOUND');
    });
  });
});
