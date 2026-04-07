import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const ADDRESSES_COLLECTION = 'addresses';


export const saveAddress = async (userId, addressData) => {
  try {
    const address = {
      userId,
      ...addressData,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, ADDRESSES_COLLECTION), address);
    return { success: true, addressId: docRef.id };
  } catch (error) {
    console.error('Error saving address:', error);
    return { success: false, error: error.message };
  }
};


export const getUserAddresses = async (userId) => {
  try {
    const q = query(
      collection(db, ADDRESSES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const addresses = [];
    querySnapshot.forEach((doc) => {
      addresses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { success: true, addresses };
  } catch (error) {
    console.error('Error getting addresses:', error);
    return { success: false, error: error.message };
  }
};


export const deleteAddress = async (addressId) => {
  try {
    await deleteDoc(doc(db, ADDRESSES_COLLECTION, addressId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: error.message };
  }
};


export const setDefaultAddress = async (userId, addressId) => {
  try {
    
    const q = query(
      collection(db, ADDRESSES_COLLECTION),
      where('userId', '==', userId),
      where('isDefault', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    querySnapshot.forEach((doc) => {
      updatePromises.push(updateDoc(doc.ref, { isDefault: false }));
    });
    
    await Promise.all(updatePromises);
    
    
    await updateDoc(doc(db, ADDRESSES_COLLECTION, addressId), { isDefault: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting default address:', error);
    return { success: false, error: error.message };
  }
};