import { HTTP_STATUS } from '../config/constants.js'
import { errorResponse } from '../utils/apiResponse.js'

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  err.message = err.message || 'Internal Server Error'

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message)
    return errorResponse(res, 'Validation Error', HTTP_STATUS.BAD_REQUEST, errors)
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return errorResponse(res, `${field} already exists`, HTTP_STATUS.CONFLICT)
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid resource ID', HTTP_STATUS.BAD_REQUEST)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED)
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED)
  }

  errorResponse(res, err.message, err.statusCode)
}

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
}
