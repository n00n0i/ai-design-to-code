import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe('API Integration', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Setup test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (error) throw error;
    authToken = data.session?.access_token || '';
  });
  
  describe('POST /api/generate', () => {
    it('should generate code with valid input', async () => {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          prompt: 'Create a login form with email and password fields'
        })
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('id');
    });
    
    it('should reject unauthorized requests', async () => {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Create a button'
        })
      });
      
      expect(response.status).toBe(401);
    });
    
    it('should validate input', async () => {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          prompt: 'short' // Too short
        })
      });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await fetch('http://localhost:3000/api/health');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });
  });
});
