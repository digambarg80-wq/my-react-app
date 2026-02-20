import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import Services from "../routes/Services";

const images = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
];

function Home() {
  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(6); // Show 6 products initially
  const [loading, setLoading] = useState(true);

  // Slider logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products (you can also limit here if you want)
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

  // Get products to display based on limit
  const displayedProducts = products.slice(0, displayLimit);
  const hasMoreProducts = products.length > displayLimit;

  const handleViewMore = () => {
    setDisplayLimit(prev => prev + 6); // Show 6 more products
  };

  const handleViewLess = () => {
    setDisplayLimit(6); // Reset to 6 products
    // Scroll to products section
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">

      {/* Hero Slider */}
      <div
        className="h-screen bg-cover bg-center relative transition-all duration-700"
        style={{ backgroundImage: `url(${images[current]})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Luxury Interior Design
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300">
            Transforming Spaces Into Dream Homes
          </p>
          <Link
            to="/services"
            className="bg-amber-500 hover:bg-amber-600 px-6 py-3 text-lg rounded-lg transition duration-300"
          >
            Explore Services
          </Link>
        </div>
      </div>

      {/* Service Section */}
      <Services/> 

      {/* Product Section */}
      <div id="products-section" className="py-16 px-10 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Our Products
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1"
                  >
                    <img
                      src={product.image || 'https://via.placeholder.com/400x300?text=Mauli+Interior'}
                      alt={product.name}
                      className="h-48 w-full object-cover rounded"
                    />
                    <h3 className="text-xl font-semibold mt-4">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      ₹ {product.price}
                    </p>
                    <Link
                      to={`/products`}
                      state={{ selectedProduct: product }}
                      className="mt-4 inline-block bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition w-full text-center"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>

              {/* View More / View Less Buttons */}
              <div className="flex justify-center mt-10 gap-4">
                {hasMoreProducts && (
                  <button
                    onClick={handleViewMore}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-medium transition transform hover:scale-105"
                  >
                    View More Products
                  </button>
                )}
                
                {displayLimit > 6 && (
                  <button
                    onClick={handleViewLess}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition transform hover:scale-105"
                  >
                    Show Less
                  </button>
                )}
              </div>

              {/* Product count indicator */}
              <p className="text-center text-gray-500 mt-4">
                Showing {displayedProducts.length} of {products.length} products
              </p>
            </>
          )}
        </div>
      </div> 
    </div>
  );
}

export default Home;