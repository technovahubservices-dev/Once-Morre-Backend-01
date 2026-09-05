import mongoose from 'mongoose'
import User from './src/models/User.js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const email = 'admin@example.com'
    const password = 'Admin@123456'

    let user = await User.findOne({ email }).select('+password')

    if (!user) {
      user = new User({
        name: 'Admin',
        email,
        password,
        role: 'admin',
        isActive: true,
      })
    } else {
      user.password = password
      user.role = 'admin'
      user.isActive = true
    }

    await user.save()

    console.log('Admin account ready')
    console.log('Email:', email)
    console.log('Password:', password)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Failed:', error.message)
    process.exit(1)
  }
}

createAdmin()