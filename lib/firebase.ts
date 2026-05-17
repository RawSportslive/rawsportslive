import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

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
export const storage = getStorage(app);

// Enable Offline Persistence for Instant Loads ONLY in the browser
export const db = typeof window !== 'undefined'
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    })
  : getFirestore(app);

// Initialize Analytics conditionally
export const analytics = typeof window !== 'undefined' ? 
  isSupported().then(yes => yes ? getAnalytics(app) : null) : 
  null;

// Connection test as per critical constraint
export async function testFirebaseConnection() {
  try {
    const testDoc = doc(db, '_connection_test_', 'status');
    await getDocFromServer(testDoc);
    console.log('Firebase connected successfully');
  } catch (error: any) {
    if (error?.message?.includes('offline')) {
      console.error('Firebase client is offline. Check configuration.');
    } else {
      console.log('Firebase connection check (ignore if expected):', error.message);
    }
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

