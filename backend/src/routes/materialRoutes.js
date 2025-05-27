const express = require('express');
const router = express.Router();
const { getMaterials } = require('../controllers/materialController');

// Get all materials
router.get('/', getMaterials);

module.exports = router; 