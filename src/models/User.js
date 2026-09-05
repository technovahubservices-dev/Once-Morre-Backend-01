import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { USER_ROLES, LOYALTY_TIERS } from '../config/constants.js'

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, { _id: true })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  addresses: [addressSchema],
  role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.USER },
  loyaltyPoints: { type: Number, default: 0 },
  tier: { type: String, enum: Object.values(LOYALTY_TIERS), default: LOYALTY_TIERS.BRONZE },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.getAddresses = function () {
  return this.addresses || []
}

export default mongoose.model('User', userSchema)
