import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';

const MENU_COLLECTION = 'menu';


export const getAllMenuItems = async () => {
  try {
    const q = query(collection(db, MENU_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, items };
  } catch (error) {
    console.error('Error getting menu items:', error);
    return { success: false, error: error.message };
  }
};


export const addMenuItem = async (itemData) => {
  try {
    const item = {
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, MENU_COLLECTION), item);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding menu item:', error);
    return { success: false, error: error.message };
  }
};


export const updateMenuItem = async (id, itemData) => {
  try {
    const itemRef = doc(db, MENU_COLLECTION, id);
    await updateDoc(itemRef, {
      ...itemData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating menu item:', error);
    return { success: false, error: error.message };
  }
};


export const deleteMenuItem = async (id) => {
  try {
    await deleteDoc(doc(db, MENU_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return { success: false, error: error.message };
  }
};


export const getMenuItemById = async (id) => {
  try {
    const docRef = doc(db, MENU_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, item: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Item not found' };
    }
  } catch (error) {
    console.error('Error getting menu item:', error);
    return { success: false, error: error.message };
  }
};