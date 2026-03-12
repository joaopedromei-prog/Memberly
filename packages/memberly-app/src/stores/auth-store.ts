import { create } from 'zustand';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'member' | 'admin';
}

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
