import { register, Counter, Histogram, Gauge } from 'prom-client';

// Create metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const aiGenerationsTotal = new Counter({
  name: 'ai_generations_total',
  help: 'Total number of AI code generations',
  labelNames: ['framework', 'status']
});

export const aiGenerationDuration = new Histogram({
  name: 'ai_generation_duration_seconds',
  help: 'Duration of AI generation in seconds',
  buckets: [1, 5, 10, 30, 60, 120]
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

export const dbConnections = new Gauge({
  name: 'db_connections',
  help: 'Number of database connections'
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(aiGenerationsTotal);
register.registerMetric(aiGenerationDuration);
register.registerMetric(activeUsers);
register.registerMetric(dbConnections);

export { register };
