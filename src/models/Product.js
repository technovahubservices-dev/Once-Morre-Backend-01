import mongoose from 'mongoose'

const specificationSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  items: [{
    label: { type: String, required: true },
    value: { type: String, required: true },
  }],
}, { _id: false })

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  slug: { type: String, unique: true, lowercase: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  discount: { type: Number, min: 0, max: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  images: [{ type: String, required: true }],
  image: { type: String },
  badge: { type: String, trim: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviews: { type: Number, min: 0, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  sizes: [{ type: Number }],
  specifications: { type: [specificationSchema], default: [] },
  similarProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

productSchema.index({ category: 1 })
productSchema.index({ price: 1 })

export default mongoose.model('Product', productSchema)
