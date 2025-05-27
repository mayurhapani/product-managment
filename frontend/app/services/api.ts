import axios from 'axios';
import type { 
  ProductsResponse, 
  SingleProductResponse, 
  CategoriesResponse, 
  MaterialsResponse,
  StatisticsResponse,
  Filters,
  Product
} from '../types/models';

const API_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Product API
export const productApi = {
  getProducts: async (page = 1, limit = 10, filters: Filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get<ProductsResponse>('/products', { params });
    return response.data;
  },
  
  getProductById: async (id: number) => {
    const response = await api.get<SingleProductResponse>(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (productData: Partial<Product>) => {
    const response = await api.post<{ success: boolean; data: { product_id: number } }>('/products', productData);
    return response.data;
  },
  
  updateProduct: async (id: number, productData: Partial<Product>) => {
    const response = await api.put<{ success: boolean; message: string }>(`/products/${id}`, productData);
    return response.data;
  },
  
  deleteProduct: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/products/${id}`);
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get<StatisticsResponse>('/products/stats/all');
    return response.data;
  }
};

// Category API
export const categoryApi = {
  getCategories: async () => {
    const response = await api.get<CategoriesResponse>('/categories');
    return response.data;
  }
};

// Material API
export const materialApi = {
  getMaterials: async () => {
    const response = await api.get<MaterialsResponse>('/materials');
    return response.data;
  }
};

export default api; 