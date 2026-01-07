/**
 * ChatInput - Input de chat con soporte para Enter
 */

import { useState, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enviar con Enter (sin Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !isLoading) {
      onSend(trimmedInput);
      setInput('');
    }
  };

  const isDisabled = isLoading || input.trim().length === 0;

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Textarea */}
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta sobre salud en Andalucía..."
            disabled={isLoading}
            rows={1}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none transition-all"
            style={{
              minHeight: '48px',
              maxHeight: '150px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '48px';
              target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
            }}
          />
          <p className="text-xs text-gray-500 mt-1 ml-1">
            Presiona <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> para enviar,{' '}
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift + Enter</kbd> para nueva línea
          </p>
        </div>

        {/* Botón Enviar */}
        <button
          type="submit"
          disabled={isDisabled}
          className="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center space-x-2 min-w-[120px] justify-center"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Enviar</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
