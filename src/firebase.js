// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBXOkeIq2OeIh_RjsA_ccom0WHsxrD8apc",
  authDomain: "lostandfind-b3d72.firebaseapp.com",
  databaseURL: "https://lostandfind-b3d72-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lostandfind-b3d72",
  storageBucket: "lostandfind-b3d72.firebasestorage.app",
  messagingSenderId: "716726022794",
  appId: "1:716726022794:web:74a54ca0125dc88e99b373",
  measurementId: "G-HCTX872QRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Export the services with clear names
export { app, auth, db, rtdb };

// Default export
export default app;