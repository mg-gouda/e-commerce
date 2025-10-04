import { apiClient } from '@/lib/api';

export interface WishlistItem {
  id: string;
  product_id: string;
  wishlist_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    stock: number;
    slug: string;
    categories?: Array<{ id: string; name: string }>;
  };
}

export interface Wishlist {
  id: string;
  user_id: string;
  wishlistItems: WishlistItem[];
}

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    return apiClient.get('/wishlist');
  },

  async getWishlistCount(): Promise<{ count: number }> {
    return apiClient.get('/wishlist/count');
  },

  async checkIfInWishlist(productId: string): Promise<{ inWishlist: boolean }> {
    return apiClient.get(`/wishlist/check/${productId}`);
  },

  async addToWishlist(productId: string): Promise<Wishlist> {
    return apiClient.post('/wishlist', { product_id: productId });
  },

  async removeFromWishlist(productId: string): Promise<Wishlist> {
    return apiClient.delete(`/wishlist/${productId}`);
  },

  async clearWishlist(): Promise<{ message: string }> {
    return apiClient.delete('/wishlist');
  },
};
