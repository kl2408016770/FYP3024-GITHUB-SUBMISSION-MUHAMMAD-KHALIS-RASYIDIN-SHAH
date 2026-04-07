import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '../services/notificationService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        console.log('User role from Firestore:', userDoc.data().role);
        setUserData({ id: firebaseUser.uid, ...userDoc.data() });
      }
    } else {
      setUser(null);
      setUserData(null);
    }
    setLoading(false);
  });
  return unsubscribe;
}, []);

 const register = async (email, password, displayName, phone = '') => {
  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName });
      
      const userData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email,
        displayName,
        phone,
        points: 0,
        createdAt: new Date().toISOString(),
        role: 'user'
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await updateDoc(userRef, { pushToken: token });
          userData.pushToken = token;
        }
      } catch (pushError) {
        console.log('Push notification not available:', pushError.message);
      }
      
      setUserData(userData);
      return { success: true, user: firebaseUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    let userData = {};
    if (userDoc.exists()) {
      userData = { id: firebaseUser.uid, ...userDoc.data() };
      setUserData(userData);
    }
      
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await updateDoc(userRef, { pushToken: token });
          setUserData({ ...userData, pushToken: token });
        }
      } catch (pushError) {
        console.log('Push notification not available:', pushError.message);
      }
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserData = async (data) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, data);
      setUserData(prev => ({ ...prev, ...data }));
      
      if (data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userData,
    loading,
    register,
    login,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};