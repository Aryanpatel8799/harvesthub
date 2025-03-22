// filepath: c:\Users\Aryan\OneDrive\Desktop\harvesthubai\Backend\server.js
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./DB/DB_connect');
const port = process.env.PORT || 3000;

// Connect to MongoDB first
connectDB().then(() => {
    // Import and initialize app only after DB connection
    const app = require('./app');
    
    // Start server
    app.listen(4000, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`MongoDB connected successfully`);
    }).on('error', (err) => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});