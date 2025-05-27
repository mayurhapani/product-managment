import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { productApi, categoryApi, materialApi } from '../../services/api';
import type {
  Product,
  Category,
  Material,
  PaginationData,
  Statistics,
  Filters,
  StatisticItem,
  PriceRangeItem
} from '../../types/models';

export default function ProductList() {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Static data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    categoryHighestPrice: [],
    priceRangeCount: [],
    productsWithNoMedia: []
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Filter states
  const [filterInputs, setFilterInputs] = useState<Filters>({
    sku: '',
    product_name: '',
    category_id: '',
    material_id: '',
    status: ''
  });
  
  // Fetch static data (categories, materials, statistics) only once on mount
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [categoriesResponse, materialsResponse, statisticsResponse] = await Promise.all([
          categoryApi.getCategories(),
          materialApi.getMaterials(),
          productApi.getStatistics()
        ]);
        
        setCategories(categoriesResponse.data);
        setMaterials(materialsResponse.data);
        setStatistics(statisticsResponse.data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      }
    };
    
    fetchStaticData();
  }, []);
  
  // Fetch products with debounced filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const productsResponse = await productApi.getProducts(
        pagination.currentPage,
        pagination.itemsPerPage,
        filterInputs
      );
      setProducts(productsResponse.data.products);
      setPagination(productsResponse.data.pagination);
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filterInputs]);
  
  // Debounce filter changes and fetch products
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fetchProducts]);
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterInputs(prev => ({ ...prev, [name]: value }));
    // Reset to first page when filters change
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };
  
  // Handle product deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.deleteProduct(id);
        fetchProducts(); // Refresh only products after deletion
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      }
    }
  };

  // Loading state only for products table
  const ProductsTable = () => {
    if (loading) return <div className="text-center p-4 text-white">Loading products...</div>;
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 border rounded-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">SKU</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Media</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product: Product) => (
                <tr key={product.product_id} className="border-t hover:bg-gray-700">
                  <td className="py-3 px-4">{product.product_id}</td>
                  <td className="py-3 px-4">{product.SKU}</td>
                  <td className="py-3 px-4">{product.product_name}</td>
                  <td className="py-3 px-4">{product.category_name}</td>
                  <td className="py-3 px-4">${product.price}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${product.status === 'active' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{product.media_count || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/${product.product_id}/edit`}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 px-4 text-center">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 text-gray-200 font-sans">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Product Management</h1>
        <Link to="/products/new" className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
          Add New Product
        </Link>
      </div>
      
      {/* Statistics Section */}
      <div className="mb-8 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category wise highest price */}
          <div className="bg-gray-700 p-4 rounded shadow">
            <h3 className="font-medium mb-2">Category Highest Prices</h3>
            <ul>
              {statistics.categoryHighestPrice.map((item: StatisticItem, index: number) => (
                <li key={index} className="mb-1">
                  {item.category_name}: ${item.highest_price}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Price range product count */}
          <div className="bg-gray-700 p-4 rounded shadow">
            <h3 className="font-medium mb-2">Price Range Distribution</h3>
            <ul>
              {statistics.priceRangeCount.map((item: PriceRangeItem, index: number) => (
                <li key={index} className="mb-1">
                  {item.price_range}: {item.product_count} products
                </li>
              ))}
            </ul>
          </div>
          
          {/* Products with no media */}
          <div className="bg-gray-700 p-4 rounded shadow">
            <h3 className="font-medium mb-2">Products Without Media: {statistics.productsWithNoMedia.length}</h3>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-white">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">SKU</label>
            <input
              type="text"
              name="sku"
              value={filterInputs.sku}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Product Name</label>
            <input
              type="text"
              name="product_name"
              value={filterInputs.product_name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Category</label>
            <select
              name="category_id"
              value={filterInputs.category_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
            >
              <option value="" className="bg-gray-700 text-white">All Categories</option>
              {categories.map((category: Category) => (
                <option key={category.category_id} value={category.category_id} className="bg-gray-700 text-white">
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Material</label>
            <select
              name="material_id"
              value={filterInputs.material_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
            >
              <option value="" className="bg-gray-700 text-white">All Materials</option>
              {materials.map((material: Material) => (
                <option key={material.material_id} value={material.material_id} className="bg-gray-700 text-white">
                  {material.material_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
            <select
              name="status"
              value={filterInputs.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
            >
              <option value="" className="bg-gray-700 text-white">All Statuses</option>
              <option value="active" className="bg-gray-700 text-white">Active</option>
              <option value="inactive" className="bg-gray-700 text-white">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Products Table - Now wrapped in its own component */}
      <ProductsTable />
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page: number) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${pagination.currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 