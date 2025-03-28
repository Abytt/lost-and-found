// src/Components/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { rtdb } from '../firebase';
import { ref, onValue, update, serverTimestamp, push } from 'firebase/database';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    const notificationsRef = ref(rtdb, `notifications/${currentUser.uid}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsArray = Object.keys(notificationsData).map(key => ({
          id: key,
          ...notificationsData[key]
        }));
        
        // Sort by timestamp, newest first
        notificationsArray.sort((a, b) => {
          return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        setNotifications(notificationsArray);
        
        // Count unread notifications
        const unread = notificationsArray.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });
    
    return unsubscribe;
  }, [currentUser]);
  
  const markAsRead = async (notificationId) => {
    if (!currentUser || !notificationId) return;
    
    const notificationRef = ref(rtdb, `notifications/${currentUser.uid}/${notificationId}`);
    await update(notificationRef, { read: true });
  };
  
  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;
    
    const updates = {};
    notifications.forEach(notification => {
      if (!notification.read) {
        updates[`${notification.id}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      const userNotificationsRef = ref(rtdb, `notifications/${currentUser.uid}`);
      await update(userNotificationsRef, updates);
    }
  };
  
  const sendNotification = async (userId, type, title, message, data = {}) => {
    if (!userId) return;
    
    const userNotificationsRef = ref(rtdb, `notifications/${userId}`);
    await push(userNotificationsRef, {
      type,
      title,
      message,
      data,
      read: false,
      timestamp: serverTimestamp()
    });
  };
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}