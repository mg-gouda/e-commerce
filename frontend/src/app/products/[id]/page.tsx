"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: {
    id: string;
    name: string;
  };
  image_url?: string;
  average_rating: number;
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

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
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

  const addToCart = async () => {
    try {
      setAddingToCart(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      await api.post('/cart', {
        product_id: productId,
        quantity: quantity,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/products" className="text-gray-400 hover:text-gray-500">
                Products
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-500">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-96 w-full object-cover object-center"
                />
              ) : (
                <div className="h-96 w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xl">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(Math.round(product.average_rating))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                ({product.average_rating.toFixed(1)}) - {reviews.length} reviews
              </span>
            </div>

            <p className="text-2xl font-bold text-gray-900 mb-4">${product.price.toFixed(2)}</p>

            <div className="mb-6">
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Category: <span className="text-blue-600">{product.category.name}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </p>
            </div>

            {product.stock > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mr-2">
                      Quantity:
                    </label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[...Array(Math.min(10, product.stock))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={addToCart}
                    disabled={addingToCart}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            )}

            {product.stock === 0 && (
              <div className="mb-6">
                <button
                  disabled
                  className="w-full bg-gray-400 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                >
                  Out of Stock
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">by {review.user.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                  </div>

                  {review.title && (
                    <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
                  )}

                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}