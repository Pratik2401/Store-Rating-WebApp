import { authStorage, STORAGE_EXPIRY } from './localStorage'
import { USER_ROLES } from '../api/constants'

/**
 * Session Management Utility
 * Handles user session validation, expiry, and security
 */

// Session timeout duration (24 hours in milliseconds)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000

/**
 * Check if current session is valid
 * @returns {boolean} Whether session is valid
 */
export const isSessionValid = () => {
  try {
    const token = authStorage.getToken()
    const user = authStorage.getUser()
    const lastLogin = authStorage.getLastLogin()
    
    if (!token || !user || !lastLogin) {
      return false
    }
    
    // Check if session has expired
    const lastLoginTime = new Date(lastLogin).getTime()
    const now = Date.now()
    const timeDiff = now - lastLoginTime
    
    if (timeDiff > SESSION_TIMEOUT) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking session validity:', error)
    return false
  }
}

/**
 * Get remaining session time in milliseconds
 * @returns {number} Remaining time or 0 if expired
 */
export const getRemainingSessionTime = () => {
  try {
    const lastLogin = authStorage.getLastLogin()
    if (!lastLogin) return 0
    
    const lastLoginTime = new Date(lastLogin).getTime()
    const now = Date.now()
    const elapsed = now - lastLoginTime
    const remaining = SESSION_TIMEOUT - elapsed
    
    return Math.max(0, remaining)
  } catch (error) {
    console.error('Error getting remaining session time:', error)
    return 0
  }
}

/**
 * Format remaining time as human readable string
 * @returns {string} Formatted time string
 */
export const getFormattedRemainingTime = () => {
  const remaining = getRemainingSessionTime()
  
  if (remaining === 0) return 'Session expired'
  
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}

/**
 * Extend current session
 */
export const extendSession = () => {
  try {
    authStorage.setLastLogin()
    return true
  } catch (error) {
    console.error('Error extending session:', error)
    return false
  }
}

/**
 * Get user role from session
 * @returns {string|null} User role or null
 */
export const getSessionUserRole = () => {
  try {
    return authStorage.getRole()
  } catch (error) {
    console.error('Error getting user role from session:', error)
    return null
  }
}

/**
 * Get user data from session
 * @returns {object|null} User data or null
 */
export const getSessionUserData = () => {
  try {
    return authStorage.getUser()
  } catch (error) {
    console.error('Error getting user data from session:', error)
    return null
  }
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} Whether user has the role
 */
export const hasRole = (role) => {
  const userRole = getSessionUserRole()
  return userRole === role
}

/**
 * Check if user has any of the specified roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} Whether user has any of the roles
 */
export const hasAnyRole = (roles) => {
  const userRole = getSessionUserRole()
  return roles.includes(userRole)
}

/**
 * Check if user is admin
 * @returns {boolean} Whether user is admin
 */
export const isAdmin = () => {
  return hasRole(USER_ROLES.SYSTEM_ADMIN)
}

/**
 * Check if user is store owner
 * @returns {boolean} Whether user is store owner
 */
export const isStoreOwner = () => {
  return hasRole(USER_ROLES.STORE_OWNER)
}

/**
 * Check if user is normal user
 * @returns {boolean} Whether user is normal user
 */
export const isNormalUser = () => {
  return hasRole(USER_ROLES.NORMAL_USER)
}

/**
 * Clear session data
 */
export const clearSession = () => {
  try {
    authStorage.clearAuth()
    return true
  } catch (error) {
    console.error('Error clearing session:', error)
    return false
  }
}

/**
 * Create session activity tracker
 * @param {function} onSessionExpiry - Callback for session expiry
 * @param {function} onSessionWarning - Callback for session warning
 * @returns {object} Session tracker with start/stop methods
 */
export const createSessionTracker = (onSessionExpiry, onSessionWarning) => {
  let intervalId = null
  let warningShown = false
  
  const WARNING_TIME = 5 * 60 * 1000 // 5 minutes before expiry
  
  const checkSession = () => {
    const remaining = getRemainingSessionTime()
    
    if (remaining === 0) {
      clearSession()
      if (onSessionExpiry) onSessionExpiry()
      return
    }
    
    if (remaining <= WARNING_TIME && !warningShown) {
      warningShown = true
      if (onSessionWarning) onSessionWarning(remaining)
    }
    
    if (remaining > WARNING_TIME) {
      warningShown = false
    }
  }
  
  const start = () => {
    if (intervalId) return // Already running
    
    // Check immediately
    checkSession()
    
    // Set up interval to check every minute
    intervalId = setInterval(checkSession, 60 * 1000)
  }
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
  
  const extend = () => {
    extendSession()
    warningShown = false
  }
  
  return {
    start,
    stop,
    extend,
    isRunning: () => intervalId !== null,
    getRemainingTime: getRemainingSessionTime,
    getFormattedTime: getFormattedRemainingTime
  }
}

/**
 * Activity detection for auto session extension
 */
export const createActivityDetector = (onActivity) => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  let lastActivity = Date.now()
  let timeoutId = null
  
  const ACTIVITY_TIMEOUT = 30 * 1000 // 30 seconds
  
  const handleActivity = () => {
    const now = Date.now()
    if (now - lastActivity > ACTIVITY_TIMEOUT) {
      lastActivity = now
      if (onActivity) onActivity()
    }
  }
  
  const start = () => {
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })
  }
  
  const stop = () => {
    events.forEach(event => {
      document.removeEventListener(event, handleActivity, true)
    })
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return {
    start,
    stop,
    getLastActivity: () => lastActivity
  }
}

/**
 * Security utilities
 */
export const securityUtils = {
  /**
   * Detect suspicious activity
   * @returns {boolean} Whether suspicious activity detected
   */
  detectSuspiciousActivity: () => {
    try {
      const user = getSessionUserData()
      const lastLogin = authStorage.getLastLogin()
      
      if (!user || !lastLogin) return true
      
      // Check for multiple rapid login attempts
      // Check for unusual access patterns
      // This is a placeholder for more sophisticated detection
      
      return false
    } catch (error) {
      return true
    }
  },
  
  /**
   * Get session fingerprint for security
   * @returns {string} Session fingerprint
   */
  getSessionFingerprint: () => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    }
    
    return btoa(JSON.stringify(fingerprint))
  },
  
  /**
   * Validate session integrity
   * @returns {boolean} Whether session is secure
   */
  validateSessionIntegrity: () => {
    try {
      // Check if running on HTTPS in production
      if (import.meta.env.PROD && location.protocol !== 'https:') {
        return false
      }
      
      // Check for session tampering
      const token = authStorage.getToken()
      const user = authStorage.getUser()
      
      if (!token || !user) return false
      
      // Additional integrity checks can be added here
      
      return true
    } catch (error) {
      return false
    }
  }
}

export default {
  isSessionValid,
  getRemainingSessionTime,
  getFormattedRemainingTime,
  extendSession,
  getSessionUserRole,
  getSessionUserData,
  hasRole,
  hasAnyRole,
  isAdmin,
  isStoreOwner,
  isNormalUser,
  clearSession,
  createSessionTracker,
  createActivityDetector,
  securityUtils
}
