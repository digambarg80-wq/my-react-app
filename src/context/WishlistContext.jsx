import { createContext, useState, useContext, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from Firebase when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const wishlistRef = doc(db, 'wishlists', currentUser.uid);
      const wishlistDoc = await getDoc(wishlistRef);
      
      if (wishlistDoc.exists()) {
        setWishlistItems(wishlistDoc.data().items || []);
      } else {
        // Create wishlist for new user
        await setDoc(wishlistRef, { items: [], userId: currentUser.uid });
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!currentUser) {
      toast.error('Please login to save items to wishlist');
      return false;
    }

    try {
      const wishlistRef = doc(db, 'wishlists', currentUser.uid);
      
      // Check if product already in wishlist
      if (wishlistItems.some(item => item.id === product.id)) {
        toast.error('Item already in wishlist');
        return false;
      }

      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        addedAt: new Date().toISOString()
      };

      await updateDoc(wishlistRef, {
        items: arrayUnion(wishlistItem)
      });

      setWishlistItems(prev => [...prev, wishlistItem]);
      toast.success(`${product.name} added to wishlist!`);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!currentUser) return;

    try {
      const wishlistRef = doc(db, 'wishlists', currentUser.uid);
      const itemToRemove = wishlistItems.find(item => item.id === productId);
      
      if (itemToRemove) {
        await updateDoc(wishlistRef, {
          items: arrayRemove(itemToRemove)
        });

        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = async () => {
    if (!currentUser) return;

    try {
      const wishlistRef = doc(db, 'wishlists', currentUser.uid);
      await updateDoc(wishlistRef, { items: [] });
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};