/**
 * Input Validation Middleware
 * 
 * This module provides comprehensive input validation rules and middleware
 * for all API endpoints using express-validator. It ensures data integrity,
 * security, and consistency across the application.
 * 
 * @module middleware/validation
 * @requires express-validator
 */

const { body, param, query, validationResult } = require('express-validator')

const nameValidation = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces')

const emailValidation = body('email')
  .trim()
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address')
  .isLength({ max: 255 })
  .withMessage('Email cannot exceed 255 characters')

const passwordValidation = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be between 8 and 16 characters')
  .matches(/(?=.*[A-Z])/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/)
  .withMessage('Password must contain at least one special character')
  .matches(/^[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/)
  .withMessage('Password contains invalid characters')

const addressValidation = body('address')
  .optional()
  .trim()
  .isLength({ min: 1, max: 400 })
  .withMessage('Address must be between 1 and 400 characters when provided')

const addressRequiredValidation = body('address')
  .trim()
  .isLength({ min: 1, max: 400 })
  .withMessage('Address is required and must be between 1 and 400 characters')

const ratingValidation = body('rating')
  .isInt({ min: 1, max: 5 })
  .withMessage('Rating must be between 1 and 5')

const roleValidation = body('role')
  .optional()
  .isIn(['system_admin', 'normal_user', 'store_owner'])
  .withMessage('Invalid role specified')

const storeNameValidation = body('name')
  .trim()
  .isLength({ min: 1, max: 255 })
  .withMessage('Store name must be between 1 and 255 characters')

const storeEmailValidation = body('email')
  .trim()
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid store email address')
  .isLength({ max: 255 })
  .withMessage('Store email cannot exceed 255 characters')

const idValidation = param('id')
  .isInt({ min: 1 })
  .withMessage('Invalid ID parameter')

const pageValidation = query('page')
  .optional()
  .isInt({ min: 1 })
  .withMessage('Page must be a positive integer')

const limitValidation = query('limit')
  .optional()
  .isInt({ min: 1, max: 100 })
  .withMessage('Limit must be between 1 and 100')

const sortByValidation = query('sortBy')
  .optional()
  .isIn(['name', 'email', 'created_at', 'rating', 'average_rating'])
  .withMessage('Invalid sort field')

const sortOrderValidation = query('sortOrder')
  .optional()
  .isIn(['asc', 'desc'])
  .withMessage('Sort order must be asc or desc')

const sortValidation = query('sort')
  .optional()
  .isIn(['name', 'email', 'created_at', 'rating'])
  .withMessage('Invalid sort field')

const orderValidation = query('order')
  .optional()
  .isIn(['asc', 'desc'])
  .withMessage('Order must be asc or desc')

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  
  next()
}

const userRegistrationRules = [
  nameValidation,
  emailValidation,
  passwordValidation,
  addressValidation,
  roleValidation,
  handleValidationErrors
]

const userLoginRules = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required')
    .isLength({ max: 255 })
    .withMessage('Email too long'),
  body('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 1, max: 16 })
    .withMessage('Invalid password length'),
  handleValidationErrors
]

const userUpdateRules = [
  nameValidation.optional(),
  emailValidation.optional(),
  addressValidation,
  roleValidation,
  handleValidationErrors
]

const passwordUpdateRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password')
      }
      return true
    }),
  handleValidationErrors
]

const storeRules = [
  storeNameValidation,
  storeEmailValidation,
  addressRequiredValidation,
  body('owner_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid owner ID'),
  handleValidationErrors
]

const ratingRules = [
  ratingValidation,
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters'),
  handleValidationErrors
]

const paginationRules = [
  pageValidation,
  limitValidation,
  sortByValidation,
  sortOrderValidation,
  sortValidation, // Legacy support
  orderValidation, // Legacy support
  handleValidationErrors
]

const idRules = [
  idValidation,
  handleValidationErrors
]

const searchRules = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search term must be between 1 and 255 characters'),
  query('filter')
    .optional()
    .isIn(['name', 'email', 'address', 'role'])
    .withMessage('Invalid filter field'),
  handleValidationErrors
]

module.exports = {
  nameValidation,
  emailValidation,
  passwordValidation,
  addressValidation,
  addressRequiredValidation,
  ratingValidation,
  roleValidation,
  storeNameValidation,
  storeEmailValidation,
  idValidation,
  sortByValidation,
  sortOrderValidation,
  
  userRegistrationRules,
  userLoginRules,
  userUpdateRules,
  passwordUpdateRules,
  storeRules,
  ratingRules,
  paginationRules,
  idRules,
  searchRules,
  
  handleValidationErrors
}
