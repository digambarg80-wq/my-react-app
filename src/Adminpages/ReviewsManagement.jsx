import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to moderate');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('Review deleted');
      fetchReviews();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h1 className="text-3xl font-bold">Reviews Management</h1>
      </div>
      
      <div className="flex justify-end mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
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
              <th className="px-6 py-3 text-left">S.No</th>
              <th className="px-6 py-3 text-left">Product ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Rating</th>
              <th className="px-6 py-3 text-left">Review</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Verified</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review, index) => (
              <tr key={review.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-mono text-sm">
                  {review.productId?.slice(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{review.userName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{review.userEmail || ''}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <p className="text-sm">{review.comment || ''}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}
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
                <td className="px-6 py-4">
                  {review.verified ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
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