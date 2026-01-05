import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore, LoginCredentials, LoginResponse } from '../types/auth';
import { authService } from '../services/authService';

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: response.error || 'Error de autenticación',
            });
          }

          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Limpiar localStorage
        localStorage.removeItem('auth-storage');
      },

      // Setters
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Verificar autenticación al cargar
      checkAuth: () => {
        const state = get();
        if (state.user && state.isAuthenticated) {
          // Sesión válida desde localStorage
          return;
        }
        // No hay sesión válida
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // Solo persistir user e isAuthenticated
    }
  )
);

export default useAuthStore;
