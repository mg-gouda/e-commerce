'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const LAYOUTS = [
  {
    id: 'layout1',
    name: 'Layout 1',
    description: 'Clean, professional e-commerce design with focus on product details',
    preview: '/media/layouts/layout1-preview.png',
  },
  {
    id: 'layout2',
    name: 'Layout 2',
    description: 'Modern design with image zoom, teal accents, and enhanced visual presentation',
    preview: '/media/layouts/layout2-preview.png',
  },
  {
    id: 'layout3',
    name: 'Layout 3',
    description: 'Minimalist black and white design with clean typography and social sharing',
    preview: '/media/layouts/layout3-preview.png',
  },
  {
    id: 'layout4',
    name: 'Layout 4',
    description: 'Scientific aesthetic with zoom functionality, ratings display, and LinkedIn sharing',
    preview: '/media/layouts/layout4-preview.png',
  },
];

export default function ProductLayoutSettings() {
  const [selectedLayout, setSelectedLayout] = useState('layout1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCurrentLayout();
  }, []);

  const fetchCurrentLayout = async () => {
    try {
      const response = await api.get('/settings/product_display_layout');
      if (response.data?.value) {
        setSelectedLayout(response.data.value);
      }
    } catch (error: any) {
      // If setting doesn't exist (404), silently use default layout1
      if (error.response?.status === 404) {
        setSelectedLayout('layout1');
      } else {
        // Only log non-404 errors
        console.error('Error fetching layout setting:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await api.put('/settings/product_display_layout', {
        value: selectedLayout,
        description: 'Product page display layout',
        type: 'string',
      });

      setMessage({ type: 'success', text: 'Product layout saved successfully!' });
    } catch (error) {
      console.error('Error saving layout:', error);
      setMessage({ type: 'error', text: 'Failed to save product layout' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Product Display Layout</h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose how product pages are displayed to your customers.
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Layout Options */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {LAYOUTS.map((layout) => (
            <div
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`relative border-2 rounded-md overflow-hidden cursor-pointer transition-all ${
                selectedLayout === layout.id
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Selection indicator */}
              {selectedLayout === layout.id && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-blue-600 text-white rounded-full p-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Preview Image */}
              <div className="bg-gray-50 h-48 flex items-center justify-center border-b border-gray-200">
                <div className="text-gray-400 text-center p-6">
                  <div className="text-5xl mb-2">
                    {layout.id === 'layout1' ? '📄' : layout.id === 'layout2' ? '🎨' : layout.id === 'layout3' ? '⚪' : '🔬'}
                  </div>
                  <p className="text-xs">Preview</p>
                </div>
              </div>

              {/* Layout Info */}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-medium text-gray-900">{layout.name}</h3>
                  <input
                    type="radio"
                    checked={selectedLayout === layout.id}
                    onChange={() => setSelectedLayout(layout.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-600 mb-3">{layout.description}</p>

                {/* Key Features */}
                <div className="space-y-1.5">
                  {layout.id === 'layout1' && (
                    <>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Clean, minimal design</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Blue accent colors</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Standard image gallery</span>
                      </div>
                    </>
                  )}
                  {layout.id === 'layout2' && (
                    <>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Image zoom on hover</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Teal accent colors</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Enhanced visuals</span>
                      </div>
                    </>
                  )}
                  {layout.id === 'layout3' && (
                    <>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Black & white aesthetic</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Social sharing buttons</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Clean typography</span>
                      </div>
                    </>
                  )}
                  {layout.id === 'layout4' && (
                    <>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Image zoom on hover</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Ratings & reviews display</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Professional style</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Visit any product page to preview the selected layout.
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/admin/settings'}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
