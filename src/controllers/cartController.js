import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as cartService from '../services/cartService.js'

export const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCart(req, res)
  return result
})

export const addToCart = asyncHandler(async (req, res) => {
  const result = await cartService.addToCart(req, res)
  return result
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.updateCartItem(req, res)
  return result
})

export const removeCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.removeCartItem(req, res)
  return result
})

export const clearCart = asyncHandler(async (req, res) => {
  const result = await cartService.clearCart(req, res)
  return result
})
