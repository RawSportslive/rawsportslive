import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Parse service account from environment variable (set on Vercel)
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Use service account credentials from environment variable
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    const parsed = JSON.parse(serviceAccount);
    return initializeApp({
      credential: cert(parsed),
    });
  }

  // Fallback: initialize with project ID only (works for same-project access)
  return initializeApp({
    credential: cert({
      projectId: "sportsview-75296",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = getFirestore(getAdminApp());
