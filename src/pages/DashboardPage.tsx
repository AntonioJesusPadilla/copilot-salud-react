import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROLE_CONFIGS } from '../types';

function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const roleConfig = ROLE_CONFIGS[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4" style={{ borderColor: roleConfig.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${roleConfig.color}20` }}
              >
                {roleConfig.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary">
                  Copilot Salud Andalucía
                </h1>
                <p className="text-sm text-gray-600">
                  Dashboard {roleConfig.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={handleSettings}
                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuración"
              >
                ⚙️
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de bienvenida */}
        <div
          className="rounded-xl p-8 mb-8 text-white"
          style={{ background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}DD)` }}
        >
          <h2 className="text-3xl font-bold mb-2">
            {roleConfig.icon} Bienvenido, {user.name}
          </h2>
          <p className="text-lg opacity-90">
            Dashboard personalizado para {roleConfig.name}
          </p>
        </div>

        {/* Permisos del usuario */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 text-secondary">🔐 Permisos de Acceso</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canViewAllData ? '✅' : '❌'}
                <span className="ml-2">Ver todos los datos</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canExport ? '✅' : '❌'}
                <span className="ml-2">Exportar reportes</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canManageUsers ? '✅' : '❌'}
                <span className="ml-2">Gestionar usuarios</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canAccessChat ? '✅' : '❌'}
                <span className="ml-2">Acceso a Chat AI</span>
              </li>
              <li className="flex items-center text-gray-700">
                {roleConfig.permissions.canViewMaps ? '✅' : '❌'}
                <span className="ml-2">Ver mapas interactivos</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 text-secondary">📊 Estadísticas</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">KPIs disponibles</p>
                <p className="text-2xl font-bold" style={{ color: roleConfig.color }}>
                  {roleConfig.permissions.canViewAllData ? '26' : '6'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Centros de salud</p>
                <p className="text-2xl font-bold" style={{ color: roleConfig.color }}>
                  156
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última actualización</p>
                <p className="text-sm font-medium">Hoy, {new Date().toLocaleTimeString('es-ES')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 text-secondary">🚀 Acciones Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium">
                📈 Ver KPIs
              </button>
              {roleConfig.permissions.canViewMaps && (
                <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium">
                  🗺️ Ver Mapas
                </button>
              )}
              {roleConfig.permissions.canAccessChat && (
                <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium">
                  💬 Chat AI
                </button>
              )}
              {roleConfig.permissions.canExport && (
                <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium">
                  📥 Exportar Datos
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información del subsistema */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2 text-blue-900">
            ℹ️ Subsistema 2: Autenticación Completado
          </h3>
          <p className="text-blue-800">
            El sistema de autenticación está funcionando correctamente. Los siguientes subsistemas
            añadirán los dashboards específicos, KPIs, mapas y funcionalidades avanzadas.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
