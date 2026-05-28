import { create } from 'zustand';

export const useWorkspaceStore = create((set) => ({
  activeWorkspace: (() => {
    try {
      return JSON.parse(localStorage.getItem('crudier_active_workspace'));
    } catch {
      return null;
    }
  })(),
  workspaces: [],
  members: [],
  loading: false,
  error: null,

  setActiveWorkspace: (workspace) => {
    localStorage.setItem('crudier_active_workspace', JSON.stringify(workspace));
    set({ activeWorkspace: workspace });
  },

  setWorkspaces: (workspaces) => set({ workspaces }),
  setMembers: (members) => set({ members }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
