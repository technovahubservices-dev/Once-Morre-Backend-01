import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection.db

const orphanInventory = await db.collection('inventories').aggregate([
  {
    $lookup: {
      from: 'products',
      localField: 'product',
      foreignField: '_id',
      as: 'productData'
    }
  },
  {
    $match: {
      productData: { $size: 0 }
    }
  }
]).toArray()

console.log('\nORPHAN INVENTORY:')
console.log(JSON.stringify(orphanInventory, null, 2))

const missingInventory = await db.collection('products').aggregate([
  {
    $lookup: {
      from: 'inventories',
      localField: '_id',
      foreignField: 'product',
      as: 'inventory'
    }
  },
  {
    $match: {
      inventory: { $size: 0 }
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      sku: 1
    }
  }
]).toArray()

console.log('\nPRODUCTS WITHOUT INVENTORY:')
console.log(JSON.stringify(missingInventory, null, 2))

await mongoose.disconnect()