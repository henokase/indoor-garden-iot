import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastNotifications, setLastNotifications] = useState({});

  const addNotification = useCallback((notification) => {
    if (!notification?.title || !notification?.message) {
      console.log('Invalid notification:', notification);
      return;
    }

    const notificationKey = `${notification.title}-${notification.message}`;
    const now = Date.now();
    const lastNotification = lastNotifications[notificationKey];

    // Check if we've shown this exact notification in the last 5 seconds
    if (lastNotification && (now - lastNotification) < 5 * 1000) {
      console.log('Skipping duplicate notification:', notification);
      return;
    }

    const newNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: now,
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setLastNotifications(prev => ({
      ...prev,
      [notificationKey]: now
    }));

    // Show toast notification
    toast(notification.message, {
      icon: '🔔',
      duration: 3000,
      position: 'top-right',
    });

  }, [lastNotifications]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    showDropdown,
    setShowDropdown,
    unreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
