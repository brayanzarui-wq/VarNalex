import { create } from 'zustand';
import { api } from '@/lib/api';
import type { AuthUser } from '@/lib/types';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  hydrate: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

/**
 * Estado global de sesión (sección 4: Zustand). No guarda tokens — estos viven
 * en cookies httpOnly. Solo cachea el usuario para la UI y su estado de carga.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  hydrate: async () => {
    set({ status: 'loading' });
    try {
      const user = await api.me();
      set({ user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  setUser: (user) => set({ user, status: 'authenticated' }),

  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));
