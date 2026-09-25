import express from 'express'
import {
  getSiteSettings,
  updateSiteSettings,
} from '../controllers/siteSettingsController.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getSiteSettings)
router.put('/', authMiddleware, adminOnly, updateSiteSettings)

export default router
