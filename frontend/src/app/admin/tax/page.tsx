'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface TaxRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  rate: number;
  country: string;
  state?: string;
  city?: string;
  active: boolean;
  priority: number;
}

export default function TaxManagement() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([
    {
      id: '1',
      name: 'US Sales Tax',
      type: 'percentage',
      rate: 8.25,
      country: 'United States',
      state: 'California',
      active: true,
      priority: 1
    },
    {
      id: '2',
      name: 'VAT EU',
      type: 'percentage',
      rate: 21,
      country: 'European Union',
      active: true,
      priority: 2
    },
    {
      id: '3',
      name: 'Fixed Processing Fee',
      type: 'fixed',
      rate: 2.50,
      country: 'Global',
      active: false,
      priority: 3
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<TaxRule>>({
    name: '',
    type: 'percentage',
    rate: 0,
    country: '',
    state: '',
    city: '',
    active: true,
    priority: taxRules.length + 1
  });

  const addTaxRule = () => {
    if (newRule.name && newRule.country && newRule.rate !== undefined) {
      const rule: TaxRule = {
        id: Date.now().toString(),
        name: newRule.name,
        type: newRule.type || 'percentage',
        rate: newRule.rate,
        country: newRule.country,
        state: newRule.state,
        city: newRule.city,
        active: newRule.active || true,
        priority: newRule.priority || taxRules.length + 1
      };
      setTaxRules([...taxRules, rule]);
      setNewRule({
        name: '',
        type: 'percentage',
        rate: 0,
        country: '',
        state: '',
        city: '',
        active: true,
        priority: taxRules.length + 2
      });
      setShowAddForm(false);
    }
  };

  const toggleTaxRule = (id: string) => {
    setTaxRules(rules =>
      rules.map(rule =>
        rule.id === id ? { ...rule, active: !rule.active } : rule
      )
    );
  };

  const deleteTaxRule = (id: string) => {
    if (confirm('Are you sure you want to delete this tax rule?')) {
      setTaxRules(rules => rules.filter(rule => rule.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tax Management</h1>
              <p className="text-gray-600">Configure tax rules and rates for different regions</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Tax Rule
            </button>
          </div>
        </div>

        {/* Add Tax Rule Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Tax Rule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., US Sales Tax"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Type
                </label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate ({newRule.type === 'percentage' ? '%' : '$'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRule.rate}
                  onChange={(e) => setNewRule({ ...newRule, rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={newRule.country}
                  onChange={(e) => setNewRule({ ...newRule, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province (Optional)
                </label>
                <input
                  type="text"
                  value={newRule.state}
                  onChange={(e) => setNewRule({ ...newRule, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., California"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={newRule.city}
                  onChange={(e) => setNewRule({ ...newRule, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Los Angeles"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addTaxRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Rule
              </button>
            </div>
          </div>
        )}

        {/* Tax Rules Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Tax Rules ({taxRules.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rule.type === 'percentage' ? `${rule.rate}%` : `$${rule.rate.toFixed(2)}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rule.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rule.country}</div>
                      {(rule.state || rule.city) && (
                        <div className="text-sm text-gray-500">
                          {[rule.state, rule.city].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleTaxRule(rule.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rule.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => alert(`Edit tax rule: ${rule.name}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTaxRule(rule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Tax Calculation
                </label>
                <p className="text-sm text-gray-500">
                  Enable automatic tax calculation based on customer location
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Prices Include Tax
                </label>
                <p className="text-sm text-gray-500">
                  Product prices already include tax
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Calculate Tax on Shipping
                </label>
                <p className="text-sm text-gray-500">
                  Apply tax calculation to shipping costs
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}