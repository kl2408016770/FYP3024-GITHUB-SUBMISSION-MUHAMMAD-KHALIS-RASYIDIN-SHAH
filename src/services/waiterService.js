import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';

const WAITER_COLLECTION = 'waiter_requests';

export const saveWaiterRequest = async (tableNumber, requestType, orderId = null) => {
  try {
    const request = {
      tableNumber,
      requestType,
      orderId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, WAITER_COLLECTION), request);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving waiter request:', error);
    return { success: false, error: error.message };
  }
};

export const getWaiterRequests = async () => {
  try {
    const q = query(collection(db, WAITER_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, requests };
  } catch (error) {
    console.error('Error getting waiter requests:', error);
    return { success: false, error: error.message };
  }
};

export const markRequestResolved = async (requestId) => {
  try {
    const requestRef = doc(db, WAITER_COLLECTION, requestId);
    await updateDoc(requestRef, { status: 'resolved', resolvedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error('Error marking request resolved:', error);
    return { success: false, error: error.message };
  }
};

export const deleteWaiterRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, WAITER_COLLECTION, requestId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting waiter request:', error);
    return { success: false, error: error.message };
  }
};