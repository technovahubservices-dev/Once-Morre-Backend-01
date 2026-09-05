import { Router } from 'express'
import * as productController from '../controllers/productController.js'
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/authMiddleware.js'
import { validate, validatePagination, validateProduct, validateProductUpdate } from '../middleware/validationMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = Router()

router.get('/', validatePagination, optionalAuth, productController.getAllProducts)
router.get('/featured', productController.getFeaturedProducts)
router.post('/upload-image', authMiddleware, adminOnly, upload.single('image'), productController.uploadProductImage)
router.get('/:id', productController.getProductById)
router.post('/', authMiddleware, adminOnly, validateProduct, productController.createProduct)
router.put('/:id', authMiddleware, adminOnly, validateProductUpdate, productController.updateProduct)
router.delete('/:id', authMiddleware, adminOnly, productController.deleteProduct)

export default router

