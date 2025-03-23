// src/Components/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile 
} from "firebase/auth";
import { auth, rtdb } from "../firebase"; // Make sure auth is imported
import { ref, get, set, onValue } from "firebase/database";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user'); // Default role is 'user'
  const [loading, setLoading] = useState(true);

  // Enhanced signup with role assignment
  async function signup(email, password, displayName, role = 'user') {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with displayName
      await updateProfile(userCredential.user, { displayName });
      
      // Store additional user info in Realtime Database
      await set(ref(rtdb, `users/${userCredential.user.uid}`), {
        name: displayName,
        email,
        role, // Store the role in database
        createdAt: new Date().toISOString()
      });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function updateUserProfile(displayName) {
    return updateProfile(auth.currentUser, { displayName });
  }

  // Check if user is admin - add debug logging
  function isAdmin() {
    console.log("isAdmin check - userRole:", userRole);
    return userRole === 'admin';
  }

  // Get user data from Realtime Database - Using onValue for real-time updates
  useEffect(() => {
    if (!currentUser) return;
    
    console.log("Setting up user data listener for:", currentUser.uid);
    const userRef = ref(rtdb, `users/${currentUser.uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("User data updated:", userData);
        setUserRole(userData.role || 'user');
      } else {
        console.log("No user data found!");
        setUserRole('user');
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
    });
    
    return unsubscribe;
  }, [currentUser]);

  // Auth state observer
  useEffect(() => {
    console.log("Setting up auth state observer");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.email : "logged out");
      setCurrentUser(user);
      
      if (!user) {
        setUserRole('user');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile
  };

  console.log("AuthContext providing value:", { 
    currentUser: currentUser?.email, 
    userRole, 
    isAdmin: isAdmin() 
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}