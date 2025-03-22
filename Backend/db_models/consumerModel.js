const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const consumerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minLength: [2, 'Name must be at least 2 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters long']
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    preferences: {
        dietaryRestrictions: {
            type: [String],
            default: []
        },
        allergies: {
            type: [String],
            default: []
        },
        favoriteProducts: {
            type: [String],
            default: []
        }
    },
    avatar: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
consumerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
consumerSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Generate JWT token
consumerSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { id: this._id, type: 'consumer' },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '24h' }
    );
    return token;
};

// Method to get public profile (exclude sensitive data)
consumerSchema.methods.toPublicProfile = function() {
    const consumer = this.toObject();
    delete consumer.password;
    consumer.type = 'consumer';
    return consumer;
};

module.exports = mongoose.model('Consumer', consumerSchema); 