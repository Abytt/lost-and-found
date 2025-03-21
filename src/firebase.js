// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXOkeIq2OeIh_RjsA_ccom0WHsxrD8apc",
  authDomain: "lostandfind-b3d72.firebaseapp.com",
  databaseURL: "https://lostandfind-b3d72-default-rtdb.asia-southeast1.firebasedatabase.app", 
  projectId: "lostandfind-b3d72",
  storageBucket: "lostandfind-b3d72.appspot.com",
  messagingSenderId: "716726022794",
  appId: "1:716726022794:web:79055d4d26e2c27d99b373",
  measurementId: "G-HRJZKFGE57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app); // Make sure this is called
const analytics = getAnalytics(app);
const db = getFirestore(app);  // Add this line

export { app, database, auth, db };
export default app;