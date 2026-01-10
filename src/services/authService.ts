import bcrypt from 'bcryptjs';
import { LoginCredentials, LoginResponse, ChangePasswordData, ChangePasswordResponse } from '../types/auth';
import { User } from '../types';
import { rateLimitService } from './security/rateLimitService';
import { inputValidationService } from './security/inputValidationService';

// Servicio de autenticación
class AuthService {
  private usersData: Record<string, User> | null = null;

  // Cargar usuarios desde el archivo JSON
  private async loadUsers(): Promise<Record<string, User>> {
    if (this.usersData !== null) {
      return this.usersData;
    }

    try {
      const response = await fetch('/data/users.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo de usuarios');
      }
      const data: Record<string, User> = await response.json();
      this.usersData = data;
      return data;
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      throw new Error('Error al cargar datos de usuarios');
    }
  }

  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // 🔒 SEGURIDAD: Verificar rate limit por usuario
      const rateLimitCheck = rateLimitService.checkLimit('login', credentials.username);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: rateLimitCheck.message || 'Demasiados intentos de inicio de sesión',
        };
      }

      // 🔒 SEGURIDAD: Validar username
      const usernameValidation = inputValidationService.validateUsername(credentials.username);
      if (!usernameValidation.isValid) {
        return {
          success: false,
          error: usernameValidation.error || 'Nombre de usuario inválido',
        };
      }

      // 🔒 SEGURIDAD: Validar password
      const passwordValidation = inputValidationService.validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.error || 'Contraseña inválida',
        };
      }

      const users = await this.loadUsers();
      const user = users[credentials.username];

      // Verificar si el usuario existe
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado',
        };
      }

      // Verificar si el usuario está activo
      if (!user.active) {
        return {
          success: false,
          error: 'Usuario inactivo',
        };
      }

      // Verificar contraseña con bcrypt
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Contraseña incorrecta',
        };
      }

      // Login exitoso - no devolver la contraseña
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: {
          ...userWithoutPassword,
          username: credentials.username,
        },
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en el proceso de login',
      };
    }
  }

  // Cambiar contraseña
  async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
    try {
      const users = await this.loadUsers();
      const user = users[data.username];

      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado',
        };
      }

      // Si no es cambio de admin, verificar contraseña actual
      if (!data.isAdminChange && data.currentPassword) {
        const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

        if (!isCurrentPasswordValid) {
          return {
            success: false,
            error: 'Contraseña actual incorrecta',
          };
        }
      }

      // Generar hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

      // NOTA: En una aplicación real, aquí se actualizaría la base de datos
      // Como estamos trabajando con un archivo JSON estático, esto es solo simulación
      console.log('Nueva contraseña hasheada:', newPasswordHash);
      console.warn('ADVERTENCIA: En esta versión de prueba, los cambios de contraseña no persisten entre recargas.');

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar contraseña',
      };
    }
  }

  // Validar formato de contraseña
  validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 6) {
      return {
        valid: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      };
    }

    return { valid: true };
  }
}

export const authService = new AuthService();
