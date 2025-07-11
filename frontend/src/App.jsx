import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider, useNotification } from './contexts/NotificationContext'
import ErrorBoundary from './components/Common/ErrorBoundary'

import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Common/Login'
import Registration from './components/Common/Registration/Registration'
import AdminStructure from './components/SystemAdmin/SystemAdminStructure'
import StoreOwnerDashboard from './components/StoreOwner/StoreOwnerDashboard'
import UserDashboard from './components/User/UserDashboard'
import { setAuthHandlers } from './utils/authNavigation'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/index.css'

// Protected Route Component is now imported from separate file

// Unauthorized Component
const Unauthorized = () => {
  return (
    <div className="UnauthorizedContainer d-flex justify-content-center align-items-center min-vh-100">
      <div className="UnauthorizedCard card text-center p-4">
        <h2 className="UnauthorizedTitle text-danger">Access Denied</h2>
        <p className="UnauthorizedMessage">You don't have permission to access this page.</p>
        <a href="/login" className="UnauthorizedLink btn btn-primary">
          Back to Login
        </a>
      </div>
    </div>
  )
}

// Component to set up auth handlers
const AppContent = () => {
  const navigate = useNavigate()
  const notification = useNotification()

  useEffect(() => {
    // Set auth handlers for smooth navigation
    setAuthHandlers(navigate, notification)

    // Listen for force logout events
    const handleForceLogout = (event) => {
      navigate('/login', { replace: true })
    }

    window.addEventListener('auth:force-logout', handleForceLogout)

    return () => {
      window.removeEventListener('auth:force-logout', handleForceLogout)
    }
  }, [navigate, notification])

  return (
    <div className="AppContainer">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="system_admin">
              <ErrorBoundary minimal>
                <AdminStructure />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/store-owner/*" 
          element={
            <ProtectedRoute requiredRole="store_owner">
              <ErrorBoundary minimal>
                <StoreOwnerDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/*" 
          element={
            <ProtectedRoute requiredRole="normal_user">
              <ErrorBoundary minimal>
                <UserDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
