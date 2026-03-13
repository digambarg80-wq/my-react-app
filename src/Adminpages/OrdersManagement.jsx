import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersList);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        orderStatus: newStatus, 
        updatedAt: new Date().toISOString() 
      });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Error updating order');
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        paymentStatus: newStatus,
        paymentConfirmedAt: new Date().toISOString(),
        paymentConfirmedBy: currentUser?.uid,
        updatedAt: new Date().toISOString()
      });
      
      if (newStatus === 'paid') {
        toast.success('Payment confirmed! Customer can now review products.');
      } else {
        toast.success('Payment status updated');
      }
      
      fetchOrders();
    } catch {
      toast.error('Error updating payment status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentBadgeClass = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h1 className="text-3xl font-bold">Orders Management</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select 
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Payments</option>
          <option value="pending">Pending Payment</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">S.No</th>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Items</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Order Status</th>
              <th className="px-6 py-3 text-left">Payment Status</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-mono text-sm">{order.id?.slice(0, 8)}...</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{order.customerName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{order.customerEmail || 'N/A'}</p>
                    <button 
                      onClick={() => { setSelectedCustomer(order); setShowCustomerDetails(true); }} 
                      className="text-xs text-amber-600 hover:text-amber-800 mt-1"
                    >
                      View Details →
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="text-sm">{item.name} x{item.quantity}</div>
                  ))}
                </td>
                <td className="px-6 py-4 font-bold">₹{order.totalAmount || 0}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.orderStatus || 'pending'}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`px-2 py-1 border rounded text-sm ${getStatusBadgeClass(order.orderStatus)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadgeClass(order.paymentStatus)}`}>
                      {order.paymentStatus || 'pending'}
                    </span>
                    {order.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => updatePaymentStatus(order.id, 'paid')}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Confirm Payment
                      </button>
                    )}
                    {order.paymentStatus === 'paid' && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        ✓ Payment Confirmed
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => window.open(`/order-confirmation/${order.id}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Customer Details</h2>
              <button onClick={() => setShowCustomerDetails(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedCustomer.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedCustomer.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedCustomer.customerPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{selectedCustomer.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className={`font-medium capitalize ${selectedCustomer.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedCustomer.paymentStatus || 'pending'}
                    </p>
                  </div>
                  {selectedCustomer.paymentConfirmedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Confirmed On</p>
                      <p className="font-medium">{new Date(selectedCustomer.paymentConfirmedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <p>{selectedCustomer.shippingAddress || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}