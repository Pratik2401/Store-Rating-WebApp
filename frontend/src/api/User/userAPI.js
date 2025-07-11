import apiClient, { handleApiResponse, handleApiError } from '../apiClient'

/**
 * User API endpoints for normal users
 */
const userAPI = {
  /**
   * Profile Management
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/user/profile', profileData)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/user/change-password', passwordData)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Store Browsing
   */
  getStores: async () => {
    try {
      const response = await apiClient.get('/user/stores')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  getStoreById: async (storeId) => {
    try {
      const response = await apiClient.get(`/user/stores/${storeId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  searchStores: async (searchTerm, filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      }
      const response = await apiClient.get('/user/stores/search', { params })
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  getStoresByName: async (name) => {
    try {
      const response = await apiClient.get(`/user/stores/search?name=${encodeURIComponent(name)}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  getStoresByAddress: async (address) => {
    try {
      const response = await apiClient.get(`/user/stores/search?address=${encodeURIComponent(address)}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Rating Management
   */
  submitRating: async (storeId, ratingData) => {
    try {
      const response = await apiClient.post(`/user/stores/${storeId}/rating`, ratingData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  updateRating: async (ratingId, ratingData) => {
    try {
      const response = await apiClient.put(`/user/ratings/${ratingId}`, ratingData)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  deleteRating: async (ratingId) => {
    try {
      const response = await apiClient.delete(`/user/ratings/${ratingId}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  getMyRatings: async (params = {}) => {
    try {
      const response = await apiClient.get('/user/ratings', { params })
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  getRatingById: async (ratingId) => {
    try {
      const response = await apiClient.get(`/user/ratings/${ratingId}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  getMyRatingForStore: async (storeId) => {
    try {
      const response = await apiClient.get(`/user/ratings/store/${storeId}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Store Ratings Viewing
   */
  getStoreRatings: async (storeId, params = {}) => {
    try {
      const response = await apiClient.get(`/user/stores/${storeId}/ratings`, { params })
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  getStoreAverageRating: async (storeId) => {
    try {
      const response = await apiClient.get(`/user/stores/${storeId}/rating-average`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * User Dashboard/Statistics
   */
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/user/dashboard')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  getMyStats: async () => {
    try {
      const response = await apiClient.get('/user/stats')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Favorites
   */
  getFavoriteStores: async () => {
    try {
      const response = await apiClient.get('/user/favorites')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  addToFavorites: async (storeId) => {
    try {
      const response = await apiClient.post('/user/favorites', { storeId })
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  removeFromFavorites: async (storeId) => {
    try {
      const response = await apiClient.delete(`/user/favorites/${storeId}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Recent Activity
   */
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/user/activity?limit=${limit}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Recommendations
   */
  getRecommendedStores: async (limit = 5) => {
    try {
      const response = await apiClient.get(`/user/recommendations?limit=${limit}`)
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Export User Data
   */
  exportMyData: async (format = 'json') => {
    try {
      const response = await apiClient.get(`/user/export?format=${format}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  exportMyRatings: async (format = 'csv') => {
    try {
      const response = await apiClient.get(`/user/ratings/export?format=${format}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Account Management
   */
  deleteAccount: async (password) => {
    try {
      const response = await apiClient.delete('/user/account', {
        data: { password }
      })
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  }
}

export default userAPI
