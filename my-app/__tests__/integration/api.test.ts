import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { test, expect as playwrightExpect } from '@playwright/test';

describe('API Integration Tests', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  describe('POST /api/generate', () => {
    it('should return 401 without auth', async () => {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a login form'
        })
      });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 400 for invalid input', async () => {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          prompt: 'short' // Too short
        })
      });
      
      expect(response.status).toBe(400);
    });
    
    it('should return 429 when rate limited', async () => {
      // Make 51 requests to trigger rate limit
      const requests = Array(51).fill(null).map(() =>
        fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            prompt: 'Create a login form with email and password fields'
          })
        })
      );
      
      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];
      
      expect(lastResponse.status).toBe(429);
    });
  });
  
  describe('GET /api/generate', () => {
    it('should return health status', async () => {
      const response = await fetch(`${baseUrl}/api/generate`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });
  });
});
