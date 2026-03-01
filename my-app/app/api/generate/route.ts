import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, checkRateLimit, generateCodeSchema } from '@/lib/auth';
import { logger, logRequest, logGeneration } from '@/lib/logger';
import { AppError, ErrorCodes, handleError } from '@/lib/error-handler';

// Request schema with strict validation
const requestSchema = generateCodeSchema.extend({
  userId: z.string().optional(), // Will be set from auth
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Log request
    logRequest(req, null);
    
    // 1. Authentication
    const user = await verifyAuth(req);
    if (!user) {
      throw new AppError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // 2. Rate limiting
    const rateLimit = checkRateLimit(user.id, 50, 60 * 60 * 1000); // 50 requests/hour
    if (!rateLimit.allowed) {
      throw new AppError(
        429, 
        'Rate limit exceeded', 
        ErrorCodes.RATE_LIMIT_ERROR,
        { resetTime: rateLimit.resetTime }
      );
    }
    
    // 3. Parse and validate body
    const body = await req.json();
    const validated = requestSchema.parse({ ...body, userId: user.id });
    
    // 4. Call AI service with retry logic
    const code = await generateWithRetry(validated.prompt, validated);
    
    // 5. Log success
    const duration = Date.now() - startTime;
    logGeneration(user.id, validated.prompt, duration, true, {
      framework: validated.framework,
      styling: validated.styling
    });
    
    // 6. Return response with rate limit headers
    return NextResponse.json(
      {
        success: true,
        data: {
          code,
          metadata: {
            framework: validated.framework,
            styling: validated.styling,
            typescript: validated.typescript,
            generatedAt: new Date().toISOString()
          }
        }
      },
      {
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      }
    );
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logGeneration('unknown', '', duration, false, { error: (error as Error).message });
    return handleError(error, req, null);
  }
}

// AI generation with retry logic
async function generateWithRetry(
  prompt: string, 
  options: any,
  maxRetries: number = 3
): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new AppError(500, 'AI service not configured', ErrorCodes.INTERNAL_ERROR);
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'kimi-k2-0711-preview',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(options)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI API error: ${error}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      lastError = error as Error;
      logger.warn(`AI generation attempt ${attempt} failed`, { error: lastError.message });
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new AppError(
    503,
    'AI generation failed after retries',
    ErrorCodes.AI_GENERATION_ERROR,
    { originalError: lastError?.message }
  );
}

function buildSystemPrompt(options: any): string {
  return `You are an expert ${options.framework} developer.
Generate clean, production-ready code using ${options.styling} for styling.
${options.typescript ? 'Use TypeScript with proper types.' : 'Use JavaScript.'}

Requirements:
- Follow best practices
- Include error handling
- Add proper comments
- Make components reusable
- Ensure accessibility`;
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'ai-design-to-code',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
}
