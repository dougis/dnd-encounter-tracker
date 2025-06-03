import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';

// Mock dependencies
jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('useAuth Hook', () => {
  const mockSetUser = jest.fn();
  const mockSetTokens = jest.fn();
  const mockClearAuth = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setUser: mockSetUser,
      setTokens: mockSetTokens,
      clearAuth: mockClearAuth,
    });
  });

  test('login should call authService.login and update store on success', async () => {
    const mockUser = { id: 'user123', username: 'testuser' };
    const mockTokens = { accessToken: 'abc123', refreshToken: 'xyz789' };
    
    (authService.login as jest.Mock).mockResolvedValue({ 
      user: mockUser, 
      tokens: mockTokens 
    });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });
    
    expect(authService.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password123' 
    });
    
    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockSetTokens).toHaveBeenCalledWith(mockTokens);
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken);
  });

  test('login should throw error on failed login', async () => {
    const mockError = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useAuth());
    
    await expect(
      act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'wrong' });
      })
    ).rejects.toThrow('Login failed');
    
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockSetTokens).not.toHaveBeenCalled();
  });

  test('logout should clear auth state and navigate to login', async () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.logout();
    });
    
    expect(mockClearAuth).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  test('refreshToken should refresh tokens successfully', async () => {
    const mockTokens = { 
      accessToken: 'new_access_token', 
      refreshToken: 'new_refresh_token' 
    };
    
    (authService.refreshToken as jest.Mock).mockResolvedValue(mockTokens);
    localStorage.getItem = jest.fn().mockReturnValue('old_refresh_token');
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.refreshToken();
    });
    
    expect(authService.refreshToken).toHaveBeenCalledWith('old_refresh_token');
    expect(mockSetTokens).toHaveBeenCalledWith(mockTokens);
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new_refresh_token');
  });

  test('refreshToken should log out on failure', async () => {
    (authService.refreshToken as jest.Mock).mockRejectedValue(new Error('Refresh failed'));
    localStorage.getItem = jest.fn().mockReturnValue('old_refresh_token');
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      try {
        await result.current.refreshToken();
      } catch (error) {
        // Expected
      }
    });
    
    expect(mockClearAuth).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});
