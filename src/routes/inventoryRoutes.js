import { Router } from 'express'
import { body } from 'express-validator'
import * as inventoryController from '../controllers/inventoryController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validationMiddleware.js'

const router = Router()

router.use(authMiddleware, adminOnly)

router.get('/', inventoryController.getAllInventory)
router.get('/low-stock', inventoryController.getLowStockProducts)
router.post('/', validate([
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
]), inventoryController.createInventory)
router.post('/:productId/adjust', validate([
  body('quantityChange').optional().isInt().withMessage('Quantity change must be an integer'),
  body('adjustmentType').isIn(['add', 'reduce', 'adjust', 'out_of_stock']).withMessage('Invalid adjustment type'),
  body('reason').optional().trim(),
]), inventoryController.adjustStock)
router.get('/:productId/adjustments', inventoryController.getStockAdjustments)
router.put('/:productId', validate([
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer'),
]), inventoryController.updateInventory)
router.get('/:productId', inventoryController.getInventoryByProduct)

export default router
