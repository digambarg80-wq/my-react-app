import WhatsAppButton from '../components/WhatsAppButton';
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext"; // ADDED
import { useNavigate } from "react-router-dom";
import { ProductSkeleton } from '../components/LoadingSkeleton';
import ProductReviews from '../components/ProductReviews';


function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Search, Filter, Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(); // ADDED
  const navigate = useNavigate();

  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/400/300?random=1';
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters whenever products, search, category, priceRange, or sortBy changes
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      
      const uniqueCategories = [...new Set(productList.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Set max price for filter
      const maxPrice = Math.max(...productList.map(p => p.price || 0));
      setPriceRange({ min: 0, max: maxPrice || 100000 });
      
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    filtered = filtered.filter(p => 
      p.price >= priceRange.min && p.price <= priceRange.max
    );

    // Apply sorting
    switch(sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    const maxPrice = Math.max(...products.map(p => p.price || 0), 1000);
    setPriceRange({ min: 0, max: maxPrice });
    setSortBy("default");
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
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
          message: "Please login or create an account to add items to cart",
          redirectTo: '/products'
        } 
      });
    } else {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(n => <ProductSkeleton key={n} />)}
        </div>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <button
          onClick={() => setSelectedProduct(null)}
          className="mb-6 text-amber-500 hover:text-amber-600 flex items-center gap-2"
        >
          ← Back to Products
        </button>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={selectedProduct.image || `https://picsum.photos/600/400?random=${selectedProduct.id}`}
              alt={selectedProduct.name}
              className="w-full rounded-xl shadow-lg"
              onError={handleImageError}
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{selectedProduct.name}</h1>
            {selectedProduct.category && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm capitalize">
                {selectedProduct.category}
              </span>
            )}
            <p className="text-3xl font-bold text-amber-600 my-4">₹{selectedProduct.price}</p>
            <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
            
            <div className="space-y-3">
              {/* ADDED: Wishlist Button in Product Detail */}
              <button
                onClick={() => {
                  if (isInWishlist(selectedProduct.id)) {
                    removeFromWishlist(selectedProduct.id);
                  } else {
                    addToWishlist(selectedProduct);
                  }
                }}
                className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  isInWishlist(selectedProduct.id)
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{isInWishlist(selectedProduct.id) ? '❤️' : '🤍'}</span>
                {isInWishlist(selectedProduct.id) ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>

              <button
                onClick={() => handleAddToCart(selectedProduct)}
                disabled={!selectedProduct.inStock}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  selectedProduct.inStock
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <WhatsAppButton product={selectedProduct} />
            </div>
          </div>
        </div>
        
        <ProductReviews productId={selectedProduct.id} />
      </div>
    );
  }

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">Our Products</h1>

      {/* Search and Filter Bar */}
      <div className="mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full md:hidden bg-gray-100 p-3 rounded-lg mb-3 flex justify-between items-center"
        >
          <span>Filter & Sort Products</span>
          <span>{showFilters ? '▲' : '▼'}</span>
        </button>

        <div className={`${showFilters ? 'block' : 'hidden'} md:block bg-white p-6 rounded-xl shadow-lg mb-6`}>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Search Products</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, description, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border rounded-lg pl-10"
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Price Range Filter - Only Number Inputs */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Price Range: ₹{priceRange.min} - ₹{priceRange.max}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max={priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    setPriceRange({ 
                      ...priceRange, 
                      min: Math.min(value, priceRange.max) 
                    });
                  }}
                  className="w-1/2 p-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  min={priceRange.min}
                  max="1000000"
                  value={priceRange.max}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setPriceRange({ 
                      ...priceRange, 
                      max: Math.max(value, priceRange.min) 
                    });
                  }}
                  className="w-1/2 p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Category Pills and Clear Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Categories:</span>
            <button
              onClick={() => filterByCategory("all")}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedCategory === "all"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => filterByCategory(category)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition ${
                  selectedCategory === category
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
            
            {(searchTerm || selectedCategory !== "all" || sortBy !== "default" || priceRange.min > 0 || priceRange.max < Math.max(...products.map(p => p.price || 0))) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center col-span-3 py-12">
            <p className="text-gray-500 text-lg mb-4">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer relative"
              onClick={() => setSelectedProduct(product)}
            >
              {/* ADDED: Wishlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInWishlist(product.id)) {
                    removeFromWishlist(product.id);
                  } else {
                    addToWishlist(product);
                  }
                }}
                className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition z-10"
              >
                <span className="text-2xl">
                  {isInWishlist(product.id) ? '❤️' : '🤍'}
                </span>
              </button>
              
              <img
                src={product.image || `https://picsum.photos/400/300?random=${product.id}`}
                alt={product.name}
                className="w-full h-64 object-cover"
                onError={handleImageError}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  {product.category && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs capitalize">
                      {product.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-2xl font-bold text-amber-600">₹{product.price}</p>
                  {!product.inStock && (
                    <span className="text-red-500 text-sm">Out of Stock</span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={!product.inStock}
                  className={`w-full mt-4 py-2 rounded-lg transition ${
                    product.inStock 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}

export default Products;