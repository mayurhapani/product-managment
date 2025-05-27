const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getStatistics
} = require('../controllers/productController');
const { productValidationRules, validate } = require('../middleware/validator');

// Get all products with pagination and filtering
router.get('/', getProducts);

// Get product by ID
router.get('/:id', getProductById);

// Create new product
router.post('/', productValidationRules(), validate, createProduct);

// Update product
router.put('/:id', productValidationRules(), validate, updateProduct);

// Delete product
router.delete('/:id', deleteProduct);

// Get statistics
router.get('/stats/all', getStatistics);

module.exports = router; 