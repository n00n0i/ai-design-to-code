import winston from 'winston';

// Structured logging for production
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'ai-design-to-code',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ] : [])
  ]
});

export { logger };

// Request logging wrapper
export function logRequest(
  req: Request,
  userId: string | null,
  metadata?: Record<string, any>
) {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    userId,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || 'unknown',
    ...metadata
  });
}

export function logError(
  error: Error,
  req: Request,
  userId: string | null,
  metadata?: Record<string, any>
) {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    userId,
    ...metadata
  });
}

export function logGeneration(
  userId: string,
  prompt: string,
  duration: number,
  success: boolean,
  metadata?: Record<string, any>
) {
  logger.info({
    type: 'generation',
    userId,
    promptLength: prompt.length,
    duration,
    success,
    ...metadata
  });
}
