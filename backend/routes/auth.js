/**
 * Authentication Routes Module
 * 
 * This module handles all authentication-related operations including user registration,
 * login, token verification, and token refresh. It provides secure JWT-based authentication
 * with bcrypt password hashing and comprehensive validation.
 * 
 * @module routes/auth
 * @requires express
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires ../middleware/errorHandler
 * @requires ../middleware/validation
 */

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { asyncHandler } = require('../middleware/errorHandler')
const { userRegistrationRules, userLoginRules } = require('../middleware/validation')

const router = express.Router()

/**
 * Generate JWT Token
 * 
 * Creates a signed JWT token containing user ID and role information.
 * Token expiration is configurable via environment variables with a default of 24 hours.
 * 
 * @param {number} userId - Unique identifier for the user
 * @param {string} role - User's role in the system (normal_user, store_owner, admin)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
}

/**
 * User Registration Endpoint
 * 
 * Registers new users in the system with 'normal_user' role by default.
 * Validates input data, ensures email uniqueness, securely hashes passwords,
 * and automatically generates an authentication token upon successful registration.
 * 
 * @route POST /auth/register
 * @access Public
 * @param {string} name - User's full name
 * @param {string} email - User's email address (must be unique)
 * @param {string} password - User's password (will be hashed)
 * @param {string} address - User's address
 * @returns {Object} success - Operation status
 * @returns {string} message - Success message
 * @returns {Object} data - Contains user object and authentication token
 */
router.post('/register', userRegistrationRules, asyncHandler(async (req, res) => {
  const { name, email, password, address } = req.body
  const db = req.app.locals.db

  const [existingUsers] = await db.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  )

  if (existingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    })
  }

  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, address, 'normal_user']
  )

  const token = generateToken(result.insertId, 'normal_user')

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: result.insertId,
        name,
        email,
        address,
        role: 'normal_user'
      },
      token
    }
  })
}))

/**
 * User Login Endpoint
 * 
 * Authenticates users by validating email and password credentials.
 * Uses secure bcrypt comparison for password verification and generates
 * a new JWT token upon successful authentication.
 * 
 * @route POST /auth/login
 * @access Public
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} success - Operation status
 * @returns {string} message - Success message
 * @returns {Object} data - Contains user object and authentication token
 */
router.post('/login', userLoginRules, asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const db = req.app.locals.db

  const [users] = await db.execute(
    'SELECT id, name, email, password, address, role FROM users WHERE email = ?',
    [email]
  )

  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const user = users[0]

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const token = generateToken(user.id, user.role)

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      },
      token
    }
  })
}))

/**
 * Token Verification Endpoint
 * 
 * Validates JWT tokens and retrieves current user information.
 * Verifies token signature, checks expiration, and ensures the user still exists
 * in the database. Used for maintaining authenticated sessions.
 * 
 * @route GET /auth/verify
 * @access Public (but requires valid token)
 * @header {string} Authorization - Bearer token in format "Bearer <token>"
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains user object and token
 * @returns {string} message - Error message if token is invalid
 */
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const db = req.app.locals.db

    const [users] = await db.execute(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    res.json({
      success: true,
      data: {
        user: users[0],
        token
      }
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}))

/**
 * Token Refresh Endpoint
 * 
 * Generates a new JWT token using an existing valid token.
 * Allows clients to refresh their authentication tokens before expiration
 * to maintain continuous access without requiring re-login.
 * 
 * @route POST /auth/refresh
 * @access Public (but requires valid token)
 * @header {string} Authorization - Bearer token in format "Bearer <token>"
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains new authentication token
 * @returns {string} message - Error message if token is invalid
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const newToken = generateToken(decoded.userId, decoded.role)

    res.json({
      success: true,
      data: {
        token: newToken
      }
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}))

module.exports = router
