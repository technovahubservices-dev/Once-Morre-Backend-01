import { Router } from 'express'
import { body } from 'express-validator'
import * as cartController from '../controllers/cartController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validationMiddleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', cartController.getCart)
router.post('/add', validate([
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
]), cartController.addToCart)
router.put('/update/:itemId', cartController.updateCartItem)
router.delete('/remove/:itemId', cartController.removeCartItem)
router.delete('/clear', cartController.clearCart)

export default router
