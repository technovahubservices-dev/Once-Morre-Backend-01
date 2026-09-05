import { Router } from 'express'
import { body, param } from 'express-validator'
import * as subscriptionController from '../controllers/subscriptionController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validationMiddleware.js'

const router = Router()

router.post('/activate', authMiddleware, validate([
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('plan').isLength({ min: 1 }).withMessage('Plan is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('offerPrice').isFloat({ min: 0 }).withMessage('Valid offer price is required'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Valid original price is required'),
]), subscriptionController.activateSubscription)

router.get('/my-subscriptions', authMiddleware, subscriptionController.getUserSubscriptions)

router.get('/my-active-subscription', authMiddleware, subscriptionController.getActiveSubscription)

router.patch('/:subscriptionId/cancel', authMiddleware, validate([
  param('subscriptionId').isMongoId().withMessage('Valid subscription ID is required'),
]), subscriptionController.cancelSubscription)

router.patch('/:subscriptionId/pause', authMiddleware, validate([
  param('subscriptionId').isMongoId().withMessage('Valid subscription ID is required'),
]), subscriptionController.pauseSubscription)

router.patch('/:subscriptionId/resume', authMiddleware, validate([
  param('subscriptionId').isMongoId().withMessage('Valid subscription ID is required'),
]), subscriptionController.resumeSubscription)

router.get('/admin/all', authMiddleware, adminOnly, subscriptionController.getAllSubscriptionsAdmin)

router.get('/admin/stats', authMiddleware, adminOnly, subscriptionController.getSubscriptionStatsAdmin)

export default router
