import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Chatbot from "./WhatsAppButton";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { logout, currentUser, userData } = useAuth();
  const { getItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  
  const cartItemCount = getItemCount ? getItemCount() : 0;
  const wishlistCount = wishlistItems?.length || 0;
 useEffect(() => {
  console.log("userdata:", userData);

 

}, []);

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className={`${scrolled ? 'bg-neutral-900 shadow-lg py-2' : 'bg-neutral-900 py-3'} text-white sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main flex container - all items in one horizontal line */}
        <div className="flex items-center justify-between">
          {/* Left side - Logo stacked vertically with quote under it */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.svg" 
                alt="MHI Logo" 
                className="w-8 h-8 sm:w-9 sm:h-9"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-lg sm:text-xl font-bold tracking-wide text-amber-500 hover:text-amber-400 transition whitespace-nowrap">
                MAULI HOME INTERIORS
              </span>
            </Link>
            {/* Quote under logo and logo name */}
            <p className="text-xs sm:text-sm italic text-amber-300 mt-0.5 ml-10 sm:ml-11">
              INSPIRED INTERIORS FOR INSPIRED LIVING
            </p>
          </div>

          {/* Right side - All menu items in one line */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Desktop Menu Links */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm">
              <Link className="hover:text-amber-400 text-sm transition relative group" to="/">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link className="hover:text-amber-400 text-sm transition relative group" to="/services">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link className="hover:text-amber-400 text-sm transition relative group" to="/products">
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link className="hover:text-amber-400 text-sm transition relative group" to="/about">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link className="hover:text-amber-400 text-sm transition relative group" to="/contact">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-3">
              {/* Wishlist */}
              {currentUser && (
                <Link to="/wishlist" className="relative hover:text-amber-400 transition">
                  <span className="text-lg">❤️</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Cart */}
              <Link to="/cart" className="relative hover:text-amber-400 transition">
                <span className="text-lg">🛒</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    to={userData?.role === 'admin' ? '/admin' : '/dashboard'} 
                    className="text-sm hover:text-amber-400 transition whitespace-nowrap"
                  >
                    {userData?.role === 'admin' ? 'Admin' : 'Dashboard'}
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-500 hover:bg-blue-900 px-2 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-xl hover:text-amber-400 transition" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-neutral-800 px-4 py-3 space-y-2 text-sm border-t border-gray-700 mt-2">
          <Link className="block hover:text-amber-400 transition py-1" to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link className="block hover:text-amber-400 transition py-1" to="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link className="block hover:text-amber-400 transition py-1" to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link className="block hover:text-amber-400 transition py-1" to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link className="block hover:text-amber-400 transition py-1" to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          
          {/* Quote for mobile */}
          <p className="text-xs italic text-amber-300 py-1 border-t border-gray-700 mt-2 pt-2">
            INSPIRED INTERIORS FOR INSPIRED LIVING
          </p>
          
          {currentUser && (
            <>
              <Link className="block hover:text-amber-400 transition py-1" to="/wishlist" onClick={() => setMenuOpen(false)}>
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link className="block hover:text-amber-400 transition py-1" to="/cart" onClick={() => setMenuOpen(false)}>
                Cart {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
              <Link to={userData?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="block hover:text-amber-400 transition py-1" onClick={() => setMenuOpen(false)}>
                {userData?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }} 
                className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition text-white"
              >
                Logout
              </button>
            </>
          )}
          
          {!currentUser && (
            <Link to="/login" 
              className="block bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg text-center text-xs font-medium transition text-white" 
              onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
      <Chatbot/>
    </nav>
  );
}

export default Navbar;