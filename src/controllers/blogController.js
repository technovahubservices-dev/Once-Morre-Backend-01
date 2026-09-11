import Blog from '../models/Blog.js'
import GoogleDriveConnection from '../models/GoogleDriveConnection.js'
import { uploadBlogImageToDrive } from '../services/googleDriveService.js'

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: blogs,
    })
  } catch (error) {
    console.error('Get blogs error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch blogs',
    })
  }
}

export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: blog,
    })
  } catch (error) {
    console.error('Get blog error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch blog',
    })
  }
}

export const createBlog = async (req, res) => {
  try {
    const { title, date, readTime, description, content, image } = req.body

    if (!title || !date || !readTime || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, date, read time and description are required',
      })
    }

    const blog = await Blog.create({
      title,
      date,
      readTime,
      description,
      content,
      image,
    })

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    })
  } catch (error) {
    console.error('Create blog error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create blog',
    })
  }
}

export const updateBlog = async (req, res) => {
  try {
    const { title, date, readTime, description, content, image } = req.body

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        date,
        readTime,
        description,
        content,
        image,
      },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    })
  } catch (error) {
    console.error('Update blog error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update blog',
    })
  }
}

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    })
  } catch (error) {
    console.error('Delete blog error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete blog',
    })
  }
}
export const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      })
    }

    const connection = await GoogleDriveConnection.findOne({
      admin: req.user._id,
    }).select('+accessTokenEncrypted +refreshTokenEncrypted')

    if (!connection) {
      return res.status(400).json({
        success: false,
        message: 'Google Drive is not connected',
      })
    }

    const result = await uploadBlogImageToDrive(connection, req.file)

    return res.status(200).json({
      success: true,
      message: 'Blog image uploaded successfully',
      data: result,
    })
  } catch (error) {
    console.error('Upload blog image error:', error)

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to upload blog image',
    })
  }
}

