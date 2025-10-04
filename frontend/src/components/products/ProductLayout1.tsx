'use client';

import { useState } from 'react';
import Link from 'next/link';

type TabType = 'description' | 'specifications' | 'reviews';

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

interface ProductLayout1Props {
  product: Product;
  reviews: Review[];
  onAddToCart: (quantity: number) => void;
  addingToCart: boolean;
}

export default function ProductLayout1({ product, reviews, onAddToCart, addingToCart }: ProductLayout1Props) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [selectedImage, setSelectedImage] = useState<string>(product.image_url || product.images?.[0] || '');

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

  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images || [])
  ];

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/products" className="text-gray-500 hover:text-gray-700">
                Products
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-700">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
              {selectedImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${selectedImage}`}
                  alt={product.name}
                  className="w-full h-[500px] object-contain p-4"
                />
              ) : (
                <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`border rounded-lg overflow-hidden bg-white hover:border-blue-500 transition-colors ${
                      selectedImage === img ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-20 object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(Math.round(Number(product.average_rating) || 0))}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-gray-900">{Number(product.price).toFixed(2)} EGP</p>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-700 text-sm leading-relaxed">{product.short_description}</p>
              </div>
            )}

            {/* Product Meta Info */}
            <div className="mb-6 space-y-2 text-sm">
              {product.sku && (
                <div className="flex items-center">
                  <span className="text-gray-600">SKU:</span>
                  <span className="ml-2 text-gray-900">{product.sku}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 text-gray-900">{product.category.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Availability:</span>
                <span className={`ml-2 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Add to Cart Section */}
            {product.stock > 0 ? (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onAddToCart(quantity)}
                    disabled={addingToCart}
                    className="flex-1 bg-blue-600 text-white px-8 py-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm uppercase tracking-wide"
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-8 py-3 rounded font-medium cursor-not-allowed text-sm uppercase tracking-wide"
                >
                  Out of Stock
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabbed Content Section */}
        <div className="bg-white border-t border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'specifications'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed">
                  {product.description}
                </div>

                {product.video_url && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Product Video</h3>
                    <div className="aspect-video max-w-2xl">
                      <iframe
                        src={product.video_url}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div>
                <table className="w-full max-w-2xl">
                  <tbody className="divide-y divide-gray-200">
                    {product.sku && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-600 w-1/3">SKU</td>
                        <td className="py-3 text-sm text-gray-900">{product.sku}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 text-sm font-medium text-gray-600 w-1/3">Category</td>
                      <td className="py-3 text-sm text-gray-900">{product.category.name}</td>
                    </tr>
                    {product.weight && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-600 w-1/3">Weight</td>
                        <td className="py-3 text-sm text-gray-900">{product.weight} kg</td>
                      </tr>
                    )}
                    {(product.length || product.width || product.height) && (
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-600 w-1/3">Dimensions</td>
                        <td className="py-3 text-sm text-gray-900">
                          {product.length} × {product.width} × {product.height} cm
                        </td>
                      </tr>
                    )}
                    {product.attributes && product.attributes.map((attr, idx) => (
                      <tr key={idx}>
                        <td className="py-3 text-sm font-medium text-gray-600 w-1/3">{attr.name}</td>
                        <td className="py-3 text-sm text-gray-900">{attr.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="space-y-6 max-w-3xl">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center mb-1">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-sm text-gray-600">by {review.user.name}</p>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                        </div>

                        {review.title && (
                          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                        )}

                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
