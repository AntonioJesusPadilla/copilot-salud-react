/**
 * ChatPage - Página del chat AI con layout completo
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useKPIStore from '../store/kpiStore';
import useMapStore from '../store/mapStore';
import { ROLE_CONFIGS } from '../types';
import ChatInterface from '../components/chat/ChatInterface';
import ThemeToggle from '../components/common/ThemeToggle';
import { validateAPIKeys } from '../services/chatService';

function ChatPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { loadKPIs } = useKPIStore();
  const { loadCenters } = useMapStore();

  // Cargar datos necesarios para el contexto del chat
  useEffect(() => {
    // Verificar API keys
    const validation = validateAPIKeys();
    if (!validation.valid) {
      console.warn('⚠️ [ChatPage] API keys no configuradas:', validation.missing);
      console.warn(
        '💡 Configura las API keys en el archivo .env para usar el chat AI'
      );
    }

    // Cargar datos del sistema para el contexto del chat
    if (user) {
      console.log('📊 [ChatPage] Cargando datos del sistema para contexto...');
      loadKPIs(user.role);
      loadCenters();
    }
  }, [user, loadKPIs, loadCenters]);

  if (!user) {
    return null;
  }

  const roleConfig = ROLE_CONFIGS[user.role];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Top Bar */}
      <header className="bg-white dark:bg-gray-800 border-b-4 shadow-sm transition-colors" style={{ borderColor: roleConfig.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
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
                <h1 className="text-lg sm:text-xl font-bold text-secondary dark:text-gray-100">Chat AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Asistente inteligente de salud
                </p>
              </div>
            </div>

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

      {/* Chat Container - Ocupa todo el espacio disponible */}
      <main className="flex-1 flex flex-col p-2 sm:p-4">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
          <div className="flex-1 bg-white dark:bg-gray-800 shadow-lg rounded-t-xl overflow-hidden flex flex-col transition-colors">
            <ChatInterface />
          </div>

          {/* Info del subsistema */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-b-xl p-3 sm:p-4 transition-colors">
            <div className="flex items-start space-x-2">
              <span className="text-xl sm:text-2xl">✅</span>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-green-900 dark:text-green-300 mb-1">
                  Subsistema 5: Chat AI con Groq
                </h3>
                <p className="text-xs text-green-800 dark:text-green-200">
                  Sistema de chat inteligente impulsado por Groq LLM.
                  Contexto del sistema sanitario andaluz integrado con fallback automático de modelos.
                  Soporta markdown, respuestas rápidas y persistencia de conversaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
