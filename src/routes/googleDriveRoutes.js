import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import * as googleDriveController from '../controllers/googleDriveController.js'

const router = Router()

router.get('/connect', authMiddleware, adminOnly, googleDriveController.connect)
router.get('/callback', googleDriveController.callback)
router.get('/status', authMiddleware, adminOnly, googleDriveController.getStatus)
router.post('/disconnect', authMiddleware, adminOnly, googleDriveController.disconnect)
router.get('/image/:fileId', googleDriveController.getImage)

export default router


