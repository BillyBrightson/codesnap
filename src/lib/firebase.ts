// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBr_l2tXPm0GGxp_kZp3u8zfz_hFHPhkCo",
  authDomain: "codesnap-c65ef.firebaseapp.com",
  projectId: "codesnap-c65ef",
  storageBucket: "codesnap-c65ef.firebasestorage.app",
  messagingSenderId: "523361568414",
  appId: "1:523361568414:web:f2494aa14b6e3fa38e5d8f",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth }; 