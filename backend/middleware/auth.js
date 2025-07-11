const jwt = require('jsonwebtoken')
const { 
  ROLES, 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  RESOURCE_TYPES,
  hasPermission,
  canAccessResource 
} = require('../config/rbac')
const { logSecurityEvent } = require('./audit')

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user details from database
    const db = req.app.locals.db
    const [users] = await db.execute(
      `SELECT id, name, email, role, address, created_at 
       FROM users WHERE id = ? AND role = ?`,
      [decoded.userId, decoded.role]
    )

    if (users.length === 0) {
      await logSecurityEvent(db, 'INVALID_TOKEN', decoded.userId, {
        ipAddress: req.ip,
        reason: 'User not found'
      })
      
      return res.status(403).json({
        success: false,
        message: 'Invalid token or user not found'
      })
    }

    // Add user permissions to request
    req.user = {
      ...users[0],
      permissions: ROLE_PERMISSIONS[users[0].role] || []
    }
    
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      await logSecurityEvent(req.app.locals.db, 'EXPIRED_TOKEN', null, {
        ipAddress: req.ip,
        error: error.message
      })
      
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    } else if (error.name === 'JsonWebTokenError') {
      await logSecurityEvent(req.app.locals.db, 'INVALID_TOKEN', null, {
        ipAddress: req.ip,
        error: error.message
      })
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
    
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    })
  }
}

// Permission-based authorization middleware
const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    if (!hasPermission(req.user.role, permission)) {
      await logSecurityEvent(req.app.locals.db, 'ACCESS_DENIED', req.user.id, {
        ipAddress: req.ip,
        permission: permission,
        userRole: req.user.role,
        path: req.path
      })
      
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permission}`
      })
    }

    next()
  }
}

// Resource ownership middleware (for users managing their own resources)
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // System admins have access to everything
    if (req.user.role === ROLES.SYSTEM_ADMIN) {
      return next()
    }

    const db = req.app.locals.db
    const resourceId = req.params.id || req.params.storeId || req.params.ratingId || req.params.userId

    try {
      switch (resourceType) {
        case RESOURCE_TYPES.STORE:
          if (req.user.role !== ROLES.STORE_OWNER) {
            await logSecurityEvent(db, 'ACCESS_DENIED', req.user.id, {
              ipAddress: req.ip,
              reason: 'Not a store owner',
              resourceType,
              resourceId
            })
            
            return res.status(403).json({
              success: false,
              message: 'Only store owners can manage stores'
            })
          }
          
          const [stores] = await db.execute(
            'SELECT id FROM stores WHERE id = ? AND owner_id = ?',
            [resourceId, req.user.id]
          )
          
          if (stores.length === 0) {
            await logSecurityEvent(db, 'ACCESS_DENIED', req.user.id, {
              ipAddress: req.ip,
              reason: 'Store ownership validation failed',
              resourceType,
              resourceId
            })
            
            return res.status(403).json({
              success: false,
              message: 'You can only manage your own stores'
            })
          }
          break

        case RESOURCE_TYPES.RATING:
          // Users can only manage their own ratings
          const [ratings] = await db.execute(
            'SELECT id FROM ratings WHERE id = ? AND user_id = ?',
            [resourceId, req.user.id]
          )
          
          if (ratings.length === 0) {
            await logSecurityEvent(db, 'ACCESS_DENIED', req.user.id, {
              ipAddress: req.ip,
              reason: 'Rating ownership validation failed',
              resourceType,
              resourceId
            })
            
            return res.status(403).json({
              success: false,
              message: 'You can only manage your own ratings'
            })
          }
          break

        case RESOURCE_TYPES.PROFILE:
        case RESOURCE_TYPES.USER:
          // Users can only manage their own profile
          const targetUserId = parseInt(resourceId)
          if (targetUserId !== req.user.id) {
            await logSecurityEvent(db, 'ACCESS_DENIED', req.user.id, {
              ipAddress: req.ip,
              reason: 'Profile ownership validation failed',
              resourceType,
              resourceId,
              targetUserId
            })
            
            return res.status(403).json({
              success: false,
              message: 'You can only manage your own profile'
            })
          }
          break

        default:
          return res.status(500).json({
            success: false,
            message: 'Invalid resource type for ownership check'
          })
      }

      next()
    } catch (error) {
      console.error('Ownership check error:', error)
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      })
    }
  }
}

// Role-based authorization middleware (legacy support)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    next()
  }
}

// Specific role middlewares
const requireAdmin = authorize(ROLES.SYSTEM_ADMIN)
const requireUser = authorize(ROLES.NORMAL_USER)
const requireStoreOwner = authorize(ROLES.STORE_OWNER)
const requireAdminOrStoreOwner = authorize(ROLES.SYSTEM_ADMIN, ROLES.STORE_OWNER)

// Permission-based middlewares
const requireUserManagement = requirePermission(PERMISSIONS.USER_READ_ALL)
const requireStoreManagement = requirePermission(PERMISSIONS.STORE_READ_ALL)
const requireSystemStats = requirePermission(PERMISSIONS.SYSTEM_STATS)

module.exports = {
  // Core auth
  authenticateToken,
  
  // Permission-based
  requirePermission,
  requireOwnership,
  
  // Role-based (legacy)
  authorize,
  requireAdmin,
  requireUser,
  requireStoreOwner,
  requireAdminOrStoreOwner,
  
  // Specific permissions
  requireUserManagement,
  requireStoreManagement,
  requireSystemStats,
  
  // Constants
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS
}
