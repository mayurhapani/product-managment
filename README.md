# Product Management System

A full-stack application for managing products built with React, Node.js, Express, and MySQL.

## Features

1. List all products with pagination
2. Filter products by SKU, name, category, material, and status
3. Add, edit, and delete products
4. View statistics:
   - Category-wise highest price of products
   - Price range distribution of products
   - Products without media

## Technology Stack

### Backend
- Node.js
- Express
- MySQL
- Crypto-JS for SKU encryption

### Frontend
- React
- React Router
- React Hook Form
- Tailwind CSS
- Axios

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=product_management
   DB_PORT=3306
   PORT=5000
   CRYPTO_SECRET_KEY=your_secret_key
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Database Structure

The application uses the following database tables:

### product
| Field        | Type          | Description                      |
|--------------|---------------|----------------------------------|
| product_id   | INT           | Primary key                      |
| SKU          | VARCHAR(255)  | Encrypted unique identifier      |
| product_name | VARCHAR(255)  | Name of the product              |
| category_id  | INT           | Foreign key to category table    |
| material_ids | VARCHAR(255)  | Comma-separated material IDs     |
| price        | DECIMAL(10,2) | Product price                    |
| status       | ENUM          | 'active' or 'inactive'           |
| created_at   | TIMESTAMP     | Creation timestamp               |
| updated_at   | TIMESTAMP     | Last update timestamp            |

### category
| Field        | Type          | Description                      |
|--------------|---------------|----------------------------------|
| category_id  | INT           | Primary key                      |
| category_name| VARCHAR(100)  | Name of the category             |

### material
| Field        | Type          | Description                      |
|--------------|---------------|----------------------------------|
| material_id  | INT           | Primary key                      |
| material_name| VARCHAR(100)  | Name of the material             |

### product_media
| Field        | Type          | Description                      |
|--------------|---------------|----------------------------------|
| media_id     | INT           | Primary key                      |
| product_id   | INT           | Foreign key to product table     |
| url          | VARCHAR(255)  | URL of the media                 |
| created_at   | TIMESTAMP     | Creation timestamp               | 