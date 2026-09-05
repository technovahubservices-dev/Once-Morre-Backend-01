import Inventory from '../models/Inventory.js'
import Product from '../models/Product.js'
import StockAdjustment from '../models/StockAdjustment.js'
import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getAllInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find().populate('product', 'name sku price images')
  return successResponse(res, inventory, 'Inventory fetched successfully')
})

export const getInventoryByProduct = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ product: req.params.productId }).populate('product', 'name sku price images')
  if (!inventory) {
    return errorResponse(res, 'Inventory not found for this product', HTTP_STATUS.NOT_FOUND)
  }
  return successResponse(res, inventory, 'Inventory fetched successfully')
})

export const updateInventory = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { stockQuantity, lowStockThreshold } = req.body

  const inventory = await Inventory.findOneAndUpdate(
    { product: productId },
    {
      ...(stockQuantity !== undefined && { stockQuantity }),
      ...(lowStockThreshold !== undefined && { lowStockThreshold }),
      inStock: stockQuantity > 0,
      lastRestocked: new Date(),
    },
    { new: true, runValidators: true }
  ).populate('product', 'name sku')

  if (!inventory) {
    return errorResponse(res, 'Inventory not found', HTTP_STATUS.NOT_FOUND)
  }

  return successResponse(res, inventory, 'Inventory updated successfully')
})

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({
    $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
  }).populate('product', 'name sku price images')

  return successResponse(res, inventory, 'Low stock products fetched successfully')
})

export const createInventory = asyncHandler(async (req, res) => {
  const { product, stockQuantity, lowStockThreshold = 10 } = req.body

  const existingInventory = await Inventory.findOne({ product })
  if (existingInventory) {
    return errorResponse(res, 'Inventory already exists for this product', HTTP_STATUS.CONFLICT)
  }

  const inventory = await Inventory.create({
    product,
    stockQuantity,
    lowStockThreshold,
    inStock: stockQuantity > 0,
  })

  await inventory.populate('product', 'name sku price images')

  return createdResponse(res, inventory, 'Inventory created successfully')
})

export const adjustStock = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { quantityChange, adjustmentType, reason } = req.body

  const inventory = await Inventory.findOne({ product: productId })
  if (!inventory) {
    return errorResponse(res, 'Inventory not found for this product', HTTP_STATUS.NOT_FOUND)
  }

  const previousStock = inventory.stockQuantity
  let newStock = previousStock
  let effectiveChange = quantityChange

  switch (adjustmentType) {
    case 'add':
      newStock = previousStock + Number(quantityChange)
      break
    case 'reduce':
      newStock = previousStock - Number(quantityChange)
      effectiveChange = -Number(quantityChange)
      break
    case 'adjust':
      newStock = Number(quantityChange)
      effectiveChange = Number(quantityChange) - previousStock
      break
    case 'out_of_stock':
      newStock = 0
      effectiveChange = -previousStock
      break
    default:
      return errorResponse(res, 'Invalid adjustment type', HTTP_STATUS.BAD_REQUEST)
  }

  if (newStock < 0) {
    return errorResponse(res, 'Stock quantity cannot be negative', HTTP_STATUS.BAD_REQUEST)
  }

  inventory.stockQuantity = newStock
  inventory.inStock = newStock > 0
  if (adjustmentType === 'out_of_stock') {
    inventory.inStock = false
  }
  if (newStock > 0 && adjustmentType !== 'out_of_stock') {
    inventory.lastRestocked = new Date()
  }
  await inventory.save()

  await StockAdjustment.create({
    product: productId,
    adjustmentType,
    quantityChange: effectiveChange,
    previousStock,
    newStock,
    reason: reason || '',
    adjustedBy: req.user?._id || null,
  })

  const updatedInventory = await Inventory.findById(inventory._id).populate('product', 'name sku price images')

  return successResponse(res, updatedInventory, 'Stock adjusted successfully')
})

export const getStockAdjustments = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const adjustments = await StockAdjustment.find({ product: productId })
    .populate('adjustedBy', 'name email')
    .sort({ createdAt: -1 })

  return successResponse(res, adjustments, 'Stock adjustments fetched successfully')
})
