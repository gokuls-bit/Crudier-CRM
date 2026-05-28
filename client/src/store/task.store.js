import { create } from 'zustand';

export const useTaskStore = create((set) => ({
  tasks: [],
  activeTask: null,
  filters: {
    status: 'All',
    priority: 'All',
    assignee: 'All',
    search: '',
  },
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map(t => t._id === updatedTask._id ? updatedTask : t),
    activeTask: state.activeTask?._id === updatedTask._id ? updatedTask : state.activeTask,
  })),
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t._id !== taskId),
    activeTask: state.activeTask?._id === taskId ? null : state.activeTask,
  })),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  setActiveTask: (task) => set({ activeTask: task }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
