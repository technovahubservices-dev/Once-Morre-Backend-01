import { Router } from 'express'
import * as userController from '../controllers/userController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, adminOnly, userController.getAllUsers)
router.get('/:id', authMiddleware, userController.getUserById)
router.put('/:id', authMiddleware, adminOnly, userController.updateUser)
router.delete('/:id', authMiddleware, adminOnly, userController.deleteUser)

export default router
