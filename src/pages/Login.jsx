//src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToCart } = useCart();
  
  const { state } = location;
  const [message, setMessage] = useState(state?.message || '');

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      
      // Check for pending cart item
      const pendingItem = localStorage.getItem('pendingCartItem');
      
      if (pendingItem) {
        const item = JSON.parse(pendingItem);
        if (item.product) {
          addToCart(item.product, item.quantity);
        }
        localStorage.removeItem('pendingCartItem');
        
        // Show success message
        alert('Item added to your cart!');
        navigate('/cart');
      } else {
        // Normal login, go to dashboard or redirect
        navigate(state?.redirectTo || '/dashboard');
      }
      
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Try again later.";
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-600 to-orange-700 p-4 pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full opacity-10"></div>
      </div>

      {/* Login Card */}
      <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Message Alert */}
        {message && (
          <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl font-bold">M</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Please login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                📧
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full pl-12 pr-4 py-3 border-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                } rounded-xl focus:outline-none focus:border-amber-500 transition-colors bg-gray-50 focus:bg-white`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-2 flex items-center">
                <span className="mr-1">⚠️</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                🔒
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-3 border-2 ${
                  errors.password ? 'border-red-500' : 'border-gray-200'
                } rounded-xl focus:outline-none focus:border-amber-500 transition-colors bg-gray-50 focus:bg-white`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-2 flex items-center">
                <span className="mr-1">⚠️</span> {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800">
                Remember me
              </span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-amber-600 hover:text-amber-800 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Registration Link */}
        <p className="text-sm text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link 
            to="/register" 
            state={{ redirectTo: state?.redirectTo }}
            className="text-amber-600 hover:text-amber-800 font-semibold hover:underline transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;








// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email";
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     if (errors[name]) {
//       setErrors({ ...errors, [name]: "" });
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);

//     try {
//       await login(formData.email, formData.password);
//       alert("Login Successful! Welcome back.");
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Login error:", error);
      
//       let errorMessage = "Login failed. Please try again.";
//       if (error.code === 'auth/user-not-found') {
//         errorMessage = "No account found with this email.";
//       } else if (error.code === 'auth/wrong-password') {
//         errorMessage = "Incorrect password.";
//       } else if (error.code === 'auth/invalid-email') {
//         errorMessage = "Invalid email format.";
//       } else if (error.code === 'auth/too-many-requests') {
//         errorMessage = "Too many failed attempts. Try again later.";
//       }
      
//       alert(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4 pt-20">
//       {/* Background decoration */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full opacity-10"></div>
//       </div>

//       {/* Login Card */}
//       <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
//         {/* Logo/Icon */}
//         <div className="flex justify-center mb-6">
//           <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
//             <span className="text-white text-4xl font-bold">M</span>
//           </div>
//         </div>

//         {/* Header */}
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
//           <p className="text-gray-600">Please login to your account</p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-6">
          
//           {/* Email Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
//                 📧
//               </span>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email"
//                 className={`w-full pl-12 pr-4 py-3 border-2 ${
//                   errors.email ? 'border-red-500' : 'border-gray-200'
//                 } rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white`}
//               />
//             </div>
//             {errors.email && (
//               <p className="text-red-500 text-xs mt-2 flex items-center">
//                 <span className="mr-1">⚠️</span> {errors.email}
//               </p>
//             )}
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
//                 🔒
//               </span>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Enter your password"
//                 className={`w-full pl-12 pr-12 py-3 border-2 ${
//                   errors.password ? 'border-red-500' : 'border-gray-200'
//                 } rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white`}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//               >
//                 {showPassword ? "👁️" : "👁️‍🗨️"}
//               </button>
//             </div>
//             {errors.password && (
//               <p className="text-red-500 text-xs mt-2 flex items-center">
//                 <span className="mr-1">⚠️</span> {errors.password}
//               </p>
//             )}
//           </div>

//           {/* Remember Me & Forgot Password */}
//           <div className="flex items-center justify-between">
//             <label className="flex items-center cursor-pointer group">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
//               />
//               <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800">
//                 Remember me
//               </span>
//             </label>
//             <Link 
//               to="/forgot-password" 
//               className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
//             >
//               Forgot Password?
//             </Link>
//           </div>

//           {/* Login Button */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
//           >
//             {isLoading ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Logging in...
//               </>
//             ) : (
//               "Login"
//             )}
//           </button>
//         </form>

//         {/* Registration Link */}
//         <p className="text-sm text-center mt-6 text-gray-600">
//           Don't have an account?{" "}
//           <Link 
//             to="/register" 
//             className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
//           >
//             Create Account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;











// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Mail, Lock, Phone, Eye, EyeOff, LogIn } from "lucide-react";

// function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     mobile: "" // Added mobile field
//   });
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   // Mobile number validation
//   const validateMobile = (mobile) => {
//     const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile numbers starting with 6-9 and 10 digits
//     return mobileRegex.test(mobile);
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Email validation
//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }

//     // Password validation
//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     // Mobile validation (optional during login, but validate if provided)
//     if (formData.mobile && !validateMobile(formData.mobile)) {
//       newErrors.mobile = "Enter a valid 10-digit mobile number";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Auto-format mobile number (only digits)
//     if (name === "mobile") {
//       const numericValue = value.replace(/\D/g, "");
//       if (numericValue.length <= 10) {
//         setFormData({ ...formData, [name]: numericValue });
//       }
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }

//     // Clear error for this field when user starts typing
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: "" });
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // You can pass mobile as well if your login API supports it
//       await login(formData.email, formData.password);
      
//       // Show success message
//       alert("Login Successful! Welcome back.");
      
//       // Navigate to home/dashboard
//       navigate("/dashboard"); // or "/home" based on your routes

//     } catch (error) {
//       alert(error.message || "Login failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // For demo/quick login
//   const handleDemoLogin = () => {
//     setFormData({
//       email: "demo@user.com",
//       password: "demo123",
//       mobile: "9876543210"
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.02]">
        
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
//           <p className="text-gray-600">Please login to your account</p>
//         </div>

//         {/* Demo Login Button */}
//         <button
//           onClick={handleDemoLogin}
//           className="w-full mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
//         >
//           <LogIn size={18} />
//           Use Demo Credentials
//         </button>

//         <form onSubmit={handleLogin} className="space-y-5">
          
//           {/* Email Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email"
//                 className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//               />
//             </div>
//             {errors.email && (
//               <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//             )}
//           </div>

//           {/* Mobile Number Field (Optional during login) */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Mobile Number <span className="text-gray-400 text-xs">(Optional)</span>
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="tel"
//                 name="mobile"
//                 value={formData.mobile}
//                 onChange={handleChange}
//                 placeholder="Enter 10-digit mobile number"
//                 maxLength="10"
//                 className={`w-full pl-10 pr-3 py-3 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//               />
//             </div>
//             {errors.mobile && (
//               <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
//             )}
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Enter your password"
//                 className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             {errors.password && (
//               <p className="text-red-500 text-xs mt-1">{errors.password}</p>
//             )}
//           </div>

//           {/* Remember Me & Forgot Password */}
//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//               />
//               <span className="ml-2 text-sm text-gray-600">Remember me</span>
//             </label>
//             <Link 
//               to="/forgot-password" 
//               className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
//             >
//               Forgot Password?
//             </Link>
//           </div>

//           {/* Login Button */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {isLoading ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Logging in...
//               </>
//             ) : (
//               <>
//                 <LogIn size={18} />
//                 Login
//               </>
//             )}
//           </button>
//         </form>

//         {/* Registration Link */}
//         <p className="text-sm text-center mt-6 text-gray-600">
//           Don't have an account?{" "}
//           <Link 
//             to="/register" 
//             className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all"
//           >
//             Create Account
//           </Link>
//         </p>

//         {/* Terms */}
//         <p className="text-xs text-center mt-4 text-gray-500">
//           By logging in, you agree to our{" "}
//           <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link>{" "}
//           and{" "}
//           <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;







// import { Link } from "react-router-dom";

// function Login() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center">Customer Login</h2>
        
//         <form>
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full mb-4 p-3 border rounded"
//           />
          
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full mb-4 p-3 border rounded"
//           />
          
//           <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded">
//             Login
//           </button>
//         </form>
        
//         <p className="text-sm text-center mt-4">
//           Don't have an account?{" "}
//           <Link to="/register" className="text-blue-500 hover:underline cursor-pointer">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;













// //Login.jsx
// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// function Login({ setPage }) {
//   const { login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       await login(email, password);
//       alert("Login Successful!");

//       // After login go to home
//       setPage("home");

//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Customer Login
//         </h2>

//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full mb-4 p-3 border rounded"
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full mb-4 p-3 border rounded"
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded"
//           >
//             Login
//           </button>
//         </form>
// {/* Fixed registration Link */}
//         <p className="text-sm text-center mt-4">
//           Don’t have an account?{" "}
//           <span
//             onClick={() => navigate("register")}
//             className="text-blue-500 cursor-pointer hover:underline"
//           >
//             Register
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;
