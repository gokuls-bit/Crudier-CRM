import { useWorkspaceStore } from '../store/workspace.store';
import { workspaceService } from '../services/workspace.service';

export const useWorkspace = () => {
  const store = useWorkspaceStore();

  const fetchWorkspaces = async () => {
    store.setLoading(true);
    try {
      const response = await workspaceService.list();
      const list = response.data.data || [];
      store.setWorkspaces(list);

      // Auto select first workspace if none selected
      if (list.length > 0 && !store.activeWorkspace) {
        store.setActiveWorkspace(list[0]);
      }
    } catch (err) {
      store.setError(err.response?.data?.message || 'Error fetching workspaces');
    } finally {
      store.setLoading(false);
    }
  };

  const fetchMembers = async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const response = await workspaceService.getMembers(workspaceId);
      store.setMembers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching workspace members:', err);
    }
  };

  const switchWorkspace = (workspace) => {
    store.setActiveWorkspace(workspace);
    fetchMembers(workspace._id);
  };

  return {
    activeWorkspace: store.activeWorkspace,
    workspaces: store.workspaces,
    members: store.members,
    loading: store.loading,
    error: store.error,
    fetchWorkspaces,
    fetchMembers,
    switchWorkspace,
  };
};
