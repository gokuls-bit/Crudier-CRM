import { create } from 'zustand';

// Setup initial density mode and apply corresponding class
const initialDensity = localStorage.getItem('crudier_density') || 'default';
document.body?.classList.add(`density-${initialDensity}`);

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  isDarkMode: false, // Default to light mode for ServiceNow design language
  activeModals: {},
  density: initialDensity,
  contextPanelOpen: false,
  contextRecord: null,

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

  setDensity: (mode) => {
    const prevMode = localStorage.getItem('crudier_density') || 'default';
    document.body?.classList.remove(`density-${prevMode}`);
    document.body?.classList.add(`density-${mode}`);
    localStorage.setItem('crudier_density', mode);
    set({ density: mode });
  },

  openContextPanel: (record) => set({ contextPanelOpen: true, contextRecord: record }),
  closeContextPanel: () => set({ contextPanelOpen: false, contextRecord: null }),

  openModal: (modalId, data = null) => set((state) => ({
    activeModals: { ...state.activeModals, [modalId]: data || true },
  })),

  closeModal: (modalId) => set((state) => {
    const updated = { ...state.activeModals };
    delete updated[modalId];
    return { activeModals: updated };
  }),
}));
