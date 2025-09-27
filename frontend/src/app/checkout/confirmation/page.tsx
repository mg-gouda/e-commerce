"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PaymentData {
  orderId: string;
  paymentId: string;
  message: string;
  instructions?: {
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    routing_number?: string;
    amount?: number;
    reference?: string;
    instructions?: string[];
    delivery_instructions?: string;
    estimated_delivery?: string;
  };
  paymentMethod: 'cod' | 'bank_transfer';
}

export default function CheckoutConfirmationPage() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('checkoutResult');
    if (!storedData) {
      router.push('/cart');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setPaymentData(data);
      localStorage.removeItem('checkoutResult');
    } catch (error) {
      console.error('Error parsing payment data:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-8">We couldn't find your order information.</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Order ID: {paymentData.orderId}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{paymentData.message}</h2>

          {paymentData.paymentMethod === 'bank_transfer' && paymentData.instructions && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Bank Transfer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Bank Name</label>
                    <p className="text-blue-900 font-mono">{paymentData.instructions.bank_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Account Name</label>
                    <p className="text-blue-900 font-mono">{paymentData.instructions.account_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Account Number</label>
                    <p className="text-blue-900 font-mono text-lg font-bold">{paymentData.instructions.account_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Routing Number</label>
                    <p className="text-blue-900 font-mono">{paymentData.instructions.routing_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Amount</label>
                    <p className="text-blue-900 font-mono text-lg font-bold">${paymentData.instructions.amount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">Reference Number</label>
                    <p className="text-blue-900 font-mono text-lg font-bold">{paymentData.instructions.reference}</p>
                  </div>
                </div>
              </div>

              {paymentData.instructions.instructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-yellow-900 mb-3">Important Instructions</h3>
                  <ul className="space-y-2">
                    {paymentData.instructions.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3"></span>
                        <span className="text-yellow-800">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {paymentData.paymentMethod === 'cod' && paymentData.instructions && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4">Cash on Delivery</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment Method:</span>
                    <span className="font-medium text-green-900">Cash on Delivery</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Estimated Delivery:</span>
                    <span className="font-medium text-green-900">{paymentData.instructions.estimated_delivery}</span>
                  </div>
                </div>
              </div>

              {paymentData.instructions.delivery_instructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-amber-900 mb-3">Delivery Instructions</h3>
                  <p className="text-amber-800">{paymentData.instructions.delivery_instructions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-medium text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Order Processing</h4>
                <p className="text-gray-600">
                  {paymentData.paymentMethod === 'bank_transfer'
                    ? 'We will process your order once payment is confirmed (1-2 business days).'
                    : 'Your order is being prepared for shipment.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-medium text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Shipment</h4>
                <p className="text-gray-600">You'll receive tracking information once your order ships.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-medium text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Delivery</h4>
                <p className="text-gray-600">
                  {paymentData.paymentMethod === 'cod'
                    ? 'Pay with cash when your order is delivered to your address.'
                    : 'Your order will be delivered to your specified address.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="space-x-4">
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}