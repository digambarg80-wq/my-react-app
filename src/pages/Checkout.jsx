import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

// 🔴 IMPORTANT: Replace with your actual Razorpay Key ID
// const RAZORPAY_KEY_ID = "rzp_test_SHwsS0sdegb"; // Your test key
const RAZORPAY_KEY_ID = "rzp_test_SHwsS0sdeg0geb"; // ✅ Use this exact key
function Checkout() {
  const { cartItems, getCartTotal, placeOrder, loading } = useCart();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || userData?.name || '',
    phone: userData?.phone || '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'razorpay',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay Payment
  const handleRazorpayPayment = async () => {
    setProcessing(true);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setProcessing(false);
        return;
      }

      const totalAmount = getCartTotal();
      
      // Payment options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Mauli Interior',
        description: 'Payment for your order',
        image: 'https://your-website.com/logo.png', // Optional: Add your logo
        handler: async (response) => {
          try {
            // Payment successful - place order with payment details
            const orderData = {
              ...formData,
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'paid'
            };
            
            const order = await placeOrder(orderData);
            toast.success('Payment successful! Order placed.');
            navigate(`/order-confirmation/${order.id}`);
          } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Order placed but error saving details. Contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: currentUser.email,
          contact: formData.phone
        },
        notes: {
          address: `${formData.address}, ${formData.city} - ${formData.pincode}`
        },
        theme: {
          color: '#F59E0B' // Amber color to match your theme
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  // Handle Cash on Delivery
  const handleCOD = async () => {
    setProcessing(true);
    try {
      await placeOrder({
        ...formData,
        paymentStatus: 'pending',
        paymentMethod: 'cod'
      });
      toast.success('Order placed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error placing order');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    if (formData.paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCOD();
    }
  };

  // If cart is empty, redirect to products
  if (cartItems.length === 0) {
    navigate('/products');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
                
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium">Pay Online (Razorpay)</span>
                        <p className="text-sm text-gray-500">Credit Card, Debit Card, UPI, NetBanking</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-gray-500">Pay when you receive</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={processing || loading}
                className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  formData.paymentMethod === 'razorpay' ? 'Proceed to Pay' : 'Place Order (COD)'
                )}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Your Order</h2>
            
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-amber-600">₹{getCartTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;