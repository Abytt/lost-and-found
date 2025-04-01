import { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../Components/AuthContext';

export function useUnreadMessages() {
    const [unreadCount, setUnreadCount] = useState(0);
    const { currentUser } = useAuth();

    const playNotificationSound = () => {
        const audio = new Audio('/notification.mp3'); // Add an audio file to your public folder
        audio.play().catch(err => console.log('Error playing notification sound:', err));
    };

    useEffect(() => {
        let previousCount = 0;
        
        if (!currentUser) {
            setUnreadCount(0);
            return;
        }

        const messagesRef = ref(rtdb, 'messages');
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const messages = Object.values(snapshot.val());
                const unreadMessages = messages.filter(msg => 
                    (msg.recipientId === currentUser.uid || msg.recipientEmail === currentUser.email) 
                    && !msg.read
                );
                const newCount = unreadMessages.length;
                
                if (newCount > previousCount) {
                    playNotificationSound();
                }
                
                previousCount = newCount;
                setUnreadCount(newCount);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    return unreadCount;
}