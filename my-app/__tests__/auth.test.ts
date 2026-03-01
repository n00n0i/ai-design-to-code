import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCodeSchema } from '../lib/auth';
import { z } from 'zod';

describe('Auth Validation', () => {
  describe('generateCodeSchema', () => {
    it('should validate valid input', () => {
      const validInput = {
        prompt: 'Create a login form with email and password',
        framework: 'nextjs',
        styling: 'tailwind',
        typescript: true
      };
      
      expect(() => generateCodeSchema.parse(validInput)).not.toThrow();
    });
    
    it('should reject short prompt', () => {
      const invalidInput = {
        prompt: 'short',
        framework: 'nextjs'
      };
      
      expect(() => generateCodeSchema.parse(invalidInput)).toThrow();
    });
    
    it('should reject long prompt', () => {
      const invalidInput = {
        prompt: 'a'.repeat(5001),
        framework: 'nextjs'
      };
      
      expect(() => generateCodeSchema.parse(invalidInput)).toThrow();
    });
    
    it('should use default values', () => {
      const input = {
        prompt: 'Create a button component'
      };
      
      const result = generateCodeSchema.parse(input);
      
      expect(result.framework).toBe('nextjs');
      expect(result.styling).toBe('tailwind');
      expect(result.typescript).toBe(true);
    });
  });
});
