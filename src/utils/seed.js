import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Inventory from '../models/Inventory.js'
import bcrypt from 'bcryptjs'
import { USER_ROLES, LOYALTY_TIERS } from '../config/constants.js'

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Product.deleteMany({})
    await Category.deleteMany({})
    await Inventory.deleteMany({})

    // Create categories
    const categories = await Category.create([
      { name: 'Curd', slug: 'curd', description: 'Fresh and creamy curd made from pure cow milk', image: '' },
      { name: 'Buttermilk', slug: 'buttermilk', description: 'Cool and refreshing traditional buttermilk', image: '' },
      { name: 'Ghee', slug: 'ghee', description: 'Pure and aromatic cow ghee made with bilona method', image: '' },
      { name: 'Paneer', slug: 'paneer', description: 'Soft and fresh paneer for your culinary needs', image: '' },
      { name: 'Sweets', slug: 'sweets', description: 'Traditional milk sweets like palkova', image: '' },
      { name: 'Butter', slug: 'butter', description: 'Rich and creamy farm-fresh butter', image: '' },
    ])
    console.log('Categories seeded')

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@oncemore.com',
      password: 'once123',
      role: USER_ROLES.ADMIN,
      tier: LOYALTY_TIERS.PLATINUM,
    })
    console.log('Admin user seeded')

    // Create test user
    await User.create({
      name: 'Eleanor Vance',
      email: 'eleanor@example.com',
      password: 'user123',
      phone: '+91 8124008966',
      role: USER_ROLES.USER,
      tier: LOYALTY_TIERS.GOLD,
      loyaltyPoints: 12550,
    })
    console.log('Test user seeded')

    // Create products
    const products = await Product.create([
      {
        name: 'Farm Fresh Curd',
        slug: 'farm-fresh-curd',
        category: categories[0]._id,
        price: 45,
        originalPrice: 55,
        discount: 18,
        description: 'Thick, creamy farm-fresh curd made from pure cow milk. Naturally fermented with live cultures for a tangy, wholesome taste.',
        images: ['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop'],
        badge: 'Best Seller',
        rating: 4.8,
        reviews: 342,
        sku: 'OMCURD-500G',
        sizes: [250, 500, 1000],
      },
      {
        name: 'Traditional Buttermilk',
        slug: 'traditional-buttermilk',
        category: categories[1]._id,
        price: 25,
        originalPrice: 30,
        discount: 17,
        description: 'Cool, refreshing traditional buttermilk churned from fresh curd. A perfect summer drink that aids digestion and keeps you hydrated.',
        images: ['https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=600&h=600&fit=crop'],
        badge: '-17%',
        rating: 4.6,
        reviews: 189,
        sku: 'OMBTM-500ML',
        sizes: [250, 500, 1000],
      },
      {
        name: 'Pure Cow Ghee',
        slug: 'pure-cow-ghee',
        category: categories[2]._id,
        price: 350,
        originalPrice: 420,
        discount: 17,
        description: 'Aromatic, golden pure cow ghee made from hand-churned butter using the traditional bilona method. Rich in omega-3 and vitamins.',
        images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=600&fit=crop'],
        badge: '-17%',
        rating: 4.9,
        reviews: 278,
        sku: 'OMGHEE-500ML',
        sizes: [200, 500, 1000],
      },
      {
        name: 'Farm Fresh Paneer',
        slug: 'farm-fresh-paneer',
        category: categories[3]._id,
        price: 120,
        originalPrice: null,
        discount: null,
        description: 'Soft, fresh, and crumbly paneer made daily from pure cow milk. No preservatives, no additives - just pure farm goodness.',
        images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=600&fit=crop'],
        badge: 'NEW',
        rating: 4.7,
        reviews: 98,
        sku: 'OMPAN-200G',
        sizes: [200, 500],
      },
      {
        name: 'Premium Palkova',
        slug: 'premium-palkova',
        category: categories[4]._id,
        price: 180,
        originalPrice: null,
        discount: null,
        description: 'Rich, melt-in-your-mouth milk sweet made from pure milk and sugar. A traditional delicacy perfect for festivals and celebrations.',
        images: ['https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=600&h=600&fit=crop'],
        badge: 'Premium',
        rating: 4.9,
        reviews: 156,
        sku: 'OMPAL-250G',
        sizes: [250, 500],
      },
      {
        name: 'Fresh Butter',
        slug: 'fresh-butter',
        category: categories[5]._id,
        price: 90,
        originalPrice: 110,
        discount: 18,
        description: 'Rich and creamy farm-fresh butter churned from pure cow milk. Perfect for cooking, baking, and spreading on your favorite bread.',
        images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop'],
        badge: '-18%',
        rating: 4.7,
        reviews: 203,
        sku: 'OMBUT-500G',
        sizes: [100, 250, 500],
      },
    ])
    console.log('Products seeded')

    // Create inventory for products
    await Inventory.create([
      { product: products[0]._id, stockQuantity: 50, lowStockThreshold: 10 },
      { product: products[1]._id, stockQuantity: 30, lowStockThreshold: 10 },
      { product: products[2]._id, stockQuantity: 25, lowStockThreshold: 10 },
      { product: products[3]._id, stockQuantity: 15, lowStockThreshold: 5 },
    ])
    console.log('Inventory seeded')

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedData()
