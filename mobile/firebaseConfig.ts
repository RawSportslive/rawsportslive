import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBwNbegQIrZicq7_GItryuyESSQdle7fM4",
  authDomain: "sportsview-75296.firebaseapp.com",
  projectId: "sportsview-75296",
  storageBucket: "sportsview-75296.firebasestorage.app",
  messagingSenderId: "100551356578",
  appId: "1:100551356578:web:b6154ea790a1bc88af67fb",
  measurementId: "G-ZDGFZLFE5K"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
