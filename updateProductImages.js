import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './src/models/Product.js'

dotenv.config()

const updates = {
  'farm-fresh-curd': '/uploads/products/curd.png',
  'traditional-buttermilk': '/uploads/products/butter-milk.png',
  'pure-cow-ghee': '/uploads/products/ghee.png',
  'farm-fresh-paneer': '/uploads/products/paneer.png',
  'premium-palkova': '/uploads/products/palkova.png',
  'fresh-butter': '/uploads/products/butter.jpg',
}

await mongoose.connect(process.env.MONGODB_URI)

for (const [slug, image] of Object.entries(updates)) {
  const result = await Product.updateOne(
    { slug },
    { $set: { images: [image], image } }
  )

  console.log(`${slug}: ${result.modifiedCount} updated`)
}

await mongoose.disconnect()
console.log('Product images updated successfully')
