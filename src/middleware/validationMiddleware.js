import { body, param, query, validationResult } from 'express-validator'
import { HTTP_STATUS, PAGINATION } from '../config/constants.js'
import { errorResponse } from '../utils/apiResponse.js'

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const extractedErrors = errors.array().map((err) => err.msg)
    return errorResponse(res, 'Validation Error', HTTP_STATUS.BAD_REQUEST, extractedErrors)
  }
}

export const validateProduct = validate([
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
])

export const validateProductUpdate = validate([
  body('name').optional().trim().notEmpty().withMessage('Product name must not be empty'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('images').optional().isArray({ min: 1 }).withMessage('At least one image is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
])

export const validateCategory = validate([
  body('name').trim().notEmpty().withMessage('Category name is required'),
])

export const validateOrder = validate([
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
])

export const validatePagination = validate([
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: PAGINATION.MAX_LIMIT }).withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
])
