import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Inventory from '../models/Inventory.js'
import { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js'
import { successResponse, createdResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler, calculateOrderTotal } from '../utils/helpers.js'

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'card', items: bodyItems } = req.body

  let cartItems
  let subtotal

  if (bodyItems && bodyItems.length > 0) {
    cartItems = bodyItems.map((item) => ({
      product: item.productId || item.product,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      sku: item.sku,
    }))
    subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  } else {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Cart is empty', HTTP_STATUS.BAD_REQUEST)
    }
    cartItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      sku: item.product.sku,
    }))
    subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const tax = Math.round(subtotal * 0.06)
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

  const order = await Order.create({
    user: req.user._id,
    items: cartItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: PAYMENT_STATUS.PENDING,
    orderStatus: ORDER_STATUS.CONFIRMED,
    subtotal,
    tax,
    shipping,
    total,
  })

  // Deduct inventory if items have product IDs
  if (bodyItems && bodyItems.length > 0) {
    for (const item of bodyItems) {
      const productId = item.productId || item.product
      if (productId) {
        await Inventory.findOneAndUpdate(
          { product: productId },
          { $inc: { stockQuantity: -(item.quantity || 1) } },
          { new: true }
        )
      }
    }
  } else {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (cart) {
      for (const item of cart.items) {
        await Inventory.findOneAndUpdate(
          { product: item.product._id },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        )
      }
    }
  }

  // Clear backend cart
  const cart = await Cart.findOne({ user: req.user._id })
  if (cart) {
    cart.items = []
    await cart.save()
  }

  await order.populate('user', 'name email')

  return createdResponse(res, order, 'Order placed successfully')
})

export const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Order.countDocuments({ user: req.user._id })

  return successResponse(res, {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Orders fetched successfully')
})

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) {
    return errorResponse(res, 'Order not found', HTTP_STATUS.NOT_FOUND)
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized to view this order', HTTP_STATUS.FORBIDDEN)
  }

  return successResponse(res, order, 'Order fetched successfully')
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    return errorResponse(res, 'Order not found', HTTP_STATUS.NOT_FOUND)
  }

  if (order.orderStatus === ORDER_STATUS.DELIVERED) {
    return errorResponse(res, 'Cannot cancel delivered order', HTTP_STATUS.BAD_REQUEST)
  }

  order.orderStatus = ORDER_STATUS.CANCELLED
  await order.save()

  return successResponse(res, order, 'Order cancelled successfully')
})

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const orders = await Order.find()
    .populate('user', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })

  const total = await Order.countDocuments()

  return successResponse(res, {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Orders fetched successfully')
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    return errorResponse(res, 'Order not found', HTTP_STATUS.NOT_FOUND)
  }

  order.orderStatus = status
  await order.save()

  return successResponse(res, order, 'Order status updated successfully')
})
