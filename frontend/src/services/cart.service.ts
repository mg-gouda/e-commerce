import { apiClient } from '@/lib/api';
import { Product } from './products.service';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  total: number;
}

export interface AddToCartDto {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/cart');
    return response.data;
  },

  async addItem(data: AddToCartDto): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/items', data);
    return response.data;
  },

  async updateItem(itemId: string, data: UpdateCartItemDto): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, data);
    return response.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  },
};
