import { 
  ApiResponse, 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData 
} from '@dnd-encounter-tracker/shared'
import { apiMethods } from './api'

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export interface RegisterResponse {
  user: User
  tokens: AuthTokens
}

export interface RefreshTokenResponse {
  user: User
  tokens: AuthTokens
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiMethods.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed')
    }
    
    return response.data
  }

  static async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiMethods.post<ApiResponse<RegisterResponse>>(
      '/auth/register',
      data
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Registration failed')
    }
    
    return response.data
  }

  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiMethods.post<ApiResponse<RefreshTokenResponse>>(
      '/auth/refresh',
      { refreshToken }
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Token refresh failed')
    }
    
    return response.data
  }

  static async logout(): Promise<void> {
    try {
      await apiMethods.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on the server, we still clear local storage
      console.warn('Logout request failed:', error)
    }
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiMethods.get<ApiResponse<User>>('/auth/me')
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get current user')
    }
    
    return response.data
  }

  static async forgotPassword(email: string): Promise<void> {
    const response = await apiMethods.post<ApiResponse<void>>(
      '/auth/forgot-password',
      { email }
    )
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send password reset email')
    }
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    const response = await apiMethods.post<ApiResponse<void>>(
      '/auth/reset-password',
      { token, password }
    )
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reset password')
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiMethods.post<ApiResponse<void>>(
      '/auth/change-password',
      { currentPassword, newPassword }
    )
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to change password')
    }
  }

  static async verifyEmail(token: string): Promise<void> {
    const response = await apiMethods.post<ApiResponse<void>>(
      '/auth/verify-email',
      { token }
    )
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Email verification failed')
    }
  }

  static async resendVerificationEmail(): Promise<void> {
    const response = await apiMethods.post<ApiResponse<void>>(
      '/auth/resend-verification'
    )
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to resend verification email')
    }
  }
}

export default AuthService
