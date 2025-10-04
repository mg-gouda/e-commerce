'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSiteSettings, ProductLayoutType } from '@/contexts/SiteSettingsContext';

export default function BrandingSettings() {
  const { settings, updateSettings } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [formData, setFormData] = useState({
    productLayout: settings.productLayout,
    siteName: settings.siteName,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
  });

  const layouts = [
    {
      id: 'layout1' as ProductLayoutType,
      name: 'Layout 1 - Professional',
      description: 'Clean, professional e-commerce design with tabbed content. Features large image gallery, product meta information, and organized specification display.',
      preview: '/layouts/layout1-preview.png',
      features: [
        'Large image gallery with thumbnails',
        'Tabbed content (Description, Specifications, Reviews)',
        'Clean meta information display',
        'Professional add-to-cart section',
        'Quantity selector with +/- buttons'
      ]
    },
    {
      id: 'layout2' as ProductLayoutType,
      name: 'Layout 2 - Coming Soon',
      description: 'Modern layout with sidebar and sticky buy section.',
      preview: '/layouts/layout2-preview.png',
      features: ['Coming soon...'],
      disabled: true
    },
    {
      id: 'layout3' as ProductLayoutType,
      name: 'Layout 3 - Coming Soon',
      description: 'Minimalist design with focus on product imagery.',
      preview: '/layouts/layout3-preview.png',
      features: ['Coming soon...'],
      disabled: true
    },
  ];

  const handleSave = () => {
    setSaving(true);
    updateSettings(formData);
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => {
      setSaving(false);
      setSaveMessage('');
    }, 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Branding Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize your store's appearance and product page layouts
          </p>
        </div>

        {save Message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {saveMessage}
          </div>
        )}

        {/* Site Information */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Site Information</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Store Name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Page Layout */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Page Layout</h2>
          <p className="text-gray-600 mb-6">Choose how your product pages will be displayed to customers</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.productLayout === layout.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${layout.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !layout.disabled && setFormData({ ...formData, productLayout: layout.id })}
              >
                {/* Preview Image Placeholder */}
                <div className="aspect-video bg-gray-100 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Preview</span>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{layout.name}</h3>
                  {formData.productLayout === layout.id && (
                    <span className="text-blue-600 text-xl">✓</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{layout.description}</p>

                {!layout.disabled && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {layout.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {layout.disabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mt-3">
                    <p className="text-xs text-yellow-800">This layout is coming soon</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}