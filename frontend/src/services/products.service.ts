import { apiClient } from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categories?: { id: string; name: string }[];
  vendor_id?: string;
  image_url?: string;
  images?: string[];
  sku?: string;
  slug?: string;
  tags?: string[];
  status: string;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_ids: string[];
  vendor_id?: string;
  image_url?: string;
  images?: string[];
  sku?: string;
  tags?: string[];
  status?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export const productsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>('/products', { params });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getByCategory(
    categoryId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  async create(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async search(query: string, filters?: Record<string, any>): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/search', {
      params: { query, ...filters }
    });
    return response.data;
  },
};
