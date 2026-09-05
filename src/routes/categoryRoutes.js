import { Router } from 'express'
import * as categoryController from '../controllers/categoryController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { validate, validateCategory } from '../middleware/validationMiddleware.js'

const router = Router()

router.get('/', categoryController.getAllCategories)
router.get('/:id', categoryController.getCategoryById)
router.post('/', authMiddleware, adminOnly, validateCategory, categoryController.createCategory)
router.put('/:id', authMiddleware, adminOnly, validateCategory, categoryController.updateCategory)
router.delete('/:id', authMiddleware, adminOnly, categoryController.deleteCategory)

export default router
