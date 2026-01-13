// Servicio de Rate Limiting para prevenir abuso de APIs

interface RateLimitConfig {
  maxRequests: number; // Número máximo de requests
  windowMs: number; // Ventana de tiempo en milisegundos
  message?: string; // Mensaje de error personalizado
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  // Almacenamiento de límites por endpoint/acción
  private limits: Map<string, RateLimitEntry> = new Map();

  // Configuraciones predefinidas por tipo de acción
  private readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    // Chat AI: 20 mensajes por minuto
    chat: {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minuto
      message: 'Has enviado demasiados mensajes. Por favor, espera un momento.',
    },
    // Login: 5 intentos por 15 minutos
    login: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutos
      message: 'Demasiados intentos de inicio de sesión. Por favor, espera 15 minutos.',
    },
    // Exportación: 10 exportaciones por 5 minutos
    export: {
      maxRequests: 10,
      windowMs: 5 * 60 * 1000, // 5 minutos
      message: 'Has exportado demasiados archivos. Por favor, espera un momento.',
    },
    // Búsqueda: 30 búsquedas por minuto
    search: {
      maxRequests: 30,
      windowMs: 60 * 1000, // 1 minuto
      message: 'Demasiadas búsquedas. Por favor, espera un momento.',
    },
    // API general: 100 requests por minuto
    api: {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minuto
      message: 'Demasiadas peticiones. Por favor, espera un momento.',
    },
    // Cambio de contraseña: 3 intentos por hora
    changePassword: {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Demasiados intentos de cambio de contraseña. Por favor, espera 1 hora.',
    },
  };

  /**
   * Verifica si una acción está permitida según el rate limit
   */
  checkLimit(
    action: string,
    identifier?: string
  ): { allowed: boolean; message?: string; resetTime?: number } {
    const config = this.DEFAULT_CONFIGS[action];

    if (!config) {
      // Si no hay configuración, permitir por defecto
      return { allowed: true };
    }

    const key = this.getKey(action, identifier);
    const now = Date.now();
    const entry = this.limits.get(key);

    // Si no hay entrada o ya expiró, crear nueva
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { allowed: true };
    }

    // Si aún no se excede el límite, incrementar contador
    if (entry.count < config.maxRequests) {
      entry.count++;
      this.limits.set(key, entry);
      return { allowed: true };
    }

    // Límite excedido
    return {
      allowed: false,
      message: config.message || 'Demasiadas peticiones. Por favor, espera un momento.',
      resetTime: entry.resetTime,
    };
  }

  /**
   * Registra un intento (incrementa el contador)
   */
  recordAttempt(action: string, identifier?: string): void {
    const key = this.getKey(action, identifier);
    const config = this.DEFAULT_CONFIGS[action];

    if (!config) return;

    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
    } else {
      entry.count++;
      this.limits.set(key, entry);
    }
  }

  /**
   * Resetea el límite para una acción específica
   */
  reset(action: string, identifier?: string): void {
    const key = this.getKey(action, identifier);
    this.limits.delete(key);
  }

  /**
   * Obtiene el tiempo restante hasta el reset en milisegundos
   */
  getTimeUntilReset(action: string, identifier?: string): number {
    const key = this.getKey(action, identifier);
    const entry = this.limits.get(key);

    if (!entry) return 0;

    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  /**
   * Obtiene el número de intentos restantes
   */
  getRemainingAttempts(action: string, identifier?: string): number {
    const config = this.DEFAULT_CONFIGS[action];
    if (!config) return Infinity;

    const key = this.getKey(action, identifier);
    const entry = this.limits.get(key);

    if (!entry) return config.maxRequests;

    const now = Date.now();
    if (now >= entry.resetTime) return config.maxRequests;

    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Genera una clave única para el almacenamiento
   */
  private getKey(action: string, identifier?: string): string {
    // Usar identifier (ej: username) o IP simulada si no hay
    const id = identifier || 'anonymous';
    return `${action}:${id}`;
  }

  /**
   * Limpia entradas expiradas (mantenimiento)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Obtiene información de rate limit para debugging
   */
  getStatus(
    action: string,
    identifier?: string
  ): {
    remaining: number;
    resetTime: number;
    limit: number;
  } | null {
    const config = this.DEFAULT_CONFIGS[action];
    if (!config) return null;

    const key = this.getKey(action, identifier);
    const entry = this.limits.get(key);
    const now = Date.now();

    if (!entry || now >= entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        limit: config.maxRequests,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      limit: config.maxRequests,
    };
  }

  /**
   * Wrapper para funciones async que aplica rate limiting automáticamente
   */
  async withRateLimit<T>(action: string, fn: () => Promise<T>, identifier?: string): Promise<T> {
    const check = this.checkLimit(action, identifier);

    if (!check.allowed) {
      throw new Error(check.message || 'Rate limit exceeded');
    }

    // Ejecutar la función y retornar el resultado
    const result = await fn();
    return result;
  }
}

// Instancia singleton
export const rateLimitService = new RateLimitService();

// Limpiar entradas expiradas cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      rateLimitService.cleanup();
    },
    5 * 60 * 1000
  );
}
