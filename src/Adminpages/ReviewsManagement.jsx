import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, hidden

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const reviewsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, status) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: status,
        moderatedAt: new Date().toISOString()
      });
      toast.success(`Review ${status === 'active' ? 'approved' : 'hidden'}`);
      fetchReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Failed to moderate review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Reviews</option>
          <option value="active">Approved</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Rating</th>
              <th className="px-6 py-3 text-left">Review</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map(review => (
              <tr key={review.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  {review.productId?.slice(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <p className="text-sm text-gray-500">{review.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex text-yellow-400">
                    {renderStars(review.rating)}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <p className="text-sm">{review.comment}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    review.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {review.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  {review.status !== 'active' && (
                    <button
                      onClick={() => handleModerate(review.id, 'active')}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Approve
                    </button>
                  )}
                  {review.status === 'active' && (
                    <button
                      onClick={() => handleModerate(review.id, 'hidden')}
                      className="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}