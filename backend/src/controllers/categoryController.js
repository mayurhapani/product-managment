const { pool } = require('../config/db');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM category ORDER BY category_name');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

module.exports = {
  getCategories
}; 