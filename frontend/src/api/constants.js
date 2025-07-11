/**
 * API Configuration Constants
 */

/**
 * Base URLs
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile'
  },

  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard/stats',
    USERS: '/admin/users',
    STORES: '/admin/stores',
    RATINGS: '/admin/ratings',
    AUDIT_LOGS: '/admin/audit-logs',
    SECURITY_LOGS: '/admin/security-logs'
  },

  STORE_OWNER: {
    BASE: '/store-owner',
    DASHBOARD: '/store-owner/dashboard',
    STORE: '/store-owner/store',
    RATINGS: '/store-owner/ratings',
    CUSTOMERS: '/store-owner/customers',
    PROFILE: '/store-owner/profile',
    STATS: '/store-owner/stats',
    ANALYTICS: '/store-owner/analytics'
  },

  USER: {
    BASE: '/user',
    PROFILE: '/user/profile',
    STORES: '/user/stores',
    RATINGS: '/user/ratings',
    DASHBOARD: '/user/dashboard',
    FAVORITES: '/user/favorites',
    ACTIVITY: '/user/activity',
    RECOMMENDATIONS: '/user/recommendations'
  },

  HEALTH: '/health',
  DOCS: '/docs'
}

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

/**
 * User Roles
 */
export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  STORE_OWNER: 'store_owner',
  NORMAL_USER: 'normal_user'
}

/**
 * Permission Constants
 */
export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_READ_ALL: 'user:read_all',

  STORE_CREATE: 'store:create',
  STORE_READ: 'store:read',
  STORE_UPDATE: 'store:update',
  STORE_DELETE: 'store:delete',
  STORE_READ_ALL: 'store:read_all',
  STORE_MANAGE_OWN: 'store:manage_own',

  RATING_CREATE: 'rating:create',
  RATING_READ: 'rating:read',
  RATING_UPDATE: 'rating:update',
  RATING_DELETE: 'rating:delete',
  RATING_READ_ALL: 'rating:read_all',
  RATING_MANAGE_OWN: 'rating:manage_own',

  SYSTEM_STATS: 'system:stats',
  SYSTEM_MANAGE: 'system:manage',
  SYSTEM_DASHBOARD: 'system:dashboard',
  SYSTEM_AUDIT: 'system:audit'
}

/**
 * Default Pagination Settings
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [5, 10, 25, 50, 100]
}

/**
 * Sort Options
 */
export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  EMAIL_ASC: 'email_asc',
  EMAIL_DESC: 'email_desc',
  CREATED_ASC: 'created_asc',
  CREATED_DESC: 'created_desc',
  RATING_ASC: 'rating_asc',
  RATING_DESC: 'rating_desc'
}

/**
 * Filter Options
 */
export const FILTER_OPTIONS = {
  USER: {
    ROLE: ['system_admin', 'store_owner', 'normal_user'],
    STATUS: ['active', 'inactive']
  },
  STORE: {
    STATUS: ['active', 'inactive'],
    RATING: ['1', '2', '3', '4', '5']
  },
  RATING: {
    VALUE: ['1', '2', '3', '4', '5']
  }
}

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ROLE: 'userRole',
  USER_DATA: 'userData'
}

/**
 * API Timeout Settings
 */
export const TIMEOUT = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  LONG_RUNNING: 60000
}

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
}

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  CREATE: 'Created successfully!',
  RATING_SUBMITTED: 'Rating submitted successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
}

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 60,
    PATTERN: /^[a-zA-Z\s]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 16,
    PATTERN: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  ADDRESS: {
    MAX_LENGTH: 400
  },
  RATING: {
    MIN: 1,
    MAX: 5
  }
}

export default {
  API_BASE_URL,
  ENDPOINTS,
  HTTP_STATUS,
  USER_ROLES,
  PERMISSIONS,
  PAGINATION,
  SORT_OPTIONS,
  FILTER_OPTIONS,
  STORAGE_KEYS,
  TIMEOUT,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES
}
