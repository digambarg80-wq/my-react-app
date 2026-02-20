import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist.</p>
          <Link
            to="/login"
            className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">Save your favorite products to see them here.</p>
          <Link
            to="/products"
            className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Wishlist ({wishlistItems.length})</h1>
          <button
            onClick={clearWishlist}
            className="text-red-500 hover:text-red-700"
          >
            Clear All
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={item.image || 'https://via.placeholder.com/300x200?text=Product'}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
                >
                  <span className="text-red-500">❤️</span>
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                {item.category && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                )}
                <p className="text-amber-600 font-bold text-xl mt-2">₹{item.price}</p>
                
                <button
                  onClick={() => {
                    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
                    removeFromWishlist(item.id);
                  }}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}