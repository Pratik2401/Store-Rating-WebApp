// Login redirect utility
import { USER_ROLES } from '../api/constants'

/**
 * Get the default dashboard route for a user role
 * @param {string} role - User role
 * @returns {string} - Dashboard route path
 */
export const getDashboardRoute = (role) => {
  switch (role) {
    case USER_ROLES.SYSTEM_ADMIN:
      return '/admin/dashboard'
    case USER_ROLES.STORE_OWNER:
      return '/store-owner/dashboard'
    case USER_ROLES.NORMAL_USER:
      return '/user/dashboard'
    default:
      return '/login'
  }
}

/**
 * Redirect user to appropriate dashboard after login
 * @param {function} navigate - React Router navigate function
 * @param {object} user - User object with role
 * @param {string} redirectTo - Optional specific redirect path
 */
export const redirectAfterLogin = (navigate, user, redirectTo = null) => {
  if (redirectTo) {
    navigate(redirectTo)
    return
  }

  const defaultRoute = getDashboardRoute(user.role)
  navigate(defaultRoute, { replace: true })
}

/**
 * Check if user has access to a specific route
 * @param {object} user - User object with role
 * @param {string} route - Route path
 * @returns {boolean} - Whether user has access
 */
export const hasRouteAccess = (user, route) => {
  if (!user || !user.role) return false

  const userRole = user.role
  const routeParts = route.split('/')

  // Admin routes
  if (routeParts[1] === 'admin') {
    return userRole === USER_ROLES.SYSTEM_ADMIN
  }

  // Store owner routes
  if (routeParts[1] === 'store-owner') {
    return userRole === USER_ROLES.STORE_OWNER
  }

  // User routes
  if (routeParts[1] === 'user') {
    return userRole === USER_ROLES.NORMAL_USER
  }

  // Public routes
  if (['login', 'register', 'unauthorized'].includes(routeParts[1])) {
    return true
  }

  return false
}
