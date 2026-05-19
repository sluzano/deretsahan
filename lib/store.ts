import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

interface BookmarkState {
  bookmarkedIds: string[];
  addBookmark: (postId: string) => void;
  removeBookmark: (postId: string) => void;
  isBookmarked: (postId: string) => boolean;
  setBookmarks: (ids: string[]) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedIds: [],
      addBookmark: (postId) =>
        set({ bookmarkedIds: [...get().bookmarkedIds, postId] }),
      removeBookmark: (postId) =>
        set({ bookmarkedIds: get().bookmarkedIds.filter((id) => id !== postId) }),
      isBookmarked: (postId) => get().bookmarkedIds.includes(postId),
      setBookmarks: (ids) => set({ bookmarkedIds: ids }),
    }),
    {
      name: 'bookmark-storage',
    }
  )
);
