# Deploying HarvestHub Frontend on Render

## Prerequisites

1. ✅ Backend deployed and working at: `http://localhost:4000`
2. Frontend code ready for deployment
3. Render account

## Step 1: Update Environment Variables

Your frontend is now configured to automatically use the deployed backend URL in production. The `API_BASE_URL` in `src/config/api.ts` will automatically switch to:
- **Production**: `http://localhost:4000`
- **Development**: `http://localhost:8080`

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. **Add frontend service to render.yaml**:
   ```yaml
   services:
     - type: web
       name: harvesthub-backend
       env: node
       plan: free
       rootDir: Backend
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
         # ... other backend env vars

     - type: web
       name: harvesthub-frontend
       env: static
       plan: free
       buildCommand: npm install && npm run build
       staticPublishPath: ./dist
       envVars:
         - key: NODE_ENV
           value: production
   ```

2. **Push to GitHub and deploy**:
   ```bash
   git add .
   git commit -m "Add frontend deployment configuration"
   git push origin main
   ```

3. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will deploy both services

### Option B: Manual Frontend Deployment

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New" → "Static Site"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: harvesthub-frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

## Step 3: Environment Variables for Frontend

Set these environment variables in your Render frontend service:

```
NODE_ENV=production
VITE_API_BASE_URL=http://localhost:4000
```

## Step 4: Update Backend CORS (Important!)

After deploying your frontend, update the backend's `CLIENT_URL` environment variable:

1. Go to your backend service on Render
2. Navigate to "Environment" tab
3. Update `CLIENT_URL` to your frontend URL (e.g., `https://harvesthub-frontend.onrender.com`)
4. Redeploy the backend service

## Step 5: Testing

After deployment, test these endpoints:

1. **Frontend**: Visit your frontend URL
2. **Backend API**: `http://localhost:4000/`
3. **Products API**: `http://localhost:4000/api/products`

## Step 6: AI Service (Optional)

The Disease Detection feature uses a separate AI service. You have two options:

### Option A: Deploy AI Service Separately
- Deploy the AI service (currently on localhost:5000) to Render or another platform
- Update the URL in `src/pages/DiseaseDetection.tsx`

### Option B: Disable AI Feature Temporarily
- Comment out the AI prediction functionality
- Focus on core marketplace features first

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CLIENT_URL` in backend matches your frontend URL
2. **Build Failures**: Check if all dependencies are in `package.json`
3. **API Connection**: Verify the backend URL is correct in `src/config/api.ts`

### Debug Commands:

```bash
# Test backend
curl http://localhost:4000/

# Test products API
curl http://localhost:4000/api/products
```

## Production Considerations

1. **Domain**: Consider using a custom domain
2. **SSL**: Render provides SSL automatically
3. **Performance**: Monitor and optimize as needed
4. **Monitoring**: Set up error tracking and analytics

## Next Steps

1. Deploy frontend
2. Update backend CORS settings
3. Test all features
4. Set up custom domain (optional)
5. Configure monitoring and analytics 