/**
 * Chat Store - Estado global del sistema de chat
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatState, ChatMessage } from '../types/chat';
import { sendMessage as sendMessageService } from '../services/chatService';

const STORAGE_KEY = 'copilot-salud-chat';

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoading: false,
      error: null,

      // Enviar mensaje
      sendMessage: async (content: string) => {
        const { messages } = get();

        // Crear mensaje del usuario
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content,
          timestamp: new Date(),
        };

        // Agregar mensaje del usuario al estado
        set({
          messages: [...messages, userMessage],
          isLoading: true,
          error: null,
        });

        try {
          // Obtener todos los mensajes para el contexto
          const allMessages = [...messages, userMessage];

          // Llamar al servicio de chat
          const response = await sendMessageService(allMessages);

          if (response.success) {
            // Crear mensaje del asistente
            const assistantMessage: ChatMessage = {
              id: `msg-${Date.now()}-assistant`,
              role: 'assistant',
              content: response.message,
              timestamp: new Date(),
            };

            // Actualizar estado con la respuesta
            set({
              messages: [...get().messages, assistantMessage],
              isLoading: false,
            });

            console.log('✅ [ChatStore] Mensaje enviado exitosamente');
          } else {
            // Error del servicio
            const errorMessage: ChatMessage = {
              id: `msg-${Date.now()}-error`,
              role: 'assistant',
              content:
                response.error ||
                '❌ No se pudo obtener una respuesta. Por favor, intenta de nuevo.',
              timestamp: new Date(),
              error: true,
            };

            set({
              messages: [...get().messages, errorMessage],
              isLoading: false,
              error: response.error || 'Error desconocido',
            });

            console.error('❌ [ChatStore] Error al enviar mensaje:', response.error);
          }
        } catch (error) {
          // Error inesperado
          const errorMsg = error instanceof Error ? error.message : 'Error inesperado';

          const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error`,
            role: 'assistant',
            content: `❌ Error: ${errorMsg}`,
            timestamp: new Date(),
            error: true,
          };

          set({
            messages: [...get().messages, errorMessage],
            isLoading: false,
            error: errorMsg,
          });

          console.error('❌ [ChatStore] Error inesperado:', error);
        }
      },

      // Limpiar chat
      clearChat: () => {
        console.log('🗑️ [ChatStore] Limpiando chat...');
        set({
          messages: [],
          error: null,
        });
      },

      // Eliminar conversación (para futuras implementaciones)
      deleteConversation: (id: string) => {
        const { conversations } = get();
        set({
          conversations: conversations.filter((conv) => conv.id !== id),
        });
      },

      // Cargar conversación (para futuras implementaciones)
      loadConversation: (id: string) => {
        const { conversations } = get();
        const conversation = conversations.find((conv) => conv.id === id);
        if (conversation) {
          set({
            currentConversation: conversation,
            messages: conversation.messages,
          });
        }
      },

      // Crear nueva conversación (para futuras implementaciones)
      createNewConversation: () => {
        set({
          currentConversation: null,
          messages: [],
          error: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // Solo persistir mensajes (no el estado de loading ni errores)
        messages: state.messages,
      }),
    }
  )
);

export default useChatStore;
