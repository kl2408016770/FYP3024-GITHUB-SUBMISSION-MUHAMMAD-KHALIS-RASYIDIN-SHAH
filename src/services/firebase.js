import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyCoNHuRBahgYawpgPHy4wzx4VEh71w1A7c",
  authDomain: "chicoconnect.firebaseapp.com",
  projectId: "chicoconnect",
  storageBucket: "chicoconnect.firebasestorage.app",
  messagingSenderId: "611564513527",
  appId: "1:611564513527:web:bfbae67a6d7f5d63b00bf2"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);