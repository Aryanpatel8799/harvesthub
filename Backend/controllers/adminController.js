const Farmer = require('../db_models/farmerModel');
const Consumer = require('../db_models/consumerModel');
const Admin = require('../db_models/Admin');
const SoilCertification = require('../db_models/SoilCertification');
const jwt = require('jsonwebtoken');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [farmersCount, consumersCount, ordersCount, pendingCertificationsCount] = await Promise.all([
      Farmer.countDocuments(),
      Consumer.countDocuments(),
      Order.countDocuments(),
      SoilCertification.countDocuments({ status: 'pending' })
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly order trends
    const monthlyOrders = await Order.aggregate([
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
      { $limit: 12 }
    ]);

    res.json({
      stats: {
        totalFarmers: farmersCount,
        totalConsumers: consumersCount,
        totalOrders: ordersCount,
        pendingCertifications: pendingCertificationsCount
      },
      ordersByStatus,
      monthlyOrders
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get all pending certifications
exports.getPendingCertifications = async (req, res) => {
  try {
    const certifications = await SoilCertification.find({ status: 'pending' })
      .populate('farmer', 'name email phone')
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

    const certification = await SoilCertification.findById(certificationId);
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

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

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
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
}; 