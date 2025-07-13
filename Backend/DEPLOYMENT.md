# Deploying HarvestHub Backend on Render

## Prerequisites

1. A Render account (free tier available)
2. MongoDB Atlas account (free tier available)
3. Your backend code ready

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Set up your environment variables (see below)

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: harvesthub-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 3: Environment Variables

Set these environment variables in your Render service:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/harvesthub?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:8080
```

## Step 4: Important Notes

### File Uploads
- Render's free tier has ephemeral storage (files are lost on restart)
- For production, consider using:
  - AWS S3
  - Cloudinary
  - Supabase Storage

### Database
- Use MongoDB Atlas for production
- Ensure your connection string is correct
- Add Render's IP to MongoDB Atlas whitelist if needed

### CORS
- Currently set to `http://localhost:8080` for local development
- When you deploy your frontend, update `CLIENT_URL` to match your frontend domain
- The backend is configured to allow multiple origins

## Step 5: Testing

After deployment, test your API endpoints:

## Step 6: Updating Frontend URL (When Frontend is Deployed)

When you deploy your frontend, you'll need to update the `CLIENT_URL` environment variable:

1. Go to your Render service dashboard
2. Navigate to "Environment" tab
3. Update `CLIENT_URL` to your frontend domain (e.g., `https://your-frontend.onrender.com`)
4. Redeploy the service

The backend will automatically allow requests from the new frontend domain.

```bash
curl https://your-backend-name.onrender.com/
```

Expected response:
```json
{"message": "API is running"}
```

## Troubleshooting

1. **Build fails**: Check if all dependencies are in `package.json`
2. **Database connection fails**: Verify MongoDB URI and network access
3. **CORS errors**: Check `CLIENT_URL` environment variable
4. **File uploads not working**: Consider using cloud storage

## Production Considerations

1. **Security**: Use strong secrets for JWT and sessions
2. **Monitoring**: Set up logging and monitoring
3. **Backup**: Regular database backups
4. **SSL**: Render provides SSL certificates automatically
5. **Scaling**: Upgrade to paid plan for better performance 