const { body, validationResult } = require('express-validator');

// Product validation rules
const productValidationRules = () => {
  return [
    body('product_name').notEmpty().withMessage('Product name is required'),
    body('SKU').notEmpty().withMessage('SKU is required'),
    body('category_id').isInt().withMessage('Valid category ID is required'),
    body('material_ids').notEmpty().withMessage('Material IDs are required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ];
};

// Validate request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  return res.status(400).json({
    success: false,
    errors: errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }))
  });
};

module.exports = {
  productValidationRules,
  validate
}; 