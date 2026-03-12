import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: true });
  });

  it('initializes with null user and loading true', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('setUser updates user and sets loading to false', () => {
    const profile = {
      id: 'user-1',
      full_name: 'John Doe',
      avatar_url: null,
      role: 'member' as const,
    };

    useAuthStore.getState().setUser(profile);
    const state = useAuthStore.getState();

    expect(state.user).toEqual(profile);
    expect(state.isLoading).toBe(false);
  });

  it('clearUser sets user to null and loading to false', () => {
    useAuthStore.getState().setUser({
      id: 'user-1',
      full_name: 'John Doe',
      avatar_url: null,
      role: 'member',
    });

    useAuthStore.getState().clearUser();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});
