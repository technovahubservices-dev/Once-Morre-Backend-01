import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User.js'
import { USER_ROLES, LOYALTY_TIERS } from '../config/constants.js'

dotenv.config()

const email = process.env.ADMIN_EMAIL || 'admin@caratlane.com'
const password = process.env.ADMIN_PASSWORD || 'admin123'

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    const hashedPassword = await bcrypt.hash(password, 12)
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        name: 'Admin User',
        email: email.toLowerCase(),
        password: hashedPassword,
        role: USER_ROLES.ADMIN,
        tier: LOYALTY_TIERS.PLATINUM,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    console.log(`Admin account ready: ${email}`)
  } catch (error) {
    console.error('Error creating admin account:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()
