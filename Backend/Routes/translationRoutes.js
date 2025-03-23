const express = require('express');
const router = express.Router();

// Default route for translations
router.get('/', (req, res) => {
  res.json({ message: 'Translations service is running' });
});

module.exports = router; 