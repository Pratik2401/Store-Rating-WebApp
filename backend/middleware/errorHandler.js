/**
 * Error Handling Middleware
 * 
 * This module provides centralized error handling for the application,
 * including MySQL database errors, JWT authentication errors, validation
 * errors, and custom application errors with appropriate HTTP status codes.
 * 
 * @module middleware/errorHandler
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  let error = {
    success: false,
    message: 'Server Error',
    statusCode: 500
  }

  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        error.message = 'Duplicate entry. This record already exists.'
        error.statusCode = 400
        break
      case 'ER_NO_REFERENCED_ROW_2':
        error.message = 'Referenced record does not exist.'
        error.statusCode = 400
        break
      case 'ER_ROW_IS_REFERENCED_2':
        error.message = 'Cannot delete record as it is referenced by other records.'
        error.statusCode = 400
        break
      case 'ER_BAD_FIELD_ERROR':
        error.message = 'Invalid field in query.'
        error.statusCode = 400
        break
      case 'ER_PARSE_ERROR':
        error.message = 'Database query error.'
        error.statusCode = 400
        break
    }
  }

  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ')
    error.statusCode = 400
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token'
    error.statusCode = 401
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired'
    error.statusCode = 401
  }

  if (err.statusCode) {
    error.statusCode = err.statusCode
    error.message = err.message
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = {
  errorHandler,
  asyncHandler
}
