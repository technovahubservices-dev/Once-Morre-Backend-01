import User from '../models/User.js'
import Subscription from '../models/Subscription.js'
import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  return successResponse(res, users, 'Users fetched successfully')
})

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
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
  
  return successResponse(res, userData, 'User fetched successfully')
})

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND)
  }

  const { name, phone, role, isActive } = req.body

  if (name) user.name = name
  if (phone !== undefined) user.phone = phone
  if (role) user.role = role
  if (isActive !== undefined) user.isActive = isActive

  await user.save()

  return successResponse(res, { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }, 'User updated successfully')
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND)
  }

  await User.findByIdAndUpdate(req.params.id, { isActive: false })
  return successResponse(res, null, 'User deleted successfully')
})
