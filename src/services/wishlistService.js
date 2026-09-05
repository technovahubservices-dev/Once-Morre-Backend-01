import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'
import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name price image sku badge')
  return successResponse(res, wishlist || { products: [] }, 'Wishlist fetched successfully')
})

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body

  const product = await Product.findById(productId)
  if (!product || !product.isActive) {
    return errorResponse(res, 'Product not found', HTTP_STATUS.NOT_FOUND)
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id })

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] })
  }

  if (wishlist.products.includes(productId)) {
    return errorResponse(res, 'Product already in wishlist', HTTP_STATUS.CONFLICT)
  }

  wishlist.products.push(productId)
  await wishlist.save()
  await wishlist.populate('products', 'name price image sku badge')

  return createdResponse(res, wishlist, 'Item added to wishlist successfully')
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const wishlist = await Wishlist.findOne({ user: req.user._id })
  if (!wishlist) {
    return errorResponse(res, 'Wishlist not found', HTTP_STATUS.NOT_FOUND)
  }

  wishlist.products = wishlist.products.filter((id) => id.toString() !== productId)
  await wishlist.save()
  await wishlist.populate('products', 'name price image sku badge')

  return successResponse(res, wishlist, 'Item removed from wishlist successfully')
})

export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
  if (!wishlist) {
    return errorResponse(res, 'Wishlist not found', HTTP_STATUS.NOT_FOUND)
  }

  wishlist.products = []
  await wishlist.save()

  return successResponse(res, wishlist, 'Wishlist cleared successfully')
})
