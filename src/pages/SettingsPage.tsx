import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';
import { ROLE_CONFIGS } from '../types';
import ThemeToggle from '../components/common/ThemeToggle';

function SettingsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return null;
  }

  const roleConfig = ROLE_CONFIGS[user.role];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
      return;
    }

    // Validar formato de contraseña
    const validation = authService.validatePassword(newPassword);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error || 'Contraseña inválida' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.changePassword({
        username: user.username,
        currentPassword,
        newPassword,
        isAdminChange: false,
      });

      if (result.success) {
        setMessage({ type: 'success', text: '✅ Contraseña cambiada exitosamente' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al cambiar contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cambiar contraseña' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b-4 transition-colors" style={{ borderColor: roleConfig.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Lado izquierdo: Volver + Título */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Volver al Dashboard"
                aria-label="Volver al Dashboard"
              >
                ← <span className="hidden sm:inline">Volver</span>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-secondary dark:text-gray-100">⚙️ Configuración</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ajustes de cuenta y preferencias
                </p>
              </div>
            </div>

            {/* Lado derecho: Info usuario + Theme Toggle + Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden md:block">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{roleConfig.name}</p>
              </div>
              <ThemeToggle />
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl"
                style={{ backgroundColor: `${roleConfig.color}20` }}
              >
                {roleConfig.icon}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-4"
                style={{ backgroundColor: `${roleConfig.color}20` }}
              >
                {roleConfig.icon}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{user.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{roleConfig.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{user.email}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-4 transition-colors">
              <h4 className="font-bold mb-3 text-gray-900 dark:text-gray-100">Secciones</h4>
              <ul className="space-y-2">
                <li>
                  <button className="w-full text-left px-3 py-2 rounded bg-primary/10 text-primary font-medium">
                    🔐 Cambiar Contraseña
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-3 py-2 rounded text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                    disabled
                  >
                    👤 Perfil (Próximamente)
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-3 py-2 rounded text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                    disabled
                  >
                    🔔 Notificaciones (Próximamente)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main content area */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-xl font-bold mb-6 text-secondary dark:text-gray-100">🔐 Cambiar Contraseña</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Contraseña Actual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Nueva Contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>

                {message && (
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg transition-colors">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ <strong>Nota:</strong> En esta versión de prueba, los cambios de contraseña
                  no persisten entre recargas de la aplicación. Esta funcionalidad será completada
                  en futuros subsistemas con backend persistente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
