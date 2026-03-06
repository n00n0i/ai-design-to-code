import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, checkRateLimit, generateCodeSchema } from '@/lib/auth';
import { logger, logRequest, logGeneration } from '@/lib/logger';
import { AppError, ErrorCodes, handleError } from '@/lib/error-handler';
import { getProvider, getDefaultModel, getApiKey, ProviderID } from '@/lib/ai-providers';

// Request schema with strict validation
const requestSchema = generateCodeSchema.extend({
  userId: z.string().optional(), // Will be set from auth
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Log request
    logRequest(req, null);
    
    // 1. Authentication (skip if Supabase is not configured)
    const supabaseConfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
    const user = supabaseConfigured ? await verifyAuth(req) : null;
    if (supabaseConfigured && !user) {
      throw new AppError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
    }

    // 2. Rate limiting
    const userId = user?.id ?? 'guest';
    const rateLimit = checkRateLimit(userId, 50, 60 * 60 * 1000); // 50 requests/hour
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
    const validated = requestSchema.parse({ ...body, userId: user?.id });
    
    // 4. Call AI service with retry logic
    const code = await generateWithRetry(
      validated.prompt,
      validated,
      validated.provider as ProviderID,
      validated.model,
      validated.apiKey,
    );

    // 5. Log success
    const duration = Date.now() - startTime;
    logGeneration(userId, validated.prompt, duration, true, {
      framework: validated.framework,
      styling: validated.styling
    });
    
    // 6. Return response with rate limit headers
    return NextResponse.json(
      {
        success: true,
        code,
        data: {
          code,
          metadata: {
            framework: validated.framework,
            styling: validated.styling,
            typescript: validated.typescript,
            provider: validated.provider,
            model: validated.model,
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
  providerId: ProviderID = 'kimi',
  modelId?: string,
  clientApiKey?: string,
  maxRetries: number = 3
): Promise<string> {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new AppError(400, `Unknown AI provider: ${providerId}`, ErrorCodes.INTERNAL_ERROR);
  }

  // Prefer key sent from client (browser localStorage), fall back to server env
  const apiKey = clientApiKey?.trim() || getApiKey(provider);
  if (!apiKey) {
    throw new AppError(
      500,
      `No API key for "${provider.name}". Add it via the API Keys settings in the UI, or set ${provider.envKey} on the server.`,
      ErrorCodes.INTERNAL_ERROR
    );
  }

  const model = modelId
    ? (provider.models.find((m) => m.id === modelId) ?? getDefaultModel(provider))
    : getDefaultModel(provider);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            { role: 'system', content: buildSystemPrompt(options) },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: model.maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI API error: ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      lastError = error as Error;
      logger.warn(`AI generation attempt ${attempt} failed`, {
        error: lastError.message,
        provider: providerId,
        model: model.id,
      });

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
    { originalError: lastError?.message, provider: providerId, model: model.id }
  );
}

function buildSystemPrompt(options: any): string {
  return `You are an expert ${options.framework} developer. Your task is to generate a single self-contained React component.

RULES (must follow strictly):
- Output ONLY a single fenced code block: \`\`\`tsx ... \`\`\`
- NO explanations, NO markdown text, NO installation instructions outside the code block
- The component must be the default export
- Use ${options.styling} for all styling
${options.typescript ? '- Use TypeScript with proper types' : '- Use JavaScript'}
- Include all necessary imports at the top
- Do NOT import external packages unavailable in a standard React sandbox (no next/image, no next/link, no react-router)
- Use only: react, lucide-react, and inline ${options.styling} classes/styles
- The component must be fully functional and render without errors`;
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
