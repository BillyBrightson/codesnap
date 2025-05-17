import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import debug from 'debug';

const log = debug('app:firebase-admin');

log('Checking environment variables...');
log('FIREBASE_PROJECT_ID exists:', !!process.env.FIREBASE_PROJECT_ID);
log('FIREBASE_CLIENT_EMAIL exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);

log('Checking if any Firebase apps are initialized...');
log('Initialized apps:', getApps().length);

let adminAuth;
let adminDb;

try {
  if (!getApps().length) {
    log('Initializing Firebase Admin...');
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    log('Firebase Admin initialized successfully');
  }
  
  adminAuth = getAuth();
  adminDb = getFirestore();
  log('Firebase Admin Auth and Firestore initialized successfully');
} catch (error) {
  log('Error initializing Firebase Admin:', error);
  
  // Create a mock adminAuth object to prevent app from crashing
  adminAuth = {
    verifyIdToken: () => {
      log('WARNING: Using mock adminAuth. Firebase Admin is not properly initialized.');
      return Promise.reject(new Error('Firebase Admin is not properly initialized'));
    },
  };
  
  // Create a mock adminDb object
  adminDb = {
    collection: () => {
      log('WARNING: Using mock adminDb. Firebase Admin is not properly initialized.');
      return Promise.reject(new Error('Firebase Admin is not properly initialized'));
    },
  };
}

export { adminAuth, adminDb }; 