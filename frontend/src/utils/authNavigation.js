import { authStorage } from './localStorage'

/**
 * Auth Navigation Helper
 * Prevents page refreshes and handles smooth navigation
 */

let navigate = null
let notification = null

// Set the navigation and notification handlers
export const setAuthHandlers = (navigateFunction, notificationContext) => {
  navigate = navigateFunction
  notification = notificationContext
}

// Handle auth expiration without page refresh
export const handleAuthExpiration = (message = 'Session expired. Please log in again.') => {
  // Clear auth data
  authStorage.clearAuth()
  
  // Show notification if available
  if (notification) {
    notification.showWarning(message)
  }
  
  // Navigate to login if available
  if (navigate) {
    navigate('/login', { replace: true })
  } else {
    // Fallback: dispatch custom event
    window.dispatchEvent(new CustomEvent('auth:force-logout', {
      detail: { message }
    }))
  }
}

// Handle successful login navigation
export const handleLoginSuccess = (user, redirectTo = null) => {
  if (redirectTo) {
    if (navigate) {
      navigate(redirectTo, { replace: true })
    }
    return
  }

  // Determine default route based on user role
  let defaultRoute = '/dashboard'
  
  switch (user.role) {
    case 'system_admin':
      defaultRoute = '/admin/dashboard'
      break
    case 'store_owner':
      defaultRoute = '/store-owner/dashboard'
      break
    case 'normal_user':
      defaultRoute = '/user/dashboard'
      break
    default:
      defaultRoute = '/dashboard'
  }

  if (navigate) {
    navigate(defaultRoute, { replace: true })
  }
}

// Prevent form default behavior and handle navigation
export const preventDefaultAndNavigate = (event, navigationFunction) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  if (navigationFunction) {
    navigationFunction()
  }
}

export default {
  setAuthHandlers,
  handleAuthExpiration,
  handleLoginSuccess,
  preventDefaultAndNavigate
}
