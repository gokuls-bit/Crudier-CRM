import { useEffect } from 'react';
import { useNotificationStore } from '../store/notification.store';
import { useSocket } from './useSocket';
import { notificationService } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';

export const useNotifications = () => {
  const token = useAuthStore(state => state.token);
  const { notifications, unreadCount, setNotifications, addNotification, markAsRead, markAllAsRead, loading } = useNotificationStore();
  const { subscribe } = useSocket(token);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.list();
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchNotifications();

    // Subscribe to live websocket notifications
    const unsubscribe = subscribe('notification', (newNotification) => {
      addNotification(newNotification);
    });

    return () => unsubscribe();
  }, [token]);

  const handleRead = async (id) => {
    try {
      await notificationService.markRead(id);
      markAsRead(id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationService.markAllRead();
      markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleRead,
    markAllAsRead: handleReadAll,
    refresh: fetchNotifications,
  };
};
