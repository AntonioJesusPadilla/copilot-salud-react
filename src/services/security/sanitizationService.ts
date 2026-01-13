// Servicio de sanitización para prevenir XSS y otros ataques de inyección

class SanitizationService {
  // Protocolos seguros para enlaces
  private readonly SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:'];

  /**
   * Sanitiza HTML eliminando scripts y elementos peligrosos
   */
  sanitizeHtml(html: string): string {
    if (!html || html.trim().length === 0) {
      return '';
    }

    // Crear un DOMParser para procesar el HTML de forma segura
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Eliminar todos los scripts
    const scripts = doc.querySelectorAll('script');
    scripts.forEach((script) => script.remove());

    // Eliminar iframes
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach((iframe) => iframe.remove());

    // Eliminar event handlers (onclick, onerror, etc.)
    this.removeEventHandlers(doc.body);

    // Limpiar URLs peligrosas
    this.sanitizeUrls(doc.body);

    return doc.body.innerHTML;
  }

  /**
   * Elimina event handlers de elementos
   */
  private removeEventHandlers(element: HTMLElement): void {
    // Eliminar atributos que empiecen con 'on'
    const attributes = element.attributes;
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attr = attributes[i];
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    }

    // Recursivamente limpiar hijos
    Array.from(element.children).forEach((child) => {
      this.removeEventHandlers(child as HTMLElement);
    });
  }

  /**
   * Sanitiza URLs para prevenir javascript: y data: URIs peligrosos
   */
  private sanitizeUrls(element: HTMLElement): void {
    // Limpiar enlaces
    const links = element.querySelectorAll('a');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && !this.isUrlSafe(href)) {
        link.removeAttribute('href');
      }
      // Añadir rel="noopener noreferrer" para seguridad
      if (link.getAttribute('target') === '_blank') {
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Limpiar imágenes
    const images = element.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !this.isUrlSafe(src)) {
        img.removeAttribute('src');
      }
    });
  }

  /**
   * Verifica si una URL es segura
   */
  private isUrlSafe(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.href);
      return this.SAFE_URL_PROTOCOLS.includes(urlObj.protocol);
    } catch {
      // Si no es una URL válida, no es segura
      return false;
    }
  }

  /**
   * Sanitiza texto para uso en markdown (usado en Chat AI)
   */
  sanitizeMarkdownText(text: string): string {
    if (!text || text.trim().length === 0) {
      return '';
    }

    // Eliminar etiquetas script y style completamente
    let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Eliminar event handlers inline
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Eliminar javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
  }

  /**
   * Escapa caracteres especiales para prevenir XSS
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sanitiza un objeto para prevenir prototype pollution
   */
  sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    // Crear una copia sin __proto__ ni constructor
    const sanitized: Record<string, unknown> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Ignorar propiedades peligrosas
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          continue;
        }

        const value = obj[key];

        // Recursivamente sanitizar objetos anidados
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            item && typeof item === 'object' && !Array.isArray(item)
              ? this.sanitizeObject(item as Record<string, unknown>)
              : item
          );
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized as T;
  }

  /**
   * Sanitiza entrada de usuario para búsqueda (prevenir SQL injection en futuro backend)
   */
  sanitizeSearchInput(input: string): string {
    if (!input || input.trim().length === 0) {
      return '';
    }

    // Eliminar caracteres peligrosos comunes en SQL injection
    let sanitized = input.trim();

    // Escapar comillas simples y dobles
    sanitized = sanitized.replace(/'/g, "''");

    // Eliminar comentarios SQL
    sanitized = sanitized.replace(/--/g, '');
    sanitized = sanitized.replace(/\/\*/g, '');
    sanitized = sanitized.replace(/\*\//g, '');

    // Limitar longitud
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    return sanitized;
  }

  /**
   * Sanitiza nombres de archivo para exportación
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName || fileName.trim().length === 0) {
      return 'export';
    }

    let sanitized = fileName.trim();

    // Eliminar caracteres no permitidos
    sanitized = sanitized.replace(/[^a-zA-Z0-9_.-]/g, '_');

    // Prevenir path traversal
    sanitized = sanitized.replace(/\.\./g, '');
    sanitized = sanitized.replace(/[/\\]/g, '_');

    // Limitar longitud
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200);
    }

    // Si queda vacío, usar default
    if (sanitized.length === 0) {
      sanitized = 'export';
    }

    return sanitized;
  }

  /**
   * Sanitiza JSON para prevenir inyección de código
   */
  sanitizeJson(jsonString: string): string {
    try {
      // Parse y stringify para asegurar formato válido
      const parsed = JSON.parse(jsonString);
      const sanitized = this.sanitizeObject(parsed);
      return JSON.stringify(sanitized);
    } catch {
      // Si no es JSON válido, retornar vacío
      return '{}';
    }
  }

  /**
   * Verifica si un string contiene código potencialmente peligroso
   */
  containsDangerousCode(text: string): boolean {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i,
      /Function\(/i,
      /setTimeout\(/i,
      /setInterval\(/i,
    ];

    return dangerousPatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Limpia respuesta del Chat AI antes de renderizar
   */
  sanitizeChatResponse(response: string): string {
    if (!response || response.trim().length === 0) {
      return '';
    }

    // Sanitizar markdown
    let sanitized = this.sanitizeMarkdownText(response);

    // Verificar si contiene código peligroso
    if (this.containsDangerousCode(sanitized)) {
      console.warn('Respuesta del chat contiene código potencialmente peligroso');
      // Escapar todo el contenido como medida de seguridad
      sanitized = this.escapeHtml(sanitized);
    }

    return sanitized;
  }
}

export const sanitizationService = new SanitizationService();
