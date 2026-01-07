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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <ChatHeader
        isLoading={isLoading}
        onClear={clearChat}
        messageCount={messages.length}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg">
              👋
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Hola! Soy tu asistente de salud
            </h2>
            <p className="text-gray-600 max-w-md mb-6">
              Puedo ayudarte con información sobre centros de salud, KPIs sanitarios y datos de
              salud de Andalucía. ¿En qué puedo ayudarte hoy?
            </p>

            {/* Sugerencias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <button
                onClick={() =>
                  sendMessage('¿Cuántos centros de salud hay disponibles en Málaga?')
                }
                disabled={isLoading}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg mr-2">🏥</span>
                <span className="text-sm font-medium text-gray-700">
                  Centros de salud disponibles
                </span>
              </button>

              <button
                onClick={() => sendMessage('¿Qué KPIs de salud puedo consultar?')}
                disabled={isLoading}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg mr-2">📊</span>
                <span className="text-sm font-medium text-gray-700">
                  Ver indicadores de salud
                </span>
              </button>

              <button
                onClick={() =>
                  sendMessage('¿Cuántos centros tienen servicio de urgencias?')
                }
                disabled={isLoading}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg mr-2">🚑</span>
                <span className="text-sm font-medium text-gray-700">
                  Servicios de urgencias
                </span>
              </button>

              <button
                onClick={() => sendMessage('Explícame el sistema sanitario andaluz')}
                disabled={isLoading}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg mr-2">💡</span>
                <span className="text-sm font-medium text-gray-700">
                  Información general
                </span>
              </button>
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
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">Escribiendo...</span>
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
