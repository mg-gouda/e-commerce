"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductLayout1 from '@/components/products/ProductLayout1';
import ProductLayout2 from '@/components/products/ProductLayout2';
import ProductLayout3 from '@/components/products/ProductLayout3';
import ProductLayout4 from '@/components/products/ProductLayout4';

interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: string | number;
  stock: number;
  category: {
    id: string;
    name: string;
  };
  image_url?: string;
  images?: string[];
  average_rating: string | number;
  sku?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  video_url?: string;
  attributes?: Array<{ name: string; value: string }>;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  title?: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string>('layout1');

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
      fetchLayoutSetting();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (err) {
      setError('Product not found');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchLayoutSetting = async () => {
    try {
      const response = await api.get('/settings/product_display_layout');
      if (response.data?.value) {
        setSelectedLayout(response.data.value);
      }
    } catch (err: any) {
      // Silently default to layout1 if setting doesn't exist (404) or there's an error
      if (err.response?.status !== 404) {
        // Only log non-404 errors
        console.error('Error fetching layout setting:', err);
      }
      setSelectedLayout('layout1');
    }
  };

  const handleAddToCart = async (quantity: number) => {
    try {
      setAddingToCart(true);

      await api.post('/cart', {
        product_id: productId,
        quantity: quantity,
      });

      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/products" className="text-blue-600 hover:text-blue-800">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate layout based on setting
  if (selectedLayout === 'layout2') {
    return (
      <ProductLayout2
        product={product}
        reviews={reviews}
        onAddToCart={handleAddToCart}
        addingToCart={addingToCart}
      />
    );
  }

  if (selectedLayout === 'layout3') {
    return (
      <ProductLayout3
        product={product}
        reviews={reviews}
        onAddToCart={handleAddToCart}
        addingToCart={addingToCart}
      />
    );
  }

  if (selectedLayout === 'layout4') {
    return (
      <ProductLayout4
        product={product}
        reviews={reviews}
        onAddToCart={handleAddToCart}
        addingToCart={addingToCart}
      />
    );
  }

  // Default to Layout 1
  return (
    <ProductLayout1
      product={product}
      reviews={reviews}
      onAddToCart={handleAddToCart}
      addingToCart={addingToCart}
    />
  );
}
