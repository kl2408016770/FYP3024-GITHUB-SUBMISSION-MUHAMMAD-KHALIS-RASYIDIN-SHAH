import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';  // Added doc and updateDoc

const ORDERS_COLLECTION = 'orders';

// Save a new order (updated with address)
export const saveOrder = async (orderData) => {
  try {
    const order = {
      userId: orderData.userId,
      items: orderData.items,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      orderType: orderData.orderType,
      tableNumber: orderData.tableNumber,
      address: orderData.address,
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderNumber: 'ORD-' + Date.now().toString().slice(-8)
    };
    
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
    return { success: true, orderId: docRef.id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error('Error saving order:', error);
    return { success: false, error: error.message };
  }
};

// Get user's order history
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: error.message };
  }
};

export const getAllOrders = async () => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting all orders:', error);
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
};