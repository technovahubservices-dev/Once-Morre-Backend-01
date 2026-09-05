import { asyncHandler } from '../utils/asyncHandler.js'
import * as subscriptionService from '../services/subscriptionService.js'
import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'

export const activateSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.activateSubscription(req, res)
  return result
})

export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getUserSubscriptions(req, res)
  return result
})

export const getActiveSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getActiveSubscription(req, res)
  return result
})

export const cancelSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.cancelSubscription(req, res)
  return result
})

export const pauseSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.pauseSubscription(req, res)
  return result
})

export const resumeSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.resumeSubscription(req, res)
  return result
})

export const getAllSubscriptionsAdmin = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getAllSubscriptionsAdmin(req, res)
  return result
})

export const getSubscriptionStatsAdmin = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getSubscriptionStatsAdmin(req, res)
  return result
})
