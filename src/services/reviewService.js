import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';

const REVIEWS_COLLECTION = 'reviews';

// Save a new review
export const saveReview = async (userId, productId, orderId, rating, comment) => {
  try {
    const review = {
      userId,
      productId,
      orderId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review);
    return { success: true, reviewId: docRef.id };
  } catch (error) {
    console.error('Error saving review:', error);
    return { success: false, error: error.message };
  }
};

// Get reviews for a product
export const getProductReviews = async (productId) => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { success: true, reviews };
  } catch (error) {
    console.error('Error getting reviews:', error);
    return { success: false, error: error.message };
  }
};

// Get average rating for a product
export const getProductAverageRating = async (productId) => {
  try {
    const result = await getProductReviews(productId);
    if (!result.success) return { success: false, error: result.error };
    
    const reviews = result.reviews;
    if (reviews.length === 0) {
      return { success: true, average: 0, count: 0 };
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    
    return { 
      success: true, 
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: reviews.length 
    };
  } catch (error) {
    console.error('Error calculating average:', error);
    return { success: false, error: error.message };
  }
};

// Check if user already reviewed a product in an order
export const hasUserReviewed = async (userId, productId, orderId) => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId),
      where('productId', '==', productId),
      where('orderId', '==', orderId)
    );
    
    const querySnapshot = await getDocs(q);
    return { success: true, reviewed: !querySnapshot.empty };
  } catch (error) {
    console.error('Error checking review:', error);
    return { success: false, error: error.message };
  }
};

export const getAllReviews = async () => {
  try {
    const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, reviews };
  } catch (error) {
    console.error('Error getting all reviews:', error);
    return { success: false, error: error.message };
  }
};

export const deleteReview = async (reviewId) => {
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }
};