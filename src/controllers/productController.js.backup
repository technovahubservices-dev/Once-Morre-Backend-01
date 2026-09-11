import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as productService from '../services/productService.js'

export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'Image file is required', HTTP_STATUS.BAD_REQUEST)
  }

  const imageUrl = `/uploads/products/${req.file.filename}`

  return successResponse(res, { imageUrl }, 'Image uploaded successfully')
})

export const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req, res)
  return result
})

export const getProductById = asyncHandler(async (req, res) => {
  const result = await productService.getProductById(req, res)
  return result
})

export const createProduct = asyncHandler(async (req, res) => {
  const result = await productService.createProduct(req, res)
  return result
})

export const updateProduct = asyncHandler(async (req, res) => {
  const result = await productService.updateProduct(req, res)
  return result
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req, res)
  return result
})

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const result = await productService.getFeaturedProducts(req, res)
  return result
})


