#!/bin/bash

echo "🚀 HarvestHub Backend Deployment Script"
echo "========================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo.git"
    exit 1
fi

echo "✅ Git repository found"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please create one with your environment variables:"
    echo "   cp .env.example .env"
    echo "   # Then edit .env with your actual values"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ Backend code is ready"
echo "2. ✅ render.yaml created"
echo "3. ✅ package.json updated for production"
echo "4. ✅ .gitignore created"
echo ""
echo "🔧 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to Render Dashboard:"
echo "   https://dashboard.render.com"
echo ""
echo "3. Create a new Web Service:"
echo "   - Connect your GitHub repository"
echo "   - Render will auto-detect the render.yaml"
echo "   - Set your environment variables"
echo ""
echo "4. Environment Variables to set in Render:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=your_mongodb_connection_string"
echo "   - JWT_SECRET=your_jwt_secret"
echo "   - SESSION_SECRET=your_session_secret"
echo "   - STRIPE_SECRET_KEY=your_stripe_key"
echo "   - STRIPE_WEBHOOK_SECRET=your_webhook_secret"
echo "   - CLIENT_URL=your_frontend_url"
echo ""
echo "🎉 Your backend will be deployed automatically!" 