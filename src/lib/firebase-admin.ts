import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Debug: Log environment variables availability (without exposing values)
console.log("Firebase Admin initialization:");
console.log("- FIREBASE_PROJECT_ID exists:", !!process.env.FIREBASE_PROJECT_ID);
console.log("- FIREBASE_CLIENT_EMAIL exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("- FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);

// Check if we already have initialized apps
console.log("- Existing Firebase Admin apps:", getApps().length);

let adminAuth: any;

try {
  // Initialize Firebase Admin only if it hasn't been initialized yet
  const firebaseAdminApp = !getApps().length
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    : getApps()[0];

  console.log("Firebase Admin initialized successfully");
  adminAuth = getAuth(firebaseAdminApp);
  console.log("Firebase Admin Auth service initialized");
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  
  // Provide a mock admin auth object that will prevent the app from crashing
  // but will fail gracefully when methods are called
  adminAuth = {
    verifyIdToken: async () => {
      console.error("Using mock verifyIdToken because Firebase Admin failed to initialize");
      throw new Error("Firebase Admin not properly initialized");
    }
  };
}

export { adminAuth }; 