import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: [],
    products: [],
    totalUsers: 0,
    totalProducts: 0,
    admins: 0,
    staff: 0,
    customers: 0,
    categories: {},
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch products
      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const admins = users.filter(u => u.role === 'admin').length;
      const staff = users.filter(u => u.role === 'staff').length;
      const customers = users.filter(u => u.role === 'customer' || !u.role).length;

      // Category distribution
      const categories = {};
      products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });

      setStats({
        users,
        products,
        totalUsers: users.length,
        totalProducts: products.length,
        admins,
        staff,
        customers,
        categories,
        recentUsers: users.slice(0, 5)
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart Data
  const roleChartData = {
    labels: ['Admins', 'Staff', 'Customers'],
    datasets: [{
      data: [stats.admins, stats.staff, stats.customers],
      backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981'],
      borderWidth: 0
    }]
  };

  const categoryChartData = {
    labels: Object.keys(stats.categories).length ? Object.keys(stats.categories) : ['No Categories'],
    datasets: [{
      label: 'Products by Category',
      data: Object.keys(stats.categories).length ? Object.values(stats.categories) : [0],
      backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-500"
          link="/admin/users"
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts}
          icon="📦"
          color="bg-green-500"
          link="/admin/products"
        />
        <StatCard 
          title="Staff Members" 
          value={stats.staff}
          icon="👔"
          color="bg-purple-500"
        />
        <StatCard 
          title="Customers" 
          value={stats.customers}
          icon="👤"
          color="bg-yellow-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">User Roles Distribution</h2>
          <div className="h-80 flex items-center justify-center">
            {stats.totalUsers > 0 ? (
              <Pie data={roleChartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p className="text-gray-500">No users found</p>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Products by Category</h2>
          <div className="h-80">
            {stats.totalProducts > 0 ? (
              <Bar 
                data={categoryChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } }
                }} 
              />
            ) : (
              <p className="text-gray-500">No products found</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Users</h2>
          <Link to="/admin/users" className="text-blue-600 hover:underline">View All →</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{user.name || '-'}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role || 'customer'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{user.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, link }) {
  const CardContent = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
}