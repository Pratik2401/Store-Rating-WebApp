import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, adminAPI, storeOwnerAPI, getCurrentUserRole, getCurrentUserData, isAuthenticated } from '../api'
import { USER_ROLES } from '../api/constants'
import { authStorage, clearExpiredItems } from '../utils/localStorage'
import { useNotification } from './NotificationContext'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const notification = useNotification()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Clear any expired items first
        clearExpiredItems()
        
        const token = authStorage.getToken()
        const userData = authStorage.getUser()
        
        if (token && userData) {
          try {
            // Verify token with backend
            const response = await authAPI.verifyToken()
            setUser(response.user || userData)
            setIsAuthenticated(true)
            
            // Update last login time
            authStorage.setLastLogin()
          } catch (error) {
            // Token is invalid, clear auth data
            authStorage.clearAuth()
            setUser(null)
            setIsAuthenticated(false)
            
            if (notification) {
              notification.showWarning('Your session has expired. Please log in again.')
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        authStorage.clearAuth()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    // Handle auth expiration events from API interceptor
    const handleAuthExpired = (event) => {
      setUser(null)
      setIsAuthenticated(false)
      if (notification) {
        notification.showWarning(event.detail?.message || 'Session expired. Please log in again.')
      }
    }

    // Listen for auth expiration events
    window.addEventListener('auth:expired', handleAuthExpired)

    checkAuthStatus()

    // Cleanup event listener
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired)
    }
  }, [notification])

  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true)
      
      const response = await authAPI.login({ email, password, rememberMe })
      
      setUser(response.user)
      setIsAuthenticated(true)
      
      // Set last login time
      authStorage.setLastLogin()
      
      if (notification) {
        notification.showSuccess(`Welcome back, ${response.user.firstName || response.user.email}!`)
      }
      
      return { success: true, user: response.user, token: response.token }
    } catch (error) {
      console.error('Login error:', error)
      
      if (notification) {
        notification.showError(error.message || 'Login failed. Please try again.')
      }
      
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      
      const response = await authAPI.register(userData)
      
      setUser(response.user)
      setIsAuthenticated(true)
      
      // Set last login time
      authStorage.setLastLogin()
      
      if (notification) {
        notification.showSuccess('Registration successful! Welcome to the platform!')
      }
      
      return { success: true, user: response.user }
    } catch (error) {
      console.error('Registration error:', error)
      
      if (notification) {
        notification.showError(error.message || 'Registration failed. Please try again.')
      }
      
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      }
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData }
    setUser(updatedUser)
    authStorage.setUser(updatedUser)
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      setIsAuthenticated(false)
      
      if (notification) {
        notification.showInfo('You have been logged out successfully.')
      }
    } catch (error) {
      // Clear local state even if API call fails
      setUser(null)
      setIsAuthenticated(false)
      console.error('Logout error:', error)
      
      if (notification) {
        notification.showWarning('Logged out locally due to connection issue.')
      }
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    updateUser,
    logout,
    adminAPI,
    storeOwnerAPI
  }

  if (loading) {
    return (
      <div className="LoadingContainer d-flex justify-content-center align-items-center min-vh-100">
        <div className="LoadingSpinner spinner-border text-primary" role="status">
          <span className="LoadingText visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
