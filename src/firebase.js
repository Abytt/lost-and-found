// src/firebase.js
/*import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOg1O0v-wNCV0JByYsjgDu2Q4cpBPKvQ0",
  authDomain: "lostfound-c1f18.firebaseapp.com",
  databaseURL: "https://lostfound-c1f18-default-rtdb.asia-southeast1.firebasedatabase.app", // Update this line
  projectId: "lostfound-c1f18",
  storageBucket: "lostfound-c1f18.appspot.com",
  messagingSenderId: "370830006628",
  appId: "1:370830006628:web:365a1163bb77094f8a8271",
  measurementId: "G-LP54SCT0PY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { app, database };*/

// Import required Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // ✅ Import Database
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXOkeIq2OeIh_RjsA_ccom0WHsxrD8apc",
  authDomain: "lostandfind-b3d72.firebaseapp.com",
  databaseURL: "https://lostandfind-b3d72-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ Add Database URL
  projectId: "lostandfind-b3d72",
  storageBucket: "lostandfind-b3d72.appspot.com", // ✅ Corrected the storage bucket URL
  messagingSenderId: "716726022794",
  appId: "1:716726022794:web:79055d4d26e2c27d99b373",
  measurementId: "G-HRJZKFGE57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // ✅ Initialize Database
const analytics = getAnalytics(app);

export { app, database };
