const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Add connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            // Log additional details that might help diagnose the issue
            console.error('Connection state:', mongoose.connection.readyState);
            console.error('Database name:', mongoose.connection.name);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Log initial connection details
        console.log('Database name:', mongoose.connection.name);
        console.log('Connection state:', mongoose.connection.readyState);

        return mongoose.connection;

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        console.error('Connection details:', {
            uri: process.env.MONGODB_URI?.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://****:****@'),
            state: mongoose.connection.readyState
        });
        throw err;
    }
}

module.exports = connectDB;