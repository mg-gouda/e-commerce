'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaPicker from '@/components/admin/MediaPicker';
import { api } from '@/lib/api';

// Enhanced product interface for comprehensive product management
interface ProductFormData {
  // Basic Info
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;

  // General Tab
  productType: 'simple' | 'variable' | 'downloadable' | 'grouped';
  regularPrice: string;
  salePrice: string;
  saleQuantity: string;
  scheduleSale: boolean;
  saleStartDate: string;
  saleEndDate: string;
  taxStatus: string;

  // Inventory Tab
  sku: string;
  gtin: string;
  trackStock: boolean;
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_backorder';
  stockQuantity: string;

  // Shipping Tab
  weight: string;
  length: string;
  width: string;
  height: string;

  // Attributes
  attributes: Array<{ name: string; value: string; id: string }>;

  // Media
  images: Array<{ id: string; url: string; alt: string }>;
  videoUrl: string;
  view360Url: string;

  // Tags
  tags: Array<{ id: string; name: string }>;

  // Category
  categoryId: string;
  status: 'active' | 'inactive';
}

const taxStatuses = [
  { value: 'taxable', label: 'Taxable' },
  { value: 'none', label: 'None' },
  { value: 'shipping', label: 'Shipping only' }
];

export default function ProductEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<{ id: string; url: string; alt: string } | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'featured' | 'gallery'>('gallery');

  const [formData, setFormData] = useState<ProductFormData>({
    name: 'Sample Product',
    slug: 'sample-product',
    shortDescription: 'Short description of the product',
    longDescription: 'Long detailed description of the product...',
    productType: 'simple',
    regularPrice: '99.99',
    salePrice: '',
    saleQuantity: '',
    scheduleSale: false,
    saleStartDate: '',
    saleEndDate: '',
    taxStatus: 'taxable',
    sku: 'SKU001',
    gtin: '',
    trackStock: true,
    stockStatus: 'in_stock',
    stockQuantity: '100',
    weight: '',
    length: '',
    width: '',
    height: '',
    attributes: [],
    images: [],
    videoUrl: '',
    view360Url: '',
    tags: [],
    categoryId: '',
    status: 'active'
  });

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'shipping', label: 'Shipping', icon: '🚚' },
    { id: 'attributes', label: 'Attributes', icon: '🏷️' },
    { id: 'media', label: 'Media', icon: '🖼️' }
  ];

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        console.log('Loaded categories:', response.data);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/products/${id}`);
        const product = response.data;

        // Map backend data to form structure
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          shortDescription: product.short_description || product.description || '',
          longDescription: product.description || '',
          productType: 'simple',
          regularPrice: product.price?.toString() || '0',
          salePrice: '',
          saleQuantity: '',
          scheduleSale: false,
          saleStartDate: '',
          saleEndDate: '',
          taxStatus: 'taxable',
          sku: product.sku || '',
          gtin: '',
          trackStock: true,
          stockStatus: product.stock > 0 ? 'in_stock' : 'out_of_stock',
          stockQuantity: product.stock?.toString() || '0',
          weight: product.weight?.toString() || '',
          length: product.length?.toString() || '',
          width: product.width?.toString() || '',
          height: product.height?.toString() || '',
          attributes: product.attributes || [],
          images: product.images?.map((img: string, idx: number) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            return {
              id: `${idx}`,
              url: img.startsWith('http') ? img : `${apiUrl}${img}`,
              alt: product.name
            };
          }) || [],
          videoUrl: product.video_url || '',
          view360Url: '',
          tags: product.tags?.map((tag: string, idx: number) => ({ id: `${idx}`, name: tag })) || [],
          categoryId: product.category?.id?.toString() || '',
          status: product.status || 'active'
        });

        // Set featured image
        if (product.image_url) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          const imageUrl = product.image_url.startsWith('http') ? product.image_url : `${apiUrl}${product.image_url}`;
          setFeaturedImage({ id: '1', url: imageUrl, alt: product.name });
        }

        // Set selected categories
        if (product.category?.id) {
          setSelectedCategories([product.category.id.toString()]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Error loading product data');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      console.log('Category toggled:', categoryId, 'New selection:', newSelection);
      return newSelection;
    });
  };

  const handleFeaturedImageUpload = () => {
    setMediaPickerMode('featured');
    setShowMediaPicker(true);
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const addAttribute = () => {
    const newAttribute = {
      id: Date.now().toString(),
      name: '',
      value: ''
    };
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute]
    }));
  };

  const updateAttribute = (id: string, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr =>
        attr.id === id ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(attr => attr.id !== id)
    }));
  };

  const addTag = (tagName: string) => {
    if (tagName.trim() && !formData.tags.find(tag => tag.name === tagName.trim())) {
      const newTag = {
        id: Date.now().toString(),
        name: tagName.trim()
      };
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
  };

  const removeTag = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== id)
    }));
  };

  const handleImageUpload = () => {
    setMediaPickerMode('gallery');
    setShowMediaPicker(true);
  };

  const removeImage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  const handle360Upload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.rar';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Here you would implement 360-degree view upload logic
        alert(`360° view file selected: ${file.name}`);
        setFormData(prev => ({
          ...prev,
          view360Url: URL.createObjectURL(file)
        }));
      }
    };
    input.click();
  };

  const handleMediaSelect = (selectedMedia: any[]) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    if (mediaPickerMode === 'featured' && selectedMedia.length > 0) {
      const media = selectedMedia[0];
      setFeaturedImage({
        id: media.id,
        url: `${apiUrl}${media.url}`,
        alt: media.alt_text || media.filename
      });
    } else if (mediaPickerMode === 'gallery') {
      const newImages = selectedMedia.map(media => ({
        id: media.id,
        url: `${apiUrl}${media.url}`,
        alt: media.alt_text || media.filename
      }));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5)
      }));
    }
    setShowMediaPicker(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (!formData.regularPrice || parseFloat(formData.regularPrice) <= 0) {
      alert('Please enter a valid regular price');
      return;
    }

    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    setLoading(true);
    try {
      // Helper function to extract just the path from a URL
      const extractPath = (url: string) => {
        if (!url) return undefined;
        // If URL contains http://, extract just the path part
        if (url.includes('http://') || url.includes('https://')) {
          const urlObj = new URL(url);
          return urlObj.pathname;
        }
        // Already a path
        return url;
      };

      // Prepare the data for API call - map the form data to backend format
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.longDescription || formData.shortDescription,
        short_description: formData.shortDescription,
        price: parseFloat(formData.regularPrice) || 0,
        stock: parseInt(formData.stockQuantity) || 0,
        category_id: selectedCategories[0],
        image_url: extractPath(featuredImage?.url),
        sku: formData.sku || null,
        weight: parseFloat(formData.weight) || null,
        length: parseFloat(formData.length) || null,
        width: parseFloat(formData.width) || null,
        height: parseFloat(formData.height) || null,
        images: formData.images.map(img => extractPath(img.url)).filter(Boolean),
        video_url: formData.videoUrl || null,
        attributes: formData.attributes.filter(attr => attr.name && attr.value),
        tags: formData.tags.map(tag => tag.name),
        status: formData.status
      };

      console.log('Selected Categories:', selectedCategories);
      console.log('Product Data being sent:', updateData);

      await api.put(`/products/${id}`, updateData);
      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.message || 'Error updating product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-4">
      {/* Product Type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Product Type
        </label>
        <select
          value={formData.productType}
          onChange={(e) => handleInputChange('productType', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="simple">Simple Product</option>
          <option value="variable">Variable Product</option>
          <option value="downloadable">Downloadable Product</option>
          <option value="grouped">Grouped Product</option>
        </select>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Regular Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.regularPrice}
            onChange={(e) => handleInputChange('regularPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sale Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.salePrice}
            onChange={(e) => handleInputChange('salePrice', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Schedule Sale */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.scheduleSale}
            onChange={(e) => handleInputChange('scheduleSale', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-xs text-gray-700">Schedule Sale</span>
        </label>
      </div>

      {formData.scheduleSale && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sale Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.saleStartDate}
              onChange={(e) => handleInputChange('saleStartDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sale End Date
            </label>
            <input
              type="datetime-local"
              value={formData.saleEndDate}
              onChange={(e) => handleInputChange('saleEndDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Sale Quantity */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Sale Quantity (Optional)
        </label>
        <input
          type="number"
          value={formData.saleQuantity}
          onChange={(e) => handleInputChange('saleQuantity', e.target.value)}
          placeholder="Leave empty for unlimited"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tax Status */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tax Status
        </label>
        <select
          value={formData.taxStatus}
          onChange={(e) => handleInputChange('taxStatus', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {taxStatuses.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-4">
      {/* SKU */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          SKU (Stock Keeping Unit)
        </label>
        <input
          type="text"
          value={formData.sku}
          onChange={(e) => handleInputChange('sku', e.target.value)}
          placeholder="Auto-generated if left empty"
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GTIN */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          GTIN, UPC, EAN, or ISBN
        </label>
        <input
          type="text"
          value={formData.gtin}
          onChange={(e) => handleInputChange('gtin', e.target.value)}
          placeholder="Global Trade Item Number"
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Track Stock */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.trackStock}
            onChange={(e) => handleInputChange('trackStock', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-xs text-gray-700">Track stock quantity for this product</span>
        </label>
      </div>

      {/* Stock Status */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Stock Status
        </label>
        <div className="space-y-1.5">
          {[
            { value: 'in_stock', label: 'In stock' },
            { value: 'out_of_stock', label: 'Out of stock' },
            { value: 'on_backorder', label: 'On backorder' }
          ].map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="stockStatus"
                value={option.value}
                checked={formData.stockStatus === option.value}
                onChange={(e) => handleInputChange('stockStatus', e.target.value)}
                className="text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-xs text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Quantity */}
      {formData.trackStock && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );

  const renderShippingTab = () => (
    <div className="space-y-4">
      {/* Weight */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Weight (kg)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.weight}
          onChange={(e) => handleInputChange('weight', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dimensions */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Dimensions (cm)
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Length</label>
            <input
              type="number"
              step="0.01"
              value={formData.length}
              onChange={(e) => handleInputChange('length', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Width</label>
            <input
              type="number"
              step="0.01"
              value={formData.width}
              onChange={(e) => handleInputChange('width', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height</label>
            <input
              type="number"
              step="0.01"
              value={formData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttributesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900">Product Attributes</h3>
        <button
          onClick={addAttribute}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
        >
          Add Attribute
        </button>
      </div>

      {formData.attributes.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-xs">
          No attributes added yet. Click "Add Attribute" to start.
        </div>
      ) : (
        <div className="space-y-3">
          {formData.attributes.map((attribute) => (
            <div key={attribute.id} className="flex gap-3 items-start">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Attribute Name</label>
                <input
                  type="text"
                  value={attribute.name}
                  onChange={(e) => updateAttribute(attribute.id, 'name', e.target.value)}
                  placeholder="e.g., Color, Size, Material"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Attribute Value</label>
                <input
                  type="text"
                  value={attribute.value}
                  onChange={(e) => updateAttribute(attribute.id, 'value', e.target.value)}
                  placeholder="e.g., Red, Large, Cotton"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => removeAttribute(attribute.id)}
                className="mt-5 p-1.5 text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-4">
      {/* Product Images */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-900">Product Images</h3>
          <button
            onClick={handleImageUpload}
            disabled={formData.images.length >= 5}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload ({formData.images.length}/5)
          </button>
        </div>

        {formData.images.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-1 text-xs text-gray-600">No images uploaded</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {formData.images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Video */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Product Video URL
        </label>
        <input
          type="url"
          value={formData.videoUrl}
          onChange={(e) => handleInputChange('videoUrl', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Supports YouTube, Vimeo, and direct video links
        </p>
      </div>

      {/* 360 Degree View */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-medium text-gray-700">
            360° Product View
          </label>
          <button
            onClick={handle360Upload}
            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            Upload 360° Images
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Upload a ZIP file containing 360-degree product images
        </p>
        {formData.view360Url && (
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-800">360° view uploaded successfully</p>
          </div>
        )}
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Product ID: {params.id}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/products')}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated from product name"
                  />
                  <p className="mt-1 text-xs text-gray-500">Used in the product URL</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for product listings"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Long Description
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => handleInputChange('longDescription', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed product description with features, benefits, and specifications"
                  />
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-white rounded-lg shadow flex">
              {/* Tab Navigation - Left Side */}
              <div className="w-40 border-r border-gray-200 flex-shrink-0">
                <nav className="flex flex-col p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-left px-3 py-2 rounded-md font-medium text-sm mb-1 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4">
                {activeTab === 'general' && renderGeneralTab()}
                {activeTab === 'inventory' && renderInventoryTab()}
                {activeTab === 'shipping' && renderShippingTab()}
                {activeTab === 'attributes' && renderAttributesTab()}
                {activeTab === 'media' && renderMediaTab()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Product Tags */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Tags</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.name}
                      <button
                        onClick={() => removeTag(tag.id)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Categories</h3>
              <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                {categories.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-xs">
                    No categories available
                  </div>
                ) : (
                  <div className="p-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center py-1.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-xs text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Select one or more categories
              </p>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Featured Image</h3>
              {featuredImage ? (
                <div className="relative">
                  <img
                    src={featuredImage.url}
                    alt={featuredImage.alt}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={removeFeaturedImage}
                    className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleFeaturedImageUpload}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-xs text-gray-600">Click to upload</p>
                </div>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Used as product thumbnail
              </p>
            </div>

            {/* Product Status */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Status</h3>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                Active products are visible to customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {showMediaPicker && (
        <MediaPicker
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelect}
          multiple={mediaPickerMode === 'gallery'}
        />
      )}
    </AdminLayout>
  );
}