/**
 * Notification Context Provider
 * 
 * This module provides a comprehensive notification system using react-toastify.
 * It offers success, error, warning, info, loading, and custom notifications
 * with utility functions for common notification patterns.
 * 
 * @module contexts/NotificationContext
 * @requires react
 * @requires react-toastify
 */

import React, { createContext, useContext, useCallback } from 'react'
import { toast, ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

const defaultToastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Slide,
}

export const NotificationProvider = ({ children }) => {
  const showSuccess = useCallback((message, options = {}) => {
    toast.success(message, {
      ...defaultToastConfig,
      ...options,
    })
  }, [])

  const showError = useCallback((message, options = {}) => {
    toast.error(message, {
      ...defaultToastConfig,
      autoClose: 7000,
      ...options,
    })
  }, [])

  const showWarning = useCallback((message, options = {}) => {
    toast.warning(message, {
      ...defaultToastConfig,
      ...options,
    })
  }, [])

  const showInfo = useCallback((message, options = {}) => {
    toast.info(message, {
      ...defaultToastConfig,
      ...options,
    })
  }, [])

  const showLoading = useCallback((promise, messages = {}) => {
    const defaultMessages = {
      loading: 'Processing...',
      success: 'Operation completed successfully!',
      error: 'Something went wrong!'
    }

    const toastMessages = { ...defaultMessages, ...messages }

    return toast.promise(
      promise,
      {
        pending: toastMessages.loading,
        success: toastMessages.success,
        error: toastMessages.error,
      },
      {
        ...defaultToastConfig,
      }
    )
  }, [])

  const showCustom = useCallback((content, options = {}) => {
    toast(content, {
      ...defaultToastConfig,
      ...options,
    })
  }, [])

  const dismissAll = useCallback(() => {
    toast.dismiss()
  }, [])

  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId)
  }, [])

  const update = useCallback((toastId, render, options = {}) => {
    toast.update(toastId, {
      render,
      ...options,
    })
  }, [])

  const isActive = useCallback((toastId) => {
    return toast.isActive(toastId)
  }, [])

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showCustom,
    dismiss,
    dismissAll,
    update,
    isActive,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        limit={5}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        className="custom-toast-container"
      />
    </NotificationContext.Provider>
  )
}

export const notificationUtils = {
  handleApiResponse: (response, successMessage = 'Operation successful!') => {
    const { showSuccess, showError } = useNotification()
    
    if (response?.success) {
      showSuccess(successMessage)
    } else {
      showError(response?.error || 'Something went wrong!')
    }
  },

  handleFormErrors: (errors) => {
    const { showError } = useNotification()
    
    if (Array.isArray(errors)) {
      errors.forEach(error => showError(error))
    } else if (typeof errors === 'object') {
      Object.values(errors).forEach(error => showError(error))
    } else {
      showError(errors)
    }
  },

  handleNetworkError: (error) => {
    const { showError } = useNotification()
    
    if (error.code === 'NETWORK_ERROR') {
      showError('Network error. Please check your connection and try again.')
    } else if (error.response?.status === 401) {
      showError('Session expired. Please log in again.')
    } else if (error.response?.status === 403) {
      showError('You do not have permission to perform this action.')
    } else if (error.response?.status === 404) {
      showError('Requested resource not found.')
    } else if (error.response?.status >= 500) {
      showError('Server error. Please try again later.')
    } else {
      showError(error.message || 'An unexpected error occurred.')
    }
  },

  loginSuccess: (userName) => {
    const { showSuccess } = useNotification()
    showSuccess(`Welcome back, ${userName}!`)
  },

  logoutSuccess: () => {
    const { showInfo } = useNotification()
    showInfo('You have been logged out successfully.')
  },

  registrationSuccess: () => {
    const { showSuccess } = useNotification()
    showSuccess('Registration successful! Welcome to the platform!')
  },

  dataCreated: (itemType = 'Item') => {
    const { showSuccess } = useNotification()
    showSuccess(`${itemType} created successfully!`)
  },

  dataUpdated: (itemType = 'Item') => {
    const { showSuccess } = useNotification()
    showSuccess(`${itemType} updated successfully!`)
  },

  dataDeleted: (itemType = 'Item') => {
    const { showSuccess } = useNotification()
    showSuccess(`${itemType} deleted successfully!`)
  },

  fileUploadSuccess: (fileName) => {
    const { showSuccess } = useNotification()
    showSuccess(`${fileName} uploaded successfully!`)
  },

  fileUploadError: (fileName, error) => {
    const { showError } = useNotification()
    showError(`Failed to upload ${fileName}: ${error}`)
  },

  accessDenied: () => {
    const { showWarning } = useNotification()
    showWarning('Access denied. You do not have permission to perform this action.')
  },

  maintenanceMode: () => {
    const { showInfo } = useNotification()
    showInfo('The system is currently under maintenance. Some features may be unavailable.')
  }
}

export default NotificationProvider
