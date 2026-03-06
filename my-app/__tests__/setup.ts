import { vi } from 'vitest';

// Mock environment variables for tests
process.env.KIMI_API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock fetch globally
global.fetch = vi.fn();
