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
import { auth, rtdb } from "../firebase";
import { ref, get, set, onValue, update } from "firebase/database";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Enhanced signup with role assignment and better error handling
  async function signup(email, password, displayName, role = 'user') {
    try {
      console.log(`Signing up user: ${email} with role: ${role}`);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log(`User created successfully: ${user.uid}`);
      
      // Update profile with displayName
      await updateProfile(user, { displayName });
      console.log(`Profile updated with displayName: ${displayName}`);
      
      // Store user info in Realtime Database
      const userData = {
        name: displayName,
        email,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      const userRef = ref(rtdb, `users/${user.uid}`);
      await set(userRef, userData);
      console.log(`User data saved to database at path: users/${user.uid}`, userData);
      
      // Update local state immediately
      setUserRole(role);
      
      return userCredential;
    } catch (error) {
      console.error("Error during signup process:", error.code, error.message);
      throw error;
    }
  }

  function login(email, password) {
    console.log(`Attempting login for: ${email}`);
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        // Update last login timestamp
        try {
          const userRef = ref(rtdb, `users/${result.user.uid}`);
          await update(userRef, {
            lastLogin: new Date().toISOString()
          });
          console.log(`Updated last login for: ${email}`);
        } catch (err) {
          console.warn("Could not update last login time:", err);
        }
        return result;
      });
  }

  function logout() {
    console.log("Logging out user");
    return signOut(auth);
  }

  function resetPassword(email) {
    console.log(`Sending password reset email to: ${email}`);
    return sendPasswordResetEmail(auth, email);
  }

  function updateUserProfile(displayName) {
    if (!auth.currentUser) {
      console.error("No authenticated user to update profile");
      return Promise.reject(new Error("No authenticated user"));
    }
    
    console.log(`Updating profile for ${auth.currentUser.email} to: ${displayName}`);
    
    return updateProfile(auth.currentUser, { displayName })
      .then(async () => {
        // Also update the name in the database
        try {
          const userRef = ref(rtdb, `users/${auth.currentUser.uid}`);
          await update(userRef, { name: displayName });
          console.log("Name updated in database");
        } catch (err) {
          console.warn("Could not update name in database:", err);
        }
      });
  }

  // Check if user is admin
  function isAdmin() {
    console.log("isAdmin check - userRole:", userRole);
    return userRole === 'admin';
  }

  // Fetch user data from database - with retry logic
  async function fetchUserData(uid, retryCount = 0) {
    if (retryCount > 3) {
      console.error("Failed to fetch user data after multiple attempts");
      setUserRole('user');
      setUserDataLoaded(true);
      return;
    }
    
    try {
      console.log(`Fetching user data for: ${uid} (attempt ${retryCount + 1})`);
      const userRef = ref(rtdb, `users/${uid}`);
      
      return new Promise((resolve) => {
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("User data retrieved:", userData);
            setUserRole(userData.role || 'user');
            setUserDataLoaded(true);
            resolve(userData);
          } else {
            console.log("No user data found in database. Creating default entry.");
            // Create default user entry if not exists
            const defaultUserData = {
              email: auth.currentUser?.email || '',
              name: auth.currentUser?.displayName || '',
              role: 'user',
              createdAt: new Date().toISOString()
            };
            
            set(userRef, defaultUserData)
              .then(() => {
                console.log("Created default user entry");
                setUserRole('user');
                setUserDataLoaded(true);
                resolve(defaultUserData);
              })
              .catch(error => {
                console.error("Error creating default user entry:", error);
                // Retry after a delay
                setTimeout(() => fetchUserData(uid, retryCount + 1), 1000);
              });
          }
        }, (error) => {
          console.error("Error in onValue listener:", error);
          // Retry after a delay
          setTimeout(() => fetchUserData(uid, retryCount + 1), 1000);
        });
      });
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      // Retry after a delay
      setTimeout(() => fetchUserData(uid, retryCount + 1), 1000);
    }
  }

  // User data listener set up when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setUserRole('user');
      setUserDataLoaded(false);
      return;
    }
    
    console.log("Setting up user data listener for:", currentUser.uid);
    fetchUserData(currentUser.uid);
    
    const userRef = ref(rtdb, `users/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("User data updated from listener:", userData);
        setUserRole(userData.role || 'user');
        setUserDataLoaded(true);
      }
    }, (error) => {
      console.error("Error in user data listener:", error);
    });
    
    return unsubscribe;
  }, [currentUser]);

  // Auth state observer
  useEffect(() => {
    console.log("Setting up auth state observer");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `${user.email} (${user.uid})` : "logged out");
      setCurrentUser(user);
      
      if (!user) {
        setUserRole('user');
        setUserDataLoaded(false);
        setLoading(false);
      }
    });
    
    return unsubscribe;
  }, []);

  // Set loading to false once we have both auth state and user data
  useEffect(() => {
    if (currentUser === null || userDataLoaded) {
      setLoading(false);
    }
  }, [currentUser, userDataLoaded]);

  const value = {
    currentUser,
    userRole,
    isAdmin,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    loading
  };

  console.log("AuthContext providing value:", {
    currentUser: currentUser?.email,
    userRole,
    isAdmin: isAdmin(),
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}