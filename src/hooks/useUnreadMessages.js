import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../Components/AuthContext';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    let unsubscribe;
    let retryCount = 0;
    const maxRetries = 3;

    const setupListener = async () => {
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('recipientId', '==', currentUser.uid),
          where('read', '==', false)
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            setUnreadCount(snapshot.size);
            setError(null);
            retryCount = 0;
          },
          (error) => {
            console.error('Messages listener error:', error);
            setError(error);

            // Retry logic
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(setupListener, 2000 * retryCount); // Exponential backoff
            }
          }
        );
      } catch (error) {
        console.error('Setup listener error:', error);
        setError(error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  return { unreadCount, error };
}