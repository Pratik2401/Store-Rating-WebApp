/**
 * Admin Routes Module
 * 
 * This module provides comprehensive administrative functionality for the RBAC system.
 * It includes routes for dashboard statistics, user management, and store management.
 * All routes require admin-level authentication and authorization.
 * 
 * @module routes/admin
 * @requires express
 * @requires bcrypt
 * @requires ../middleware/auth
 * @requires ../middleware/errorHandler
 * @requires ../middleware/validation
 */

const express = require('express')
const bcrypt = require('bcrypt')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const { 
  userRegistrationRules, 
  storeRules, 
  paginationRules, 
  idRules,
  userUpdateRules 
} = require('../middleware/validation')

const router = express.Router()

/**
 * Global middleware configuration for admin routes
 * Ensures all admin endpoints require valid authentication and admin role
 */
router.use(authenticateToken)
router.use(requireAdmin)

/**
 * Dashboard Statistics Endpoint
 * 
 * Retrieves comprehensive system statistics for the admin dashboard.
 * Provides real-time counts of users, stores, ratings, and average rating metrics.
 * 
 * @route GET /admin/dashboard/stats
 * @access Admin only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Statistics object containing system metrics
 */
router.get('/dashboard/stats', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  
  // Execute parallel database queries for optimal performance
  const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users')
  const [storeCount] = await db.execute('SELECT COUNT(*) as count FROM stores')
  const [ratingCount] = await db.execute('SELECT COUNT(*) as count FROM ratings')
  const [avgRating] = await db.execute('SELECT AVG(rating) as average FROM ratings')

  res.json({
    success: true,
    data: {
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count,
      averageRating: parseFloat(avgRating[0].average || 0).toFixed(2)
    }
  })
}))

/**
 * ================================
 * USER MANAGEMENT ENDPOINTS
 * ================================
 */

/**
 * Retrieve All Users
 * 
 * Fetches a paginated list of all users in the system with their basic information.
 * Currently returns the first 100 users ordered by creation date (most recent first).
 * 
 * @route GET /admin/users
 * @access Admin only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains users array and pagination metadata
 */
router.get('/users', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  
  // Fetch users with essential information excluding sensitive data
  const [users] = await db.execute(`
    SELECT id, name, email, address, role, created_at, updated_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 100
  `)
  
  // Get total count for pagination calculations
  const [totalCount] = await db.execute(`
    SELECT COUNT(*) as count FROM users
  `)
  
  res.json({
    success: true,
    data: {
      users,
      total: totalCount[0].count,
      page: 1,
      limit: 100,
      totalPages: 1
    }
  })
}))

/**
 * Retrieve User by ID
 * 
 * Fetches detailed information for a specific user identified by their unique ID.
 * Returns 404 if the user does not exist in the system.
 * 
 * @route GET /admin/users/:id
 * @access Admin only
 * @param {number} id - User's unique identifier
 * @returns {Object} success - Operation status
 * @returns {Object} data - User object with detailed information
 * @returns {string} message - Error message if user not found
 */
router.get('/users/:id', idRules, asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const { id } = req.params
  
  const [user] = await db.execute('SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?', [id])
  
  if (user.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  res.json({
    success: true,
    data: user[0]
  })
}))

/**
 * Create New User
 * 
 * Creates a new user account with the specified details and role assignment.
 * Validates input data, checks for email uniqueness, and securely hashes the password.
 * Defaults to 'normal_user' role if not specified.
 * 
 * @route POST /admin/users
 * @access Admin only
 * @param {string} name - User's full name
 * @param {string} email - User's email address (must be unique)
 * @param {string} password - User's password (will be hashed)
 * @param {string} address - User's address
 * @param {string} [role=normal_user] - User's role in the system
 * @returns {Object} success - Operation status
 * @returns {string} message - Success message
 * @returns {Object} data - Created user object (without password)
 */
router.post('/users', userRegistrationRules, asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const { name, email, password, address, role = 'normal_user' } = req.body
  
  // Validate email uniqueness to prevent duplicate accounts
  const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email])
  if (existingUser.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists'
    })
  }
  
  const hashedPassword = await bcrypt.hash(password, 12)
  
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, address, role]
  )
  
  const [newUser] = await db.execute('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [result.insertId])
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser[0]
  })
}))

/**
 * ================================
 * STORE MANAGEMENT ENDPOINTS
 * ================================
 */

/**
 * Retrieve All Stores
 * 
 * Fetches a comprehensive list of all stores with their associated owner information
 * and rating statistics. Includes aggregated data such as average rating and total
 * number of ratings for each store.
 * 
 * @route GET /admin/stores
 * @access Admin only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains stores array with owner info and rating statistics
 */
router.get('/stores', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  
  
  const [stores] = await db.execute(`
    SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
           u.name as owner_name,
           COALESCE(AVG(r.rating), 0) as average_rating,
           COUNT(r.id) as total_ratings
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at, u.name
    ORDER BY s.created_at DESC 
    LIMIT 100
  `)
  
  
  const [totalCount] = await db.execute(`
    SELECT COUNT(DISTINCT s.id) as count 
    FROM stores s
  `)
  
  res.json({
    success: true,
    data: {
      stores,
      total: totalCount[0].count,
      page: 1,
      limit: 100,
      totalPages: 1
    }
  })
}))

/**
 * Retrieve Store by ID
 * 
 * Fetches detailed information for a specific store including owner details
 * and comprehensive rating statistics. Returns 404 if store doesn't exist.
 * 
 * @route GET /admin/stores/:id
 * @access Admin only
 * @param {number} id - Store's unique identifier
 * @returns {Object} success - Operation status
 * @returns {Object} data - Store object with owner info and rating statistics
 * @returns {string} message - Error message if store not found
 */
router.get('/stores/:id', idRules, asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const { id } = req.params
  
  
  const [store] = await db.execute(`
    SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
           u.name as owner_name,
           AVG(r.rating) as average_rating,
           COUNT(r.id) as total_ratings
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE s.id = ?
    GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at, u.name
  `, [id])
  
  if (store.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Store not found'
    })
  }
  
  res.json({
    success: true,
    data: store[0]
  })
}))

/**
 * Create New Store
 * 
 * Creates a new store record with the specified details and assigns it to a store owner.
 * Validates input data, ensures email uniqueness, and verifies the owner exists and
 * has the appropriate role permissions.
 * 
 * @route POST /admin/stores
 * @access Admin only
 * @param {string} name - Store name
 * @param {string} email - Store contact email (must be unique)
 * @param {string} address - Store physical address
 * @param {number} owner_id - ID of the user who will own this store
 * @returns {Object} success - Operation status
 * @returns {string} message - Success message
 * @returns {Object} data - Created store object with owner information
 */
router.post('/stores', storeRules, asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const { name, email, address, owner_id } = req.body
  
  
  const [existingStore] = await db.execute('SELECT id FROM stores WHERE email = ?', [email])
  if (existingStore.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Store email already exists'
    })
  }
  
  
  const [owner] = await db.execute('SELECT id, role FROM users WHERE id = ? AND role = "store_owner"', [owner_id])
  if (owner.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid owner ID or user is not a store owner'
    })
  }
  
  
  const [result] = await db.execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address, owner_id]
  )
  
  
  const [newStore] = await db.execute(`
    SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
           u.name as owner_name
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    WHERE s.id = ?
  `, [result.insertId])
  
  res.status(201).json({
    success: true,
    message: 'Store created successfully',
    data: newStore[0]
  })
}))

module.exports = router
