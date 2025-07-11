import apiClient, { handleApiResponse, handleApiError } from './apiClient'
import { authStorage } from '../utils/localStorage'

/**
 * Authentication API endpoints
 */
const authAPI = {
  /**
   * User registration
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * User login
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const data = handleApiResponse(response)
      
      if (data.token) {
        const rememberMe = credentials.rememberMe || false
        authStorage.setToken(data.token, rememberMe)
        authStorage.setRole(data.user.role)
        authStorage.setUser(data.user)
        authStorage.setLastLogin()
      }
      
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * User logout
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
      authStorage.clearAuth()
      return true
    } catch (error) {
      authStorage.clearAuth()
      handleApiError(error)
    }
  },

  /**
   * Verify authentication token
   */
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/auth/change-password', passwordData)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/profile')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  }
}

export default authAPI
