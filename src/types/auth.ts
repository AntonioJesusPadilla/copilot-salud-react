import { UserWithoutPassword } from './index';

// Estado de autenticación
export interface AuthState {
  user: UserWithoutPassword | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Credenciales de login
export interface LoginCredentials {
  username: string;
  password: string;
}

// Respuesta de login
export interface LoginResponse {
  success: boolean;
  user?: UserWithoutPassword;
  error?: string;
}

// Datos para cambio de contraseña
export interface ChangePasswordData {
  username: string;
  currentPassword?: string; // No requerido si es admin cambiando contraseña de otro usuario
  newPassword: string;
  isAdminChange?: boolean; // True si un admin está cambiando la contraseña de otro usuario
}

// Respuesta de cambio de contraseña
export interface ChangePasswordResponse {
  success: boolean;
  error?: string;
}

// Store de autenticación (Zustand)
export interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  setUser: (user: UserWithoutPassword | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  checkAuth: () => void; // Verificar si hay sesión guardada
}
