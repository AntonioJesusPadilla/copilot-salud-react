/**
 * Chat Types - Sistema de Chat con Groq
 */

// Message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  error?: boolean;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Chat context - Datos del sistema que se inyectan en el chat
export interface ChatContext {
  user: {
    name: string;
    role: string;
  };
  kpis: {
    total: number;
    categories: string[];
    topKPIs: Array<{
      name: string;
      value: number;
      unit: string;
      category: string;
    }>;
  };
  centers: {
    total: number;
    withEmergency: number;
    cities: string[];
    byType: Record<string, number>;
    topCenters: Array<{
      name: string;
      city: string;
      type: string;
      hasEmergency: boolean;
    }>;
  };
}

// Service types
export interface ChatServiceResponse {
  success: boolean;
  message: string;
  error?: string;
  retries?: number;
}

export interface ProviderAttempt {
  attempt: number;
  success: boolean;
  error?: string;
}

// Store state
export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  deleteConversation: (id: string) => void;
  loadConversation: (id: string) => void;
  createNewConversation: () => void;
}
