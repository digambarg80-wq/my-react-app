// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext); // ✅ THIS MUST BE HERE

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Register function
  const register = async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: userData.name || userData.username || ''
      });

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name: userData.name || userData.username || '',
        email: userData.email,
        phone: userData.mobile || userData.phone || '',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await fetchUserData(user.uid);
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (uid, data) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      setUserData(prev => ({ ...prev, ...data }));
      
      if (data.name && currentUser) {
        await updateProfile(currentUser, {
          displayName: data.name
        });
      }
      
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      console.log('Fetching user data for uid:', uid);
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('User data found:', data);
        setUserData(data);
      } else {
        console.log("No user data found in Firestore for uid:", uid);
        // Create default user data if not exists
        const defaultUserData = {
          uid: uid,
          email: currentUser?.email || '',
          name: currentUser?.displayName || '',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        try {
          await setDoc(doc(db, "users", uid), defaultUserData);
          console.log('Created default user data');
          setUserData(defaultUserData);
        } catch (createError) {
          console.error('Error creating user data:', createError);
          setUserData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email);
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};