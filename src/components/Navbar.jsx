import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext"; // ADDED

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, currentUser, userData } = useAuth();
  const { getItemCount } = useCart();
  const { wishlistItems } = useWishlist(); // ADDED
  const navigate = useNavigate();
  
  const cartItemCount = getItemCount();
  const wishlistCount = wishlistItems.length; // ADDED

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-neutral-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide text-amber-500 hover:text-amber-400 transition">
          Mauli Interior
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-lg">
          <Link className="hover:text-amber-400 transition" to="/">Home</Link>
          <Link className="hover:text-amber-400 transition" to="/services">Services</Link>
          <Link className="hover:text-amber-400 transition" to="/products">Products</Link>
          <Link className="hover:text-amber-400 transition" to="/about">About</Link>
          <Link className="hover:text-amber-400 transition" to="/contact">Contact</Link>
          
          {/* ADDED: Wishlist Icon with Count */}
          {currentUser && (
            <Link to="/wishlist" className="relative hover:text-amber-400 transition">
              <span className="text-2xl">❤️</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}
          
          {/* Cart Icon with Count */}
          <Link to="/cart" className="relative hover:text-amber-400 transition">
            <span className="text-2xl">🛒</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {currentUser ? (
            <div className="flex items-center space-x-4">
              {/* Dashboard Link - Different for admin vs customer */}
              <Link 
                to={userData?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="hover:text-amber-400 transition font-medium"
              >
                {userData?.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          ) : (
            /* Login Link */
            <Link 
              to="/login" 
              className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl hover:text-amber-400 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Admin Badge (only shows for admin users) */}
      {currentUser && userData?.role === 'admin' && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-bl-lg">
          Admin
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-neutral-800 px-6 py-4 space-y-4 text-lg border-t border-gray-700">
          <Link 
            className="block hover:text-amber-400 transition" 
            to="/" 
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            className="block hover:text-amber-400 transition" 
            to="/services" 
            onClick={() => setMenuOpen(false)}
          >
            Services
          </Link>
          <Link 
            className="block hover:text-amber-400 transition" 
            to="/products" 
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
          
          {/* ADDED: Wishlist in Mobile Menu */}
          {currentUser && (
            <Link 
              className="block hover:text-amber-400 transition" 
              to="/wishlist" 
              onClick={() => setMenuOpen(false)}
            >
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
          )}
          
          <Link 
            className="block hover:text-amber-400 transition" 
            to="/cart" 
            onClick={() => setMenuOpen(false)}
          >
            Cart {cartItemCount > 0 && `(${cartItemCount})`}
          </Link>
          <Link 
            className="block hover:text-amber-400 transition" 
            to="/about" 
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            className="block hover:text-amber-400 transition" 
            to="/contact" 
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          
          {currentUser ? (
            <>
              <Link 
                to={userData?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="block hover:text-amber-400 transition"
                onClick={() => setMenuOpen(false)}
              >
                {userData?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full text-left bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="block bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg text-center font-medium transition text-white"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;