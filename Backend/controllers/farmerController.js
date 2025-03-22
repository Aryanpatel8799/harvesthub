// Upload soil certification
exports.uploadSoilCertification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const certificateUrl = `/uploads/certificates/${req.file.filename}`;

    const certification = await SoilCertification.create({
      farmer: req.user._id,
      certificateUrl,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Soil certification uploaded successfully',
      certification
    });
  } catch (error) {
    console.error('Upload certification error:', error);
    res.status(500).json({ message: 'Error uploading soil certification' });
  }
};

// Get farmer's soil certification
exports.getSoilCertification = async (req, res) => {
  try {
    const certification = await SoilCertification.findOne({ farmer: req.user._id })
      .sort('-createdAt');

    if (!certification) {
      return res.status(404).json({ message: 'No certification found' });
    }

    res.json(certification);
  } catch (error) {
    console.error('Get certification error:', error);
    res.status(500).json({ message: 'Error fetching soil certification' });
  }
}; 