import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { HTTP_STATUS, OTP } from '../config/constants.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import * as authService from '../services/authService.js'
import { storeOTP, verifyOTP as checkOTP, verifyResetToken, clearOTP } from '../services/otpService.js'
import Subscription from '../models/Subscription.js'

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req, res)
  return result
})

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req, res)
  return result
})

export const adminLogin = asyncHandler(async (req, res) => {
  const result = await authService.adminLogin(req, res)
  return result
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token')
  return successResponse(res, null, 'Logged out successfully')
})

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND)
  }

  const activeSubscription = await Subscription.findOne({ user: user._id, status: 'ACTIVE' })
    .populate('product', 'name price images description')
  
  const userData = {
    ...user.toObject(),
    activeSubscription: activeSubscription ? {
      id: activeSubscription._id,
      plan: activeSubscription.plan,
      quantity: activeSubscription.quantity,
      offerPrice: activeSubscription.offerPrice,
      originalPrice: activeSubscription.originalPrice,
      status: activeSubscription.status,
      activatedAt: activeSubscription.activatedAt,
      nextBillingAt: activeSubscription.nextBillingAt,
      nextDeliveryAt: activeSubscription.nextDeliveryAt,
      product: activeSubscription.product,
    } : null,
  }
  
  return successResponse(res, userData, 'Profile fetched successfully')
})

export const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req, res)
  return result
})

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req, res)
  return result
})

export const addAddress = asyncHandler(async (req, res) => {
  const result = await authService.addAddress(req, res)
  return result
})

export const updateAddress = asyncHandler(async (req, res) => {
  const result = await authService.updateAddress(req, res)
  return result
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const result = await authService.deleteAddress(req, res)
  return result
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return errorResponse(res, 'No user found with this email', HTTP_STATUS.NOT_FOUND)
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const { resetToken } = storeOTP(email, otp, OTP.EXPIRE_MINUTES)

  if (process.env.NODE_ENV === 'development') {
    return successResponse(res, { otp, resetToken }, 'OTP generated successfully')
  }

  return successResponse(res, null, 'If an account exists with this email, a password reset OTP has been sent.')
})

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return errorResponse(res, 'Email and OTP are required', HTTP_STATUS.BAD_REQUEST)
  }

  const result = checkOTP(email, otp)

  if (!result.success) {
    return errorResponse(res, result.message, HTTP_STATUS.BAD_REQUEST)
  }

  clearOTP(email)

  return successResponse(res, { resetToken: result.resetToken }, 'OTP verified successfully')
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { newPassword } = req.body

  if (!newPassword || newPassword.length < 6) {
    return errorResponse(res, 'Password must be at least 6 characters', HTTP_STATUS.BAD_REQUEST)
  }

  const result = verifyResetToken(token)
  if (!result.success) {
    return errorResponse(res, result.message, HTTP_STATUS.BAD_REQUEST)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await User.findOneAndUpdate({ email: result.email }, { password: hashedPassword })

  clearOTP(result.email)

  return successResponse(res, null, 'Password reset successfully')
})
