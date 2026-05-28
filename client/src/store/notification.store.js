import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  addNotification: (notification) => set((state) => {
    const updated = [notification, ...state.notifications];
    return {
      notifications: updated,
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    };
  }),

  markAsRead: (notificationId) => set((state) => {
    const updated = state.notifications.map(n => 
      n._id === notificationId ? { ...n, isRead: true } : n
    );
    const unreadCount = updated.filter(n => !n.isRead).length;
    return { notifications: updated, unreadCount };
  }),

  markAllAsRead: () => set((state) => {
    const updated = state.notifications.map(n => ({ ...n, isRead: true }));
    return { notifications: updated, unreadCount: 0 };
  }),

  setLoading: (loading) => set({ loading }),
}));
