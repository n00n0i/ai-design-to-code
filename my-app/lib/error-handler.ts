import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger, logError } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  AI_GENERATION_ERROR: 'AI_GENERATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND'
} as const;

export function handleError(error: unknown, req: Request, userId: string | null) {
  logError(error as Error, req, userId);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.flatten().fieldErrors
        }
      },
      { status: 400 }
    );
  }

  // Unknown error
  logger.error('Unhandled error', { error });
  
  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : (error as Error).message
      }
    },
    { status: 500 }
  );
}

// Async handler wrapper
export function asyncHandler(
  fn: (req: Request, context: { params: any }) => Promise<NextResponse>
) {
  return async (req: Request, context: { params: any }) => {
    try {
      return await fn(req, context);
    } catch (error) {
      return handleError(error, req, null);
    }
  };
}
