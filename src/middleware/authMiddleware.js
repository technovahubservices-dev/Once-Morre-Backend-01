import jwt from 'jsonwebtoken'
import { verifyToken, asyncHandler } from '../utils/asyncHandler.js'
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js'
import User from '../models/User.js'

export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token

  // Get token from cookie or header
  if (req.cookies?.token) {
    token = req.cookies.token
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Access denied. No token provided.',
    })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token.',
    })
  }

  const user = await User.findById(decoded.id).select('-password')
  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'User not found.',
    })
  }

  req.user = user
  next()
})

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    })
  }
  next()
}

export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token

  if (req.cookies?.token) {
    token = req.cookies.token
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      const user = await User.findById(decoded.id).select('-password')
      if (user) {
        req.user = user
      }
    }
  }

  next()
})
