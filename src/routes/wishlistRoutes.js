import { Router } from 'express'
import { body } from 'express-validator'
import * as wishlistController from '../controllers/wishlistController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validationMiddleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', wishlistController.getWishlist)
router.post('/add', validate([
  body('productId').isMongoId().withMessage('Valid product ID is required'),
]), wishlistController.addToWishlist)
router.delete('/remove/:productId', wishlistController.removeFromWishlist)
router.delete('/clear', wishlistController.clearWishlist)

export default router
