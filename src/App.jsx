// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; // ADDED: Wishlist Provider
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CustomerDashboard from "./pages/CustomerDashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist"; // ADDED: Wishlist Page
import Services from "./routes/Services";
import ProtectedRoute from "./routes/ProtectedRoute";

// Admin Imports
import AdminLayout from './Adminpages/AdminLayout';
import AdminDashboard from './Adminpages/AdminDashboard';
import UserManagement from './Adminpages/UserManagement';
import ProductsManagement from './Adminpages/ProductsManagement';
import ContactMessages from './Adminpages/ContactMessages';
import OrdersManagement from './Adminpages/OrdersManagement';
import ReviewsManagement from './Adminpages/ReviewsManagement';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider> {/* ADDED: Wrap with WishlistProvider */}
            {/* Toast Notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
              <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
              <Route path="/products" element={<><Navbar /><Products /><Footer /></>} />
              <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
              <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
              <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
              <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
              <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />
              
              {/* Protected Routes - Login Required */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <><Navbar /><Cart /><Footer /></>
                </ProtectedRoute>
              } />
              
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <><Navbar /><Checkout /><Footer /></>
                </ProtectedRoute>
              } />
              
              <Route path="/order-confirmation/:orderId" element={
                <ProtectedRoute>
                  <><Navbar /><OrderConfirmation /><Footer /></>
                </ProtectedRoute>
              } />
              
              {/* ADDED: Wishlist Route */}
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <><Navbar /><Wishlist /><Footer /></>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <><Navbar /><CustomerDashboard /><Footer /></>
                </ProtectedRoute>
              } />

              {/* Admin Routes - Admin Only */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="products" element={<ProductsManagement />} />
                <Route path="orders" element={<OrdersManagement />} />
                <Route path="reviews" element={<ReviewsManagement />} />
                <Route path="contacts" element={<ContactMessages />} />
              </Route>

              {/* 404 Page */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                    <a href="/" className="text-amber-500 hover:text-amber-600">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </WishlistProvider> {/* ADDED: Close WishlistProvider */}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;