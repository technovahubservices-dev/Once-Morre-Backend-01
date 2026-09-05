# CaratLane Backend

Node.js + Express.js + MongoDB backend for the CaratLane jewellery e-commerce website.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── constants.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── wishlistController.js
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   └── inventoryController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   ├── Wishlist.js
│   │   ├── Order.js
│   │   ├── Address.js
│   │   └── Inventory.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── userRoutes.js
│   │   └── inventoryRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   └── inventoryService.js
│   ├── utils/
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   └── helpers.js
│   └── server.js
├── .env
└── package.json
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your MongoDB connection string and JWT secret.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Seed the database with sample data (optional):
   ```bash
   npm run seed
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile
- POST `/api/auth/forgot-password` - Request password reset
- PUT `/api/auth/reset-password/:token` - Reset password

### Products
- GET `/api/products` - Get all products (with pagination, filters)
- GET `/api/products/:id` - Get product by ID
- POST `/api/products` - Create product (admin)
- PUT `/api/products/:id` - Update product (admin)
- DELETE `/api/products/:id` - Delete product (admin)
- GET `/api/products/featured` - Get featured products

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/:id` - Get category by ID
- POST `/api/categories` - Create category (admin)
- PUT `/api/categories/:id` - Update category (admin)
- DELETE `/api/categories/:id` - Delete category (admin)

### Cart
- GET `/api/cart` - Get user's cart
- POST `/api/cart/add` - Add item to cart
- PUT `/api/cart/update/:itemId` - Update cart item quantity
- DELETE `/api/cart/remove/:itemId` - Remove item from cart
- DELETE `/api/cart/clear` - Clear cart

### Wishlist
- GET `/api/wishlist` - Get user's wishlist
- POST `/api/wishlist/add` - Add item to wishlist
- DELETE `/api/wishlist/remove/:productId` - Remove item from wishlist
- DELETE `/api/wishlist/clear` - Clear wishlist

### Orders
- GET `/api/orders` - Get user's orders
- GET `/api/orders/:id` - Get order by ID
- POST `/api/orders` - Create new order
- PUT `/api/orders/:id/status` - Update order status (admin)
- PUT `/api/orders/:id/cancel` - Cancel order

### Users
- GET `/api/users` - Get all users (admin)
- GET `/api/users/:id` - Get user by ID (admin)
- PUT `/api/users/:id` - Update user (admin)
- DELETE `/api/users/:id` - Delete user (admin)

### Inventory
- GET `/api/inventory` - Get all inventory (admin)
- GET `/api/inventory/:productId` - Get inventory by product ID
- PUT `/api/inventory/:productId` - Update inventory (admin)
- GET `/api/inventory/low-stock` - Get low stock products (admin)
