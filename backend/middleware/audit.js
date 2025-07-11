/**
 * Audit and Security Middleware Module
 * 
 * This module provides comprehensive audit logging, security event tracking,
 * and input sanitization middleware for the RBAC system. It ensures all
 * user actions are logged for security monitoring and compliance purposes.
 * 
 * @module middleware/audit
 * @requires ../config/rbac
 */

const { ACTIONS } = require('../config/rbac')

/**
 * Audit Logger Middleware Factory
 * 
 * Creates middleware for logging user actions and system events.
 * Captures detailed information about requests including user context,
 * resource access, and request metadata for security monitoring.
 * 
 * @param {string} action - The action being performed
 * @param {string} resourceType - Type of resource being accessed
 * @returns {Function} Express middleware function
 */
const auditLogger = (action, resourceType) => {
  return async (req, res, next) => {
    try {
      const db = req.app.locals.db
      const userId = req.user ? req.user.id : null
      const userRole = req.user ? req.user.role : null
      const resourceId = req.params.id || req.params.storeId || req.params.ratingId || req.body.id
      const ipAddress = req.ip || req.connection.remoteAddress
      const userAgent = req.get('User-Agent')
      
      await db.execute(
        `INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, ip_address, user_agent, details, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          userRole,
          action,
          resourceType,
          resourceId,
          ipAddress,
          userAgent,
          JSON.stringify({
            method: req.method,
            path: req.path,
            query: req.query,
            body: sensitiveDataFilter(req.body)
          })
        ]
      )
      
      next()
    } catch (error) {
      console.error('Audit logging error:', error)
      next()
    }
  }
}

/**
 * Sensitive Data Filter
 * 
 * Filters out sensitive information from audit logs to prevent
 * exposure of passwords, tokens, and other confidential data.
 * 
 * @param {Object} data - Data object to filter
 * @returns {Object} Filtered data with sensitive fields redacted
 */
const sensitiveDataFilter = (data) => {
  if (!data || typeof data !== 'object') return data
  
  const filtered = { ...data }
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
  
  Object.keys(filtered).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      filtered[key] = '[REDACTED]'
    }
  })
  
  return filtered
}

/**
 * Security Event Logger
 * 
 * Logs critical security events such as permission checks,
 * authentication failures, and suspicious activities.
 * 
 * @param {Object} db - Database connection instance
 * @param {string} eventType - Type of security event
 * @param {number} userId - ID of the user involved
 * @param {Object} details - Additional event details
 * @returns {Promise<void>}
 */
const logSecurityEvent = async (db, eventType, userId, details) => {
  try {
    await db.execute(
      `INSERT INTO security_logs (user_id, event_type, details, ip_address, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, eventType, JSON.stringify(details), details.ipAddress || null]
    )
  } catch (error) {
    console.error('Security logging error:', error)
  }
}

/**
 * Input Sanitization Middleware
 * 
 * Sanitizes request input to prevent XSS attacks and other
 * security vulnerabilities by cleaning request body and query parameters.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const inputSanitizer = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/[<>]/g, '')
        .trim()
    }
    return value
  }
  
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key])
        } else {
          obj[key] = sanitizeValue(obj[key])
        }
      })
    }
  }
  
  sanitizeObject(req.body)
  sanitizeObject(req.query)
  
  next()
}

module.exports = {
  auditLogger,
  logSecurityEvent,
  inputSanitizer,
  ACTIONS
}
