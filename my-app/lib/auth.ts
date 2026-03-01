import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Supabase client for auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// JWT verification middleware
export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

// Rate limiting store (Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Reset window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

// Input validation schemas
export const generateCodeSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt too long'),
  framework: z.enum(['nextjs', 'react', 'vue', 'svelte']).default('nextjs'),
  styling: z.enum(['tailwind', 'css-modules', 'styled-components']).default('tailwind'),
  typescript: z.boolean().default(true),
});

export type GenerateCodeInput = z.infer<typeof generateCodeSchema>;

// API Key validation
export function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  const validKey = process.env.API_KEY;
  
  if (!validKey || !apiKey) return false;
  return apiKey === validKey;
}
