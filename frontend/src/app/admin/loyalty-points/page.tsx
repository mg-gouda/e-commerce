'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';

interface UserPoints {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  points: number;
}

export default function AdminLoyaltyPointsPage() {
  const [userPoints, setUserPoints] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserPoints | null>(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [actionType, setActionType] = useState<'add' | 'deduct'>('add');
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAllUserPoints();
  }, []);

  const fetchAllUserPoints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loyalty-points/all');
      setUserPoints(response.data.points || []);
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: UserPoints, action: 'add' | 'deduct') => {
    setSelectedUser(user);
    setActionType(action);
    setPointsAmount('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedUser || !pointsAmount || parseInt(pointsAmount) <= 0) return;

    try {
      setProcessing(true);
      const endpoint = actionType === 'add'
        ? `/loyalty-points/add/${selectedUser.user.id}`
        : `/loyalty-points/deduct/${selectedUser.user.id}`;

      await api.post(endpoint, { points: parseInt(pointsAmount) });
      await fetchAllUserPoints();
      setShowModal(false);
      setSelectedUser(null);
      setPointsAmount('');
    } catch (error: any) {
      console.error('Error updating points:', error);
      alert(error.response?.data?.message || 'Failed to update points');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Points Management</h1>
          <p className="text-gray-600">Manage customer loyalty points</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading user points...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPoints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No users with loyalty points found
                    </td>
                  </tr>
                ) : (
                  userPoints.map((userPoint) => (
                    <tr key={userPoint.user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {userPoint.user.full_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{userPoint.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {userPoint.points.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          ${(userPoint.points * 0.01).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleOpenModal(userPoint, 'add')}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Add Points
                        </button>
                        <button
                          onClick={() => handleOpenModal(userPoint, 'deduct')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Deduct Points
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {actionType === 'add' ? 'Add' : 'Deduct'} Points
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    User: <span className="font-medium">{selectedUser.user.full_name}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Current Points: <span className="font-medium">{selectedUser.points.toLocaleString()}</span>
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points to {actionType}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedUser(null);
                      setPointsAmount('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={`px-4 py-2 rounded-md text-white ${
                      actionType === 'add'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                    disabled={processing || !pointsAmount || parseInt(pointsAmount) <= 0}
                  >
                    {processing ? 'Processing...' : `${actionType === 'add' ? 'Add' : 'Deduct'} Points`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
