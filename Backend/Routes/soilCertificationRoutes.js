const express = require('express');
const router = express.Router();
const { auth, farmerOnly, adminOnly } = require('../Middleware/authMiddleware');
const { 
  uploadCertificate, 
  getFarmerCertifications, 
  getPendingCertifications,
  updateCertificationStatus,
  getDashboardStats,
  getRecentActivity
} = require('../controllers/soilCertificationController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/certificates/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only .jpeg, .jpg, .png, and .pdf formats are allowed!'));
    }
  }
});

// Submit a new soil certification - protected route for farmers
router.post('/certifications/submit', auth, farmerOnly, upload.single('certificateFile'), uploadCertificate);

// Get farmer's soil certifications - protected route for farmers
router.get('/certifications/farmer', auth, farmerOnly, getFarmerCertifications);

// Get pending certifications - protected route for admins
router.get('/certifications/pending', auth, adminOnly, getPendingCertifications);

// Update certification status - protected route for admins
router.put('/certifications/:id/status', auth, adminOnly, updateCertificationStatus);

// Get dashboard statistics - protected route for admins
router.get('/certifications/stats', auth, adminOnly, getDashboardStats);

// Get recent activity - protected route for admins
router.get('/certifications/recent-activity', auth, adminOnly, getRecentActivity);

// Debug route for testing multer configuration
router.post('/certifications/test-upload', auth, farmerOnly, upload.single('certificateFile'), (req, res) => {
  try {
    console.log('Test upload endpoint called');
    console.log('File field name expected: certificateFile');
    console.log('File received:', req.file ? {
      fieldname: req.file.fieldname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');
    console.log('Body fields received:', Object.keys(req.body));
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    return res.status(200).json({ 
      message: 'File uploaded successfully for testing', 
      file: req.file,
      body: req.body
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return res.status(500).json({ message: 'Test upload failed', error: error.message });
  }
});

// Debug routes for troubleshooting
router.get('/debug', (req, res) => {
  res.json({
    message: 'Soil certification routes are working',
    endpoints: [
      { method: 'POST', path: '/certifications/submit', description: 'Submit a new soil certification' },
      { method: 'GET', path: '/certifications/farmer', description: 'Get farmer\'s soil certifications' },
      { method: 'GET', path: '/certifications/pending', description: 'Get pending certifications' },
      { method: 'PUT', path: '/certifications/:id/status', description: 'Update certification status' },
      { method: 'GET', path: '/certifications/stats', description: 'Get dashboard statistics' },
      { method: 'GET', path: '/certifications/recent-activity', description: 'Get recent certification activity' }
    ],
    uploadConfig: {
      destination: 'uploads/certificates/',
      sizeLimit: '5MB',
      allowedFormats: ['jpeg', 'jpg', 'png', 'pdf']
    }
  });
});

module.exports = router; 