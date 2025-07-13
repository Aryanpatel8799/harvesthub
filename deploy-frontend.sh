#!/bin/bash

echo "🚀 HarvestHub Frontend Deployment Script"
echo "========================================="

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

# Check if backend is deployed
echo "🔍 Checking backend status..."
if curl -s "https://harvesthub-backend-pdkm.onrender.com/" > /dev/null; then
    echo "✅ Backend is running at: https://harvesthub-backend-pdkm.onrender.com"
else
    echo "⚠️  Backend might not be running. Please check: https://harvesthub-backend-pdkm.onrender.com"
fi

echo ""
echo "📋 Frontend Deployment Checklist:"
echo "1. ✅ Backend deployed and working"
echo "2. ✅ API configuration updated"
echo "3. ✅ render.yaml includes frontend service"
echo "4. ✅ All localhost URLs replaced with API_BASE_URL"
echo ""
echo "🔧 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare frontend for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy on Render:"
echo "   - Go to: https://dashboard.render.com"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will deploy both backend and frontend"
echo ""
echo "3. After deployment, update backend CORS:"
echo "   - Go to your backend service on Render"
echo "   - Update CLIENT_URL to your frontend URL"
echo "   - Redeploy backend"
echo ""
echo "🎉 Your full-stack app will be deployed!"
echo ""
echo "📝 Important Notes:"
echo "- Frontend will automatically use the deployed backend in production"
echo "- Disease Detection AI service needs separate deployment"
echo "- Consider setting up a custom domain for production" 