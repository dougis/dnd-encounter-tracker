import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

// Create the base API instance
const createApiInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const { tokens } = useAuthStore.getState()
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        try {
          await useAuthStore.getState().refreshToken()
          const { tokens } = useAuthStore.getState()
          
          if (tokens?.accessToken) {
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          // If refresh fails, logout and redirect to login
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
      
      return Promise.reject(error)
    }
  )

  return api
}

// Export the API instance
export const api = createApiInstance()

// Helper function for making API calls with better error handling
export const apiCall = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api(config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message
      throw new Error(message)
    }
    throw error
  }
}

// Generic API methods
export const apiMethods = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiCall<T>({ method: 'GET', url, ...config }),
    
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>({ method: 'POST', url, data, ...config }),
    
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>({ method: 'PUT', url, data, ...config }),
    
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>({ method: 'PATCH', url, data, ...config }),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiCall<T>({ method: 'DELETE', url, ...config }),
}

export default api
