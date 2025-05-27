const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const materialRoutes = require('./materialRoutes');

// Get all categories
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/materials', materialRoutes);

module.exports = router; 