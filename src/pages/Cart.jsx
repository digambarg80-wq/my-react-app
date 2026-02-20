// src/pages/Cart.jsx
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fallback image handler
  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/100/100?random=1';
  };

  const handleCheckout = () => {
    if (!currentUser) {
      localStorage.setItem('pendingCart', JSON.stringify(cartItems));
      navigate('/login', { 
        state: { 
          message: "Please login to complete your purchase",
          redirectTo: '/checkout'
        } 
      });
    } else {
      navigate('/checkout');
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-8">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any products yet.</p>
          <button
            onClick={handleContinueShopping}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                <img 
                  src={item.image || `https://picsum.photos/100/100?random=${item.id}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                  onError={handleImageError}
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-amber-600 font-bold">₹{item.price}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center border rounded">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">₹{getCartTotal()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition mb-2"
            >
              Proceed to Checkout
            </button>
            
            <button
              onClick={handleContinueShopping}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition"
            >
              Continue Shopping
            </button>
            
            <button
              onClick={clearCart}
              className="w-full text-red-500 hover:text-red-700 text-sm mt-4"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;