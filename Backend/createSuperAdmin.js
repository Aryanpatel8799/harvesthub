require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./db_models/Admin');

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harvesthub');
    console.log('Connected to MongoDB');

    // Delete any existing admin accounts (optional, uncomment if needed)
    // await Admin.deleteMany({});

    // Super admin credentials
    const superAdmin = {
      fullName: 'Super Admin',
      email: 'admin@harvesthub.com',
      password: 'Admin@123',
      role: 'super' // Must be either 'super' or 'manager'
    };

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ email: superAdmin.email });
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create super admin
    const admin = await Admin.create(superAdmin);
    console.log('Super admin created successfully:', {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role
    });

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the function
createSuperAdmin(); 