// Script to update backend CORS for Vercel deployment
// Run this after you get your Vercel domain

const fs = require('fs');
const path = require('path');

const backendAppPath = path.join(__dirname, 'Backend', 'app.js');

console.log('🔧 Updating Backend CORS for Vercel deployment...');
console.log('');

// Read the current app.js file
let appContent = fs.readFileSync(backendAppPath, 'utf8');

// Add your Vercel domain here (replace with your actual domain)
const vercelDomain = 'https://harvesthub-xxxxx.vercel.app'; // Replace with your actual Vercel domain

// Find the allowedOrigins array and add the Vercel domain
const corsPattern = /const allowedOrigins = \[([\s\S]*?)\];/;
const match = appContent.match(corsPattern);

if (match) {
  const currentOrigins = match[1];
  
  // Check if Vercel domain is already in the list
  if (!currentOrigins.includes(vercelDomain)) {
    // Add Vercel domain to the list
    const updatedOrigins = currentOrigins.replace(
      /(\s*'https:\/\/harvesthub\.onrender\.com',?\s*)/,
      `$1            '${vercelDomain}',\n`
    );
    
    const updatedContent = appContent.replace(corsPattern, `const allowedOrigins = [${updatedOrigins}];`);
    
    // Write the updated content back
    fs.writeFileSync(backendAppPath, updatedContent);
    
    console.log('✅ Successfully updated CORS settings!');
    console.log(`📍 Added domain: ${vercelDomain}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Commit and push the changes to GitHub');
    console.log('2. Redeploy your backend on Render');
    console.log('3. Test your deployed frontend with the backend');
  } else {
    console.log('ℹ️  Vercel domain already exists in CORS settings');
  }
} else {
  console.log('❌ Could not find CORS configuration in app.js');
  console.log('Please manually add your Vercel domain to the allowedOrigins array');
}

console.log('');
console.log('🔗 Your Vercel domain should be added to the allowedOrigins array like this:');
console.log(`   '${vercelDomain}',`); 