import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateCodeSchema } from '@/lib/auth';
import { AppError, ErrorCodes } from '@/lib/error-handler';

describe('Auth Module', () => {
  describe('generateCodeSchema', () => {
    it('should validate valid input', () => {
      const input = {
        prompt: 'Create a login form with email and password',
        framework: 'nextjs',
        styling: 'tailwind',
        typescript: true
      };
      
      const result = generateCodeSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
    
    it('should reject short prompt', () => {
      const input = {
        prompt: 'short',
        framework: 'nextjs'
      };
      
      const result = generateCodeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
    
    it('should reject long prompt', () => {
      const input = {
        prompt: 'a'.repeat(5001),
        framework: 'nextjs'
      };
      
      const result = generateCodeSchema.safeParse(input);
      expect(result.success).toBe(false);
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

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(
        400,
        'Validation failed',
        ErrorCodes.VALIDATION_ERROR,
        { field: 'email' }
      );
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.details).toEqual({ field: 'email' });
    });
  });
});
