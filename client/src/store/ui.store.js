import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  isDarkMode: true, // Default to true for the dark premium aesthetic!
  activeModals: {},

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  toggleTheme: () => set((state) => {
    const nextMode = !state.isDarkMode;
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: nextMode };
  }),

  setTheme: (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDarkMode: isDark });
  },

  openModal: (modalId, data = null) => set((state) => ({
    activeModals: { ...state.activeModals, [modalId]: data || true },
  })),

  closeModal: (modalId) => set((state) => {
    const updated = { ...state.activeModals };
    delete updated[modalId];
    return { activeModals: updated };
  }),
}));
