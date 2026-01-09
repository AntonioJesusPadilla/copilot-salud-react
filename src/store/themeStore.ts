import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode } from '../types/theme';

interface ThemeStore {
  mode: ThemeMode;
  isDark: boolean;

  // Acciones
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'light',
      isDark: false,

      setMode: (mode: ThemeMode) => {
        const actualMode = mode === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : mode;

        const isDark = actualMode === 'dark';

        // Aplicar clase al documento
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        set({ mode, isDark });
      },

      toggleMode: () => {
        const { isDark } = get();
        const newMode: ThemeMode = isDark ? 'light' : 'dark';
        get().setMode(newMode);
      },
    }),
    {
      name: 'copilot-salud-theme',
      onRehydrateStorage: () => (state) => {
        // Aplicar tema al cargar desde localStorage
        if (state) {
          state.setMode(state.mode);
        }
      },
    }
  )
);

export default useThemeStore;
