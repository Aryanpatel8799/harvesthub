const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../Middleware/authMiddleware');
const soilDetailsController = require('../controllers/soilDetailsController');

// Debug routes
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'Soil details routes are working',
    availableRoutes: [
      '/certifications/pending',
      '/:farmerId/soil-details',
      '/certifications/:certificationId'
    ]
  });
});

// Farmer routes
router.post('/:farmerId/soil-details', auth, soilDetailsController.submitSoilDetails);
router.get('/:farmerId/soil-details', auth, soilDetailsController.getFarmerSoilDetails);

// Admin routes
router.get('/certifications/pending', auth, adminOnly, soilDetailsController.getPendingCertifications);
router.put('/certifications/:certificationId', auth, adminOnly, soilDetailsController.updateCertificationStatus);

module.exports = router; 