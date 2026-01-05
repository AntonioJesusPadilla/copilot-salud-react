// Tipos de usuario y roles
export type UserRole = 'admin' | 'gestor' | 'analista' | 'invitado';

export interface User {
  username: string;
  password: string; // Hash de la contraseña (bcrypt)
  role: UserRole;
  name: string;
  email?: string;
  canChangePassword?: boolean; // Si el usuario puede cambiar su contraseña
  lastPasswordChange?: string; // Fecha del último cambio de contraseña
}

// Configuración de roles con permisos y colores
export interface RoleConfig {
  role: UserRole;
  name: string;
  icon: string;
  color: string;
  permissions: {
    canViewAllData: boolean;
    canExport: boolean;
    canManageUsers: boolean;
    canAccessChat: boolean;
    canViewMaps: boolean;
  };
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    name: 'Administrador',
    icon: '👨‍💼',
    color: '#FF6B6B', // Rojo administración
    permissions: {
      canViewAllData: true,
      canExport: true,
      canManageUsers: true,
      canAccessChat: true,
      canViewMaps: true,
    },
  },
  gestor: {
    role: 'gestor',
    name: 'Gestor',
    icon: '📊',
    color: '#4A90E2', // Azul gestión
    permissions: {
      canViewAllData: true,
      canExport: true,
      canManageUsers: false,
      canAccessChat: true,
      canViewMaps: true,
    },
  },
  analista: {
    role: 'analista',
    name: 'Analista',
    icon: '📈',
    color: '#7B68EE', // Púrpura análisis
    permissions: {
      canViewAllData: true,
      canExport: true,
      canManageUsers: false,
      canAccessChat: true,
      canViewMaps: false,
    },
  },
  invitado: {
    role: 'invitado',
    name: 'Invitado',
    icon: '👤',
    color: '#9CA3AF', // Gris invitado
    permissions: {
      canViewAllData: false,
      canExport: false,
      canManageUsers: false,
      canAccessChat: false,
      canViewMaps: true,
    },
  },
};

// Tipos de centros de salud
export interface CentroSalud {
  id: string;
  nombre: string;
  provincia: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipo: 'centro_salud' | 'hospital' | 'clinica';
  telefono?: string;
  email?: string;
  servicios?: string[];
}

// Tipos de KPIs
export interface KPI {
  id: string;
  nombre: string;
  descripcion: string;
  valor: number;
  unidad: string;
  tendencia?: 'up' | 'down' | 'stable';
  cambio?: number;
  fecha: Date;
  categoria?: string;
}

// Tipos de rango de fechas
export interface DateRange {
  start: Date;
  end: Date;
}

// Tipos de provincias de Andalucía
export type ProvinciaAndalucia =
  | 'Todas'
  | 'Almería'
  | 'Cádiz'
  | 'Córdoba'
  | 'Granada'
  | 'Huelva'
  | 'Jaén'
  | 'Málaga'
  | 'Sevilla';

export const PROVINCIAS_ANDALUCIA: ProvinciaAndalucia[] = [
  'Todas', 'Almería', 'Cádiz', 'Córdoba', 'Granada',
  'Huelva', 'Jaén', 'Málaga', 'Sevilla'
];
