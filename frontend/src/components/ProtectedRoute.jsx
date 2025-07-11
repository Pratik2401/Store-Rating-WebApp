import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasRouteAccess, getDashboardRoute } from '../utils/authUtils'
import LoadingSpinner from '../components/Common/LoadingSpinner'

/**
 * Protected route component that handles authentication and authorization
 * Redirects users based on their authentication status and role permissions
 */
const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." fullPage />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (!hasRouteAccess(user, location.pathname)) {
    const userDashboard = getDashboardRoute(user.role)
    return <Navigate to={userDashboard} replace />
  }

  return children
}

export default ProtectedRoute
