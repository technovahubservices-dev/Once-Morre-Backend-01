import Category from '../models/Category.js'
import { HTTP_STATUS } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import slugify from 'slugify'

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 })
  return successResponse(res, categories, 'Categories fetched successfully')
})

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category || !category.isActive) {
    return errorResponse(res, 'Category not found', HTTP_STATUS.NOT_FOUND)
  }
  return successResponse(res, category, 'Category fetched successfully')
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  const slug = slugify(name, { lower: true, strict: true })
  const existingSlug = await Category.findOne({ slug })
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

  const category = await Category.create({ ...req.body, slug: finalSlug })
  return createdResponse(res, category, 'Category created successfully')
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    return errorResponse(res, 'Category not found', HTTP_STATUS.NOT_FOUND)
  }

  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true, strict: true })
  }

  const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  return successResponse(res, updatedCategory, 'Category updated successfully')
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    return errorResponse(res, 'Category not found', HTTP_STATUS.NOT_FOUND)
  }

  await Category.findByIdAndUpdate(req.params.id, { isActive: false })
  return successResponse(res, null, 'Category deleted successfully')
})
