import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, min: 0, default: 10 },
  inStock: { type: Boolean, default: true },
  lastRestocked: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Inventory', inventorySchema)
