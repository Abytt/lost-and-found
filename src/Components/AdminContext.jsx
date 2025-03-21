// src/Components/AdminContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getDatabase, ref, get } from "firebase/database";

// Create the context
const AdminContext = createContext();

// Custom hook to use the Admin context
export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  // Get auth information with safe fallbacks
  const auth = useAuth() || {};
  const currentUser = auth.currentUser;
  const isAdminFunc = auth.isAdmin;
  
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalLostItems: 0,
    totalFoundItems: 0,
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);

  // Helper function to safely check admin status
  const checkIsAdmin = () => {
    return isAdminFunc && typeof isAdminFunc === 'function' && isAdminFunc();
  };

  // Load admin dashboard statistics
  useEffect(() => {
    async function loadAdminStats() {
      // Only proceed if user is logged in and is admin
      if (!currentUser || !checkIsAdmin()) {
        setLoading(false);
        return;
      }

      try {
        const db = getDatabase();
        
        // Fetch users count
        const usersRef = ref(db, "users");
        const usersSnapshot = await get(usersRef);
        const usersCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
        
        // Fetch entries
        const entriesRef = ref(db, "entries");
        const entriesSnapshot = await get(entriesRef);
        let lostCount = 0;
        let foundCount = 0;
        
        if (entriesSnapshot.exists()) {
          const entries = entriesSnapshot.val();
          Object.values(entries).forEach(entry => {
            if (entry.type === "Lost") lostCount++;
            if (entry.type === "Found") foundCount++;
          });
        }
        
        // Fetch matches
        const matchesRef = ref(db, "matches");
        const matchesSnapshot = await get(matchesRef);
        const matchesCount = matchesSnapshot.exists() ? Object.keys(matchesSnapshot.val()).length : 0;
        
        setAdminStats({
          totalUsers: usersCount,
          totalLostItems: lostCount,
          totalFoundItems: foundCount,
          totalMatches: matchesCount
        });
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Check if we can load stats
    if (currentUser) {
      loadAdminStats();
    } else {
      setLoading(false);
    }
  }, [currentUser, isAdminFunc]);

  // Function to refresh stats
  const refreshStats = async () => {
    if (!currentUser || !checkIsAdmin()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const db = getDatabase();
      
      // Fetch users count
      const usersRef = ref(db, "users");
      const usersSnapshot = await get(usersRef);
      const usersCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
      
      // Fetch entries
      const entriesRef = ref(db, "entries");
      const entriesSnapshot = await get(entriesRef);
      let lostCount = 0;
      let foundCount = 0;
      
      if (entriesSnapshot.exists()) {
        const entries = entriesSnapshot.val();
        Object.values(entries).forEach(entry => {
          if (entry.type === "Lost") lostCount++;
          if (entry.type === "Found") foundCount++;
        });
      }
      
      // Fetch matches
      const matchesRef = ref(db, "matches");
      const matchesSnapshot = await get(matchesRef);
      const matchesCount = matchesSnapshot.exists() ? Object.keys(matchesSnapshot.val()).length : 0;
      
      setAdminStats({
        totalUsers: usersCount,
        totalLostItems: lostCount,
        totalFoundItems: foundCount,
        totalMatches: matchesCount
      });
    } catch (error) {
      console.error("Error refreshing admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided by the context
  const value = {
    adminStats,
    refreshStats,
    loading,
    isAdmin: checkIsAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export default AdminProvider;