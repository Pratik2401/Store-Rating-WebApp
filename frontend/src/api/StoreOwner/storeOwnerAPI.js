import apiClient, { handleApiResponse, handleApiError } from '../apiClient'

/**
 * Store Owner API endpoints
 */
const storeOwnerAPI = {
  /**
   * Get all stores owned by the store owner
   */
  getStores: async () => {
    try {
      const response = await apiClient.get('/store-owner/stores')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/store-owner/dashboard/stats')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Get store ratings
   */
  getStoreRatings: async () => {
    try {
      const response = await apiClient.get('/store-owner/ratings')
      return handleApiResponse(response)
    } catch (error) {
      handleApiError(error)
    }
  }
}

export default storeOwnerAPI
