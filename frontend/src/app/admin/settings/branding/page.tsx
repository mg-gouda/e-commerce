'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function BrandingSettings() {
  const [logo, setLogo] = useState<string>('');
  const [favicon, setFavicon] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  const fetchBrandingSettings = async () => {
    try {
      const [logoRes, faviconRes] = await Promise.all([
        api.get('/settings/site_logo').catch(() => ({ data: { value: '' } })),
        api.get('/settings/site_favicon').catch(() => ({ data: { value: '' } })),
      ]);

      if (logoRes.data?.value) {
        setLogo(logoRes.data.value);
        setLogoPreview(logoRes.data.value);
      }
      if (faviconRes.data?.value) {
        setFavicon(faviconRes.data.value);
        setFaviconPreview(faviconRes.data.value);
      }
    } catch (error) {
      console.error('Error fetching branding settings:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = response.data.url;

      if (type === 'logo') {
        setLogo(fileUrl);
        setLogoPreview(fileUrl);
      } else {
        setFavicon(fileUrl);
        setFaviconPreview(fileUrl);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: 'Failed to upload file' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'logo');
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'favicon');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await Promise.all([
        api.put('/settings/site_logo', {
          value: logo,
          description: 'Website logo URL',
          type: 'string',
        }),
        api.put('/settings/site_favicon', {
          value: favicon,
          description: 'Website favicon URL',
          type: 'string',
        }),
      ]);

      setMessage({ type: 'success', text: 'Branding settings saved successfully!' });
    } catch (error) {
      console.error('Error saving branding settings:', error);
      setMessage({ type: 'error', text: 'Failed to save branding settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Branding</h1>
        <p className="mt-1 text-sm text-gray-600">Customize your store's branding and visual identity</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-8">
          {/* Logo Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Website Logo</h3>
            <div className="flex items-start space-x-6">
              {/* Preview */}
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="w-48 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${logoPreview}`}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-sm">No logo uploaded</span>
                  </div>
                )}
              </div>

              {/* Upload Control */}
              <div className="flex-1">
                <label className="block">
                  <span className="sr-only">Choose logo file</span>
                  <input
                    type="file"
                    accept="image/*,image/svg+xml"
                    onChange={handleLogoChange}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Accepts all image types including SVG. Maximum file size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Favicon Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Website Favicon</h3>
            <div className="flex items-start space-x-6">
              {/* Preview */}
              <div className="flex-shrink-0">
                {faviconPreview ? (
                  <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${faviconPreview}`}
                      alt="Favicon preview"
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-xs">No icon</span>
                  </div>
                )}
              </div>

              {/* Upload Control */}
              <div className="flex-1">
                <label className="block">
                  <span className="sr-only">Choose favicon file</span>
                  <input
                    type="file"
                    accept="image/*,image/svg+xml"
                    onChange={handleFaviconChange}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Accepts all image types including SVG. Maximum file size: 5MB. Recommended: 32x32 or 64x64 pixels
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
