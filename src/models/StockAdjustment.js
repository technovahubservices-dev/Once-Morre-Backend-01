import mongoose from 'mongoose'

const stockAdjustmentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  adjustmentType: { type: String, enum: ['add', 'reduce', 'adjust', 'out_of_stock'], required: true },
  quantityChange: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, trim: true },
  adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

stockAdjustmentSchema.index({ product: 1, createdAt: -1 })

export default mongoose.model('StockAdjustment', stockAdjustmentSchema)
