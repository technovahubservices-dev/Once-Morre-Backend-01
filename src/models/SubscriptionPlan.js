import mongoose from 'mongoose'

const subscriptionPlanSchema = new mongoose.Schema({
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  offerPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

subscriptionPlanSchema.index({ duration: 1 }, { unique: true })

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema)
