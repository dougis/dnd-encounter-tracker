import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthTokens, LoginCredentials, RegisterData } from '@dnd-encounter-tracker/shared'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Login failed')
          }

          const data = await response.json()
          set({
            user: data.data.user,
            tokens: data.data.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Registration failed')
          }

          const responseData = await response.json()
          set({
            user: responseData.data.user,
            tokens: responseData.data.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setTokens: (tokens: AuthTokens) => {
        set({ tokens })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      refreshToken: async () => {
        const { tokens } = get()
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data = await response.json()
          set({
            tokens: data.data.tokens,
            user: data.data.user,
          })
        } catch (error) {
          // If refresh fails, logout the user
          get().logout()
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
