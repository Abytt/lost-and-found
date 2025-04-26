// src/Components/fetchEntries.js
import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";

// Fetch all entries (for admins)
export const fetchAllEntries = async () => {
    const db = getDatabase();
    const dbRef = ref(db, "entries");

    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return {};
        }
    } catch (error) {
        console.error("Error fetching all entries:", error);
        return {};
    }
};

// Fetch user's entries only
export const fetchUserEntries = async (userId) => {
    const db = getDatabase();
    const dbRef = ref(db, "entries");
    
    try {
        // For Realtime Database, we need to fetch all and filter
        // If you have a large dataset, consider restructuring your database
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
            const allEntries = snapshot.val();
            const userEntries = {};
            
            // Filter entries by userId
            Object.keys(allEntries).forEach(key => {
                if (allEntries[key].userId === userId) {
                    userEntries[key] = allEntries[key];
                }
            });
            
            return userEntries;
        } else {
            return {};
        }
    } catch (error) {
        console.error("Error fetching user entries:", error);
        return {};
    }
};

// Fetch entries based on user role
export const fetchEntries = async (user, isAdmin) => {
    if (!user) {
        return {};
    }
    
    if (isAdmin) {
        return fetchAllEntries();
    } else {
        return fetchUserEntries(user.uid);
    }
};

// Fetch lost items
export const fetchLostItems = async (user, isAdmin) => {
    const db = getDatabase();
    const entriesRef = ref(db, "entries");
    
    try {
        const snapshot = await get(entriesRef);
        if (snapshot.exists()) {
            const allEntries = snapshot.val();
            const lostItems = {};
            
            // Filter for lost items
            Object.keys(allEntries).forEach(key => {
                if (allEntries[key].type === "lost") {
                    // For admin, include all lost items
                    // For regular users, only include their own items
                    if (isAdmin || allEntries[key].userId === user.uid) {
                        lostItems[key] = allEntries[key];
                    }
                }
            });
            
            return lostItems;
        } else {
            return {};
        }
    } catch (error) {
        console.error("Error fetching lost items:", error);
        return {};
    }
};

// Fetch found items
export const fetchFoundItems = async (user, isAdmin) => {
    const db = getDatabase();
    const entriesRef = ref(db, "entries");
    
    try {
        const snapshot = await get(entriesRef);
        if (snapshot.exists()) {
            const allEntries = snapshot.val();
            const foundItems = {};
            
            // Filter for found items
            Object.keys(allEntries).forEach(key => {
                if (allEntries[key].type === "found") {
                    // For admin, include all found items
                    // For regular users, only include their own items
                    if (isAdmin || allEntries[key].userId === user.uid) {
                        foundItems[key] = allEntries[key];
                    }
                }
            });
            
            return foundItems;
        } else {
            return {};
        }
    } catch (error) {
        console.error("Error fetching found items:", error);
        return {};
    }
};

// Fetch matches
export const fetchMatches = async (user, isAdmin) => {
    const db = getDatabase();
    const matchesRef = ref(db, "matches");
    
    try {
        const snapshot = await get(matchesRef);
        if (snapshot.exists()) {
            const allMatches = snapshot.val();
            
            // For admin, return all matches
            if (isAdmin) {
                return allMatches;
            }
            
            // For regular users, only include matches related to their items
            const userMatches = {};
            Object.keys(allMatches).forEach(key => {
                const match = allMatches[key];
                if (match.lostItemUserId === user.uid || match.foundItemUserId === user.uid) {
                    userMatches[key] = match;
                }
            });
            
            return userMatches;
        } else {
            return {};
        }
    } catch (error) {
        console.error("Error fetching matches:", error);
        return {};
    }
};

export default fetchEntries;