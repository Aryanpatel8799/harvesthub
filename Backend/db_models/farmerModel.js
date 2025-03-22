const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const farmerSchema = new mongoose.Schema({
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
    location: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    farmSize: {
        type: String,
        trim: true,
        default: ''
    },
    cropTypes: {
        type: String,
        trim: true,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    farmImages: [{
        url: String,
        caption: String
    }],
    farmVideos: [{
        url: String,
        caption: String
    }],
    totalOrders: {
        type: Number,
        default: 0
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
farmerSchema.pre('save', async function(next) {
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
farmerSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to get public profile (exclude sensitive data)
farmerSchema.methods.toPublicProfile = function() {
    const farmer = this.toObject();
    delete farmer.password;
    farmer.type = 'farmer';
    return farmer;
};

farmerSchema.methods.generateAuthToken = function(){
    const token=jwt.sign({id:this._id, type: 'farmer'},process.env.JWT_SECRET_KEY,{expiresIn:'24h'});
    return token;
}

farmerSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password,10);
}

const Farmer = mongoose.model("farmer",farmerSchema);

module.exports=Farmer;
