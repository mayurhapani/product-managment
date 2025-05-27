const mysql = require('mysql2/promise');
const { encryptSKU } = require('../utils/cryptoUtils');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();
    
    // Create tables
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    // Create category table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS category (
        category_id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(100) NOT NULL
      )
    `);
    
    // Create material table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS material (
        material_id INT PRIMARY KEY AUTO_INCREMENT,
        material_name VARCHAR(100) NOT NULL
      )
    `);
    
    // Create product table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product (
        product_id INT PRIMARY KEY AUTO_INCREMENT,
        SKU VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category_id INT,
        material_ids VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES category(category_id),
        UNIQUE KEY (SKU)
      )
    `);
    
    // Create product_media table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_media (
        media_id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
      )
    `);
    
    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const insertSampleData = async () => {
  try {
    // Check if sample data already exists
    const [categories] = await pool.query('SELECT * FROM category LIMIT 1');
    if (categories.length > 0) {
      return; // Data already exists
    }
    
    // Insert categories
    await pool.query(`
      INSERT INTO category (category_name) VALUES 
      ('category1'), ('category2'), ('category3')
    `);
    
    // Insert materials
    await pool.query(`
      INSERT INTO material (material_name) VALUES 
      ('Material1'), ('Material2'), ('Material3')
    `);
    
    // Insert products with encrypted SKUs
    await pool.query(`
      INSERT INTO product (SKU, product_name, category_id, material_ids, price) VALUES 
      (?, 'Product1', 1, '1,2', 1000),
      (?, 'Product2', 2, '1', 2000),
      (?, 'Product3', 3, '2', 3000),
      (?, 'Product4', 1, '2', 4000),
      (?, 'Product5', 1, '3', 5000)
    `, [
      encryptSKU('f2821c0c88c19a99918d443'),
      encryptSKU('f2821c0c88c19a99918d444'),
      encryptSKU('f2821c0c88c19a99918d445'),
      encryptSKU('f2821c0c88c19a99918d446'),
      encryptSKU('f2821c0c88c19a99918d447')
    ]);
    
    // Insert product media
    await pool.query(`
      INSERT INTO product_media (product_id, url) VALUES 
      (1, 'https://xyz/a.png'),
      (2, 'https://xyz/a.png'),
      (2, 'https://xyz/a.png'),
      (3, 'https://xyz/a.png')
    `);
    
    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase
}; 