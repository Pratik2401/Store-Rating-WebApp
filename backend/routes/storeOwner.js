/**
 * Store Owner Routes Module
 * 
 * This module provides store owner functionality for managing their stores,
 * viewing ratings, and accessing dashboard statistics.
 * 
 * @module routes/storeOwner
 * @requires express
 * @requires ../middleware/auth
 * @requires ../middleware/errorHandler
 * @requires ../middleware/validation
 */

const express = require('express')
const { requireStoreOwner } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const { paginationRules } = require('../middleware/validation')

const router = express.Router()

router.use(requireStoreOwner)

/**
 * Get Store Owner's Stores
 * 
 * Retrieves all stores owned by the authenticated store owner with their
 * rating statistics including average rating and total number of ratings.
 * 
 * @route GET /store-owner/stores
 * @access Store Owner only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains array of owned stores with rating statistics
 */
router.get('/stores', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const userId = req.user.id
  
  const [stores] = await db.execute(
    `SELECT s.id, s.name, s.email, s.address, s.created_at,
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings,
            COUNT(DISTINCT r.user_id) as total_rating_users
     FROM stores s
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE s.owner_id = ?
     GROUP BY s.id
     ORDER BY s.created_at DESC`,
    [userId]
  )
  
  res.json({
    success: true,
    data: {
      stores: stores.map(store => ({
        ...store,
        average_rating: parseFloat((Number(store.average_rating) || 0).toFixed(2))
      }))
    }
  })
}))

/**
 * Get Store Owner Dashboard Statistics
 * 
 * Provides comprehensive statistics for the store owner's dashboard including
 * overall average rating across all stores, total ratings count, and store count.
 * 
 * @route GET /store-owner/dashboard/stats
 * @access Store Owner only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains dashboard statistics (averageRating, totalRatings, storeCount)
 */
router.get('/dashboard/stats', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const userId = req.user.id
  
  const [stores] = await db.execute(
    `SELECT s.id, s.name, s.address,
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings
     FROM stores s
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE s.owner_id = ?
     GROUP BY s.id`,
    [userId]
  )
  
  let totalRatings = stores.reduce((sum, store) => sum + store.total_ratings, 0)
  let overallAverage = totalRatings > 0 ? 
    stores.reduce((sum, store) => sum + (store.average_rating * store.total_ratings), 0) / totalRatings 
    : 0
  
  res.json({
    success: true,
    data: {
      averageRating: parseFloat(overallAverage.toFixed(2)),
      totalRatings: totalRatings,
      storeCount: stores.length
    }
  })
}))

/**
 * Get Store Owner's Ratings
 * 
 * Retrieves all ratings for stores owned by the authenticated store owner.
 * Includes detailed information about users who submitted ratings and the stores rated.
 * 
 * @route GET /store-owner/ratings
 * @access Store Owner only
 * @returns {Object} success - Operation status
 * @returns {Object} data - Contains array of ratings with user and store information, plus total count
 */
router.get('/ratings', asyncHandler(async (req, res) => {
  const db = req.app.locals.db
  const userId = req.user.id
  
  const [ratings] = await db.execute(
    `SELECT r.id, r.rating, r.review, r.created_at, r.updated_at,
            u.id as user_id, u.name as user_name, u.email as user_email, u.address as user_address,
            s.id as store_id, s.name as store_name
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     JOIN stores s ON r.store_id = s.id
     WHERE s.owner_id = ?
     ORDER BY r.created_at DESC`,
    [userId]
  )
  
  const [totalCount] = await db.execute(
    `SELECT COUNT(*) as total
     FROM ratings r
     JOIN stores s ON r.store_id = s.id
     WHERE s.owner_id = ?`,
    [userId]
  )
  
  const total = totalCount[0].total
  
  res.json({
    success: true,
    data: {
      ratings: ratings,
      total: total
    }
  })
}))

module.exports = router
