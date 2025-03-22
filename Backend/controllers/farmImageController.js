const FarmImage = require('../db_models/FarmImage');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/farm-images/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
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
}).single('image');

// Upload farm image
exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      const farmImage = new FarmImage({
        farmer: req.user._id,
        imageUrl: `/uploads/farm-images/${req.file.filename}`,
        description: req.body.description
      });

      await farmImage.save();
      res.status(201).json({ success: true, data: farmImage });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
};

// Get farmer's images
exports.getFarmerImages = async (req, res) => {
  try {
    const images = await FarmImage.find({ farmer: req.params.farmerId })
      .sort('-uploadDate');
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete farm image
exports.deleteImage = async (req, res) => {
  try {
    const image = await FarmImage.findOneAndDelete({
      _id: req.params.imageId,
      farmer: req.user._id
    });

    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}; 