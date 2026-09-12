import { Router } from 'express'
import { body, param } from 'express-validator'
import * as subscriptionController from '../controllers/subscriptionController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validationMiddleware.js'

const router = Router()

router.post('/activate', authMiddleware, validate([
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

router.patch('/admin/:subscriptionId', authMiddleware, adminOnly, validate([
  param('subscriptionId').isMongoId().withMessage('Valid subscription ID is required'),
  body('plan').optional().isString().trim().notEmpty().withMessage('Invalid plan'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('offerPrice').optional().isFloat({ min: 0 }).withMessage('Invalid offer price'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Invalid original price'),
  body('status').optional().isIn(['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED']).withMessage('Invalid status'),
]), subscriptionController.updateSubscriptionAdmin)
router.get('/plans', subscriptionController.getSubscriptionPlans)
router.get('/admin/plans', authMiddleware, adminOnly, subscriptionController.getSubscriptionPlansAdmin)

router.post('/admin/plans', authMiddleware, adminOnly, validate([
  body('duration').isString().trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Invalid original price'),
  body('offerPrice').isFloat({ min: 0 }).withMessage('Invalid offer price'),
  body('popular').optional().isBoolean().withMessage('Popular must be boolean'),
  body('active').optional().isBoolean().withMessage('Active must be boolean'),
]), subscriptionController.createSubscriptionPlanAdmin)

router.patch('/admin/plans/:planId', authMiddleware, adminOnly, validate([
  param('planId').isMongoId().withMessage('Valid plan ID is required'),
  body('duration').optional().isString().trim().isLength({ min: 1 }).withMessage('Invalid duration'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Invalid original price'),
  body('offerPrice').optional().isFloat({ min: 0 }).withMessage('Invalid offer price'),
  body('popular').optional().isBoolean().withMessage('Popular must be boolean'),
  body('active').optional().isBoolean().withMessage('Active must be boolean'),
]), subscriptionController.updateSubscriptionPlanAdmin)

router.delete('/admin/plans/:planId', authMiddleware, adminOnly, validate([
  param('planId').isMongoId().withMessage('Valid plan ID is required'),
]), subscriptionController.deleteSubscriptionPlanAdmin)
router.get('/admin/all', authMiddleware, adminOnly, subscriptionController.getAllSubscriptionsAdmin)

router.get('/admin/stats', authMiddleware, adminOnly, subscriptionController.getSubscriptionStatsAdmin)

export default router
