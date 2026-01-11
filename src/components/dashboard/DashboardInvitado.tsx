import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useKPIStore from '../../store/kpiStore';
import useMapStore from '../../store/mapStore';
import { ROLE_CONFIGS } from '../../types';
import KPIGrid from '../kpi/KPIGrid';
import DashboardHeader from './DashboardHeader';
import QuickActions from './QuickActions';
import StatsCard from './StatsCard';
import SearchBar from '../filters/SearchBar';

function DashboardInvitado() {
  const { user, logout } = useAuthStore();
  const { filteredKPIs, stats, isLoading, loadKPIs } = useKPIStore();
  const { centers } = useMapStore();
  const navigate = useNavigate();

  const [displayedKPIs, setDisplayedKPIs] = useState(filteredKPIs);

  const roleConfig = ROLE_CONFIGS.invitado;

  useEffect(() => {
    if (user) {
      loadKPIs(user.role);
    }
  }, [user, loadKPIs]);

  useEffect(() => {
    setDisplayedKPIs(filteredKPIs);
  }, [filteredKPIs]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  if (!user) return null;

  // Centros de salud por tipo
  const hospitales = centers.filter(c => c.type === 'hospital');
  const centrosSalud = centers.filter(c => c.type === 'centro_salud');
  const clinicas = centers.filter(c => c.type === 'consultorio');

  // Centros con urgencias
  const centrosConUrgencias = centers.filter(c => c.emergencyService);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <DashboardHeader
        user={user}
        roleConfig={roleConfig}
        onLogout={handleLogout}
        onSettings={handleSettings}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de bienvenida */}
        <div
          className="rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 text-white"
          style={{ background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}DD)` }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {roleConfig.icon} Información Pública de Salud
          </h2>
          <p className="text-base sm:text-lg opacity-90">
            Acceso a información general del sistema sanitario de Andalucía
          </p>
        </div>

        {/* Grid de tarjetas de información */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Información básica */}
          <StatsCard
            title="Indicadores Públicos"
            icon="📊"
            stats={[
              { label: 'KPIs disponibles', value: stats?.total || 0, color: roleConfig.color },
              { label: 'Tendencia positiva', value: `${stats?.trending.up || 0} ↑`, color: '#10B981' },
              { label: 'Acceso', value: 'Básico', color: '#6B7280', subtitle: 'Información pública' }
            ]}
          />

          {/* Centros disponibles */}
          <StatsCard
            title="Centros de Salud"
            icon="🏥"
            stats={[
              { label: 'Total centros', value: centers.length, color: roleConfig.color },
              { label: 'Hospitales', value: hospitales.length, color: '#EF4444' },
              { label: 'Centros de salud', value: centrosSalud.length, color: '#10B981' }
            ]}
          />

          {/* Servicios disponibles */}
          <StatsCard
            title="Servicios"
            icon="🚑"
            stats={[
              { label: 'Con urgencias', value: centrosConUrgencias.length, color: '#EF4444' },
              { label: 'Consultorios', value: clinicas.length, color: '#3B82F6' },
              { label: 'Total servicios', value: centers.reduce((sum, c) => sum + (c.services?.length || 0), 0), color: roleConfig.color }
            ]}
          />

          {/* Acciones rápidas */}
          <QuickActions
            roleConfig={roleConfig}
            customActions={
              <>
                <button
                  onClick={() => window.open('tel:061', '_blank')}
                  className="w-full text-left px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-red-700 dark:text-red-300 font-medium"
                >
                  🚨 Emergencias 061
                </button>
                <button
                  onClick={() => window.open('tel:900100061', '_blank')}
                  className="w-full text-left px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-blue-700 dark:text-blue-300 font-medium"
                >
                  📞 Salud Responde
                </button>
              </>
            }
          />
        </div>

        {/* Información útil */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-secondary dark:text-gray-100">
            ℹ️ Información Útil
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">📞 Teléfonos de Interés</h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li><strong>061</strong> - Emergencias sanitarias</li>
                <li><strong>900 100 061</strong> - Salud Responde (24h)</li>
                <li><strong>112</strong> - Emergencias generales</li>
                <li><strong>016</strong> - Atención víctimas violencia de género</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-700">
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">🏥 Servicios Disponibles</h4>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li>✓ Atención primaria</li>
                <li>✓ Urgencias 24h</li>
                <li>✓ Especialidades médicas</li>
                <li>✓ Programas de prevención</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">🕐 Horarios</h4>
              <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                <li><strong>Centros de salud:</strong> L-V 8:00-21:00</li>
                <li><strong>Urgencias:</strong> 24 horas</li>
                <li><strong>Salud Responde:</strong> 24/7</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-700">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-2">🔗 Enlaces Útiles</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.sspa.juntadeandalucia.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-800 dark:text-orange-200 hover:underline"
                  >
                    Portal SSPA Andalucía →
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.juntadeandalucia.es/salud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-800 dark:text-orange-200 hover:underline"
                  >
                    Consejería de Salud →
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Búsqueda de centros */}
        <div className="mb-6">
          <SearchBar
            placeholder="Buscar centros de salud cercanos..."
            defaultScope="centers"
          />
        </div>

        {/* Recomendación de ver mapa */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-700 rounded-xl p-6 mb-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-teal-900 dark:text-teal-300 mb-2">
                🗺️ Encuentra el centro de salud más cercano
              </h3>
              <p className="text-teal-800 dark:text-teal-200">
                Usa nuestro mapa interactivo para encontrar hospitales, centros de salud y clínicas en tu zona
              </p>
            </div>
            <button
              onClick={() => navigate('/maps')}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              Ver Mapa Interactivo →
            </button>
          </div>
        </div>

        {/* Sección de KPIs públicos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-secondary dark:text-gray-100">
                📊 Indicadores Públicos de Salud
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Información básica de {stats?.total || 0} indicadores del sistema sanitario
              </p>
            </div>
          </div>

          <KPIGrid kpis={displayedKPIs} isLoading={isLoading} />
        </div>

        {/* Información de limitaciones */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-4 sm:p-6 mb-6 transition-colors">
          <h3 className="font-bold text-base sm:text-lg mb-2 text-yellow-900 dark:text-yellow-300 flex items-center gap-2">
            ⚠️ Acceso de Invitado
          </h3>
          <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200 mb-3">
            Tienes acceso limitado a información pública. Para acceder a funcionalidades avanzadas como exportación de datos y Chat AI, contacta con el administrador del sistema.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">✓ Ver KPIs básicos</span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">✓ Ver mapas</span>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">✗ Exportar datos</span>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">✗ Chat AI</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardInvitado;
