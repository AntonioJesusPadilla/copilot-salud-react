import { describe, it, expect } from 'vitest';
import { inputValidationService } from './inputValidationService';

describe('InputValidationService', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = inputValidationService.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    it('should convert email to lowercase', () => {
      const result = inputValidationService.validateEmail('Test@Example.COM');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    it('should reject empty email', () => {
      const result = inputValidationService.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('vacío');
    });

    it('should reject invalid email format', () => {
      const result = inputValidationService.validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('inválido');
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(255) + '@example.com';
      const result = inputValidationService.validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('largo');
    });
  });

  describe('validateUsername', () => {
    it('should validate correct username', () => {
      const result = inputValidationService.validateUsername('test_user');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('test_user');
    });

    it('should reject username that is too short', () => {
      const result = inputValidationService.validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('al menos 3 caracteres');
    });

    it('should reject username that is too long', () => {
      const result = inputValidationService.validateUsername('a'.repeat(21));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('más de 20 caracteres');
    });

    it('should reject username with special characters', () => {
      const result = inputValidationService.validateUsername('test@user');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('solo puede contener');
    });

    it('should accept username with allowed characters', () => {
      const result = inputValidationService.validateUsername('test_user.123-name');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', () => {
      const result = inputValidationService.validatePassword('password123');
      expect(result.isValid).toBe(true);
    });

    it('should reject password that is too short', () => {
      const result = inputValidationService.validatePassword('pass1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('al menos 6 caracteres');
    });

    it('should reject password without letter', () => {
      const result = inputValidationService.validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('letra y un número');
    });

    it('should reject password without number', () => {
      const result = inputValidationService.validatePassword('password');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('letra y un número');
    });

    it('should reject password that is too long', () => {
      const result = inputValidationService.validatePassword('a'.repeat(129) + '1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('demasiado larga');
    });

    it('should accept password with letters and numbers', () => {
      const result = inputValidationService.validatePassword('SecurePass123');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSafeString', () => {
    it('should validate safe string', () => {
      const result = inputValidationService.validateSafeString('Hello World');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('Hello World');
    });

    it('should reject string with dangerous characters', () => {
      const result = inputValidationService.validateSafeString('<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('caracteres no permitidos');
    });

    it('should reject string that exceeds max length', () => {
      const result = inputValidationService.validateSafeString('a'.repeat(101), 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('más de 100 caracteres');
    });

    it('should trim whitespace', () => {
      const result = inputValidationService.validateSafeString('  Hello World  ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('Hello World');
    });
  });

  describe('validateChatMessage', () => {
    it('should validate normal chat message', () => {
      const result = inputValidationService.validateChatMessage('Hello, how are you?');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('Hello, how are you?');
    });

    it('should reject empty message', () => {
      const result = inputValidationService.validateChatMessage('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('vacío');
    });

    it('should reject message that is too long', () => {
      const result = inputValidationService.validateChatMessage('a'.repeat(5001));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('demasiado largo');
    });

    it('should reject message with dangerous code', () => {
      const result = inputValidationService.validateChatMessage('<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('contenido no permitido');
    });
  });

  describe('validateUrl', () => {
    it('should validate HTTP URL', () => {
      const result = inputValidationService.validateUrl('http://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should validate HTTPS URL', () => {
      const result = inputValidationService.validateUrl('https://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject javascript: protocol', () => {
      const result = inputValidationService.validateUrl('javascript:alert("xss")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('HTTP o HTTPS');
    });

    it('should reject non-HTTP protocols', () => {
      const result = inputValidationService.validateUrl('ftp://example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('HTTP o HTTPS');
    });

    it('should reject invalid URL', () => {
      const result = inputValidationService.validateUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('inválida');
    });
  });

  describe('validateInteger', () => {
    it('should validate integer', () => {
      const result = inputValidationService.validateInteger(42);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('42');
    });

    it('should validate integer string', () => {
      const result = inputValidationService.validateInteger('42');
      expect(result.isValid).toBe(true);
    });

    it('should reject non-integer', () => {
      const result = inputValidationService.validateInteger(42.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('entero');
    });

    it('should reject value below minimum', () => {
      const result = inputValidationService.validateInteger(5, 10, 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('mayor o igual a 10');
    });

    it('should reject value above maximum', () => {
      const result = inputValidationService.validateInteger(150, 10, 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('menor o igual a 100');
    });

    it('should reject NaN', () => {
      const result = inputValidationService.validateInteger('not-a-number');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('número válido');
    });
  });

  describe('validateFileName', () => {
    it('should validate normal filename', () => {
      const result = inputValidationService.validateFileName('report_2024.pdf');
      expect(result.isValid).toBe(true);
    });

    it('should reject filename with path traversal', () => {
      const result = inputValidationService.validateFileName('../../../etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject filename with slash', () => {
      const result = inputValidationService.validateFileName('path/to/file.pdf');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject filename with backslash', () => {
      const result = inputValidationService.validateFileName('path\\to\\file.pdf');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const result = inputValidationService.escapeHtml('<div>"test" & \'quote\'</div>');
      expect(result).toBe('&lt;div&gt;&quot;test&quot; &amp; &#039;quote&#039;&lt;/div&gt;');
    });

    it('should escape script tags', () => {
      const result = inputValidationService.escapeHtml('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });
});
