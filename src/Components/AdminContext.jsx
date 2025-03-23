// src/Components/AdminContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getDatabase, ref, get, onValue } from "firebase/database";

// Create the context
const AdminContext = createContext();

// Custom hook to use the Admin context
export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const { currentUser } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalLostItems: 0,
    totalFoundItems: 0,
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdminUser(false);
        setLoading(false);
        return;
      }

      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setIsAdminUser(userData.role === 'admin');
        } else {
          setIsAdminUser(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdminUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Load admin dashboard statistics
  useEffect(() => {
    if (!currentUser || !isAdminUser) {
      return;
    }

    const db = getDatabase();
    setLoading(true);

    // Realtime listeners for admin stats
    // Users count
    const usersRef = ref(db, "users");
    const usersListener = onValue(usersRef, (snapshot) => {
      const usersCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      setAdminStats(prev => ({ ...prev, totalUsers: usersCount }));
    });

    // Entries (lost and found)
    const entriesRef = ref(db, "entries");
    const entriesListener = onValue(entriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const entries = snapshot.val();
        let lostCount = 0;
        let foundCount = 0;

        Object.values(entries).forEach(entry => {
          if (entry.type === "Lost") lostCount++;
          if (entry.type === "Found") foundCount++;
        });

        setAdminStats(prev => ({
          ...prev,
          totalLostItems: lostCount,
          totalFoundItems: foundCount
        }));
      } else {
        setAdminStats(prev => ({
          ...prev,
          totalLostItems: 0,
          totalFoundItems: 0
        }));
      }
    });

    // Matches
    const matchesRef = ref(db, "matches");
    const matchesListener = onValue(matchesRef, (snapshot) => {
      const matchesCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      setAdminStats(prev => ({ ...prev, totalMatches: matchesCount }));
      setLoading(false);
    });

    // Cleanup function
    return () => {
      // Detach listeners when component unmounts
      usersListener && usersListener();
      entriesListener && entriesListener();
      matchesListener && matchesListener();
    };
  }, [currentUser, isAdminUser]);

  // Function to check if user is admin
  const isAdmin = () => {
    return isAdminUser;
  };

  // Value to be provided by the context
  const value = {
    adminStats,
    loading,
    isAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export default AdminProvider;