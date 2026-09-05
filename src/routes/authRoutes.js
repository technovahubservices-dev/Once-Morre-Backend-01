import { Router } from 'express'
import { body, param } from 'express-validator'
import * as authController from '../controllers/authController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validationMiddleware.js'
import { otpRateLimit, resetRateLimit } from '../middleware/rateLimitMiddleware.js'

const router = Router()

router.post('/register', validate([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]), authController.register)

router.post('/login', validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]), authController.login)

router.post('/admin-login', validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]), authController.adminLogin)

router.post('/logout', authMiddleware, authController.logout)

router.get('/profile', authMiddleware, authController.getProfile)

router.put('/profile', authMiddleware, validate([
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
]), authController.updateProfile)

router.put('/password', authMiddleware, validate([
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
]), authController.changePassword)

router.post('/addresses', authMiddleware, validate([
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('country').optional().trim(),
  body('isDefault').optional().isBoolean(),
]), authController.addAddress)

router.put('/addresses/:addressId', authMiddleware, validate([
  body('fullName').optional().trim().notEmpty().withMessage('Full name is required'),
  body('phone').optional().trim().notEmpty().withMessage('Phone is required'),
  body('street').optional().trim().notEmpty().withMessage('Street is required'),
  body('city').optional().trim().notEmpty().withMessage('City is required'),
  body('state').optional().trim().notEmpty().withMessage('State is required'),
  body('zipCode').optional().trim().notEmpty().withMessage('Zip code is required'),
  body('country').optional().trim(),
  body('isDefault').optional().isBoolean(),
]), authController.updateAddress)

router.delete('/addresses/:addressId', authMiddleware, authController.deleteAddress)

router.post('/forgot-password', otpRateLimit, validate([
  body('email').isEmail().withMessage('Valid email is required'),
]), authController.forgotPassword)

router.post('/verify-otp', otpRateLimit, validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
]), authController.verifyOTP)

router.put('/reset-password/:token', resetRateLimit, validate([
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]), authController.resetPassword)

export default router
