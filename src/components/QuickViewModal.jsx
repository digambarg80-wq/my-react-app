import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (!currentUser) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product.id,
        product: product,
        quantity: quantity,
        timestamp: new Date().toISOString()
      }));
      navigate('/login', { 
        state: { 
          message: "Please login to add items to cart",
          redirectTo: '/products'
        } 
      });
    } else {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      alert(`${quantity} ${product.name} added to cart!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              <img
                src={product.image || 'https://via.placeholder.com/500x400?text=Product'}
                alt={product.name}
                className="w-full rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div>
              {product.category && (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm capitalize">
                  {product.category}
                </span>
              )}
              
              <p className="text-3xl font-bold text-amber-600 my-4">₹{product.price}</p>
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center border rounded-lg w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isInWishlist(product.id)
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{isInWishlist(product.id) ? '❤️' : '🤍'}</span>
                  {isInWishlist(product.id) ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    product.inStock
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <WhatsAppButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}