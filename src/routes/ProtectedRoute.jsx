// routes/ProtectedRoute.jsx
// routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (currentUser) {
        if (userData) {
          setUserRole(userData.role || 'customer');
        } else {
          // Try to fetch directly if userData is not available
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              setUserRole(userDoc.data().role || 'customer');
            } else {
              setUserRole('customer');
            }
          } catch (error) {
            console.error('Error fetching role:', error);
            setUserRole('customer');
          }
        }
      }
      setLoading(false);
    };

    checkUserRole();
  }, [currentUser, userData]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (adminOnly && userRole !== 'admin') {
    console.log('Admin access denied. User role:', userRole);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;







// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useState, useEffect } from "react";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../firebase";

// function ProtectedRoute({ children, adminOnly = false }) {
//   const { currentUser } = useAuth();
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserRole = async () => {
//       if (currentUser) {
//         try {
//           // 🔴 TEMPORARY: Hardcode your email as admin
//           if (currentUser.email === 'digambarg80@gmail.com') { // CHANGE THIS TO YOUR EMAIL
//             setUserRole('admin');
//             setLoading(false);
//             return;
//           }
          
//           const userDocRef = doc(db, 'users', currentUser.uid);
//           const userDoc = await getDoc(userDocRef);
          
//           if (userDoc.exists()) {
//             const data = userDoc.data();
//             setUserRole(data.role || 'customer');
//           } else {
//             setUserRole('customer');
//           }
//         } catch (error) {
//           console.error('Error fetching user role:', error);
//           setUserRole('customer');
//         }
//       }
//       setLoading(false);
//     };

//     fetchUserRole();
//   }, [currentUser]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   if (adminOnly && userRole !== 'admin') {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

// export default ProtectedRoute;