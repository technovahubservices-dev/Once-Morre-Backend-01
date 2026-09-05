import { Router } from 'express'
import * as orderController from '../controllers/orderController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { validate, validateOrder } from '../middleware/validationMiddleware.js'

const router = Router()

// Admin order routes (must come before customer /:id route)
router.get('/all', authMiddleware, adminOnly, orderController.getAllOrders)
router.put('/:id/status', authMiddleware, adminOnly, orderController.updateOrderStatus)

// Customer order routes (authenticated)
router.get('/', authMiddleware, orderController.getUserOrders)
router.get('/:id', authMiddleware, orderController.getOrderById)
router.post('/', authMiddleware, validateOrder, orderController.createOrder)
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder)

export default router