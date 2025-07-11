/**
 * Role-Based Access Control (RBAC) Controller
 * 
 * This controller provides comprehensive RBAC functionality for the application,
 * managing user permissions, role hierarchies, resource access controls, and
 * security audit logging. It serves as the central authority for all
 * authorization decisions throughout the system.
 * 
 * Features:
 * - Permission validation and enforcement
 * - Resource-level access control
 * - Role hierarchy management
 * - Data filtering based on user permissions
 * - Security audit logging
 * - Dashboard permission management
 * 
 * @module controllers/RBACController
 * @requires ../config/rbac
 * @requires ../middleware/audit
 */

const { 
  ROLES, 
  PERMISSIONS, 
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource 
} = require('../config/rbac')
const { logSecurityEvent } = require('../middleware/audit')

/**
 * RBAC Controller Class
 * 
 * Centralized controller for managing role-based access control operations.
 * Provides static methods for permission checking, resource access validation,
 * and data filtering based on user roles and permissions.
 */
class RBACController {
  /**
   * Initialize RBAC Controller
   * 
   * Sets up references to roles, permissions, and role-permission mappings
   * from the RBAC configuration for easy access throughout the controller.
   */
  constructor() {
    this.roles = ROLES
    this.permissions = PERMISSIONS
    this.rolePermissions = ROLE_PERMISSIONS
  }

  /**
   * ================================
   * BASIC ROLE AND PERMISSION METHODS
   * ================================
   */

  /**
   * Get All Available Roles
   * 
   * Returns a complete list of all system roles that can be assigned to users.
   * Used for role management interfaces and validation.
   * 
   * @static
   * @returns {string[]} Array of available role strings
   */
  static getRoles() {
    return Object.values(ROLES)
  }

  /**
   * Get All Available Permissions
   * 
   * Returns a complete list of all system permissions that can be granted.
   * Used for permission management and UI generation.
   * 
   * @static
   * @returns {string[]} Array of available permission strings
   */
  static getPermissions() {
    return Object.values(PERMISSIONS)
  }

  /**
   * Get Role-Specific Permissions
   * 
   * Retrieves all permissions associated with a specific role.
   * Returns empty array if role doesn't exist or has no permissions.
   * 
   * @static
   * @param {string} role - Role identifier to get permissions for
   * @returns {string[]} Array of permissions for the specified role
   */
  static getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || []
  }

  /**
   * ================================
   * PERMISSION VALIDATION METHODS
   * ================================
   */

  /**
   * Check User Permission
   * 
   * Validates whether a user has a specific permission based on their role.
   * Performs null-safety checks and delegates to the RBAC configuration.
   * 
   * @static
   * @param {Object} user - User object containing role information
   * @param {string} user.role - User's role identifier
   * @param {string} permission - Permission to check for
   * @returns {boolean} True if user has the permission, false otherwise
   */
  static userHasPermission(user, permission) {
    if (!user || !user.role) return false
    return hasPermission(user.role, permission)
  }

  /**
   * Check Multiple Permissions (OR Logic)
   * 
   * Validates whether a user has at least one of the specified permissions.
   * Useful for operations that can be performed with any of several permissions.
   * 
   * @static
   * @param {Object} user - User object containing role information
   * @param {string} user.role - User's role identifier
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} True if user has any of the permissions, false otherwise
   */
  static userHasAnyPermission(user, permissions) {
    if (!user || !user.role) return false
    return hasAnyPermission(user.role, permissions)
  }

  /**
   * Check Multiple Permissions (AND Logic)
   * 
   * Validates whether a user has all of the specified permissions.
   * Useful for operations that require multiple permissions simultaneously.
   * 
   * @static
   * @param {Object} user - User object containing role information
   * @param {string} user.role - User's role identifier
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} True if user has all permissions, false otherwise
   */
  static userHasAllPermissions(user, permissions) {
    if (!user || !user.role) return false
    return hasAllPermissions(user.role, permissions)
  }

  /**
   * ================================
   * RESOURCE ACCESS CONTROL
   * ================================
   */

  /**
   * Resource Access Validation
   * 
   * Comprehensive method for validating user access to specific resources.
   * Implements business logic for different resource types and ownership rules.
   * System admins have universal access, while other roles follow specific rules.
   * 
   * @static
   * @async
   * @param {Object} db - Database connection instance
   * @param {Object} user - User object with id and role
   * @param {string} resourceType - Type of resource (user, store, rating)
   * @param {string|number} resourceId - Unique identifier of the resource
   * @returns {Promise<boolean>} True if user can access the resource, false otherwise
   */
  static async userCanAccessResource(db, user, resourceType, resourceId) {
    if (!user || !user.role) return false

    // System administrators have universal access to all resources
    if (user.role === ROLES.SYSTEM_ADMIN) {
      return true
    }

    try {
      switch (resourceType) {
        case 'user':
          // Users can only access their own profile data
          return parseInt(resourceId) === user.id

        case 'store':
          if (user.role === ROLES.STORE_OWNER) {
            // Store owners can access only their owned stores
            const [stores] = await db.execute(
              'SELECT id FROM stores WHERE id = ? AND owner_id = ?',
              [resourceId, user.id]
            )
            return stores.length > 0
          }
          // Normal users have read-only access to all stores
          return user.role === ROLES.NORMAL_USER

        case 'rating':
          // Users can only access ratings they have created
          const [ratings] = await db.execute(
            'SELECT id FROM ratings WHERE id = ? AND user_id = ?',
            [resourceId, user.id]
          )
          return ratings.length > 0

        default:
          // Deny access to unknown resource types
          return false
      }
    } catch (error) {
      console.error('Resource access check error:', error)
      return false
    }
  }

  /**
   * ================================
   * ROLE HIERARCHY AND MANAGEMENT
   * ================================
   */

  /**
   * Role Hierarchy Validation
   * 
   * Determines if a user with a manager role can manage another user based on
   * role hierarchy. Higher hierarchy values can manage lower ones.
   * Essential for user management and role assignment operations.
   * 
   * @static
   * @param {string} managerRole - Role of the user attempting management
   * @param {string} targetRole - Role of the user being managed
   * @returns {boolean} True if manager can manage target user, false otherwise
   */
  static canManageUser(managerRole, targetRole) {
    // Define role hierarchy with numerical precedence
    const hierarchy = {
      [ROLES.SYSTEM_ADMIN]: 3,
      [ROLES.STORE_OWNER]: 2,
      [ROLES.NORMAL_USER]: 1
    }

    return hierarchy[managerRole] > hierarchy[targetRole]
  }

  /**
   * ================================
   * DATA FILTERING AND PRIVACY
   * ================================
   */

  /**
   * Filter User Data Based on Permissions
   * 
   * Applies role-based filtering to user data, controlling what information
   * is visible to different user types. Always excludes sensitive data like
   * passwords and adds permission flags for UI state management.
   * 
   * @static
   * @param {Object} requestingUser - User making the request
   * @param {Object} userData - Complete user data to be filtered
   * @returns {Object} Filtered user data with permission flags
   */
  static filterUserData(requestingUser, userData) {
    const isAdmin = requestingUser.role === ROLES.SYSTEM_ADMIN
    const isOwnProfile = requestingUser.id === userData.id

    // Always exclude sensitive information like passwords
    const { password, ...safeData } = userData

    // System administrators can see all user data with full permissions
    if (isAdmin) {
      return {
        ...safeData,
        canEdit: true,
        canDelete: true
      }
    }

    // Users can see their own complete profile with edit permissions
    if (isOwnProfile) {
      return {
        ...safeData,
        canEdit: true,
        canDelete: false
      }
    }

    // Other users see only limited public information
    return {
      id: userData.id,
      name: userData.name,
      role: userData.role,
      canEdit: false,
      canDelete: false
    }
  }

  /**
   * Filter Store Data Based on Permissions
   * 
   * Applies role-based filtering to store data, controlling access levels
   * and management capabilities. Adds permission flags for frontend
   * state management and UI rendering decisions.
   * 
   * @static
   * @param {Object} requestingUser - User making the request
   * @param {Object} storeData - Complete store data to be filtered
   * @returns {Object} Filtered store data with permission flags
   */
  static filterStoreData(requestingUser, storeData) {
    const isAdmin = requestingUser.role === ROLES.SYSTEM_ADMIN
    const isOwner = requestingUser.role === ROLES.STORE_OWNER && 
                   requestingUser.id === storeData.owner_id

    // System administrators have full control over all stores
    if (isAdmin) {
      return {
        ...storeData,
        canEdit: true,
        canDelete: true,
        canManageRatings: true
      }
    }

    // Store owners can manage their own stores but cannot delete them
    if (isOwner) {
      return {
        ...storeData,
        canEdit: true,
        canDelete: false,
        canManageRatings: true
      }
    }

    // Normal users have read-only access to store information
    return {
      ...storeData,
      canEdit: false,
      canDelete: false,
      canManageRatings: false
    }
  }

  /**
   * ================================
   * SECURITY AUDIT AND LOGGING
   * ================================
   */

  /**
   * Log Permission Check for Security Audit
   * 
   * Records permission check events for security monitoring and compliance.
   * Logs both successful and failed permission checks with contextual
   * information for audit trail purposes.
   * 
   * @static
   * @async
   * @param {Object} db - Database connection instance
   * @param {Object} user - User object who performed the action
   * @param {string} permission - Permission that was checked
   * @param {string} resource - Resource that was accessed
   * @param {boolean} granted - Whether permission was granted
   * @param {string} ipAddress - IP address of the request
   * @returns {Promise<void>}
   */
  static async logPermissionCheck(db, user, permission, resource, granted, ipAddress) {
    try {
      await logSecurityEvent(db, 'PERMISSION_CHECK', user?.id, {
        permission,
        resource,
        granted,
        userRole: user?.role,
        ipAddress
      })
    } catch (error) {
      console.error('Permission logging error:', error)
    }
  }

  /**
   * ================================
   * ROLE ASSIGNMENT VALIDATION
   * ================================
   */

  /**
   * Validate Role Assignment Permissions
   * 
   * Determines if a user has the authority to assign a specific role.
   * Currently, only system administrators can assign roles, ensuring
   * proper access control for role management operations.
   * 
   * @static
   * @param {string} assignerRole - Role of user attempting assignment
   * @param {string} targetRole - Role being assigned
   * @returns {boolean} True if assignment is permitted, false otherwise
   */
  static canAssignRole(assignerRole, targetRole) {
    // Only system administrators can assign roles
    if (assignerRole !== ROLES.SYSTEM_ADMIN) {
      return false
    }

    // System administrators can assign any valid role
    return Object.values(ROLES).includes(targetRole)
  }

  /**
   * ================================
   * DASHBOARD PERMISSION MANAGEMENT
   * ================================
   */

  /**
   * Get Role-Specific Dashboard Permissions
   * 
   * Returns a comprehensive set of dashboard permissions based on user role.
   * Used by frontend components to control UI rendering and feature availability.
   * Includes both base permissions available to all users and role-specific capabilities.
   * 
   * @static
   * @param {string} userRole - Role identifier to get dashboard permissions for
   * @returns {Object} Object containing boolean permission flags for dashboard features
   */
  static getDashboardPermissions(userRole) {
    // Base permissions available to all authenticated users
    const basePermissions = {
      canViewProfile: true,
      canEditProfile: true,
      canChangePassword: true
    }

    switch (userRole) {
      case ROLES.SYSTEM_ADMIN:
        // System administrators have comprehensive system management capabilities
        return {
          ...basePermissions,
          canViewDashboard: true,
          canManageUsers: true,
          canManageStores: true,
          canViewAllRatings: true,
          canViewSystemStats: true,
          canManageRoles: true,
          canViewAuditLogs: true
        }

      case ROLES.STORE_OWNER:
        // Store owners can manage their own stores and view related analytics
        return {
          ...basePermissions,
          canViewDashboard: true,
          canManageOwnStore: true,
          canViewOwnStoreRatings: true,
          canViewStoreStats: true
        }

      case ROLES.NORMAL_USER:
        // Normal users have consumer-focused permissions for browsing and rating
        return {
          ...basePermissions,
          canViewStores: true,
          canSubmitRatings: true,
          canEditOwnRatings: true,
          canSearchStores: true
        }

      default:
        // Unknown roles get only base permissions
        return basePermissions
    }
  }
}

module.exports = RBACController
