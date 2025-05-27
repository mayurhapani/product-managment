require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const materialRoutes = require('./routes/materialRoutes');
const { initializeDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/materials', materialRoutes);

// Initialize database connection
initializeDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 