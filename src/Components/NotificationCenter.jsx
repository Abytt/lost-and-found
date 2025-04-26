// src/Components/NotificationCenter.jsx
import React, { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { Link } from 'react-router-dom';

function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening the notification center
      markAllAsRead();
    }
  };
  
  return (
    <div className="notification-center dropdown">
      <button
        className="btn btn-link text-white position-relative"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>
      
      <div className={`dropdown-menu dropdown-menu-end p-0 ${isOpen ? 'show' : ''}`} style={{ width: '320px', maxHeight: '500px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {notifications.length > 0 && (
            <button 
              className="btn btn-sm btn-link text-decoration-none" 
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="d-flex">
                  {notification.type === 'match' && <i className="bi bi-link-45deg text-primary fs-4 me-2"></i>}
                  {notification.type === 'message' && <i className="bi bi-chat-left-text text-success fs-4 me-2"></i>}
                  {notification.type === 'status' && <i className="bi bi-info-circle text-info fs-4 me-2"></i>}
                  
                  <div>
                    <h6 className="mb-1">{notification.title}</h6>
                    <p className="mb-1 small">{notification.message}</p>
                    <small className="text-muted">
                      {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : 'Just now'}
                    </small>
                    
                    {notification.data && notification.data.link && (
                      <div className="mt-2">
                        <Link 
                          to={notification.data.link} 
                          className="btn btn-sm btn-primary"
                          onClick={() => markAsRead(notification.id)}
                        >
                          View
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted">
              <i className="bi bi-bell-slash fs-1 mb-2"></i>
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;