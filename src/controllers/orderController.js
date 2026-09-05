import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as orderService from '../services/orderService.js'

export const createOrder = asyncHandler(async (req, res) => {
  const result = await orderService.createOrder(req, res)
  return result
})

export const getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req, res)
  return result
})

export const getOrderById = asyncHandler(async (req, res) => {
  const result = await orderService.getOrderById(req, res)
  return result
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const result = await orderService.cancelOrder(req, res)
  return result
})

export const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req, res)
  return result
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await orderService.updateOrderStatus(req, res)
  return result
})
