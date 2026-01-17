/**
 * ChatInterface - Componente principal del chat
 */

import { useEffect, useRef } from 'react';
import useChatStore from '../../store/chatStore';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

function ChatInterface() {
  const { messages, isLoading, sendMessage, clearChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <ChatHeader isLoading={isLoading} onClear={clearChat} messageCount={messages.length} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg">
              👋
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              ¡Hola! Soy tu asistente de salud
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-4">
              Puedo ayudarte con información sobre centros de salud, KPIs sanitarios, gestión de
              capacidad hospitalaria y datos de salud de Andalucía.
            </p>

            {/* Badge de contexto ampliado */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <span className="mr-1">🏥</span> Centros de Salud
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <span className="mr-1">📊</span> KPIs Sanitarios
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <span className="mr-1">🛏️</span> Capacidad Hospitalaria
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                <span className="mr-1">💰</span> Datos Financieros
              </span>
            </div>

            {/* Sugerencias - Organizadas por categoría */}
            <div className="w-full max-w-3xl">
              {/* Categoría: Capacidad Hospitalaria (Nueva) */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                  Gestión de Capacidad
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      sendMessage('¿Cuál es la ocupación actual de camas en los hospitales?')
                    }
                    disabled={isLoading}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg mr-2">🛏️</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ocupación de camas actual
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      sendMessage('¿Hay alertas de capacidad activas en algún hospital?')
                    }
                    disabled={isLoading}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg mr-2">🚨</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Alertas de capacidad
                    </span>
                  </button>
                </div>
              </div>

              {/* Categoría: Centros y Servicios */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Centros y Servicios
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      sendMessage('¿Cuántos centros de salud hay disponibles en Málaga?')
                    }
                    disabled={isLoading}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg mr-2">🏥</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Centros de salud disponibles
                    </span>
                  </button>

                  <button
                    onClick={() => sendMessage('¿Cuántos centros tienen servicio de urgencias?')}
                    disabled={isLoading}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg mr-2">🚑</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Servicios de urgencias
                    </span>
                  </button>
                </div>
              </div>

              {/* Categoría: Indicadores y Análisis */}
              <div>
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">
                  Indicadores y Análisis
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    onClick={() => sendMessage('¿Qué KPIs de salud puedo consultar?')}
                    disabled={isLoading}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg mr-2">📊</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ver indicadores de salud
                    </span>
                  </button>

                  <button
                    onClick={() => sendMessage('Explícame el sistema sanitario andaluz')}
                    disabled={isLoading}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg mr-2">💡</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Información general
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Messages list
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-scroll target */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}

export default ChatInterface;
