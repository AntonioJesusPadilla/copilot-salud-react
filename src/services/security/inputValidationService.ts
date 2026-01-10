// Servicio de validación de inputs para prevenir inyecciones y datos maliciosos

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

class InputValidationService {
  // Patrones de validación
  private readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly PHONE_PATTERN = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  private readonly USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,20}$/; // Permite letras, números, punto, guión bajo y guión

  // Caracteres peligrosos para SQL/XSS
  private readonly DANGEROUS_CHARS = /<script|<iframe|javascript:|onerror=|onload=|eval\(|alert\(/gi;

  /**
   * Valida un email
   */
  validateEmail(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'El email no puede estar vacío' };
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length > 254) {
      return { isValid: false, error: 'El email es demasiado largo' };
    }

    if (!this.EMAIL_PATTERN.test(trimmedEmail)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }

    return { isValid: true, sanitizedValue: trimmedEmail.toLowerCase() };
  }

  /**
   * Valida un número de teléfono
   */
  validatePhone(phone: string): ValidationResult {
    if (!phone || phone.trim().length === 0) {
      return { isValid: false, error: 'El teléfono no puede estar vacío' };
    }

    const trimmedPhone = phone.trim();

    if (!this.PHONE_PATTERN.test(trimmedPhone)) {
      return { isValid: false, error: 'Formato de teléfono inválido' };
    }

    return { isValid: true, sanitizedValue: trimmedPhone };
  }

  /**
   * Valida un nombre de usuario
   */
  validateUsername(username: string): ValidationResult {
    if (!username || username.trim().length === 0) {
      return { isValid: false, error: 'El nombre de usuario no puede estar vacío' };
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      return { isValid: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }

    if (trimmedUsername.length > 20) {
      return { isValid: false, error: 'El nombre de usuario no puede tener más de 20 caracteres' };
    }

    if (!this.USERNAME_PATTERN.test(trimmedUsername)) {
      return {
        isValid: false,
        error: 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
      };
    }

    return { isValid: true, sanitizedValue: trimmedUsername };
  }

  /**
   * Valida una contraseña
   */
  validatePassword(password: string): ValidationResult {
    if (!password || password.length === 0) {
      return { isValid: false, error: 'La contraseña no puede estar vacía' };
    }

    if (password.length < 6) {
      return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'La contraseña es demasiado larga' };
    }

    // Verificar que tenga al menos una letra y un número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos una letra y un número',
      };
    }

    return { isValid: true };
  }

  /**
   * Valida una cadena de texto general (nombres, descripciones, etc.)
   */
  validateSafeString(input: string, maxLength: number = 100): ValidationResult {
    if (!input || input.trim().length === 0) {
      return { isValid: false, error: 'El campo no puede estar vacío' };
    }

    const trimmedInput = input.trim();

    if (trimmedInput.length > maxLength) {
      return { isValid: false, error: `El texto no puede tener más de ${maxLength} caracteres` };
    }

    // Detectar caracteres peligrosos
    if (this.DANGEROUS_CHARS.test(trimmedInput)) {
      return { isValid: false, error: 'El texto contiene caracteres no permitidos' };
    }

    return { isValid: true, sanitizedValue: trimmedInput };
  }

  /**
   * Valida un mensaje de chat (más permisivo pero seguro)
   */
  validateChatMessage(message: string): ValidationResult {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'El mensaje no puede estar vacío' };
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > 5000) {
      return { isValid: false, error: 'El mensaje es demasiado largo (máximo 5000 caracteres)' };
    }

    // Solo detectar scripts y código JavaScript peligroso
    if (this.DANGEROUS_CHARS.test(trimmedMessage)) {
      return { isValid: false, error: 'El mensaje contiene contenido no permitido' };
    }

    return { isValid: true, sanitizedValue: trimmedMessage };
  }

  /**
   * Valida un término de búsqueda
   */
  validateSearchTerm(searchTerm: string): ValidationResult {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { isValid: false, error: 'El término de búsqueda no puede estar vacío' };
    }

    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch.length < 2) {
      return { isValid: false, error: 'El término de búsqueda debe tener al menos 2 caracteres' };
    }

    if (trimmedSearch.length > 100) {
      return { isValid: false, error: 'El término de búsqueda es demasiado largo' };
    }

    // Detectar caracteres peligrosos
    if (this.DANGEROUS_CHARS.test(trimmedSearch)) {
      return { isValid: false, error: 'El término de búsqueda contiene caracteres no permitidos' };
    }

    return { isValid: true, sanitizedValue: trimmedSearch };
  }

  /**
   * Escapa caracteres HTML para prevenir XSS
   */
  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Valida un número entero
   */
  validateInteger(value: string | number, min?: number, max?: number): ValidationResult {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(num)) {
      return { isValid: false, error: 'Debe ser un número válido' };
    }

    if (!Number.isInteger(num)) {
      return { isValid: false, error: 'Debe ser un número entero' };
    }

    if (min !== undefined && num < min) {
      return { isValid: false, error: `El valor debe ser mayor o igual a ${min}` };
    }

    if (max !== undefined && num > max) {
      return { isValid: false, error: `El valor debe ser menor o igual a ${max}` };
    }

    return { isValid: true, sanitizedValue: num.toString() };
  }

  /**
   * Valida una URL
   */
  validateUrl(url: string): ValidationResult {
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: 'La URL no puede estar vacía' };
    }

    const trimmedUrl = url.trim();

    try {
      const urlObj = new URL(trimmedUrl);

      // Solo permitir HTTP y HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Solo se permiten URLs HTTP o HTTPS' };
      }

      // Detectar javascript: protocol y otros peligrosos
      if (trimmedUrl.toLowerCase().startsWith('javascript:')) {
        return { isValid: false, error: 'URL no permitida' };
      }

      return { isValid: true, sanitizedValue: trimmedUrl };
    } catch {
      return { isValid: false, error: 'URL inválida' };
    }
  }

  /**
   * Valida datos de exportación (nombres de archivo)
   */
  validateFileName(fileName: string): ValidationResult {
    if (!fileName || fileName.trim().length === 0) {
      return { isValid: false, error: 'El nombre de archivo no puede estar vacío' };
    }

    const trimmedFileName = fileName.trim();

    // Permitir letras, números, espacios, guiones, puntos y guiones bajos
    const fileNamePattern = /^[a-zA-Z0-9\s._-]{1,200}$/;

    if (!fileNamePattern.test(trimmedFileName)) {
      return {
        isValid: false,
        error: 'El nombre de archivo contiene caracteres no permitidos',
      };
    }

    // Prevenir path traversal
    if (trimmedFileName.includes('..') || trimmedFileName.includes('/') || trimmedFileName.includes('\\')) {
      return { isValid: false, error: 'El nombre de archivo no es válido' };
    }

    return { isValid: true, sanitizedValue: trimmedFileName };
  }
}

export const inputValidationService = new InputValidationService();
