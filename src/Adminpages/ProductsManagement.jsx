// src/Adminpages/ProductManagement.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'furniture',
    image: '',
    inStock: true,
    featured: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    
    if (userData?.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
    }
  }, [currentUser, userData, navigate]);

  useEffect(() => {
    if (currentUser && userData?.role === 'admin') {
      fetchProducts();
    }
  }, [currentUser, userData]);

  const fetchProducts = async () => {
    setFetchLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate price
    if (isNaN(formData.price) || formData.price <= 0) {
      toast.error('Please enter a valid price');
      setLoading(false);
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        image: formData.image || '',
        inStock: formData.inStock,
        featured: formData.featured,
        updatedAt: new Date().toISOString()
      };

      if (editingProduct) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully!');
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        toast.success('Product added successfully!');
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product: ' + error.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Show loading while checking auth
  if (!currentUser || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
          />
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                category: 'furniture',
                image: '',
                inStock: true,
                featured: false
              });
              setShowModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <span>+</span> Add Product
          </button>
        </div>
      </div>

      {/* Loading State */}
      {fetchLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-300 rounded w-24"></div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 mb-4">No products found.</p>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    category: 'furniture',
                    image: '',
                    inStock: true,
                    featured: false
                  });
                  setShowModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative">
                  <img 
                    src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  {product.featured && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{product.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-amber-600">₹{product.price}</span>
                    <div className="space-x-3">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData(product);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="mt-3 text-xs text-gray-500">
                    Last updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  placeholder="e.g., Luxury Wooden Sofa"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    min="0"
                    step="1"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="furniture">Furniture</option>
                    <option value="lighting">Lighting</option>
                    <option value="decor">Decor</option>
                    <option value="fabric">Fabric</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="living">Living Room</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm">Featured Product</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}