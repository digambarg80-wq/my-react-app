import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [averageRating, setAverageRating] = useState(0);
  
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log("Fetching reviews for product:", productId);
      
      // Simplified query - removed orderBy to avoid index requirement
      const q = query(
        collection(db, 'reviews'), 
        where('productId', '==', productId)
      );
      
      const snapshot = await getDocs(q);
      console.log("Reviews fetched:", snapshot.docs.length);
      
      const reviewsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort manually in JavaScript (newest first)
      reviewsList.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      setReviews(reviewsList);
      
      // Calculate average rating
      if (reviewsList.length > 0) {
        const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0);
        setAverageRating((sum / reviewsList.length).toFixed(1));
      } else {
        setAverageRating(0);
      }
      
      // Check if current user already reviewed
      if (currentUser) {
        const userReview = reviewsList.find(r => r.userId === currentUser.uid);
        if (userReview) {
          setUserReview(userReview);
        } else {
          setUserReview(null);
        }
      }
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to write a review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        productId,
        userId: currentUser.uid,
        userName: userData?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        userEmail: currentUser.email,
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      console.log("Submitting review:", reviewData);
      
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      console.log("Review saved with ID:", docRef.id);
      
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchReviews(); // Refresh reviews
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = async (reviewId) => {
    if (!editComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        rating: Number(editRating),
        comment: editComment.trim(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Review updated successfully!');
      setEditingId(null);
      fetchReviews();
      
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('Review deleted successfully');
      
      // Clear userReview if it was their review
      if (userReview?.id === reviewId) {
        setUserReview(null);
      }
      
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review: ' + error.message);
    }
  };

  const handleModerateReview = async (reviewId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'show' : 'hide'} this review?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: newStatus,
        moderatedAt: new Date().toISOString(),
        moderatedBy: currentUser?.uid
      });
      toast.success(`Review ${newStatus === 'active' ? 'shown' : 'hidden'} successfully`);
      fetchReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Failed to moderate review: ' + error.message);
    }
  };

  // Helper to render stars
  const renderStars = (rating, interactive = false, setRatingFn = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && setRatingFn && setRatingFn(i)}
          className={`text-2xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}`}
          disabled={!interactive}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  // Filter only active reviews for public display
  const visibleReviews = reviews.filter(r => r.status === 'active');
  const isAdmin = userData?.role === 'admin';

  // Log for debugging
  console.log("Current reviews:", reviews);
  console.log("Visible reviews:", visibleReviews);

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">Customer Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400 mr-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-gray-600">
                {averageRating} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Form - Only for logged in users who haven't reviewed */}
      {currentUser && !userReview && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">Write a Review</h4>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-1">
              {renderStars(rating, true, setRating)}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              rows="3"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* User's existing review - show edit option */}
      {userReview && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-2">Your Review</h4>
          
          {editingId === userReview.id ? (
            // Edit form
            <div>
              <div className="mb-3">
                <div className="flex gap-1">
                  {renderStars(editRating, true, setEditRating)}
                </div>
              </div>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="w-full p-2 border rounded-lg mb-2"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditReview(userReview.id)}
                  disabled={submitting}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Display user's review
            <div>
              <div className="flex text-yellow-400 mb-1">
                {renderStars(userReview.rating)}
              </div>
              <p className="text-gray-700 mb-2">{userReview.comment}</p>
              <p className="text-xs text-gray-500">
                {userReview.createdAt ? new Date(userReview.createdAt).toLocaleDateString() : 'Recently'}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditingId(userReview.id);
                    setEditComment(userReview.comment);
                    setEditRating(userReview.rating);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReview(userReview.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mx-auto"></div>
        </div>
      ) : visibleReviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map(review => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.userName}</span>
                    <span className="text-sm text-gray-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Panel for Moderation */}
      {isAdmin && reviews.filter(r => r.status !== 'active').length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h4 className="font-bold text-lg mb-4">Moderation Queue ({reviews.filter(r => r.status !== 'active').length})</h4>
          <div className="space-y-4">
            {reviews.filter(r => r.status !== 'active').map(review => (
              <div key={review.id} className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <p className="text-sm text-gray-600">{review.userEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModerateReview(review.id, 'active')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex text-yellow-400 mt-2">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-700 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}