import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as inventoryService from '../services/inventoryService.js'

export const getAllInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.getAllInventory(req, res)
  return result
})

export const getInventoryByProduct = asyncHandler(async (req, res) => {
  const result = await inventoryService.getInventoryByProduct(req, res)
  return result
})

export const updateInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.updateInventory(req, res)
  return result
})

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const result = await inventoryService.getLowStockProducts(req, res)
  return result
})

export const createInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.createInventory(req, res)
  return result
})

export const adjustStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req, res)
  return result
})

export const getStockAdjustments = asyncHandler(async (req, res) => {
  const result = await inventoryService.getStockAdjustments(req, res)
  return result
})
