'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const { user, isLoading, setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    async function getInitialSession() {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser(profile);
        } else {
          clearUser();
        }
      } else {
        clearUser();
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        clearUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, setLoading]);

  return { user, isLoading };
}
