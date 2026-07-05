import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDPZyvJ_AfKaF2iJorxRnY9GRpSb41lDJ4",
  authDomain: "rawsportslive-4b556.firebaseapp.com",
  projectId: "rawsportslive-4b556",
  storageBucket: "rawsportslive-4b556.firebasestorage.app",
  messagingSenderId: "434982559115",
  appId: "1:434982559115:web:92d35c78aee4507bd9238e",
  measurementId: "G-2EQ83E8FZX"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
