import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Inventory from '../models/Inventory.js'
import { HTTP_STATUS, PAGINATION, USER_ROLES } from '../config/constants.js'
import { successResponse, errorResponse, createdResponse } from '../utils/apiResponse.js'
import { asyncHandler, generateSKU } from '../utils/helpers.js'
import slugify from 'slugify'

export const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT
  const skip = (page - 1) * limit

  const filter = {}

  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    filter.isActive = true
  }

  if (req.query.category) {
    filter.category = req.query.category
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {}
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
  }

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' }
  }

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })

  const total = await Product.countDocuments(filter)

  const productIds = products.map((p) => p._id)
  let inventoryMap = {}
  if (productIds.length > 0) {
    const inventoryRecords = await Inventory.find({ product: { $in: productIds } })
    inventoryRecords.forEach((inv) => {
      inventoryMap[inv.product.toString()] = {
        stockQuantity: inv.stockQuantity,
        inStock: inv.inStock,
        lowStockThreshold: inv.lowStockThreshold,
      }
    })
  }

  const productsWithInventory = products.map((product) => ({
    ...product.toObject(),
    ...inventoryMap[product._id.toString()],
  }))

  return successResponse(res, {
    products: productsWithInventory,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }, 'Products fetched successfully')
})

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug')
  if (!product || !product.isActive) {
    return errorResponse(res, 'Product not found', HTTP_STATUS.NOT_FOUND)
  }

  const inventory = await Inventory.findOne({ product: product._id })
  const productObj = product.toObject()
  if (inventory) {
    productObj.stockQuantity = inventory.stockQuantity
    productObj.inStock = inventory.inStock
    productObj.lowStockThreshold = inventory.lowStockThreshold
  }

  return successResponse(res, productObj, 'Product fetched successfully')
})

export const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body

  if (productData.images && productData.images.length > 0) {
    productData.image = productData.images[0]
  }

  const slug = slugify(productData.name, { lower: true, strict: true })
  const existingSlug = await Product.findOne({ slug })
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

  productData.slug = finalSlug

  const product = await Product.create(productData)

  if (!product.sku) {
    product.sku = generateSKU(product.category?.name?.substring(0, 2).toUpperCase() || 'PR', product._id)
    await product.save()
  }

  await product.populate('category', 'name slug')

  return createdResponse(res, product, 'Product created successfully')
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return errorResponse(res, 'Product not found', HTTP_STATUS.NOT_FOUND)
  }

  if (req.body.images && req.body.images.length > 0) {
    req.body.image = req.body.images[0]
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug')

  return successResponse(res, updatedProduct, 'Product updated successfully')
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return errorResponse(res, 'Product not found', HTTP_STATUS.NOT_FOUND)
  }

  await Product.findByIdAndUpdate(req.params.id, { isActive: false })

  return successResponse(res, null, 'Product deleted successfully')
})

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, badge: { $exists: true, $ne: null } })
    .populate('category', 'name slug')
    .limit(8)
    .sort({ createdAt: -1 })

  return successResponse(res, products, 'Featured products fetched successfully')
})
