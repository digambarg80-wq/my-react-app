import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/products', icon: '📦', label: 'Products' },
      { path: '/admin/orders', icon: '🛒', label: 'Orders' },
        { path: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    { path: '/admin/contacts', icon: '📧', label: 'Contact Messages' }, 
    // Changed from Projects
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          {isOpen && <h1 className="text-xl font-bold text-gray-800">Mauli Admin</h1>}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 hover:bg-gray-100 ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-red-600 mt-auto"
          >
            <span className="text-xl">🚪</span>
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}