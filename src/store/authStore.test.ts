import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAuthStore from './authStore';
import { authService } from '../services/authService';
import type { LoginResponse } from '../types/auth';

// Mock del authService
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Clear mocks
    vi.clearAllMocks();

    // Clear localStorage
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        username: 'test_user',
        name: 'Test User',
        role: 'admin' as const,
        email: 'test@example.com',
        organization: 'Test Org',
        active: true,
      };

      const mockResponse: LoginResponse = {
        success: true,
        user: mockUser,
      };

      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      const state = useAuthStore.getState();
      const response = await state.login({
        username: 'test_user',
        password: 'password123',
      });

      expect(response.success).toBe(true);
      expect(response.user).toEqual(mockUser);

      const newState = useAuthStore.getState();
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should handle login failure', async () => {
      const mockResponse: LoginResponse = {
        success: false,
        error: 'Usuario no encontrado',
      };

      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      const state = useAuthStore.getState();
      const response = await state.login({
        username: 'wrong_user',
        password: 'wrong_password',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Usuario no encontrado');

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Usuario no encontrado');
    });

    it('should set loading state during login', async () => {
      const mockResponse: LoginResponse = {
        success: true,
        user: {
          username: 'test_user',
          name: 'Test User',
          role: 'admin' as const,
          email: 'test@example.com',
          organization: 'Test Org',
          active: true,
        },
      };

      vi.mocked(authService.login).mockImplementation(async () => {
        // Verificar que isLoading sea true durante la llamada
        const state = useAuthStore.getState();
        expect(state.isLoading).toBe(true);
        return mockResponse;
      });

      const state = useAuthStore.getState();
      await state.login({
        username: 'test_user',
        password: 'password123',
      });

      const newState = useAuthStore.getState();
      expect(newState.isLoading).toBe(false);
    });

    it('should handle exception during login', async () => {
      const error = new Error('Network error');
      vi.mocked(authService.login).mockRejectedValue(error);

      const state = useAuthStore.getState();
      const response = await state.login({
        username: 'test_user',
        password: 'password123',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Network error');

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBe('Network error');
    });
  });

  describe('logout', () => {
    it('should clear user data on logout', () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: {
          username: 'test_user',
          name: 'Test User',
          role: 'admin' as const,
          email: 'test@example.com',
          organization: 'Test Org',
          active: true,
        },
        isAuthenticated: true,
      });

      const state = useAuthStore.getState();
      state.logout();

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const user = {
        username: 'test_user',
        name: 'Test User',
        role: 'admin' as const,
        email: 'test@example.com',
        organization: 'Test Org',
        active: true,
      };

      const state = useAuthStore.getState();
      state.setUser(user);

      const newState = useAuthStore.getState();
      expect(newState.user).toEqual(user);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should clear user when set to null', () => {
      const state = useAuthStore.getState();
      state.setUser(null);

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error', () => {
      const state = useAuthStore.getState();
      state.setError('Test error');

      const newState = useAuthStore.getState();
      expect(newState.error).toBe('Test error');
    });

    it('should clear error', () => {
      useAuthStore.setState({ error: 'Test error' });

      const state = useAuthStore.getState();
      state.clearError();

      const newState = useAuthStore.getState();
      expect(newState.error).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should keep valid session', () => {
      useAuthStore.setState({
        user: {
          username: 'test_user',
          name: 'Test User',
          role: 'admin' as const,
          email: 'test@example.com',
          organization: 'Test Org',
          active: true,
        },
        isAuthenticated: true,
      });

      const state = useAuthStore.getState();
      state.checkAuth();

      const newState = useAuthStore.getState();
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user).not.toBeNull();
    });

    it('should clear invalid session', () => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
      });

      const state = useAuthStore.getState();
      state.checkAuth();

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });
});
