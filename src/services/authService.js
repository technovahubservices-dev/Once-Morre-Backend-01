import User from '../models/User.js'
import mongoose from 'mongoose'
import { generateToken, asyncHandler } from '../utils/asyncHandler.js'
import { HTTP_STATUS, USER_ROLES, LOYALTY_TIERS } from '../config/constants.js'
import { successResponse, createdResponse, errorResponse } from '../utils/apiResponse.js'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return errorResponse(res, 'User already exists with this email', HTTP_STATUS.CONFLICT)
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: USER_ROLES.USER,
    tier: LOYALTY_TIERS.BRONZE,
  })

  return createdResponse(res, { id: user._id, name: user.name, email: user.email }, 'User registered successfully')
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return errorResponse(res, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED)
  }

  if (!user.isActive) {
    return errorResponse(res, 'Account is deactivated. Please contact support.', HTTP_STATUS.FORBIDDEN)
  }

  user.lastLogin = new Date()
  await user.save()

  return successResponse(res, {
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      tier: user.tier,
    },
  }, 'Login successful')
})

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: normalizedEmail }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return errorResponse(res, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED)
  }

  if (user.role !== USER_ROLES.ADMIN) {
    return errorResponse(res, 'Admin access is required', HTTP_STATUS.FORBIDDEN)
  }

  if (!user.isActive) {
    return errorResponse(res, 'Account is deactivated. Please contact support.', HTTP_STATUS.FORBIDDEN)
  }

  user.lastLogin = new Date()
  await user.save()

  return successResponse(res, {
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      tier: user.tier,
    },
  }, 'Admin login successful')
})

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND)
  }
  return successResponse(res, user, 'Profile fetched successfully')
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body
  const user = await User.findById(req.user._id)

  if (name) user.name = name
  if (phone !== undefined) user.phone = phone

  await user.save()

  return successResponse(res, { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, 'Profile updated successfully')
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+password')

  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND)
  }

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    return errorResponse(res, 'Current password is incorrect', HTTP_STATUS.BAD_REQUEST)
  }

  user.password = newPassword
  await user.save()

  return successResponse(res, null, 'Password changed successfully')
})

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const address = { ...req.body, _id: new mongoose.Types.ObjectId() }

  if (address.isDefault) {
    user.addresses = user.addresses.map((a) => ({ ...a, isDefault: false }))
  }

  user.addresses.push(address)
  await user.save()

  return successResponse(res, address, 'Address added successfully')
})

export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params
  const user = await User.findById(req.user._id)

  const addressIndex = user.addresses.findIndex((a) => a._id.toString() === addressId)
  if (addressIndex === -1) {
    return errorResponse(res, 'Address not found', HTTP_STATUS.NOT_FOUND)
  }

  const updates = req.body
  if (updates.isDefault) {
    user.addresses = user.addresses.map((a) => ({ ...a, isDefault: false }))
  }

  user.addresses[addressIndex] = { ...user.addresses[addressIndex].toObject(), ...updates }
  await user.save()

  return successResponse(res, user.addresses[addressIndex], 'Address updated successfully')
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params
  const user = await User.findById(req.user._id)

  const addressIndex = user.addresses.findIndex((a) => a._id.toString() === addressId)
  if (addressIndex === -1) {
    return errorResponse(res, 'Address not found', HTTP_STATUS.NOT_FOUND)
  }

  user.addresses.splice(addressIndex, 1)
  await user.save()

  return successResponse(res, null, 'Address deleted successfully')
})
