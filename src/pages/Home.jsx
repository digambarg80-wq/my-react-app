

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Services from "../routes/Services";
import QuickViewModal from '../components/QuickViewModal';
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const images = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
];

function Home() {
  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(8);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Slider logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const displayedProducts = products.slice(0, displayLimit);
  const hasMoreProducts = products.length > displayLimit;

  const handleViewMore = () => {
    setDisplayLimit(prev => prev + 8);
  };

  const handleViewLess = () => {
    setDisplayLimit(8);
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    if (!currentUser) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product.id,
        product: product,
        quantity: 1,
        timestamp: new Date().toISOString()
      }));
      navigate('/login', { 
        state: { 
          message: "Please login to add items to cart",
          redirectTo: '/products'
        } 
      });
    } else {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/400/300?random=1';
  };

  return (
    <div className="w-full">
      {/* Hero Slider - WITHOUT SEARCH BAR */}
      <div
        className="h-[60vh] sm:h-screen bg-cover bg-center relative transition-all duration-700"
        style={{ backgroundImage: `url(${images[current]})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            Luxury Interior Design
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-300">
            Transforming Spaces Into Dream Homes
          </p>
          <Link
            to="/services"
            className="bg-amber-500 hover:bg-amber-600 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg rounded-lg transition duration-300"
          >
            Explore Services
          </Link>
        </div>
      </div>

    

      {/* Product Section */}
      <div id="products-section" className="py-12 sm:py-16 px-4 sm:px-10 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
            Our Products
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1 relative group"
                  >
                    {/* Quick View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition z-20 whitespace-nowrap text-sm sm:text-base font-medium shadow-lg"
                    >
                      Quick View
                    </button>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInWishlist(product.id)) {
                          removeFromWishlist(product.id);
                        } else {
                          addToWishlist(product);
                        }
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition z-10"
                    >
                      <span className="text-xl sm:text-2xl">
                        {isInWishlist(product.id) ? '❤️' : '🤍'}
                      </span>
                    </button>
                    
                    <img
                      src={product.image || 'https://picsum.photos/400/300?random=1'}
                      alt={product.name}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition duration-300"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{product.description}</p>
                      <p className="text-lg sm:text-xl font-bold text-amber-600 mb-2 sm:mb-3">₹ {product.price}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm font-medium"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View More / View Less Buttons */}
              <div className="flex flex-col sm:flex-row justify-center mt-8 sm:mt-10 gap-3 sm:gap-4">
                {hasMoreProducts && (
                  <button
                    onClick={handleViewMore}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition transform hover:scale-105 text-sm sm:text-base"
                  >
                    View More Products
                  </button>
                )}
                
                {displayLimit > 8 && (
                  <button
                    onClick={handleViewLess}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition transform hover:scale-105 text-sm sm:text-base"
                  >
                    Show Less
                  </button>
                )}
              </div>

              <p className="text-center text-gray-500 text-sm sm:text-base mt-4">
                Showing {displayedProducts.length} of {products.length} products
              </p>
            </>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default Home;



