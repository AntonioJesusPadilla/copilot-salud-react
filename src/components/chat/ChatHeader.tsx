/**
 * ChatHeader - Header del chat con título y botón limpiar
 */

interface ChatHeaderProps {
  isLoading: boolean;
  onClear: () => void;
  messageCount: number;
}

function ChatHeader({ isLoading, onClear, messageCount }: ChatHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between">
        {/* Título */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xl shadow-md">
            💬
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary dark:text-gray-100">Copilot Salud Andalucía</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {messageCount === 0
                ? 'Asistente de salud impulsado por IA (Groq)'
                : `${messageCount} mensaje${messageCount > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Botón Limpiar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClear}
            disabled={messageCount === 0 || isLoading}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center space-x-2"
            title="Limpiar chat"
          >
            <span>🗑️</span>
            <span className="hidden sm:inline">Limpiar Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
