import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  breadcrumbLabels: Record<string, string>;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  closeSidebar: () => void;
  setBreadcrumbLabel: (segment: string, label: string) => void;
  clearBreadcrumbLabels: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  breadcrumbLabels: {},
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  closeSidebar: () => set({ sidebarOpen: false }),
  setBreadcrumbLabel: (segment, label) =>
    set((state) => ({
      breadcrumbLabels: { ...state.breadcrumbLabels, [segment]: label },
    })),
  clearBreadcrumbLabels: () => set({ breadcrumbLabels: {} }),
}));
