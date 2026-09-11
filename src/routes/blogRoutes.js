import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} from '../controllers/blogController.js'

const router = Router()

// Public
router.get('/', getBlogs)
router.get('/:id', getBlog)

// Admin
router.post(
  '/upload-image',
  authMiddleware,
  adminOnly,
  upload.single('image'),
  uploadBlogImage
)

router.post('/', authMiddleware, adminOnly, createBlog)
router.put('/:id', authMiddleware, adminOnly, updateBlog)
router.delete('/:id', authMiddleware, adminOnly, deleteBlog)

export default router
