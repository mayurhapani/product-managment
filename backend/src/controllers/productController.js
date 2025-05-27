const { pool } = require('../config/db');
const { encryptSKU, decryptSKU } = require('../utils/cryptoUtils');

// Get all products with pagination and filtering
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const queryParams = [];
    
    // Filter parameters
    const { sku, product_name, category_id, material_id, status } = req.query;
    
    if (sku || product_name || category_id || material_id || status) {
      whereClause = 'WHERE ';
      const conditions = [];
      
      if (sku) {
        conditions.push('SKU LIKE ?');
        queryParams.push(`%${sku}%`);
      }
      
      if (product_name) {
        conditions.push('product_name LIKE ?');
        queryParams.push(`%${product_name}%`);
      }
      
      if (category_id) {
        conditions.push('category_id = ?');
        queryParams.push(category_id);
      }
      
      if (material_id) {
        conditions.push('material_ids LIKE ?');
        queryParams.push(`%${material_id}%`);
      }
      
      if (status) {
        conditions.push('status = ?');
        queryParams.push(status);
      }
      
      whereClause += conditions.join(' AND ');
    }
    
    // Count total products for pagination
    const [totalResult] = await pool.query(
      `SELECT COUNT(*) as total FROM product ${whereClause}`,
      queryParams
    );
    const totalProducts = totalResult[0].total;
    
    // Get products with pagination
    const [products] = await pool.query(
      `SELECT p.*, c.category_name,
      (SELECT COUNT(*) FROM product_media pm WHERE pm.product_id = p.product_id) as media_count
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      ${whereClause}
      ORDER BY p.product_id DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );
    
    // Get media for each product
    for (const product of products) {
      const [media] = await pool.query(
        'SELECT * FROM product_media WHERE product_id = ?',
        [product.product_id]
      );
      product.media = media;
      
      // Convert material_ids string to array of IDs
      if (product.material_ids) {
        product.material_ids = product.material_ids.split(',').map(id => parseInt(id));
      } else {
        product.material_ids = [];
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          totalItems: totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await pool.query(
      `SELECT p.*, c.category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      WHERE p.product_id = ?`,
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const product = products[0];
    
    // Get media for the product
    const [media] = await pool.query(
      'SELECT * FROM product_media WHERE product_id = ?',
      [product.product_id]
    );
    product.media = media;
    
    // Convert material_ids string to array of IDs
    if (product.material_ids) {
      product.material_ids = product.material_ids.split(',').map(id => parseInt(id));
    } else {
      product.material_ids = [];
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { SKU, product_name, category_id, material_ids, price, status, media } = req.body;
    
    // Check if SKU already exists
    const [existingSKU] = await pool.query('SELECT * FROM product WHERE SKU = ?', [SKU]);
    if (existingSKU.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate SKU is not allowed'
      });
    }
    
    // Encrypt SKU
    const encryptedSKU = encryptSKU(SKU);
    
    // Convert material_ids array to string if it's an array
    const materialIdsString = Array.isArray(material_ids) ? material_ids.join(',') : material_ids;
    
    // Insert product
    const [result] = await pool.query(
      'INSERT INTO product (SKU, product_name, category_id, material_ids, price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [encryptedSKU, product_name, category_id, materialIdsString, price, status || 'active']
    );
    
    const productId = result.insertId;
    
    // Insert media if provided
    if (media && Array.isArray(media) && media.length > 0) {
      const mediaValues = media.map(url => [productId, url]);
      await pool.query(
        'INSERT INTO product_media (product_id, url) VALUES ?',
        [mediaValues]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product_id: productId
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { SKU, product_name, category_id, material_ids, price, status, media } = req.body;
    
    // Check if product exists
    const [existingProduct] = await pool.query('SELECT * FROM product WHERE product_id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if SKU changed and if new SKU already exists
    if (SKU && SKU !== decryptSKU(existingProduct[0].SKU)) {
      const [existingSKU] = await pool.query('SELECT * FROM product WHERE SKU = ? AND product_id != ?', [SKU, id]);
      if (existingSKU.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate SKU is not allowed'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (SKU) updateData.SKU = encryptSKU(SKU);
    if (product_name) updateData.product_name = product_name;
    if (category_id) updateData.category_id = category_id;
    if (material_ids) {
      updateData.material_ids = Array.isArray(material_ids) ? material_ids.join(',') : material_ids;
    }
    if (price) updateData.price = price;
    if (status) updateData.status = status;
    
    // Update product if there's data to update
    if (Object.keys(updateData).length > 0) {
      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];
      
      await pool.query(
        `UPDATE product SET ${setClause} WHERE product_id = ?`,
        values
      );
    }
    
    // Update media if provided
    if (media && Array.isArray(media)) {
      // Delete existing media
      await pool.query('DELETE FROM product_media WHERE product_id = ?', [id]);
      
      // Insert new media
      if (media.length > 0) {
        const mediaValues = media.map(url => [id, url]);
        await pool.query(
          'INSERT INTO product_media (product_id, url) VALUES ?',
          [mediaValues]
        );
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const [existingProduct] = await pool.query('SELECT * FROM product WHERE product_id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete product (media will be deleted automatically due to foreign key constraint with ON DELETE CASCADE)
    await pool.query('DELETE FROM product WHERE product_id = ?', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    // 1. Category wise highest price of product
    const [categoryHighestPrice] = await pool.query(`
      SELECT c.category_name, MAX(p.price) as highest_price
      FROM product p
      JOIN category c ON p.category_id = c.category_id
      GROUP BY p.category_id, c.category_name
    `);
    
    // 2. Price range wise product count
    const [priceRangeCount] = await pool.query(`
      SELECT 
        CASE
          WHEN price BETWEEN 0 AND 500 THEN '0-500'
          WHEN price BETWEEN 501 AND 1000 THEN '501-1000'
          ELSE '1000+'
        END AS price_range,
        COUNT(*) AS product_count
      FROM product
      GROUP BY price_range
    `);
    
    // 3. Get all products that have no media
    const [productsWithNoMedia] = await pool.query(`
      SELECT p.*
      FROM product p
      LEFT JOIN product_media pm ON p.product_id = pm.product_id
      WHERE pm.media_id IS NULL
    `);
    
    res.status(200).json({
      success: true,
      data: {
        categoryHighestPrice,
        priceRangeCount,
        productsWithNoMedia
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getStatistics
}; 