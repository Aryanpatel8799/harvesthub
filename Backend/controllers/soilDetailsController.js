const SoilDetails = require('../db_models/SoilDetails');
const multer = require('multer');
const path = require('path');

// Configure multer for certificate upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/certificates/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
}).single('certificate');

// Submit soil details
exports.submitSoilDetails = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      console.log('submitSoilDetails called');
      console.log('User ID:', req.user._id);
      console.log('Request body:', req.body);
      console.log('Request file:', req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file uploaded');

      if (!req.file) {
        return res.status(400).json({ message: 'No certificate uploaded' });
      }

      const certificateUrl = `/uploads/certificates/${req.file.filename}`;
      
      // Parse numeric values from form data
      const soilDetails = {
        farmer: req.user._id,
        soilType: req.body.soilType,
        pH: parseFloat(req.body.pH) || 0,
        organicMatter: parseFloat(req.body.organicMatter) || 0,
        nitrogen: parseFloat(req.body.nitrogen) || 0,
        phosphorus: parseFloat(req.body.phosphorus) || 0,
        potassium: parseFloat(req.body.potassium) || 0,
        certificateUrl,
        status: 'pending'
      };
      
      console.log('Creating soil details record:', soilDetails);

      // Create or update soil details for this farmer
      const result = await SoilDetails.findOneAndUpdate(
        { farmer: req.user._id },
        soilDetails,
        { upsert: true, new: true }
      );
      
      console.log('Soil details saved successfully:', result._id);

      res.status(201).json({
        message: 'Soil details submitted successfully',
        soilDetails: result
      });
    } catch (error) {
      console.error('Submit soil details error:', error);
      res.status(500).json({ message: 'Error submitting soil details' });
    }
  });
};

// Get farmer's soil details
exports.getFarmerSoilDetails = async (req, res) => {
  try {
    const soilDetails = await SoilDetails.findOne({ farmer: req.params.farmerId })
      .sort('-createdAt');

    if (!soilDetails) {
      return res.status(404).json({ message: 'No soil details found' });
    }

    res.json(soilDetails);
  } catch (error) {
    console.error('Get soil details error:', error);
    res.status(500).json({ message: 'Error fetching soil details' });
  }
};

// Get all pending certifications (admin only)
exports.getPendingCertifications = async (req, res) => {
  try {
    const SoilCertification = require('../db_models/SoilCertification');
    const User = require('../db_models/User');
    
    console.log('getPendingCertifications called from admin panel');
    console.log('Admin ID:', req.user._id);
    
    // Find all certifications for admin panel
    const certifications = await SoilCertification.find({})
      // Populate with User model only
      .populate({
        path: 'farmer',
        model: User,
        select: 'fullName email phone'
      })
      .sort('-createdAt');
    
    console.log(`Found ${certifications.length} certifications (all statuses) for admin panel`);
    
    // Log a sample of the first certification
    if (certifications.length > 0) {
      const sample = certifications[0];
      console.log('Sample certification for admin:', {
        id: sample._id,
        status: sample.status,
        certificateFile: sample.certificateFile,
        farmName: sample.farmName,
        farmer: sample.farmer ? {
          id: sample.farmer._id,
          name: sample.farmer.fullName,
          email: sample.farmer.email
        } : 'No farmer data (null)'
      });
      
      // If farmer is null, try to find the user data directly
      if (!sample.farmer) {
        console.log('Farmer reference is null, checking if farmerId exists in SoilCertification document');
        console.log('Raw certification document:', JSON.stringify(sample.toObject()));
      }
    } else {
      console.log('No certifications found in the database at all');
    }

    res.json(certifications);
  } catch (error) {
    console.error('Fetch certifications error:', error);
    res.status(500).json({ message: 'Error fetching certifications' });
  }
};

// Update certification status (admin only)
exports.updateCertificationStatus = async (req, res) => {
  try {
    const SoilCertification = require('../db_models/SoilCertification');
    console.log('updateCertificationStatus called with params:', req.params);
    console.log('Request body:', req.body);
    
    const { certificationId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Use SoilCertification model instead of SoilDetails
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
    
    console.log('Certification updated successfully:', {
      id: certification._id,
      status: certification.status
    });

    res.json({
      message: 'Certification status updated successfully',
      certification
    });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({ message: 'Error updating certification status' });
  }
}; 