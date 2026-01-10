/**
 * Chat Service - Groq Provider
 *
 * Servicio de chat AI usando Groq como proveedor de LLM
 */

import Groq from 'groq-sdk';
import { ChatServiceResponse, ChatMessage, ProviderAttempt } from '../types/chat';
import { getChatContext, generateSystemPrompt, logChatContext } from './contextService';
import { sanitizationService } from './security/sanitizationService';
import { inputValidationService } from './security/inputValidationService';
import { rateLimitService } from './security/rateLimitService';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const GROQ_CONFIG = {
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  model: 'llama-3.3-70b-versatile', // Modelo principal
  maxRetries: 2,
};

// Cliente Groq singleton
let groqClient: Groq | null = null;

const getGroqClient = (): Groq => {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: GROQ_CONFIG.apiKey,
      dangerouslyAllowBrowser: true, // Necesario para uso en cliente
    });
  }
  return groqClient;
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convierte mensajes al formato requerido por los providers
 */
const formatMessages = (messages: ChatMessage[], systemPrompt: string) => {
  return [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];
};

/**
 * Logging con emojis para mejor visibilidad
 */
const log = {
  attempt: (attemptNum: number) => {
    console.log(`⚡ [GROQ] Intento ${attemptNum}...`);
  },
  success: (response: string) => {
    console.log(`✅⚡ [GROQ] Respuesta exitosa (${response.length} chars)`);
  },
  error: (error: string) => {
    console.error(`❌⚡ [GROQ] Error:`, error);
  },
};

// ============================================================================
// GROQ PROVIDER
// ============================================================================

/**
 * Llama a Groq API con fallback automático de modelos
 */
const callGroq = async (
  messages: ChatMessage[],
  systemPrompt: string,
  attemptNum: number
): Promise<string> => {
  log.attempt(attemptNum);

  if (!GROQ_CONFIG.apiKey) {
    console.error('❌ [Groq] API Key no configurada');
    console.error('   API Key presente:', !!GROQ_CONFIG.apiKey);
    throw new Error('Groq API key not configured');
  }

  const client = getGroqClient();
  const formattedMessages = formatMessages(messages, systemPrompt);

  // Lista de modelos a intentar (del más potente al más rápido)
  const models = [
    'llama-3.3-70b-versatile',  // Modelo principal (más potente)
    'llama-3.1-8b-instant',     // Fallback rápido
    'mixtral-8x7b-32768',       // Alternativa con contexto largo
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      console.log(`📤 [Groq] Intentando con modelo: ${model}`);
      console.log('📤 [Groq] Mensajes:', formattedMessages.length);

      const completion = await client.chat.completions.create({
        messages: formattedMessages,
        model: model,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
        stream: false,
      });

      console.log(`📥 [Groq] Response recibido con ${model}`);

      const assistantMessage = completion.choices[0]?.message?.content;

      if (!assistantMessage) {
        console.error('❌ [Groq] Formato de respuesta inválido:', completion);
        throw new Error('Invalid response format from Groq');
      }

      log.success(assistantMessage);
      console.log(`✅ [Groq] Éxito con modelo: ${model}`);
      return assistantMessage;
    } catch (error) {
      console.warn(`⚠️ [Groq] Modelo ${model} falló, intentando siguiente...`);
      lastError = error as Error;
      // Continuar con el siguiente modelo
      continue;
    }
  }

  // Si todos los modelos fallaron
  console.error('❌ [Groq] Todos los modelos fallaron');
  throw lastError || new Error('All Groq models failed');
};

/**
 * Intenta llamar a Groq con reintentos
 */
const tryGroq = async (
  messages: ChatMessage[],
  systemPrompt: string
): Promise<{ success: boolean; message?: string; attempts: ProviderAttempt[] }> => {
  const attempts: ProviderAttempt[] = [];

  for (let i = 1; i <= GROQ_CONFIG.maxRetries; i++) {
    try {
      const message = await callGroq(messages, systemPrompt, i);
      attempts.push({ attempt: i, success: true });
      return { success: true, message, attempts };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      log.error(errorMsg);
      attempts.push({ attempt: i, success: false, error: errorMsg });

      if (i < GROQ_CONFIG.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  return { success: false, attempts };
};

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

/**
 * Envía un mensaje usando Groq como proveedor
 */
export const sendMessage = async (messages: ChatMessage[]): Promise<ChatServiceResponse> => {
  console.log('💬 [ChatService] Iniciando envío de mensaje...');

  // 🔒 SEGURIDAD: Verificar rate limit
  const rateLimitCheck = rateLimitService.checkLimit('chat');
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.message || 'Demasiados mensajes. Por favor, espera un momento.');
  }

  // 🔒 SEGURIDAD: Validar y sanitizar mensajes
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === 'user') {
    // Validar mensaje
    const validation = inputValidationService.validateChatMessage(lastMessage.content);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Mensaje inválido');
    }

    // Sanitizar mensaje
    lastMessage.content = sanitizationService.sanitizeMarkdownText(lastMessage.content);
  }

  // Verificar que las API keys estén cargadas
  console.log('🔑 [ChatService] Verificando credenciales...');
  console.log('   Groq API Key:', GROQ_CONFIG.apiKey ? `${GROQ_CONFIG.apiKey.substring(0, 20)}...` : 'NO CONFIGURADA');

  // Obtener contexto del sistema
  const context = getChatContext();
  logChatContext(context);

  // Generar system prompt con contexto
  const systemPrompt = generateSystemPrompt(context);

  // Intentar con Groq
  console.log('⚡ [ChatService] Enviando mensaje a Groq...');
  const groqResult = await tryGroq(messages, systemPrompt);

  if (groqResult.success && groqResult.message) {
    // 🔒 SEGURIDAD: Sanitizar respuesta de la AI antes de devolverla
    const sanitizedMessage = sanitizationService.sanitizeChatResponse(groqResult.message);

    return {
      success: true,
      message: sanitizedMessage,
      retries: groqResult.attempts.length,
    };
  }

  // Falló
  console.error('❌ [ChatService] No se pudo obtener respuesta de Groq');
  return {
    success: false,
    message: '',
    error: 'No se pudo obtener respuesta del servidor. Por favor, intenta de nuevo.',
    retries: groqResult.attempts.length,
  };
};

/**
 * Valida que la API key de Groq esté configurada
 */
export const validateAPIKeys = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!GROQ_CONFIG.apiKey) missing.push('VITE_GROQ_API_KEY');

  return {
    valid: missing.length === 0,
    missing,
  };
};
