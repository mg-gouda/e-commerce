'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function GeneralSettings() {
  const { settings: globalSettings, updateSettings } = useSettings();
  const [settings, setSettings] = useState(globalSettings);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update global settings
    updateSettings(settings);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'clear-cache':
        alert('Cache cleared successfully!');
        break;
      case 'reindex-search':
        alert('Search reindexing started...');
        break;
      case 'export-data':
        alert('Data export initiated...');
        break;
      case 'health-check':
        alert('System health check completed - All systems operational');
        break;
      default:
        break;
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (PNG, JPG, GIF, SVG)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo file size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleSettingChange('platformLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/ico'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid favicon file (ICO or PNG)');
        return;
      }

      // Validate file size (2MB limit for favicon)
      if (file.size > 2 * 1024 * 1024) {
        alert('Favicon file size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleSettingChange('faviconUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">General Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure your platform settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-4">
          {/* General Settings */}
          <div className="bg-white rounded-md shadow p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">General Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Commerce Settings */}
          <div className="bg-white rounded-md shadow p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Commerce Settings</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Standard Shipping Rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.shippingRate}
                    onChange={(e) => handleSettingChange('shippingRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Free Shipping Threshold ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleSettingChange('freeShippingThreshold', parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="bg-white rounded-md shadow p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Platform Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <p className="text-xs text-gray-500">Temporarily disable site access</p>
                </div>
                <button
                  onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow User Registration</label>
                  <p className="text-xs text-gray-500">Allow new users to create accounts</p>
                </div>
                <button
                  onClick={() => handleSettingChange('allowRegistration', !settings.allowRegistration)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.allowRegistration ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.allowRegistration ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-xs text-gray-500">Send email notifications to users</p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-xs text-gray-500">Send SMS notifications to users</p>
                </div>
                <button
                  onClick={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.smsNotifications ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-md shadow p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAction('clear-cache')}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                Clear Cache
              </button>
              <button
                onClick={() => handleQuickAction('reindex-search')}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                Reindex Search
              </button>
              <button
                onClick={() => handleQuickAction('export-data')}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                Export Data
              </button>
              <button
                onClick={() => handleQuickAction('health-check')}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                System Health Check
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-md shadow p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">System Information</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Platform Version:</span>
                <span className="font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Database:</span>
                <span className="font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Cache:</span>
                <span className="font-medium">Redis</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Search:</span>
                <span className="font-medium">Elasticsearch</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Last Backup:</span>
                <span className="font-medium">2 hours ago</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-md shadow p-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full px-4 py-2 text-white text-sm rounded-md transition-colors font-medium ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : saved
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}