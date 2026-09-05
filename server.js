import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import productRoutes from './src/routes/productRoutes.js'
import categoryRoutes from './src/routes/categoryRoutes.js'
import cartRoutes from './src/routes/cartRoutes.js'
import wishlistRoutes from './src/routes/wishlistRoutes.js'
import orderRoutes from './src/routes/orderRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import inventoryRoutes from './src/routes/inventoryRoutes.js'
import subscriptionRoutes from './src/routes/subscriptionRoutes.js'
import { errorMiddleware, notFound } from './src/middleware/errorMiddleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Connect to database
connectDB()

// Define allowed origins and clean any accidental trailing slashes
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'https://oncemorre.in',
  'https://oncemorre.in'
]
  .filter(Boolean)
  .map(url => url.replace(/\/$/, '')) // Automatically strips trailing slash if present

// CORS Configuration Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

// Explicitly handle all OPTIONS preflight requests before executing routes
app.options('*', cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// Body parsers
app.use(express.json({ limit: '50mb' })) // Increased limit slightly to handle image uploads safely
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() })
})

// 404 handler
app.use(notFound)

// Error handler
app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection: ${err.message}`)
  server.close(() => process.exit(1))
})

export default app

