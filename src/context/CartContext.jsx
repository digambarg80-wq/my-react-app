// src/context/CartContext.jsx
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import toast from 'react-hot-toast';
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(false);

  // Save cart to Firebase with error handling
  const saveCartToFirebase = useCallback(async (userId, items) => {
    if (!userId || firebaseError) return;
    try {
      await setDoc(doc(db, "carts", userId), {
        items: items,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Cart saved to Firebase for user:', userId);
    } catch (error) {
      console.error('Error saving cart to Firebase:', error);
      if (error.code === 'permission-denied') {
        setFirebaseError(true);
        toast.error('Cart sync disabled. Working offline.');
      }
    }
  }, [firebaseError]);

  // Load cart from Firebase with error handling
  const loadCartFromFirebase = useCallback(async (userId) => {
    if (!userId || firebaseError) return [];
    try {
      const cartDoc = await getDoc(doc(db, "carts", userId));
      if (cartDoc.exists()) {
        console.log('Cart loaded from Firebase for user:', userId);
        return cartDoc.data().items || [];
      }
    } catch (error) {
      console.error('Error loading cart from Firebase:', error);
      if (error.code === 'permission-denied') {
        setFirebaseError(true);
        toast.error('Cart sync disabled. Working offline.');
      }
    }
    return [];
  }, [firebaseError]);

  // Load cart when user changes
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (currentUser && !firebaseError) {
          // User is logged in - try Firebase first
          const firebaseCart = await loadCartFromFirebase(currentUser.uid);
          
          if (firebaseCart.length > 0) {
            // Cart exists in Firebase - use it
            setCartItems(firebaseCart);
            localStorage.setItem("cart", JSON.stringify(firebaseCart));
          } else {
            // No cart in Firebase - check localStorage
            const savedCart = localStorage.getItem("cart");
            if (savedCart && savedCart !== "undefined" && savedCart !== "null") {
              try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setCartItems(parsed);
                  // Try to save to Firebase but don't wait for it
                  saveCartToFirebase(currentUser.uid, parsed).catch(() => {});
                } else {
                  setCartItems([]);
                }
              } catch (e) {
                setCartItems([]);
              }
            } else {
              setCartItems([]);
            }
          }
        } else {
          // User is logged out or Firebase error - use localStorage only
          const savedCart = localStorage.getItem("cart");
          if (savedCart && savedCart !== "undefined" && savedCart !== "null") {
            try {
              const parsed = JSON.parse(savedCart);
              setCartItems(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [currentUser, firebaseError, loadCartFromFirebase, saveCartToFirebase]);

  // Save cart to both localStorage and Firebase when it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        // Always save to localStorage
        if (cartItems.length > 0) {
          localStorage.setItem("cart", JSON.stringify(cartItems));
        } else {
          localStorage.removeItem("cart");
        }
        
        // Save to Firebase if user is logged in and no Firebase error
        if (currentUser && !firebaseError) {
          await saveCartToFirebase(currentUser.uid, cartItems);
        }
      } catch (error) {
        console.error('Error in cart save effect:', error);
      }
    };

    // Debounce to avoid too many writes
    const timeoutId = setTimeout(saveCart, 500);
    return () => clearTimeout(timeoutId);
  }, [cartItems, currentUser, firebaseError, saveCartToFirebase]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      const existingItem = currentItems.find(item => item?.id === product.id);
      
      if (existingItem) {
        toast.success(`Added another ${product.name} to cart!`);
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 0) + quantity }
            : item
        );
      } else {
        toast.success(`${product.name} added to cart!`);
        return [...currentItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '',
          quantity: quantity
        }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      return currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      const item = currentItems.find(i => i.id === productId);
      if (item) {
        toast.success(`${item.name} removed from cart`);
      }
      return currentItems.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    if (currentUser && !firebaseError) {
      saveCartToFirebase(currentUser.uid, []).catch(() => {});
    }
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    const items = Array.isArray(cartItems) ? cartItems : [];
    return items.reduce((total, item) => {
      const price = Number(item?.price) || 0;
      const quantity = Number(item?.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getItemCount = () => {
    const items = Array.isArray(cartItems) ? cartItems : [];
    return items.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);
  };

  const placeOrder = async (orderDetails) => {
    if (!currentUser) {
      toast.error("You must be logged in to place an order");
      throw new Error("Not logged in");
    }

    const items = Array.isArray(cartItems) ? cartItems : [];
    if (items.length === 0) {
      toast.error("Your cart is empty");
      throw new Error("Cart empty");
    }

    // Validate payment status
    if (orderDetails.paymentMethod === 'razorpay' && orderDetails.paymentStatus !== 'paid') {
      toast.error("Payment not completed");
      throw new Error("Payment not completed");
    }

    setLoading(true);
    try {
      const orderData = {
        userId: currentUser.uid,
        customerName: orderDetails.name || currentUser.displayName || "Customer",
        customerEmail: currentUser.email,
        customerPhone: orderDetails.phone || "",
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || ""
        })),
        totalAmount: getCartTotal(),
        orderStatus: "pending",
        paymentStatus: orderDetails.paymentStatus || "pending",
        paymentMethod: orderDetails.paymentMethod || "cod",
        paymentId: orderDetails.paymentId || null,
        shippingAddress: `${orderDetails.address || ""}, ${orderDetails.city || ""} - ${orderDetails.pincode || ""}`,
        orderDate: new Date().toISOString(),
        notes: orderDetails.notes || "",
        createdAt: new Date().toISOString(),
        isPaidOnline: orderDetails.paymentMethod === 'razorpay' && orderDetails.paymentStatus === 'paid'
      };

      console.log("Placing order:", orderData);

      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order placed with ID:", docRef.id);
      
      // Clear cart after successful order
      clearCart();
      toast.success('Order placed successfully!');
      
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error('Error placing order: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getItemCount,
    placeOrder,
    loading,
    firebaseError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};