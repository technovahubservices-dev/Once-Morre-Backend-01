import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price image sku')
  return successResponse(res, cart || { items: [] }, 'Cart fetched successfully')
})

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size } = req.body

  const product = await Product.findById(productId)
  if (!product || !product.isActive) {
    return errorResponse(res, 'Product not found', HTTP_STATUS.NOT_FOUND)
  }

  let cart = await Cart.findOne({ user: req.user._id })

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] })
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  )

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity
  } else {
    cart.items.push({ product: productId, quantity, size })
  }

  await cart.save()
  await cart.populate('items.product', 'name price image sku')

  return createdResponse(res, cart, 'Item added to cart successfully')
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params
  const { quantity, size } = req.body

  const cart = await Cart.findOne({ user: req.user._id })
  if (!cart) {
    return errorResponse(res, 'Cart not found', HTTP_STATUS.NOT_FOUND)
  }

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)
  if (itemIndex === -1) {
    return errorResponse(res, 'Item not found in cart', HTTP_STATUS.NOT_FOUND)
  }

  if (quantity !== undefined) {
    cart.items[itemIndex].quantity = Math.max(1, quantity)
  }
  if (size !== undefined) {
    cart.items[itemIndex].size = size
  }

  await cart.save()
  await cart.populate('items.product', 'name price image sku')

  return successResponse(res, cart, 'Cart item updated successfully')
})

export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params

  const cart = await Cart.findOne({ user: req.user._id })
  if (!cart) {
    return errorResponse(res, 'Cart not found', HTTP_STATUS.NOT_FOUND)
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId)
  await cart.save()
  await cart.populate('items.product', 'name price image sku')

  return successResponse(res, cart, 'Item removed from cart successfully')
})

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
  if (!cart) {
    return errorResponse(res, 'Cart not found', HTTP_STATUS.NOT_FOUND)
  }

  cart.items = []
  await cart.save()

  return successResponse(res, cart, 'Cart cleared successfully')
})
