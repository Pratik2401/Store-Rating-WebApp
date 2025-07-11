/**
 * Role-Based Access Control (RBAC) Configuration
 * 
 * This module defines the complete RBAC system configuration including roles,
 * permissions, role-permission mappings, and utility functions for authorization.
 * It serves as the central authority for all access control decisions.
 * 
 * @module config/rbac
 */

const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  STORE_OWNER: 'store_owner',
  NORMAL_USER: 'normal_user'
}

const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_READ_ALL: 'user:read_all',
  USER_UPDATE_ANY: 'user:update_any',
  USER_DELETE_ANY: 'user:delete_any',
  
  STORE_CREATE: 'store:create',
  STORE_READ: 'store:read',
  STORE_UPDATE: 'store:update',
  STORE_DELETE: 'store:delete',
  STORE_READ_ALL: 'store:read_all',
  STORE_UPDATE_ANY: 'store:update_any',
  STORE_DELETE_ANY: 'store:delete_any',
  STORE_MANAGE_OWN: 'store:manage_own',
  
  RATING_CREATE: 'rating:create',
  RATING_READ: 'rating:read',
  RATING_UPDATE: 'rating:update',
  RATING_DELETE: 'rating:delete',
  RATING_READ_ALL: 'rating:read_all',
  RATING_UPDATE_ANY: 'rating:update_any',
  RATING_DELETE_ANY: 'rating:delete_any',
  RATING_MANAGE_OWN: 'rating:manage_own',
  
  SYSTEM_STATS: 'system:stats',
  SYSTEM_MANAGE: 'system:manage',
  SYSTEM_DASHBOARD: 'system:dashboard',
  SYSTEM_AUDIT: 'system:audit'
}

const ROLE_PERMISSIONS = {
  [ROLES.SYSTEM_ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.USER_UPDATE_ANY,
    PERMISSIONS.USER_DELETE_ANY,
    
    PERMISSIONS.STORE_CREATE,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_UPDATE,
    PERMISSIONS.STORE_DELETE,
    PERMISSIONS.STORE_READ_ALL,
    PERMISSIONS.STORE_UPDATE_ANY,
    PERMISSIONS.STORE_DELETE_ANY,
    
    PERMISSIONS.RATING_CREATE,
    PERMISSIONS.RATING_READ,
    PERMISSIONS.RATING_UPDATE,
    PERMISSIONS.RATING_DELETE,
    PERMISSIONS.RATING_READ_ALL,
    PERMISSIONS.RATING_UPDATE_ANY,
    PERMISSIONS.RATING_DELETE_ANY,
    
    PERMISSIONS.SYSTEM_STATS,
    PERMISSIONS.SYSTEM_MANAGE,
    PERMISSIONS.SYSTEM_DASHBOARD,
    PERMISSIONS.SYSTEM_AUDIT
  ],
  
  [ROLES.STORE_OWNER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_MANAGE_OWN,
    
    PERMISSIONS.RATING_READ,
    PERMISSIONS.RATING_MANAGE_OWN
  ],
  
  [ROLES.NORMAL_USER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    
    PERMISSIONS.STORE_READ,
    
    PERMISSIONS.RATING_CREATE,
    PERMISSIONS.RATING_READ,
    PERMISSIONS.RATING_MANAGE_OWN
  ]
}

const RESOURCE_TYPES = {
  USER: 'user',
  STORE: 'store',
  RATING: 'rating',
  PROFILE: 'profile'
}

const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ACCESS_DENIED: 'access_denied'
}

const ROLE_HIERARCHY = {
  [ROLES.SYSTEM_ADMIN]: 3,
  [ROLES.STORE_OWNER]: 2,
  [ROLES.NORMAL_USER]: 1
}

const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(permission)
}

const hasAnyPermission = (userRole, permissions) => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.some(permission => userPermissions.includes(permission))
}

const hasAllPermissions = (userRole, permissions) => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.every(permission => userPermissions.includes(permission))
}

const isHigherRole = (role1, role2) => {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2]
}

const canAccessResource = (userRole, userId, resourceOwnerId, resourceType) => {
  if (userRole === ROLES.SYSTEM_ADMIN) {
    return true
  }
  
  if (userId === resourceOwnerId) {
    return true
  }
  
  if (userRole === ROLES.STORE_OWNER && resourceType === RESOURCE_TYPES.STORE) {
    return true
  }
  
  return false
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  RESOURCE_TYPES,
  ACTIONS,
  ROLE_HIERARCHY,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isHigherRole,
  canAccessResource
}
