/**
 * User Routes Module
 * 
 * This module provides user-specific functionality including profile management,
 * password updates, store browsing, and rating submission capabilities.
 * 
 * @module routes/user
 * @requires express
 * @requires bcrypt
 * @requires ../middleware/auth
 * @requires ../middleware/errorHandler
 * @requires ../middleware/validation
 */

const express = require('express')
const bcrypt = require('bcrypt')
const { requireUser } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const { 
  paginationRules, 
  idRules, 
  ratingRules,
  passwordUpdateRules,
  userUpdateRules 
} = require('../middleware/validation')

const router = express.Router()

router.use(requireUser)

/**
 * Get User Profile
 * 
 * Retrieves the authenticated user's profile information including
 * personal details and statistics about ratings given.
 * 
 * @route GET /user/profile
 * @access User only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains user profile with rating statistics
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const userId = req.user.id
  
  const [users] = await db.execute(
    `SELECT u.id, u.name, u.email, u.address, u.created_at,
            COUNT(r.id) as total_ratings_given
     FROM users u
     LEFT JOIN ratings r ON u.id = r.user_id
     WHERE u.id = ?
     GROUP BY u.id`,
    [userId]
  )
  
  res.json({
    success: true,
    data: {
      user: users[0]
    }
  })
}))

/**
 * Update User Profile
 * 
 * Updates the authenticated user's profile information.
 * Validates email uniqueness and allows partial updates.
 * 
 * @route PUT /user/profile
 * @access User only
 * @param {string} [name] - User's name
 * @param {string} [email] - User's email (must be unique)
 * @param {string} [address] - User's address
 * @returns {Object} success - Operation status
 * @returns {string} message - Success message
 */
router.put('/profile', userUpdateRules, asyncHandler(async (req, res) => {
  const { name, email, address } = req.body
  const db = req.app.locals.db
  const userId = req.user.id

  if (email && email !== req.user.email) {
    const [emailCheck] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    )

    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another user'
      })
    }
  }

  const updates = []
  const values = []

  if (name) {
    updates.push('name = ?')
    values.push(name)
  }
  if (email) {
    updates.push('email = ?')
    values.push(email)
  }
  if (address !== undefined) {
    updates.push('address = ?')
    values.push(address)
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    })
  }

  values.push(userId)

  await db.execute(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  )

  res.json({
    success: true,
    message: 'Profile updated successfully'
  })
}))

/**
 * Change Password
 * 
 * Updates the authenticated user's password after verifying
 * the current password for security.
 * 
 * @route PUT /user/change-password
 * @access User only
 * @param {string} currentPassword - User's current password
 * @param {string} newPassword - New password
 * @returns {Object} success - Operation status
 * @returns {string} message - Success message
 */
router.put('/change-password', passwordUpdateRules, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const db = req.app.locals.db
  const userId = req.user.id

  const [users] = await db.execute(
    'SELECT password FROM users WHERE id = ?',
    [userId]
  )

  const isValidPassword = await bcrypt.compare(currentPassword, users[0].password)

  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    })
  }

  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

  await db.execute(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, userId]
  )

  res.json({
    success: true,
    message: 'Password updated successfully'
  })
}))

/**
 * Get All Stores with User Ratings
 * 
 * Retrieves all stores with their rating statistics and
 * the authenticated user's rating for each store if available.
 * 
 * @route GET /user/stores
 * @access User only
 * @returns {Object} success - Operation status
 * @returns {Array} stores - Array of stores with rating information
 */
router.get('/stores', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const userId = req.user.id
  
  const mainQuery = `
    SELECT s.id, s.name, s.address,
           COALESCE(AVG(r.rating), 0) as average_rating,
           COUNT(r.id) as total_ratings
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    GROUP BY s.id 
    ORDER BY s.name ASC
  `
  
  const [stores] = await db.execute(mainQuery)
  
  for (let store of stores) {
    const [userRating] = await db.execute(
      'SELECT rating, review, id, created_at FROM ratings WHERE store_id = ? AND user_id = ?',
      [store.id, userId]
    )
    store.user_rating = userRating[0]?.rating || null
    store.user_rating_id = userRating[0]?.id || null
    store.user_rating_date = userRating[0]?.created_at || null
  }

  res.json({
    success: true,
    stores
  })
}))

/**
 * Get Store Details
 * 
 * Retrieves detailed information for a specific store including
 * the user's rating and recent ratings from other users.
 * 
 * @route GET /user/stores/:id
 * @access User only
 * @param {number} id - Store ID
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains store details, user rating, and recent ratings
 */
router.get('/stores/:id', idRules, asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const { id } = req.params
  const userId = req.user.id
  
  const [stores] = await db.execute(
    `SELECT s.id, s.name, s.address,
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings
     FROM stores s
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE s.id = ?
     GROUP BY s.id`,
    [id]
  )
  
  if (stores.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Store not found'
    })
  }
  
  const [userRatings] = await db.execute(
    'SELECT id, rating, review, created_at, updated_at FROM ratings WHERE store_id = ? AND user_id = ?',
    [id, userId]
  )
  
  const [recentRatings] = await db.execute(
    `SELECT r.rating, r.review, r.created_at, u.name as user_name
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     WHERE r.store_id = ? AND r.user_id != ?
     ORDER BY r.created_at DESC
     LIMIT 10`,
    [id, userId]
  )
  
  res.json({
    success: true,
    data: {
      store: stores[0],
      userRating: userRatings[0] || null,
      recentRatings
    }
  })
}))

/**
 * Submit or Update Store Rating
 * 
 * Allows users to submit a new rating for a store or update
 * their existing rating. Prevents duplicate ratings per user per store.
 * 
 * @route POST /user/stores/:id/rating
 * @access User only
 * @param {number} id - Store ID
 * @param {number} rating - Rating value (1-5)
 * @param {string} [review] - Optional review text
 * @returns {Object} success - Operation status
 * @returns {string} message - Success message
 */
router.post('/stores/:id/rating', idRules, ratingRules, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rating, review } = req.body
  const db = req.app.locals.db
  const userId = req.user.id

  const [stores] = await db.execute('SELECT id FROM stores WHERE id = ?', [id])
  
  if (stores.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Store not found'
    })
  }

  const [existingRatings] = await db.execute(
    'SELECT id FROM ratings WHERE store_id = ? AND user_id = ?',
    [id, userId]
  )

  if (existingRatings.length > 0) {
    await db.execute(
      'UPDATE ratings SET rating = ?, review = ? WHERE id = ?',
      [rating, review || null, existingRatings[0].id]
    )

    res.json({
      success: true,
      message: 'Rating updated successfully'
    })
  } else {
    await db.execute(
      'INSERT INTO ratings (user_id, store_id, rating, review) VALUES (?, ?, ?, ?)',
      [userId, id, rating, review || null]
    )

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    })
  }
}))

/**
 * Get User's Ratings
 * 
 * Retrieves all ratings submitted by the authenticated user
 * with associated store information.
 * 
 * @route GET /user/ratings
 * @access User only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains array of user's ratings with store details and total count
 */
router.get('/ratings', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const userId = req.user.id

  const [ratings] = await db.execute(`
    SELECT 
      r.id,
      r.rating,
      r.created_at,
      r.updated_at,
      s.id as store_id,
      s.name as store_name,
      s.address as store_address
    FROM ratings r
    JOIN stores s ON r.store_id = s.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `, [userId])

  res.json({
    success: true,
    data: {
      ratings,
      total: ratings.length
    }
  })
}))

module.exports = router