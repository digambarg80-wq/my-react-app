// src/pages/OrderConfirmation.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import WhatsAppButton from '../components/WhatsAppButton';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold mb-4">Order Details</h2>
            <p className="text-sm text-gray-600 mb-2">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Date: {new Date(order.orderDate).toLocaleString()}
            </p>

            <div className="border-t pt-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-2">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total Paid</span>
                <span className="text-amber-600">₹{order.totalAmount}</span>
              </div>
            </div>

            {order.paymentId && (
              <p className="text-xs text-gray-500 mt-4">
                Payment ID: {order.paymentId}
              </p>
            )}
          </div>

          {/* WhatsApp Support Button */}
          <div className="mb-6">
            <WhatsAppButton order={order} />
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}