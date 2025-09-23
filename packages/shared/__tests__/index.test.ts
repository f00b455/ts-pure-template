import { describe, it, expect } from 'vitest';
import { greet, formatDate } from '../src/index.js';

describe('shared utilities', () => {
  describe('greet', () => {
    it('should return greeting message', () => {
      expect(greet('TypeScript')).toBe('Hello, TypeScript!');
    });

    it('should throw error for empty name', () => {
      expect(() => greet('')).toThrow('Name cannot be empty');
      expect(() => greet('   ')).toThrow('Name cannot be empty');
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(formatDate(date)).toBe('2024-03-15');
    });
  });
});