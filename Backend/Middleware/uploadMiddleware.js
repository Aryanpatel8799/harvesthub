const multer = require('multer');
const path = require('path');
const fs = require('fs');
const process = require('process');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = ['products', 'farms'].map(dir => path.join(__dirname, '..', 'uploads', dir));
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create upload directories on startup
createUploadDirs();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination folder based on field name
    const folder = file.fieldname === 'productImages' ? 'products' : 'farms';
    const uploadPath = path.join(__dirname, '..', 'uploads', folder);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + safeFileName);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
    }
  }
});

// Create middleware that handles both product and farm images
const uploadMiddleware = upload.fields([
  { name: 'productImages', maxCount: 5 },
  { name: 'farmImages', maxCount: 5 }
]);

// Middleware to process uploaded files
const processUpload = (req, res, next) => {
  try {
    if (!req.files) {
      return next();
    }

    // Process product images
    if (req.files.productImages) {
      req.productImages = req.files.productImages.map(file => ({
        url: `/uploads/products/${file.filename}`,
        caption: 'Product image',
        fileName: file.filename,
        path: file.path
      }));
    }

    // Process farm images
    if (req.files.farmImages) {
      req.farmImages = req.files.farmImages.map(file => ({
        url: `/uploads/farms/${file.filename}`,
        caption: 'Farm image',
        fileName: file.filename,
        path: file.path
      }));
    }

    next();
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ 
      message: 'Error processing uploaded files',
      error: error.message 
    });
  }
};

// Export both the upload middleware and process function
module.exports = { 
  uploadMiddleware,
  processUpload 
}; 