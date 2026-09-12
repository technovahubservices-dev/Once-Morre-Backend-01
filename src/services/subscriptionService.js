import { HTTP_STATUS, USER_ROLES } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'
import Subscription from '../models/Subscription.js'
import User from '../models/User.js'
import SubscriptionPlan from '../models/SubscriptionPlan.js'
const getDurationInDays = (plan) => {
  const value = String(plan || '').trim().toUpperCase()

  const match = value.match(/^(\d+)\s*DAYS?$/)
  const numericMatch = value.match(/^(\d+)$/)

  if (match) {
    const days = Number(match[1])
    return days > 0 ? days : null
  }

  if (numericMatch) {
    const days = Number(numericMatch[1])
    return days > 0 ? days : null
  }

  if (value === '30-DAYS' || value === '30') return 30
  if (value === '90-DAYS' || value === '90') return 90
  if (value === '180-DAYS' || value === '180') return 180

  return null
}

export const activateSubscription = async (req, res) => {
  const { plan, quantity, offerPrice, originalPrice } = req.body
  const userId = req.user._id

  if (!plan || !quantity || offerPrice === undefined || originalPrice === undefined) {
    return errorResponse(res, 'Plan, quantity, offer price, and original price are required', HTTP_STATUS.BAD_REQUEST)
  }

  if (quantity < 1) {
    return errorResponse(res, 'Quantity must be at least 1', HTTP_STATUS.BAD_REQUEST)
  }

  if (offerPrice > originalPrice) {
    return errorResponse(res, 'Offer price cannot be greater than original price', HTTP_STATUS.BAD_REQUEST)
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

  const durationInDays = getDurationInDays(plan)

  if (!durationInDays) {
    return errorResponse(res, 'Invalid plan selected', HTTP_STATUS.BAD_REQUEST)
  }

  nextBillingAt.setDate(now.getDate() + durationInDays)
  nextDeliveryAt.setDate(now.getDate() + durationInDays)

  const subscription = await Subscription.create({
    user: userId,
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
    .populate('user', 'name email')

  return createdResponse(res, populated, 'Subscription activated successfully')
}

export const getUserSubscriptions = async (req, res) => {
  const userId = req.user._id

  const subscriptions = await Subscription.find({ user: userId })
    .sort({ createdAt: -1 })

  return successResponse(res, subscriptions, 'Subscriptions fetched successfully')
}

export const getActiveSubscription = async (req, res) => {
  const userId = req.user._id

  const subscription = await Subscription.findOne({ user: userId, status: 'ACTIVE' })
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

  const durationInDays = getDurationInDays(subscription.plan)

  if (durationInDays) {
    nextBillingAt.setDate(now.getDate() + durationInDays)
    nextDeliveryAt.setDate(now.getDate() + durationInDays)

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



export const updateSubscriptionAdmin = async (req, res) => {
  const { subscriptionId } = req.params
  const { plan, quantity, offerPrice, originalPrice, status } = req.body

  const subscription = await Subscription.findById(subscriptionId)

  if (!subscription) {
    return errorResponse(res, 'Subscription not found', HTTP_STATUS.NOT_FOUND)
  }

  if (plan) {
    const durationInDays = getDurationInDays(plan)

    if (!durationInDays) {
      return errorResponse(res, 'Invalid plan selected', HTTP_STATUS.BAD_REQUEST)
    }

    subscription.plan = String(plan).trim().toUpperCase()
  }

  if (quantity !== undefined) {
    if (quantity < 1) {
      return errorResponse(res, 'Quantity must be at least 1', HTTP_STATUS.BAD_REQUEST)
    }
    subscription.quantity = quantity
  }

  if (offerPrice !== undefined) subscription.offerPrice = offerPrice
  if (originalPrice !== undefined) subscription.originalPrice = originalPrice

  if (subscription.offerPrice > subscription.originalPrice) {
    return errorResponse(res, 'Offer price cannot be greater than original price', HTTP_STATUS.BAD_REQUEST)
  }

  if (status) {
    if (!['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'].includes(status)) {
      return errorResponse(res, 'Invalid subscription status', HTTP_STATUS.BAD_REQUEST)
    }
    subscription.status = status
  }

  await subscription.save()

  const updated = await Subscription.findById(subscription._id)
    .populate('user', 'name email')

  return successResponse(res, updated, 'Subscription updated successfully')
}

export const getSubscriptionPlans = async (req, res) => {
  const plans = await SubscriptionPlan.find({ active: true }).sort({ duration: 1 })
  return successResponse(res, plans)
}
export const getSubscriptionPlansAdmin = async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ duration: 1 })
  return successResponse(res, plans)
}

export const createSubscriptionPlanAdmin = async (req, res) => {
  const { duration, originalPrice, offerPrice, popular, active } = req.body

  if (!duration || !duration.trim()) {
    return errorResponse(res, 'Duration is required', HTTP_STATUS.BAD_REQUEST)
  }

  if (offerPrice > originalPrice) {
    return errorResponse(
      res,
      'Offer price cannot be greater than original price',
      HTTP_STATUS.BAD_REQUEST
    )
  }

  const existing = await SubscriptionPlan.findOne({ duration })

  if (existing) {
    return errorResponse(
      res,
      'A plan with this duration already exists',
      HTTP_STATUS.BAD_REQUEST
    )
  }

  const plan = await SubscriptionPlan.create({
    duration,
    originalPrice,
    offerPrice,
    popular: popular ?? false,
    active: active ?? true,
  })

  return createdResponse(res, plan, 'Subscription plan created successfully')
}

export const updateSubscriptionPlanAdmin = async (req, res) => {
  const { planId } = req.params
  const { duration, originalPrice, offerPrice, popular, active } = req.body

  const plan = await SubscriptionPlan.findById(planId)

  if (!plan) {
    return errorResponse(res, 'Subscription plan not found', HTTP_STATUS.NOT_FOUND)
  }

  if (duration !== undefined) {
    if (!duration.trim()) {
      return errorResponse(res, 'Invalid duration', HTTP_STATUS.BAD_REQUEST)
    }

    const duplicate = await SubscriptionPlan.findOne({
      duration,
      _id: { $ne: planId },
    })

    if (duplicate) {
      return errorResponse(
        res,
        'A plan with this duration already exists',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    plan.duration = duration
  }

  if (originalPrice !== undefined) {
    plan.originalPrice = originalPrice
  }

  if (offerPrice !== undefined) {
    plan.offerPrice = offerPrice
  }

  if (plan.offerPrice > plan.originalPrice) {
    return errorResponse(
      res,
      'Offer price cannot be greater than original price',
      HTTP_STATUS.BAD_REQUEST
    )
  }

  if (popular !== undefined) {
    plan.popular = popular
  }

  if (active !== undefined) {
    plan.active = active
  }

  await plan.save()

  return successResponse(res, plan, 'Subscription plan updated successfully')
}

export const deleteSubscriptionPlanAdmin = async (req, res) => {
  const { planId } = req.params

  const plan = await SubscriptionPlan.findById(planId)

  if (!plan) {
    return errorResponse(res, 'Subscription plan not found', HTTP_STATUS.NOT_FOUND)
  }

  await SubscriptionPlan.findByIdAndDelete(planId)

  return successResponse(res, null, 'Subscription plan deleted successfully')
}
