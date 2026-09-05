import mongoose from 'mongoose'
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'
import Subscription from '../models/Subscription.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

export const activateSubscription = async (req, res) => {
  const { productId, plan, quantity, offerPrice, originalPrice } = req.body
  const userId = req.user._id

  if (!productId || !plan || !quantity || offerPrice === undefined || originalPrice === undefined) {
    return errorResponse(res, 'Product, plan, quantity, offer price, and original price are required', HTTP_STATUS.BAD_REQUEST)
  }

  if (quantity < 1) {
    return errorResponse(res, 'Quantity must be at least 1', HTTP_STATUS.BAD_REQUEST)
  }

  if (offerPrice > originalPrice) {
    return errorResponse(res, 'Offer price cannot be greater than original price', HTTP_STATUS.BAD_REQUEST)
  }

  const product = await Product.findById(productId)
  if (!product) {
    return errorResponse(res, 'Product not found', HTTP_STATUS.NOT_FOUND)
  }

  const user = await User.findById(userId)
  if (!user) {
    return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND)
  }

  if (user.role !== USER_ROLES.USER) {
    return errorResponse(res, 'Only customers can activate subscriptions', HTTP_STATUS.FORBIDDEN)
  }

  const now = new Date()
  const nextBillingAt = new Date(now)
  const nextDeliveryAt = new Date(now)

  if (plan === '30 DAYS' || plan === '30-days' || plan === '30') {
    nextBillingAt.setDate(now.getDate() + 30)
    nextDeliveryAt.setDate(now.getDate() + 30)
  } else if (plan === '90 DAYS' || plan === '90-days' || plan === '90') {
    nextBillingAt.setDate(now.getDate() + 90)
    nextDeliveryAt.setDate(now.getDate() + 90)
  } else if (plan === '180 DAYS' || plan === '180-days' || plan === '180') {
    nextBillingAt.setDate(now.getDate() + 180)
    nextDeliveryAt.setDate(now.getDate() + 180)
  } else {
    return errorResponse(res, 'Invalid plan selected', HTTP_STATUS.BAD_REQUEST)
  }

  const subscription = await Subscription.create({
    user: userId,
    product: productId,
    plan: plan.toUpperCase(),
    quantity,
    originalPrice,
    offerPrice,
    status: 'ACTIVE',
    activatedAt: now,
    nextBillingAt,
    nextDeliveryAt,
  })

  const populated = await Subscription.findById(subscription._id)
    .populate('product', 'name price images')
    .populate('user', 'name email')

  return createdResponse(res, populated, 'Subscription activated successfully')
}

export const getUserSubscriptions = async (req, res) => {
  const userId = req.user._id

  const subscriptions = await Subscription.find({ user: userId })
    .populate('product', 'name price images description')
    .sort({ createdAt: -1 })

  return successResponse(res, subscriptions, 'Subscriptions fetched successfully')
}

export const getActiveSubscription = async (req, res) => {
  const userId = req.user._id

  const subscription = await Subscription.findOne({ user: userId, status: 'ACTIVE' })
    .populate('product', 'name price images description')
    .sort({ createdAt: -1 })

  if (!subscription) {
    return successResponse(res, null, 'No active subscription found')
  }

  return successResponse(res, subscription, 'Active subscription fetched successfully')
}

export const cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.params
  const userId = req.user._id

  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId })
  if (!subscription) {
    return errorResponse(res, 'Subscription not found', HTTP_STATUS.NOT_FOUND)
  }

  if (subscription.status === 'CANCELLED') {
    return errorResponse(res, 'Subscription is already cancelled', HTTP_STATUS.BAD_REQUEST)
  }

  subscription.status = 'CANCELLED'
  await subscription.save()

  return successResponse(res, null, 'Subscription cancelled successfully')
}

export const pauseSubscription = async (req, res) => {
  const { subscriptionId } = req.params
  const userId = req.user._id

  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId })
  if (!subscription) {
    return errorResponse(res, 'Subscription not found', HTTP_STATUS.NOT_FOUND)
  }

  if (subscription.status !== 'ACTIVE') {
    return errorResponse(res, 'Only active subscriptions can be paused', HTTP_STATUS.BAD_REQUEST)
  }

  subscription.status = 'PAUSED'
  await subscription.save()

  return successResponse(res, null, 'Subscription paused successfully')
}

export const resumeSubscription = async (req, res) => {
  const { subscriptionId } = req.params
  const userId = req.user._id

  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId })
  if (!subscription) {
    return errorResponse(res, 'Subscription not found', HTTP_STATUS.NOT_FOUND)
  }

  if (subscription.status !== 'PAUSED') {
    return errorResponse(res, 'Only paused subscriptions can be resumed', HTTP_STATUS.BAD_REQUEST)
  }

  const now = new Date()
  const nextBillingAt = new Date(now)
  const nextDeliveryAt = new Date(now)

  if (subscription.plan === '30 DAYS' || subscription.plan === '30-days' || subscription.plan === '30') {
    nextBillingAt.setDate(now.getDate() + 30)
    nextDeliveryAt.setDate(now.getDate() + 30)
  } else if (subscription.plan === '90 DAYS' || subscription.plan === '90-days' || subscription.plan === '90') {
    nextBillingAt.setDate(now.getDate() + 90)
    nextDeliveryAt.setDate(now.getDate() + 90)
  } else if (subscription.plan === '180 DAYS' || subscription.plan === '180-days' || subscription.plan === '180') {
    nextBillingAt.setDate(now.getDate() + 180)
    nextDeliveryAt.setDate(now.getDate() + 180)
  }

  subscription.status = 'ACTIVE'
  subscription.nextBillingAt = nextBillingAt
  subscription.nextDeliveryAt = nextDeliveryAt
  await subscription.save()

  return successResponse(res, null, 'Subscription resumed successfully')
}

export const getAllSubscriptionsAdmin = async (req, res) => {
  const { status = 'ACTIVE', plan = '', page = 1, limit = 20 } = req.query

  const query = {}
  if (status) query.status = status.toUpperCase()
  if (plan) query.plan = plan.toUpperCase()

  const skip = (Number(page) - 1) * Number(limit)

  const subscriptions = await Subscription.find(query)
    .populate('user', 'name email phone')
    .populate('product', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const total = await Subscription.countDocuments(query)

  return successResponse(res, { subscriptions, total, page: Number(page), limit: Number(limit) }, 'Subscriptions fetched successfully')
}

export const getSubscriptionStatsAdmin = async (req, res) => {
  const totalActive = await Subscription.countDocuments({ status: 'ACTIVE' })
  const totalPaused = await Subscription.countDocuments({ status: 'PAUSED' })
  const totalCancelled = await Subscription.countDocuments({ status: 'CANCELLED' })
  const totalExpired = await Subscription.countDocuments({ status: 'EXPIRED' })
  const totalRevenue = await Subscription.aggregate([
    { $match: { status: 'ACTIVE' } },
    { $group: { _id: null, total: { $sum: '$offerPrice' } } },
  ])

  return successResponse(res, {
    totalActive,
    totalPaused,
    totalCancelled,
    totalExpired,
    totalRevenue: totalRevenue[0]?.total || 0,
  }, 'Subscription stats fetched successfully')
}
