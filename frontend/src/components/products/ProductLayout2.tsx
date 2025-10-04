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

interface ProductLayout2Props {
  product: Product;
  reviews: Review[];
  onAddToCart: (quantity: number) => void;
  addingToCart: boolean;
}

export default function ProductLayout2({ product, reviews, onAddToCart, addingToCart }: ProductLayout2Props) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [selectedImage, setSelectedImage] = useState<string>(product.image_url || product.images?.[0] || '');
  const [imageZoom, setImageZoom] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-amber-400' : 'text-gray-300'}>
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

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Alpha Science Style */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/products" className="text-teal-600 hover:text-teal-700 font-medium">
                Products
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <span className="text-gray-600">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                {/* Product Image Gallery - Alpha Science Style */}
                <div>
                  {/* Main Image with Zoom */}
                  <div
                    className="mb-4 border-2 border-gray-200 rounded-lg overflow-hidden bg-white relative group cursor-zoom-in"
                    onMouseEnter={() => setImageZoom(true)}
                    onMouseLeave={() => setImageZoom(false)}
                  >
                    {selectedImage ? (
                      <img
                        src={getImageUrl(selectedImage)}
                        alt={product.name}
                        className={`w-full h-[450px] object-contain p-6 transition-transform duration-300 ${
                          imageZoom ? 'scale-150' : 'scale-100'
                        }`}
                      />
                    ) : (
                      <div className="w-full h-[450px] bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No image available</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images Grid */}
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          className={`border-2 rounded-lg overflow-hidden bg-white hover:border-teal-500 transition-all duration-200 ${
                            selectedImage === img ? 'border-teal-500 shadow-md' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-20 object-contain p-2"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info - Alpha Science Style */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {product.name}
                  </h1>

                  {/* Rating and Reviews */}
                  <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center text-lg">
                      {renderStars(Math.round(Number(product.average_rating) || 0))}
                    </div>
                    <span className="ml-3 text-sm text-gray-600">
                      ({reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>

                  {/* Price - Prominent Display */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3">
                      <p className="text-4xl font-bold text-teal-600">
                        {Number(product.price).toFixed(2)}
                      </p>
                      <span className="text-xl text-gray-600">EGP</span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`font-semibold ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="text-sm text-orange-600">
                          (Only {product.stock} left!)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  {product.short_description && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {product.short_description}
                      </p>
                    </div>
                  )}

                  {/* Product Meta */}
                  <div className="mb-6 space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                    {product.sku && (
                      <div className="flex">
                        <span className="text-gray-600 font-medium w-24">SKU:</span>
                        <span className="text-gray-900">{product.sku}</span>
                      </div>
                    )}
                    <div className="flex">
                      <span className="text-gray-600 font-medium w-24">Category:</span>
                      <span className="text-teal-600 font-medium">{product.category.name}</span>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex">
                        <span className="text-gray-600 font-medium w-24">Tags:</span>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Section */}
                  {product.stock > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Quantity:</label>
                        <div className="flex items-center border-2 border-gray-300 rounded-lg">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-5 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                          >
                            −
                          </button>
                          <span className="px-8 py-2 border-x-2 border-gray-300 font-semibold min-w-[80px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            className="px-5 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => onAddToCart(quantity)}
                        disabled={addingToCart}
                        className="w-full bg-teal-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl uppercase tracking-wide"
                      >
                        {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                      </button>

                      {/* Social Share */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Share:</span>
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </button>
                          <button className="p-2 text-gray-600 hover:text-blue-400 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white px-8 py-4 rounded-lg font-bold text-lg cursor-not-allowed uppercase tracking-wide"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>

              {/* Product Tabs - Alpha Science Style */}
              <div className="border-t border-gray-200">
                {/* Tab Navigation */}
                <div className="flex bg-gray-50 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`flex-1 py-4 px-6 text-sm font-semibold uppercase tracking-wide transition-all ${
                      activeTab === 'description'
                        ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`flex-1 py-4 px-6 text-sm font-semibold uppercase tracking-wide transition-all ${
                      activeTab === 'specifications'
                        ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Additional Information
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 py-4 px-6 text-sm font-semibold uppercase tracking-wide transition-all ${
                      activeTab === 'reviews'
                        ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Reviews ({reviews.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-8">
                  {/* Description */}
                  {activeTab === 'description' && (
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed text-base">
                        {product.description}
                      </div>

                      {product.video_url && (
                        <div className="mt-8">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Product Video</h3>
                          <div className="aspect-video max-w-3xl rounded-lg overflow-hidden shadow-lg">
                            <iframe
                              src={product.video_url}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specifications */}
                  {activeTab === 'specifications' && (
                    <div className="max-w-3xl">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          {product.sku && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-4 text-sm font-semibold text-gray-700 w-1/3">SKU</td>
                              <td className="py-4 text-sm text-gray-900">{product.sku}</td>
                            </tr>
                          )}
                          <tr className="hover:bg-gray-50">
                            <td className="py-4 text-sm font-semibold text-gray-700 w-1/3">Category</td>
                            <td className="py-4 text-sm text-gray-900">{product.category.name}</td>
                          </tr>
                          {product.weight && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-4 text-sm font-semibold text-gray-700 w-1/3">Weight</td>
                              <td className="py-4 text-sm text-gray-900">{product.weight} kg</td>
                            </tr>
                          )}
                          {(product.length || product.width || product.height) && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-4 text-sm font-semibold text-gray-700 w-1/3">Dimensions</td>
                              <td className="py-4 text-sm text-gray-900">
                                {product.length} × {product.width} × {product.height} cm
                              </td>
                            </tr>
                          )}
                          {product.attributes && product.attributes.map((attr, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-4 text-sm font-semibold text-gray-700 w-1/3">{attr.name}</td>
                              <td className="py-4 text-sm text-gray-900">{attr.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Reviews */}
                  {activeTab === 'reviews' && (
                    <div>
                      {reviews.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">⭐</div>
                          <p className="text-gray-500 text-lg">No reviews yet.</p>
                          <p className="text-gray-400 text-sm mt-2">Be the first to review this product!</p>
                        </div>
                      ) : (
                        <div className="space-y-6 max-w-4xl">
                          {reviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center mb-2">
                                    {renderStars(review.rating)}
                                  </div>
                                  {review.title && (
                                    <h4 className="font-bold text-gray-900 mb-1 text-lg">{review.title}</h4>
                                  )}
                                  <p className="text-sm text-gray-600">by {review.user.name}</p>
                                </div>
                                <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                              </div>

                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
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

          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Fast Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
