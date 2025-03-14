import { getDatabase, ref, get } from "firebase/database";

const fetchEntries = async () => {
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
        console.error("Error fetching data:", error);
        return {};
    }
};

export default fetchEntries;
