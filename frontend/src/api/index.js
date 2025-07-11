/**
 * Main API exports
 */
export { default as apiClient } from './apiClient'
export { default as authAPI } from './auth'

/**
 * Role-specific API exports
 */
export { default as systemAdminAPI } from './SystemAdmin'
export { default as storeOwnerAPI } from './StoreOwner' 
export { default as userAPI } from './User'

/**
 * Named exports for convenience
 */
export { systemAdminAPI as adminAPI } from './SystemAdmin'
export { storeOwnerAPI as ownerAPI } from './StoreOwner'
export { userAPI as normalUserAPI } from './User'

/**
 * Utility functions
 */
export { handleApiResponse, handleApiError } from './apiClient'

import { authStorage } from '../utils/localStorage'

/**
 * API configuration
 */
export const API_ENDPOINTS = {
  AUTH: '/auth',
  ADMIN: '/admin',
  STORE_OWNER: '/store-owner',
  USER: '/user',
  HEALTH: '/health'
}

/**
 * Get the appropriate API based on user role
 */
export const getAPIForRole = (role) => {
  switch (role) {
    case 'system_admin':
      return systemAdminAPI
    case 'store_owner':
      return storeOwnerAPI
    case 'normal_user':
      return userAPI
    default:
      throw new Error(`Unknown role: ${role}`)
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!authStorage.getToken()
}

/**
 * Get current user role
 */
export const getCurrentUserRole = () => {
  return authStorage.getRole()
}

/**
 * Get current user data
 */
export const getCurrentUserData = () => {
  return authStorage.getUser()
}

/**
 * Get last login time
 */
export const getLastLoginTime = () => {
  return authStorage.getLastLogin()
}

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  authStorage.clearAuth()
}
