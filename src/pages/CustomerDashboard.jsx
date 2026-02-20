import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders for user:", currentUser.uid); // Debug log
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('orderDate', 'desc')
      );
      
      const ordersSnap = await getDocs(ordersQuery);
      console.log("Orders snapshot:", ordersSnap.size); // Debug log
      
      const ordersList = ordersSnap.docs.map(doc => {
        const data = doc.data();
        console.log("Order data:", data); // Debug log
        return {
          id: doc.id,
          ...data
        };
      });
      
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userData?.name || currentUser?.displayName || 'Valued Customer'}! 
              </h1>
              <p className="text-gray-600 mt-1">{currentUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{orders.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Completed</p>
                <p className="text-3xl font-bold mt-2">
                  {orders.filter(o => o.orderStatus === 'completed').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100">Pending</p>
                <p className="text-3xl font-bold mt-2">
                  {orders.filter(o => o.orderStatus === 'pending').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">My Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No orders yet. Start shopping!</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                      <p className="text-sm text-gray-500">
                        Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t mt-3 pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-amber-600">₹{order.totalAmount}</span>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Payment: {order.paymentMethod}</p>
                    <p>Address: {order.shippingAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}