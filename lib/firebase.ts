import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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

// Firebase Cloud Messaging (Push Notifications)
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates
// ⚠️ YOU MUST ADD YOUR VAPID KEY HERE after getting it from Firebase Console
const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || '';

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging || typeof window === 'undefined') return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

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

