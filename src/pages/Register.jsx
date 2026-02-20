//src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Phone, Eye, EyeOff, User, ArrowRight, CheckCircle } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Mobile number validation (compulsory)
  const validateMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile numbers starting with 6-9 and 10 digits
    return mobileRegex.test(mobile);
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers,
      strength: {
        length: password.length >= 8,
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        number: hasNumbers,
        specialChar: hasSpecialChar
      }
    };
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 20) {
      newErrors.username = "Username must be less than 20 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Mobile validation (COMPULSORY)
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit Indian mobile number starting with 6-9";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and numbers";
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement
    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format mobile number (only digits)
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register user with all fields
      await register({
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });
      
      // Show success message
      alert("Registration Successful! Please check your email for verification.");
      
      // Navigate to login page
      navigate("/login");

    } catch (error) {
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const passwordValidation = formData.password ? validatePassword(formData.password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.02]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join us today! Fill in your details below.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className={`w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Mobile Number Field (COMPULSORY) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                className={`w-full pl-10 pr-3 py-3 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              />
              {formData.mobile && formData.mobile.length === 10 && !errors.mobile && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
              )}
            </div>
            {errors.mobile && (
              <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && passwordValidation && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`${passwordValidation.strength.length ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ 8+ characters
                  </span>
                  <span className={`${passwordValidation.strength.upperCase ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Uppercase
                  </span>
                  <span className={`${passwordValidation.strength.lowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Lowercase
                  </span>
                  <span className={`${passwordValidation.strength.number ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Number
                  </span>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <Link to="/terms" className="text-green-600 hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
              <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white p-3 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                Register Now
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-sm text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-green-600 hover:text-green-800 font-semibold hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>

        {/* Required Fields Note */}
        <p className="text-xs text-center mt-4 text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </p>
      </div>
    </div>
  );
}

export default Register;








// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function Register() {
//   const navigate = useNavigate();
//   const { register } = useAuth();

//   const [user, setUser] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setUser({ ...user, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     try {
//       await register(user);
//       alert("Registration Successful! Check your email for verification.");
//       navigate("/login");
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Customer Register
//         </h2>

//         <form onSubmit={handleRegister}>
//           <input
//             type="text"
//             name="username"
//             placeholder="Username"
//             onChange={handleChange}
//             className="w-full mb-4 p-3 border rounded"
//           />

//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={handleChange}
//             className="w-full mb-4 p-3 border rounded"
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//             className="w-full mb-4 p-3 border rounded"
//           />

//           <button
//             type="submit"
//             className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded"
//           >
//             Register
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Register;
























// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function Register() {
//   const navigate = useNavigate();
//   const { register } = useAuth();

//   const [user, setUser] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });

//   const [otp, setOtp] = useState("");
//   const [generatedOtp, setGeneratedOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);

//   const handleChange = (e) => {
//     setUser({ ...user, [e.target.name]: e.target.value });
//   };

//   const sendOtp = () => {
//     const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
//     setGeneratedOtp(newOtp);
//     alert("Demo OTP: " + newOtp); // demo only
//     setOtpSent(true);
//   };

//  const verifyOtp = async () => {
//   if (otp === generatedOtp) {
//     try {
//       await register(user);
//       alert("Registration Successful!");
//       navigate("/login");
//     } catch (error) {
//       alert(error.message);
//     }
//   } else {
//     alert("Invalid OTP");
//   }
// };


//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Customer Register
//         </h2>

//         {!otpSent ? (
//           <>
//             <input
//               type="text"
//               name="username"
//               placeholder="Username"
//               onChange={handleChange}
//               className="w-full mb-4 p-3 border rounded"
//             />

//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               onChange={handleChange}
//               className="w-full mb-4 p-3 border rounded"
//             />

//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full mb-4 p-3 border rounded"
//             />

//             <button
//               onClick={sendOtp}
//               className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded"
//             >
//               Send OTP
//             </button>
//           </>
//         ) : (
//           <>
//             <input
//               type="text"
//               placeholder="Enter OTP"
//               onChange={(e) => setOtp(e.target.value)}
//               className="w-full mb-4 p-3 border rounded"
//             />

//             <button
//               onClick={verifyOtp}
//               className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded"
//             >
//               Verify OTP
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Register;
