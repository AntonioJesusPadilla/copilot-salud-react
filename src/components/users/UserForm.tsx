import { useState, useEffect, FormEvent } from 'react';
import { UserWithoutPassword, UserRole, ROLE_CONFIGS } from '../../types';
import { inputValidationService } from '../../services/security/inputValidationService';
import Modal from '../common/Modal';

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: UserWithoutPassword; // Si existe, es edición
  isLoading?: boolean;
}

export interface UserFormData {
  username: string;
  password?: string;
  name: string;
  email?: string;
  role: UserRole;
  organization?: string;
}

function UserForm({ isOpen, onClose, onSubmit, user, isLoading = false }: UserFormProps) {
  const isEditMode = !!user;

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'invitado',
    organization: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Cargar datos del usuario en modo edición
  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        username: user.username,
        password: '', // No mostrar contraseña
        name: user.name,
        email: user.email || '',
        role: user.role,
        organization: user.organization || '',
      });
    } else {
      // Reset en modo creación
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'invitado',
        organization: '',
      });
    }
    setErrors({});
  }, [isEditMode, user, isOpen]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar username (solo en modo creación)
    if (!isEditMode) {
      const usernameValidation = inputValidationService.validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.username = usernameValidation.error || 'Username inválido';
      }
    }

    // Validar password (requerido en creación, opcional en edición)
    if (!isEditMode || formData.password) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else {
        const passwordValidation = inputValidationService.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.error || 'Contraseña inválida';
        }
      }
    }

    // Validar nombre
    const nameValidation = inputValidationService.validateSafeString(formData.name, 100);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'Nombre inválido';
    }

    // Validar email (opcional)
    if (formData.email && formData.email.trim()) {
      const emailValidation = inputValidationService.validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar submit
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const submitData: UserFormData = {
      username: formData.username,
      name: formData.name,
      role: formData.role,
      email: formData.email?.trim() || undefined,
      organization: formData.organization?.trim() || undefined,
    };

    // Solo incluir password si está llena (creación o cambio)
    if (formData.password && formData.password.trim()) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="user-form"
        disabled={isLoading}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Guardando...
          </>
        ) : (
          <>{isEditMode ? 'Actualizar' : 'Crear'} Usuario</>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      footer={footer}
      size="lg"
      closeOnEscape={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre de Usuario <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={isEditMode || isLoading}
            className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
              errors.username
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder="ej: juan.perez"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
          )}
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              El nombre de usuario no se puede modificar
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                errors.password
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={
                isEditMode ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
          )}
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Dejar vacío para no cambiar la contraseña actual
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
              errors.name
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="ej: Juan Pérez García"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
            className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
              errors.email
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="ej: juan.perez@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            disabled={isLoading}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            {Object.values(ROLE_CONFIGS).map((role) => (
              <option key={role.role} value={role.role}>
                {role.icon} {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organización
          </label>
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="ej: Consejería de Salud"
          />
        </div>
      </form>
    </Modal>
  );
}

export default UserForm;
