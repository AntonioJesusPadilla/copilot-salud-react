// Tipos para el sistema de temas (dark mode)

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Colores de fondo
    background: string;
    surface: string;
    surfaceHover: string;

    // Colores de texto
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;

    // Colores de borde
    border: string;
    borderHover: string;

    // Colores de marca
    primary: string;
    secondary: string;
    accent: string;

    // Estados
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceHover: '#F3F4F6',

    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',

    border: '#E5E7EB',
    borderHover: '#D1D5DB',

    primary: '#3B82F6',
    secondary: '#1E3A8A',
    accent: '#10B981',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',

    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#64748B',

    border: '#334155',
    borderHover: '#475569',

    primary: '#60A5FA',
    secondary: '#93C5FD',
    accent: '#34D399',

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
};
