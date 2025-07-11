import apiClient, { handleApiResponse } from '../apiClient'

/**
 * System Administrator API endpoints
 */
const systemAdminAPI = {
  /**
   * Dashboard Statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats')
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard stats'
      return { success: false, error: errorMessage }
    }
  },

  /**
   * User Management
   */
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/users', { params })
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users'
      return { success: false, error: errorMessage }
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user'
      return { success: false, error: errorMessage }
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/admin/users', userData)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user'
      return { success: false, error: errorMessage }
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, userData)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user'
      return { success: false, error: errorMessage }
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user'
      return { success: false, error: errorMessage }
    }
  },

  /**
   * Store Management
   */
  getStores: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/stores', { params })
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stores'
      return { success: false, error: errorMessage }
    }
  },

  createStore: async (storeData) => {
    try {
      const response = await apiClient.post('/admin/stores', storeData)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create store'
      return { success: false, error: errorMessage }
    }
  },

  updateStore: async (storeId, storeData) => {
    try {
      const response = await apiClient.put(`/admin/stores/${storeId}`, storeData)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update store'
      return { success: false, error: errorMessage }
    }
  },

  deleteStore: async (storeId) => {
    try {
      const response = await apiClient.delete(`/admin/stores/${storeId}`)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete store'
      return { success: false, error: errorMessage }
    }
  },

  getStoreById: async (storeId) => {
    try {
      const response = await apiClient.get(`/admin/stores/${storeId}`)
      return { success: true, data: handleApiResponse(response) }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch store'
      return { success: false, error: errorMessage }
    }
  }
}

export default systemAdminAPI
