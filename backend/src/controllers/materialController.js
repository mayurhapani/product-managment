const { pool } = require('../config/db');

// Get all materials
const getMaterials = async (req, res) => {
  try {
    const [materials] = await pool.query('SELECT * FROM material ORDER BY material_name');
    
    res.status(200).json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
};

module.exports = {
  getMaterials
}; 