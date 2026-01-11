import { describe, it, expect } from 'vitest';
import { sanitizationService } from './sanitizationService';

describe('SanitizationService', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const result = sanitizationService.sanitizeHtml('<div>Hello</div><script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should remove iframe tags', () => {
      const result = sanitizationService.sanitizeHtml('<div>Content</div><iframe src="evil.com"></iframe>');
      expect(result).not.toContain('<iframe>');
      expect(result).toContain('Content');
    });

    it('should remove event handlers', () => {
      const result = sanitizationService.sanitizeHtml('<div onclick="alert(\'xss\')">Click me</div>');
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click me');
    });

    it('should return empty string for empty input', () => {
      const result = sanitizationService.sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should preserve safe HTML', () => {
      const safeHtml = '<div><p>Hello <strong>World</strong></p></div>';
      const result = sanitizationService.sanitizeHtml(safeHtml);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });

  describe('sanitizeMarkdownText', () => {
    it('should remove script tags', () => {
      const result = sanitizationService.sanitizeMarkdownText('Hello <script>alert("xss")</script> World');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove style tags', () => {
      const result = sanitizationService.sanitizeMarkdownText('Text <style>body{display:none}</style>');
      expect(result).not.toContain('<style>');
      expect(result).toContain('Text');
    });

    it('should remove inline event handlers', () => {
      const result = sanitizationService.sanitizeMarkdownText('<div onclick="alert(\'xss\')">Text</div>');
      expect(result).not.toContain('onclick');
    });

    it('should remove javascript: protocol', () => {
      const result = sanitizationService.sanitizeMarkdownText('[Link](javascript:alert("xss"))');
      expect(result).not.toContain('javascript:');
    });

    it('should return empty string for empty input', () => {
      const result = sanitizationService.sanitizeMarkdownText('');
      expect(result).toBe('');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const result = sanitizationService.escapeHtml('<div>"test"</div>');
      expect(result).not.toContain('<div>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });
  });

  describe('sanitizeObject', () => {
    it('should remove __proto__ property', () => {
      const obj = { name: 'test', __proto__: { evil: true } } as Record<string, unknown>;
      const result = sanitizationService.sanitizeObject(obj);
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('__proto__');
    });

    it('should remove constructor property', () => {
      const obj = { name: 'test', constructor: 'evil' };
      const result = sanitizationService.sanitizeObject(obj);
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('constructor');
    });

    it('should remove prototype property', () => {
      const obj = { name: 'test', prototype: 'evil' };
      const result = sanitizationService.sanitizeObject(obj);
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('prototype');
    });

    it('should recursively sanitize nested objects', () => {
      const obj = {
        name: 'test',
        nested: {
          __proto__: { evil: true },
          safe: 'value',
        },
      };
      const result = sanitizationService.sanitizeObject(obj);
      expect(result.nested).toHaveProperty('safe');
      expect(result.nested).not.toHaveProperty('__proto__');
    });

    it('should handle arrays', () => {
      const obj = {
        items: [
          { __proto__: { evil: true }, name: 'item1' },
          { name: 'item2' },
        ],
      };
      const result = sanitizationService.sanitizeObject(obj);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).not.toHaveProperty('__proto__');
    });
  });

  describe('sanitizeSearchInput', () => {
    it('should escape single quotes', () => {
      const result = sanitizationService.sanitizeSearchInput("test'input");
      expect(result).toBe("test''input");
    });

    it('should remove SQL comments', () => {
      const result = sanitizationService.sanitizeSearchInput('test--comment');
      expect(result).not.toContain('--');
    });

    it('should remove multiline SQL comments', () => {
      const result = sanitizationService.sanitizeSearchInput('test/*comment*/');
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });

    it('should limit length to 100 characters', () => {
      const longInput = 'a'.repeat(150);
      const result = sanitizationService.sanitizeSearchInput(longInput);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should return empty string for empty input', () => {
      const result = sanitizationService.sanitizeSearchInput('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('should replace special characters with underscore', () => {
      const result = sanitizationService.sanitizeFileName('test file@2024.pdf');
      expect(result).toBe('test_file_2024.pdf');
    });

    it('should prevent path traversal', () => {
      const result = sanitizationService.sanitizeFileName('../../../etc/passwd');
      expect(result).not.toContain('..');
      expect(result).not.toContain('/');
    });

    it('should replace slashes with underscore', () => {
      const result = sanitizationService.sanitizeFileName('path/to/file.pdf');
      expect(result).not.toContain('/');
      expect(result).toContain('_');
    });

    it('should return default name for empty input', () => {
      const result = sanitizationService.sanitizeFileName('');
      expect(result).toBe('export');
    });

    it('should limit length to 200 characters', () => {
      const longName = 'a'.repeat(250) + '.pdf';
      const result = sanitizationService.sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('containsDangerousCode', () => {
    it('should detect script tags', () => {
      const result = sanitizationService.containsDangerousCode('<script>alert("xss")</script>');
      expect(result).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      const result = sanitizationService.containsDangerousCode('javascript:alert("xss")');
      expect(result).toBe(true);
    });

    it('should detect event handlers', () => {
      const result = sanitizationService.containsDangerousCode('<div onclick="alert(\'xss\')">');
      expect(result).toBe(true);
    });

    it('should detect eval', () => {
      const result = sanitizationService.containsDangerousCode('eval("malicious code")');
      expect(result).toBe(true);
    });

    it('should detect iframe', () => {
      const result = sanitizationService.containsDangerousCode('<iframe src="evil.com">');
      expect(result).toBe(true);
    });

    it('should return false for safe content', () => {
      const result = sanitizationService.containsDangerousCode('Hello, this is safe content');
      expect(result).toBe(false);
    });
  });

  describe('sanitizeChatResponse', () => {
    it('should sanitize dangerous markdown', () => {
      const response = 'Hello <script>alert("xss")</script> World';
      const result = sanitizationService.sanitizeChatResponse(response);
      expect(result).not.toContain('<script>');
    });

    it('should escape content if dangerous code is detected', () => {
      const response = 'Text with <script>evil</script>';
      const result = sanitizationService.sanitizeChatResponse(response);
      expect(result).not.toContain('<script>');
    });

    it('should preserve safe markdown content', () => {
      const response = '# Heading\n\nThis is **bold** text';
      const result = sanitizationService.sanitizeChatResponse(response);
      expect(result).toContain('Heading');
      expect(result).toContain('bold');
    });

    it('should return empty string for empty input', () => {
      const result = sanitizationService.sanitizeChatResponse('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeJson', () => {
    it('should parse and stringify valid JSON', () => {
      const jsonString = '{"name":"test","value":123}';
      const result = sanitizationService.sanitizeJson(jsonString);
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('name', 'test');
      expect(parsed).toHaveProperty('value', 123);
    });

    it('should remove dangerous properties from JSON', () => {
      const jsonString = '{"name":"test","__proto__":{"evil":true}}';
      const result = sanitizationService.sanitizeJson(jsonString);
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('name');
      expect(parsed).not.toHaveProperty('__proto__');
    });

    it('should return empty object for invalid JSON', () => {
      const result = sanitizationService.sanitizeJson('invalid json');
      expect(result).toBe('{}');
    });
  });
});
