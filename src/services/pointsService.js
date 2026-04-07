import { db } from './firebase';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';

const USERS_COLLECTION = 'users';


export const getUserPoints = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, points: userSnap.data().points || 0 };
    } else {
      
      await setDoc(userRef, { points: 0, createdAt: new Date().toISOString() });
      return { success: true, points: 0 };
    }
  } catch (error) {
    console.error('Error getting user points:', error);
    return { success: false, error: error.message };
  }
};


export const addPoints = async (userId, pointsToAdd) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      points: increment(pointsToAdd)
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding points:', error);
    return { success: false, error: error.message };
  }
};


export const deductPoints = async (userId, pointsToDeduct) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      points: increment(-pointsToDeduct)
    });
    return { success: true };
  } catch (error) {
    console.error('Error deducting points:', error);
    return { success: false, error: error.message };
  }
};


export const calculatePointsFromOrder = (orderTotal) => {
  return Math.floor(orderTotal); 
};


export const hasEnoughPoints = (userPoints, requiredPoints) => {
  return userPoints >= requiredPoints;
};