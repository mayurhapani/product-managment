// Product related interfaces
export interface Product {
  product_id: number;
  SKU: string;
  product_name: string;
  category_id: number;
  category_name?: string;
  material_ids: number[] | string;
  price: number;
  status: 'active' | 'inactive';
  media?: Media[] | string[];
  media_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Media {
  media_id?: number;
  product_id?: number;
  url: string;
  created_at?: string;
}

export interface Category {
  category_id: number;
  category_name: string;
}

export interface Material {
  material_id: number;
  material_name: string;
}

// API Response interfaces
export interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: PaginationData;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface MaterialsResponse {
  success: boolean;
  data: Material[];
}

export interface Filters {
  sku?: string;
  product_name?: string;
  category_id?: string | number;
  material_id?: string | number;
  status?: string;
}

export interface StatisticItem {
  category_name: string;
  highest_price: number;
}

export interface PriceRangeItem {
  price_range: string;
  product_count: number;
}

export interface Statistics {
  categoryHighestPrice: StatisticItem[];
  priceRangeCount: PriceRangeItem[];
  productsWithNoMedia: Product[];
}

export interface StatisticsResponse {
  success: boolean;
  data: Statistics;
} 