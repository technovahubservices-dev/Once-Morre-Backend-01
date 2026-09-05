import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  plan: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  originalPrice: { type: Number, required: true, min: 0 },
  offerPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'], default: 'ACTIVE', index: true },
  activatedAt: { type: Date, default: Date.now },
  nextBillingAt: { type: Date, required: true },
  nextDeliveryAt: { type: Date, required: true },
}, { timestamps: true })

subscriptionSchema.index({ user: 1, status: 1 })
subscriptionSchema.index({ status: 1, nextBillingAt: 1 })

export default mongoose.model('Subscription', subscriptionSchema)
