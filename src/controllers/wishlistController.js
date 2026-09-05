import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as wishlistService from '../services/wishlistService.js'

export const getWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.getWishlist(req, res)
  return result
})

export const addToWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.addToWishlist(req, res)
  return result
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.removeFromWishlist(req, res)
  return result
})

export const clearWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.clearWishlist(req, res)
  return result
})
