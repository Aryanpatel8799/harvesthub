const Farmer = require('../db_models/farmerModel');
const Consumer = require('../db_models/consumerModel');
const Admin = require('../db_models/Admin');
const SoilDetails = require('../db_models/SoilDetails');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for farmers, consumers, and certifications
    const [
      totalFarmers,
      totalConsumers,
      pendingCertifications,
      approvedCertifications,
      rejectedCertifications
    ] = await Promise.all([
      Farmer.countDocuments(),
      Consumer.countDocuments(),
      SoilDetails.countDocuments({ status: 'pending' }),
      SoilDetails.countDocuments({ status: 'approved' }),
      SoilDetails.countDocuments({ status: 'rejected' })
    ]);

    // Get monthly certification trends
    const monthlyCertifications = await SoilDetails.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 } // Last 12 months
    ]);

    // Get certifications by status
    const ordersByStatus = await SoilDetails.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await SoilDetails.find()
      .populate('farmer', 'fullName email')
      .sort('-createdAt')
      .limit(5)
      .select('status createdAt updatedAt');

    // Get farmer growth trend
    const farmerGrowth = await Farmer.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 } // Last 6 months
    ]);

    res.json({
      stats: {
        totalFarmers,
        totalConsumers,
        totalOrders: pendingCertifications + approvedCertifications + rejectedCertifications,
        pendingCertifications,
        approvedCertifications,
        rejectedCertifications
      },
      ordersByStatus,
      monthlyOrders: monthlyCertifications,
      recentActivity,
      farmerGrowth
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get all pending certifications
exports.getPendingCertifications = async (req, res) => {
  try {
    const certifications = await SoilDetails.find({ status: 'pending' })
      .populate('farmer', 'fullName email phone')
      .sort('-createdAt');

    res.json(certifications);
  } catch (error) {
    console.error('Fetch certifications error:', error);
    res.status(500).json({ message: 'Error fetching pending certifications' });
  }
};

// Update certification status
exports.updateCertificationStatus = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const certification = await SoilDetails.findById(certificationId);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    certification.status = status;
    if (status === 'rejected') {
      certification.rejectionReason = rejectionReason;
    } else {
      certification.approvedBy = req.user._id;
      certification.approvedAt = new Date();
    }

    await certification.save();

    res.json({ message: 'Certification status updated successfully', certification });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({ message: 'Error updating certification status' });
  }
};

// Register admin (only super admin can create new admins)
exports.registerAdmin = async (req, res) => {
  try {
    // Check if the requesting user is a super admin
    if (req.user.role !== 'super') {
      return res.status(403).json({ message: 'Only super admins can create new admins' });
    }

    const { fullName, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create new admin
    const admin = await Admin.create({
      fullName,
      email,
      password,
      role: role || 'manager'
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Error registering admin' });
  }
};

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login time without triggering validation
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: Date.now() }, { validateBeforeSave: false });

    // Generate token
    const token = admin.generateAuthToken();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

// Logout admin
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
}; 