/**
 * ChatMessage - Componente individual de mensaje con markdown
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatMessageProps {
  message: ChatMessageType;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.error;

  // Formatear timestamp
  const timestamp = format(new Date(message.timestamp), 'HH:mm', { locale: es });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Header del mensaje (solo para asistente) */}
        {!isUser && (
          <div className="flex items-center space-x-2 mb-1 px-1">
            <span className="text-xl">🏥</span>
            <span className="text-sm font-medium text-gray-700">Copilot Salud</span>
            <span className="text-xs text-gray-500">• ⚡ Groq</span>
          </div>
        )}

        {/* Contenido del mensaje */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isError
              ? 'bg-red-50 border-2 border-red-200'
              : isUser
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200'
          }`}
        >
          {isUser ? (
            // Mensaje del usuario (texto plano)
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            // Mensaje del asistente (markdown)
            <div className={`prose prose-sm max-w-none ${isError ? 'prose-red' : ''}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Personalizar estilos de markdown
                  p: ({ children }) => (
                    <p className={`mb-2 last:mb-0 ${isError ? 'text-red-800' : 'text-gray-800'}`}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className={`mb-2 ml-4 list-disc ${isError ? 'text-red-800' : 'text-gray-800'}`}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className={`mb-2 ml-4 list-decimal ${isError ? 'text-red-800' : 'text-gray-800'}`}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className={`mb-1 ${isError ? 'text-red-800' : 'text-gray-800'}`}>
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className={`font-bold ${isError ? 'text-red-900' : 'text-gray-900'}`}>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className={`italic ${isError ? 'text-red-800' : 'text-gray-700'}`}>
                      {children}
                    </em>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto">
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => (
                    <h1 className={`text-xl font-bold mb-2 ${isError ? 'text-red-900' : 'text-gray-900'}`}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className={`text-lg font-bold mb-2 ${isError ? 'text-red-900' : 'text-gray-900'}`}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`text-base font-bold mb-2 ${isError ? 'text-red-900' : 'text-gray-900'}`}>
                      {children}
                    </h3>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer con timestamp */}
        <div className={`flex items-center mt-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
