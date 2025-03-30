# HarvestHub - Agricultural E-Commerce Platform 🌾

## Revolutionizing Agricultural Commerce

HarvestHub is a cutting-edge agricultural e-commerce platform that bridges the gap between farmers and consumers, fostering sustainable farming practices while creating a transparent and efficient marketplace for agricultural products. Our platform combines traditional farming wisdom with modern technology to create a seamless ecosystem for agricultural commerce.

### 🌟 Why HarvestHub?

- **Direct Farm-to-Consumer Connection**: Eliminate intermediaries and ensure fair prices for both farmers and consumers
- **Sustainable Agriculture**: Promote eco-friendly farming practices and support local agricultural communities
- **Smart Technology Integration**: Leverage AI and ML for disease detection, crop recommendations, and market insights
- **Transparent Operations**: Build trust through verified farmer profiles, quality certifications, and real-time tracking

### 🎯 Our Mission

To empower farmers with modern technology and connect them directly with consumers, creating a sustainable and profitable agricultural ecosystem that benefits all stakeholders while promoting environmental consciousness.

### 💡 Our Vision

To become the world's leading agricultural e-commerce platform, setting new standards in sustainable farming practices, technological innovation, and community engagement.

## 🌟 Features

### For Farmers 🚜

1. **Profile Management**
   - Create and manage farmer profiles
   - Upload farm images and videos
   - Add farm location and description
   - Track total orders and ratings
   - Share farming journey and success stories

2. **Product Management**
   - List agricultural products
   - Set prices and available quantities
   - Add product descriptions and images
   - Manage product inventory
   - Automatic price adjustments based on expiry dates
   

3. **Order Management**
   - View incoming orders
   - Accept/reject orders with reason
   - Track order status
   - View order history
   - Automated order notifications
   - Bulk order processing
   - Order analytics dashboard

4. **Soil Certification**
   - Upload soil certification documents
   - Get verification status
   - Track certification expiry
   - Digital certification storage

5. **Smart Farming Tools**
   - Disease detection using AI
   - Crop recommendation system
   - Weather forecasting integration

### For Consumers 🛒

1. **User Profile**
   - Create consumer accounts
   - Manage delivery addresses
   - Track order history
   - Save favorite products/farmers
   - Personalized recommendations

2. **Shopping Experience**
   - Browse products by category
   - Search products and farmers
   - View product details and farm information
   - Add items to cart
   - Virtual farm tours
   - Live market prices
   - Price comparison across farmers
   - Automatic expiry-based discounts
   - Bulk purchase discounts

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

5. **Trust & Transparency**
   - Detailed farmer profiles
   - Farm verification badges
   - Product traceability
   - Quality assurance certificates

### Smart Features 🤖

1. **AI-Powered Assistant**
   - 24/7 chatbot support
   - Product recommendations
   - Farming advice
   - Disease detection
   - Market trend analysis
   - Price predictions

2. **Government Schemes**
   - Latest scheme notifications
   - Application assistance
   - Document verification
   - Status tracking
   - Scheme eligibility checker

3. **Market Intelligence**
   - Live market prices
   - Price trends
   - Local market insights

### Admin Features 👨‍💼

1. **User Management**
   - Manage farmer and consumer accounts
   - Review and approve registrations
   - Handle user reports and issues
   - User activity monitoring
   - Account verification system

2. **Content Management**
   - Manage product categories
   - Review product listings
   - Monitor user reviews


3. **Certification Management**
   - Review soil certification requests
   - Approve/reject certifications
   - Track certification status

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
   - Live market data
   - Weather updates


## 🚀 Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Axios for API requests
- Context API for state management
- Chart.js for analytics
- TensorFlow.js for AI features

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
- Weather API integration
- Payment gateway APIs

### AI & ML Services
- TensorFlow for disease detection
- OpenAI for chatbot
- Custom ML models for predictions
- Image recognition
- Natural Language Processing
- Recommendation engine

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
   WEATHER_API_KEY=your_weather_api_key

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
- PUT `/api/reviews/:id` - Update review
- DELETE `/api/reviews/:id` - Delete review
- GET `/api/reviews/analytics` - Get review analytics

### AI & ML Endpoints
- POST `/api/ai/disease-detection` - Detect plant diseases
- POST `/api/ai/crop-recommendation` - Get crop recommendations
- POST `/api/ai/price-prediction` - Predict product prices
- GET `/api/ai/market-insights` - Get market insights
- POST `/api/ai/chat` - AI chatbot interaction

### Government Schemes
- GET `/api/schemes` - Get available schemes
- POST `/api/schemes/apply` - Apply for scheme
- GET `/api/schemes/status` - Check application status
- GET `/api/schemes/eligibility` - Check scheme eligibility



