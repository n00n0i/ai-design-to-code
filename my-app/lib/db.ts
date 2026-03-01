import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// User queries
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { generations: true }
      }
    }
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export async function createUser(data: {
  email: string;
  name?: string;
  oauthProvider?: string;
  oauthId?: string;
}) {
  return prisma.user.create({
    data
  });
}

// Generation queries
export async function createGeneration(data: {
  userId: string;
  prompt: string;
  framework: string;
  styling: string;
  typescript: boolean;
  code: string;
  status: string;
  tokensUsed?: number;
  duration?: number;
}) {
  return prisma.generation.create({
    data
  });
}

export async function getUserGenerations(userId: string, limit: number = 50) {
  return prisma.generation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

// API Key queries
export async function createApiKey(data: {
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  rateLimit?: number;
}) {
  return prisma.apiKey.create({
    data
  });
}

export async function getApiKeyByHash(keyHash: string) {
  return prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true }
  });
}

export async function updateApiKeyLastUsed(id: string) {
  return prisma.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() }
  });
}

// Rate limit queries
export async function getRateLimit(identifier: string) {
  return prisma.rateLimit.findFirst({
    where: {
      identifier,
      resetTime: { gt: new Date() }
    }
  });
}

export async function upsertRateLimit(
  identifier: string,
  count: number,
  resetTime: Date
) {
  return prisma.rateLimit.upsert({
    where: { id: identifier },
    update: { count, resetTime },
    create: {
      id: identifier,
      identifier,
      count,
      resetTime
    }
  });
}
