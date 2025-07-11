import axios from 'axios'
import { authStorage } from '../utils/localStorage'
import { handleAuthExpiration } from '../utils/authNavigation'

/**
 * Base API configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clearAuth()
      
      try {
        handleAuthExpiration('Your session has expired. Please log in again.')
      } catch (navError) {
        if (!window.location.pathname.includes('/login')) {
          window.dispatchEvent(new CustomEvent('auth:expired', {
            detail: { message: 'Session expired. Please log in again.' }
          }))
        }
      }
    }
    
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please try again later.')
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error. Please try again later.')
    }
    
    return Promise.reject(error)
  }
)

/**
 * Helper function to handle API responses
 */
export const handleApiResponse = (response) => {
  if (response.data && response.data.success) {
    return response.data.data
  }
  throw new Error(response.data?.message || 'An error occurred')
}

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message)
  }
  throw new Error(error.message || 'An unexpected error occurred')
}

export default apiClient
