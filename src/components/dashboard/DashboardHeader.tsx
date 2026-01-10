import { UserWithoutPassword, RoleConfig } from '../../types';
import ThemeToggle from '../common/ThemeToggle';

interface DashboardHeaderProps {
  user: UserWithoutPassword;
  roleConfig: RoleConfig;
  onLogout: () => void;
  onSettings: () => void;
}

function DashboardHeader({ user, roleConfig, onLogout, onSettings }: DashboardHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b-4 transition-colors" style={{ borderColor: roleConfig.color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo y título */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl"
              style={{ backgroundColor: `${roleConfig.color}20` }}
            >
              {roleConfig.icon}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-secondary dark:text-gray-100">
                Copilot Salud Andalucía
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Dashboard {roleConfig.name}
              </p>
            </div>
          </div>

          {/* Controles del header */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Info de usuario (oculta en mobile) */}
            <div className="hidden md:block text-right">
              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Configuración */}
            <button
              onClick={onSettings}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Configuración"
              aria-label="Configuración"
            >
              ⚙️
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={onLogout}
              className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              aria-label="Cerrar sesión"
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
