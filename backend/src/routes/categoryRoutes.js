const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');

// Get all categories
router.get('/', getCategories);

module.exports = router; 