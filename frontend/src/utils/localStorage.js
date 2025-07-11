/**
 * LocalStorage utility with error handling and data validation
 */

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',
  REFRESH_TOKEN: 'refreshToken',
  LAST_LOGIN: 'lastLogin',
  REMEMBER_ME: 'rememberMe',
  CART: 'cart',
  SEARCH_HISTORY: 'searchHistory',
  FAVORITES: 'favorites',
  TEMP_DATA: 'tempData'
}

// Storage expiry times (in milliseconds)
export const STORAGE_EXPIRY = {
  AUTH_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
  TEMP_DATA: 60 * 60 * 1000, // 1 hour
  USER_PREFERENCES: 30 * 24 * 60 * 60 * 1000, // 30 days
  SEARCH_HISTORY: 7 * 24 * 60 * 60 * 1000 // 7 days
}

/**
 * Set item in localStorage with optional expiry
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} expiry - Expiry time in milliseconds
 */
export const setStorageItem = (key, value, expiry = null) => {
  try {
    const item = {
      value: value,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : null
    }
    localStorage.setItem(key, JSON.stringify(item))
    return true
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error)
    return false
  }
}

/**
 * Get item from localStorage with expiry check
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found or expired
 * @returns {any} Stored value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue

    const parsedItem = JSON.parse(item)
    
    // Check for new format with timestamp and expiry
    if (parsedItem && typeof parsedItem === 'object' && parsedItem.timestamp) {
      // Check if item has expired
      if (parsedItem.expiry && Date.now() > parsedItem.expiry) {
        localStorage.removeItem(key)
        return defaultValue
      }
      return parsedItem.value
    }
    
    // Handle old format items (direct values)
    return parsedItem || defaultValue
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error)
    return defaultValue
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error)
    return false
  }
}

/**
 * Clear all storage items
 */
export const clearStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

/**
 * Clear expired items from localStorage
 */
export const clearExpiredItems = () => {
  try {
    const keys = Object.keys(localStorage)
    const expiredKeys = []

    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          const parsedItem = JSON.parse(item)
          if (parsedItem && parsedItem.expiry && Date.now() > parsedItem.expiry) {
            expiredKeys.push(key)
          }
        }
      } catch (error) {
        // Skip items that can't be parsed
      }
    })

    expiredKeys.forEach(key => localStorage.removeItem(key))
    return expiredKeys.length
  } catch (error) {
    console.error('Error clearing expired items:', error)
    return 0
  }
}

/**
 * Get storage usage information
 * @returns {object} Storage usage stats
 */
export const getStorageInfo = () => {
  try {
    let totalSize = 0
    let itemCount = 0
    const items = {}

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key)
        const size = new Blob([item]).size
        totalSize += size
        itemCount++
        items[key] = {
          size: size,
          sizeFormatted: formatBytes(size)
        }
      }
    }

    return {
      totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      itemCount,
      items,
      available: true
    }
  } catch (error) {
    console.error('Error getting storage info:', error)
    return {
      totalSize: 0,
      totalSizeFormatted: '0 B',
      itemCount: 0,
      items: {},
      available: false
    }
  }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if localStorage is available
 * @returns {boolean} Whether localStorage is available
 */
export const isStorageAvailable = () => {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, 'test')
    localStorage.removeItem(test)
    return true
  } catch (error) {
    return false
  }
}

// Auth-specific storage utilities
export const authStorage = {
  setToken: (token, rememberMe = false) => {
    const expiry = rememberMe ? STORAGE_EXPIRY.AUTH_TOKEN : null
    return setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token, expiry)
  },

  getToken: () => {
    return getStorageItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  setUser: (userData) => {
    return setStorageItem(STORAGE_KEYS.USER_DATA, userData)
  },

  getUser: () => {
    return getStorageItem(STORAGE_KEYS.USER_DATA)
  },

  setRole: (role) => {
    return setStorageItem(STORAGE_KEYS.USER_ROLE, role)
  },

  getRole: () => {
    return getStorageItem(STORAGE_KEYS.USER_ROLE)
  },

  setLastLogin: () => {
    return setStorageItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString())
  },

  getLastLogin: () => {
    return getStorageItem(STORAGE_KEYS.LAST_LOGIN)
  },

  clearAuth: () => {
    removeStorageItem(STORAGE_KEYS.AUTH_TOKEN)
    removeStorageItem(STORAGE_KEYS.USER_DATA)
    removeStorageItem(STORAGE_KEYS.USER_ROLE)
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
  }
}

// User preferences storage utilities
export const preferencesStorage = {
  setTheme: (theme) => {
    return setStorageItem(STORAGE_KEYS.THEME, theme, STORAGE_EXPIRY.USER_PREFERENCES)
  },

  getTheme: () => {
    return getStorageItem(STORAGE_KEYS.THEME, 'light')
  },

  setLanguage: (language) => {
    return setStorageItem(STORAGE_KEYS.LANGUAGE, language, STORAGE_EXPIRY.USER_PREFERENCES)
  },

  getLanguage: () => {
    return getStorageItem(STORAGE_KEYS.LANGUAGE, 'en')
  },

  setPreferences: (preferences) => {
    return setStorageItem(STORAGE_KEYS.USER_PREFERENCES, preferences, STORAGE_EXPIRY.USER_PREFERENCES)
  },

  getPreferences: () => {
    return getStorageItem(STORAGE_KEYS.USER_PREFERENCES, {})
  }
}

// Auth validation utilities
export const authValidation = {
  hasValidToken: () => {
    const token = authStorage.getToken()
    const user = authStorage.getUser()
    return !!(token && user)
  },
  
  hasExpiredToken: () => {
    try {
      const tokenItem = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (!tokenItem) return false
      
      const parsed = JSON.parse(tokenItem)
      if (parsed && parsed.expiry) {
        return Date.now() > parsed.expiry
      }
      return false
    } catch (error) {
      return false
    }
  },
  
  shouldRefreshAuth: () => {
    return authValidation.hasValidToken() && !authValidation.hasExpiredToken()
  }
}

// Initialize storage cleanup on page load
if (typeof window !== 'undefined') {
  // Clear expired items on load
  clearExpiredItems()
  
  // Set up periodic cleanup (every hour)
  setInterval(clearExpiredItems, 60 * 60 * 1000)
}
