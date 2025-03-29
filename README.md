# HarvestHub - Agricultural E-Commerce Platform

HarvestHub is a comprehensive agricultural e-commerce platform that connects farmers directly with consumers, promoting sustainable farming practices and providing a transparent marketplace for agricultural products.

## 🌟 Features

### For Farmers 🚜

1. **Profile Management**
   - Create and manage farmer profiles
   - Upload farm images and videos
   - Add farm location and description
   - Track total orders and ratings

2. **Product Management**
   - List agricultural products
   - Set prices and available quantities
   - Add product descriptions and images
   - Manage product inventory

3. **Order Management**
   - View incoming orders
   - Accept/reject orders with reason
   - Track order status
   - View order history

4. **Soil Certification**
   - Upload soil certification documents
   - Get verification status
   - Track certification expiry

### For Consumers 🛒

1. **User Profile**
   - Create consumer accounts
   - Manage delivery addresses
   - Track order history
   - Save favorite products/farmers

2. **Shopping Experience**
   - Browse products by category
   - Search products and farmers
   - View product details and farm information
   - Add items to cart

3. **Order Processing**
   - Place orders
   - Track order status
   - Rate and review products
   - Contact farmers directly

4. **Payment Integration**
   - Secure payment processing
   - Multiple payment options
   - Order confirmation
   - Payment history

### Admin Features 👨‍💼

1. **User Management**
   - Manage farmer and consumer accounts
   - Review and approve registrations
   - Handle user reports and issues

2. **Content Management**
   - Manage product categories
   - Review product listings
   - Monitor user reviews
   - Handle reported content

3. **Certification Management**
   - Review soil certification requests
   - Approve/reject certifications
   - Track certification status
   - Send notifications

### Technical Features 🔧

1. **Authentication & Security**
   - JWT-based authentication
   - Role-based access control
   - Secure password handling
   - Session management

2. **Real-time Updates**
   - Order status notifications
   - Chat system for communication
   - Real-time inventory updates
   - Price change alerts

3. **Data Analytics**
   - Sales reports and trends
   - User behavior analytics
   - Product performance metrics
   - Market demand analysis

## 🚀 Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Axios for API requests
- Context API for state management

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Express Validator

### Cloud Services
- MongoDB Atlas for database
- Render for backend hosting
- Vercel for frontend hosting
- Cloudinary for media storage

## 📦 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/harvesthub.git
   cd harvesthub
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd Backend
   npm install

   # Install frontend dependencies
   cd ../Frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend .env
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url

   # Frontend .env
   VITE_API_URL=http://localhost:3000
   VITE_MODEL_URL=http://localhost:5000
   ```

4. **Run the Application**
   ```bash
   # Run backend
   cd Backend
   npm run dev

   # Run frontend
   cd Frontend
   npm run dev
   ```

## 📱 API Endpoints

### Authentication
- POST `/api/farmers/login` - Farmer login
- POST `/api/consumers/login` - Consumer login
- POST `/api/farmers/register` - Farmer registration
- POST `/api/consumers/register` - Consumer registration

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Orders
- GET `/api/orders/farmer` - Get farmer orders
- GET `/api/orders/consumer` - Get consumer orders
- POST `/api/orders` - Create order
- PATCH `/api/orders/:id/status` - Update order status

### Reviews
- POST `/api/products/:id/reviews` - Add product review
- GET `/api/products/:id/reviews` - Get product reviews

