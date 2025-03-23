const SoilCertification = require('../db_models/SoilCertification');
const User = require('../db_models/User');
const Order = require('../db_models/Order');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const certificateDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certificateDir)) {
  fs.mkdirSync(certificateDir, { recursive: true });
}

/**
 * Upload a new soil certification
 * @route POST /api/soil
 * @access Private - Farmers only
 */
exports.uploadCertificate = async (req, res) => {
  try {
    console.log('uploadCertificate called with data:', {
      body: Object.keys(req.body),
      file: req.file ? {
        fieldname: req.file.fieldname,
        filename: req.file.filename,
        size: req.file.size
      } : 'No file'
    });

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({ message: 'Certificate file is required' });
    }

    if (!req.body.farmName) {
      return res.status(400).json({ message: 'Farm name is required' });
    }

    // Parse components
    let components = [];
    try {
      if (req.body.components) {
        components = JSON.parse(req.body.components);
        if (!Array.isArray(components)) {
          throw new Error('Components must be an array');
        }
        // Validate each component
        components = components.map(comp => ({
          name: comp.name,
          value: parseFloat(comp.value),
          unit: comp.unit,
          isNatural: Boolean(comp.isNatural)
        }));
      }
    } catch (error) {
      console.error('Error parsing components:', error);
      return res.status(400).json({ message: 'Invalid components data format' });
    }

    // Create the certification record
    const certification = new SoilCertification({
      farmer: req.user._id,
      farmName: req.body.farmName,
      certificateFile: req.file.filename,
      components: components,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the certification
    const savedCertification = await certification.save();
    console.log('Certification saved successfully:', savedCertification._id);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Certification submitted successfully',
      certification: {
        _id: savedCertification._id,
        farmName: savedCertification.farmName,
        status: savedCertification.status,
        components: savedCertification.components,
        certificateFile: savedCertification.certificateFile,
        createdAt: savedCertification.createdAt
      }
    });

  } catch (error) {
    console.error('Upload certificate error:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle file system errors
    if (error.code === 'ENOENT') {
      return res.status(500).json({
        success: false,
        message: 'File system error. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get all certifications for a farmer
 * @route GET /api/soil
 * @access Private - Farmers only
 */
exports.getFarmerCertifications = async (req, res) => {
  try {
    console.log('Getting certifications for farmer:', req.user._id);
    
    const certifications = await SoilCertification.find({ 
      farmer: req.user._id 
    }).sort({ createdAt: -1 });

    console.log(`Found ${certifications.length} certifications for farmer ${req.user._id}`);
    
    // Log the first certification for debugging
    if (certifications.length > 0) {
      console.log('Sample certification:', {
        id: certifications[0]._id,
        farmName: certifications[0].farmName,
        certificateFile: certifications[0].certificateFile,
        status: certifications[0].status,
        components: certifications[0].components.length
      });
    }

    res.status(200).json(certifications);
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * Get all pending certifications - Admin only
 * @route GET /api/soil/pending
 * @access Private - Admin only
 */
exports.getPendingCertifications = async (req, res) => {
  try {
    console.log('Fetching pending certifications...');
    
    // First check if we have any certifications
    const certCount = await SoilCertification.countDocuments({ status: 'pending' });
    console.log('Found pending certifications count:', certCount);

    const certifications = await SoilCertification.find({ 
      status: 'pending' 
    })
    .populate({
      path: 'farmer',
      model: 'User',
      select: 'fullName email role location description profileImage'
    })
    .sort({ createdAt: -1 });

    console.log(`Found ${certifications.length} pending certifications`);

    // Transform the data to match frontend expectations
    const formattedCertifications = await Promise.all(certifications.map(async cert => {
      console.log('Processing certification:', cert._id);
      console.log('Raw farmer data:', cert.farmer);

      // If farmer is not populated, try to fetch directly
      let farmerData = cert.farmer;
      if (!farmerData && cert.farmer) {
        try {
          farmerData = await User.findById(cert.farmer).select('fullName email role location description profileImage');
          console.log('Fetched farmer data directly:', farmerData);
        } catch (err) {
          console.error('Error fetching farmer data:', err);
        }
      }
      
      return {
        _id: cert._id,
        farmer: {
          _id: farmerData?._id || cert.farmer,
          fullName: farmerData?.fullName || 'Unknown',
          email: farmerData?.email || 'No email',
          role: farmerData?.role || 'farmer',
          location: farmerData?.location || 'No location',
          description: farmerData?.description || '',
          profileImage: farmerData?.profileImage || null
        },
        farmName: cert.farmName,
        certificateFile: cert.certificateFile,
        components: cert.components || [],
        status: cert.status,
        createdAt: cert.createdAt,
        updatedAt: cert.updatedAt,
        rejectionReason: cert.rejectionReason
      };
    }));

    console.log('Sending formatted certifications:', formattedCertifications.length);
    console.log('Sample formatted certification:', formattedCertifications[0]);
    res.status(200).json(formattedCertifications);
  } catch (error) {
    console.error('Get pending certifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * Update certification status - Admin only
 * @route PUT /api/soil/:id
 * @access Private - Admin only
 */
exports.updateCertificationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Status must be approved or rejected.' 
      });
    }
    
    const certification = await SoilCertification.findById(req.params.id);
    
    if (!certification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certification not found' 
      });
    }
    
    certification.status = status;
    
    if (status === 'rejected' && rejectionReason) {
      certification.rejectionReason = rejectionReason;
    }
    
    await certification.save();
    
    res.status(200).json({
      success: true,
      message: `Certification ${status}`,
      certification
    });
  } catch (error) {
    console.error('Update certification status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * Get dashboard statistics - Admin only
 * @route GET /api/soil/certifications/stats
 * @access Private - Admin only
 */
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard statistics...');

    // Initialize default stats object
    const stats = {
      totalFarmers: 0,
      totalConsumers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      orders: {
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
      },
      pendingCertifications: 0,
      approvedCertifications: 0,
      rejectedCertifications: 0
    };

    try {
      // Get total farmers count
      stats.totalFarmers = await User.countDocuments({ role: 'farmer' });
      console.log('Total farmers:', stats.totalFarmers);

      // Get total consumers count
      stats.totalConsumers = await User.countDocuments({ role: 'consumer' });
      console.log('Total consumers:', stats.totalConsumers);
    } catch (error) {
      console.error('Error fetching user counts:', error);
    }

    try {
      // Get orders statistics safely
      const orderStats = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } }
          }
        }
      ]).exec();

      // Process order stats if they exist
      if (orderStats && orderStats.length > 0) {
        orderStats.forEach(stat => {
          stats.totalOrders += stat.count;
          stats.totalRevenue += stat.totalAmount || 0;
          if (stat._id === 'pending') stats.orders.pending = stat.count;
          if (stat._id === 'completed') stats.orders.completed = stat.count;
          if (stat._id === 'cancelled') stats.orders.cancelled = stat.count;
        });
        stats.orders.total = stats.totalOrders;
      }
      console.log('Order summary:', stats.orders);
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }

    try {
      // Get certification counts by status
      const certificationStats = await SoilCertification.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).exec();

      // Process certification stats if they exist
      if (certificationStats && certificationStats.length > 0) {
        certificationStats.forEach(stat => {
          if (stat._id === 'pending') stats.pendingCertifications = stat.count;
          if (stat._id === 'approved') stats.approvedCertifications = stat.count;
          if (stat._id === 'rejected') stats.rejectedCertifications = stat.count;
        });
      }
      console.log('Certification stats:', {
        pending: stats.pendingCertifications,
        approved: stats.approvedCertifications,
        rejected: stats.rejectedCertifications
      });
    } catch (error) {
      console.error('Error fetching certification stats:', error);
    }

    console.log('Final dashboard stats:', stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get recent certification activity - Admin only
 * @route GET /api/soil/certifications/recent-activity
 * @access Private - Admin only
 */
exports.getRecentActivity = async (req, res) => {
  try {
    console.log('Fetching recent certification activity...');
    
    // Get the 10 most recent certification activities
    const recentActivity = await SoilCertification.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate({
        path: 'farmer',
        model: 'User',
        select: 'fullName email role location description profileImage'
      })
      .select('status createdAt updatedAt farmer farmName components certificateFile');

    const formattedActivity = await Promise.all(recentActivity.map(async activity => {
      // If farmer is not populated, try to fetch directly
      let farmerData = activity.farmer;
      if (!farmerData && activity.farmer) {
        try {
          farmerData = await User.findById(activity.farmer).select('fullName email role location description profileImage');
          console.log('Fetched farmer data directly:', farmerData);
        } catch (err) {
          console.error('Error fetching farmer data:', err);
        }
      }

      return {
        _id: activity._id,
        status: activity.status,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        farmName: activity.farmName,
        farmer: {
          _id: farmerData?._id || activity.farmer,
          fullName: farmerData?.fullName || 'Unknown Farmer',
          email: farmerData?.email || 'No email',
          role: farmerData?.role || 'farmer',
          location: farmerData?.location || 'No location',
          description: farmerData?.description || '',
          profileImage: farmerData?.profileImage || null
        },
        certificateFile: activity.certificateFile,
        components: activity.components || []
      };
    }));

    console.log(`Found ${formattedActivity.length} recent activities`);
    console.log('Sample activity:', formattedActivity[0]);
    res.status(200).json(formattedActivity);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.'
    });
  }
}; 