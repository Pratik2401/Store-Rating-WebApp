import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

/**
 * Hook for managing API calls with loading and error states
 */
export const useAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callAPI = useCallback(async (apiFunction, ...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { callAPI, loading, error, clearError }
}

/**
 * Hook for managing authentication state and operations
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      const role = localStorage.getItem('userRole')
      const storedUserData = localStorage.getItem('userData')

      if (token && role) {
        try {
          const response = await authAPI.verifyToken()
          setIsAuthenticated(true)
          setUserRole(role)
          setUserData(storedUserData ? JSON.parse(storedUserData) : response.user)
        } catch (error) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('userRole')
          localStorage.removeItem('userData')
          setIsAuthenticated(false)
          setUserRole(null)
          setUserData(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      setIsAuthenticated(true)
      setUserRole(response.user.role)
      setUserData(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setIsAuthenticated(false)
      setUserRole(null)
      setUserData(null)
    } catch (error) {
      setIsAuthenticated(false)
      setUserRole(null)
      setUserData(null)
      throw error
    }
  }

  const updateUserData = (newUserData) => {
    setUserData(newUserData)
    localStorage.setItem('userData', JSON.stringify(newUserData))
  }

  return {
    isAuthenticated,
    userRole,
    userData,
    loading,
    login,
    logout,
    updateUserData
  }
}

/**
 * Hook for managing pagination state and operations
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / limit)

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(page + 1)
  }, [page, goToPage])

  const prevPage = useCallback(() => {
    goToPage(page - 1)
  }, [page, goToPage])

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  const resetPagination = useCallback(() => {
    setPage(1)
    setTotal(0)
  }, [])

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    resetPagination
  }
}

/**
 * Hook for managing search, filtering, and sorting functionality
 */
export const useSearch = (initialSearchTerm = '') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setFilters({})
    setSortBy('')
    setSortOrder('asc')
  }, [])

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    clearSearch
  }
}

/**
 * Hook for managing localStorage with error handling
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
