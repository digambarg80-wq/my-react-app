import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter only customers (not admins/staff)
      const customerList = usersList.filter(user => 
        user.role === 'customer' || !user.role || user.role === ''
      );

      // Fetch all orders to get order counts per customer
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Add order counts to each customer
      const customersWithStats = customerList.map(customer => {
        const customerOrdersList = ordersList.filter(order => order.userId === customer.uid);
        const totalSpent = customerOrdersList.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        return {
          ...customer,
          orderCount: customerOrdersList.length,
          totalSpent: totalSpent,
          lastOrder: customerOrdersList.length > 0 
            ? customerOrdersList.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0].orderDate 
            : null
        };
      });

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customer) => {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const ordersList = ordersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(order => order.userId === customer.uid)
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

      setCustomerOrders(ordersList);
      setSelectedCustomer(customer);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast.error('Failed to load customer orders');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', customerId));
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold">Customer Management</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-amber-500 w-64"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Contact</th>
              <th className="px-6 py-3 text-left">Orders</th>
              <th className="px-6 py-3 text-left">Total Spent</th>
              <th className="px-6 py-3 text-left">Last Order</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                      {customer.name?.charAt(0) || customer.email?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name || 'No name'}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm">{customer.phone || 'No phone'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {customer.orderCount || 0} orders
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">
                  ₹{customer.totalSpent?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4 text-sm">
                  {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchCustomerOrders(customer)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Customer Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Customer Profile */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedCustomer.name?.charAt(0) || selectedCustomer.email?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCustomer.name || 'No name'}</h3>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                    <p className="text-sm text-gray-500">Customer since: {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-600">{customerOrders.length}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      ₹{customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {customerOrders.filter(o => o.orderStatus === 'completed').length}
                    </p>
                    <p className="text-sm text-gray-600">Completed Orders</p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <h3 className="text-xl font-bold mb-4">Order History</h3>
              <div className="space-y-4">
                {customerOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No orders found</p>
                ) : (
                  customerOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                          <p className="text-sm text-gray-500">
                            Date: {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t mt-2 pt-2 flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold text-amber-600">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}