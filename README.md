# AI Design to Code - Production Ready

AI-powered design to code generator with Penpot integration. **Production-ready** with comprehensive security, monitoring, and scalability.

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │   Browser   │    │   Mobile    │    │   API Client│                     │
│  │   (React)   │    │   (Future)  │    │   (External)│                     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                     │
│         │                  │                  │                              │
│         └──────────────────┼──────────────────┘                              │
│                            │                                                │
└────────────────────────────┼────────────────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────┼────────────────────────────────────────────────┐
│                         CDN / LOAD BALANCER                                  │
│                    (CloudFlare / AWS CloudFront)                             │
└────────────────────────────┼────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────────────┐
│                           SERVER LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Nginx (Reverse Proxy)                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │    │
│  │  │   SSL/TLS   │  │  Rate Limit │  │   Static    │  │  Health  │  │    │
│  │  │  Termination│  │   (Req/s)   │  │    Files    │  │  Checks  │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬─────┘  │    │
│  │         └─────────────────┴─────────────────┴──────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐   │
│  │                    Next.js Application (Node.js)                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐    │   │
│  │  │     API     │  │    Auth     │  │   Logging   │  │  Error   │    │   │
│  │  │   Routes    │  │   (JWT)     │  │  (Winston)  │  │ Handler  │    │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬─────┘    │   │
│  │         └─────────────────┴─────────────────┴──────────────┘          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                    │                                          │
└────────────────────────────────────┼──────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼──────────────────────────────────────────┐
│                         SERVICE LAYER (Docker)                               │
│                                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   PostgreSQL    │  │     Redis       │  │   AI Services   │                │
│  │   (Database)    │  │   (Cache/Queue) │  │ (Kimi/OpenAI)   │                │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │                │
│  │  │  Users    │  │  │  │ Sessions  │  │  │  │  Kimi API │  │                │
│  │  │Generations│  │  │  │ Rate Limit│  │  │  │ OpenAI API│  │                │
│  │  │ API Keys  │  │  │  │   Queue   │  │  │  │  Fallback │  │                │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                    Penpot Services (Optional)                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │  Frontend   │  │   Backend   │  │  Exporter   │  │  PostgreSQL │    │  │
│  │  │    :9001    │  │    :8080    │  │    :8081    │  │    :5433    │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│  Nginx  │────▶│  Auth   │────▶│  Rate   │────▶│ Next.js │
│ Request │     │ (SSL)   │     │ Middleware│    │  Limit  │     │   API   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └────┬────┘
                                                                      │
                    ┌─────────────────────────────────────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │   Validation    │
           │   (Zod Schema)  │
           └────────┬────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  Cache  │ │Database │ │ AI API  │
   │ (Redis) │ │(Postgres)│ │(Kimi)  │
   └─────────┘ └─────────┘ └─────────┘
```

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Login  │────▶│ Validate│────▶│ Generate│────▶│  Store  │────▶│ Return  │
│ Request │     │Credentials│    │  JWT    │     │ Session │     │  Token  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
                                                                              
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  API    │────▶│ Verify  │────▶│  Check  │────▶│ Process │
│ Request │     │  JWT    │     │  Rate   │     │ Request │
│ + Token │     │         │     │  Limit  │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Code Generation Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Validate│────▶│  Check  │────▶│  Queue  │────▶│ Process │
│ Prompt  │     │  Input  │     │  Quota  │     │  Task   │     │ with AI │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └────┬────┘
                                                                      │
                    ┌─────────────────────────────────────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │  AI Provider    │
           │  (Kimi/OpenAI)  │
           └────────┬────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   ┌─────────┐             ┌─────────┐
   │ Success │             │  Error  │
   │ Save to │             │ Retry/  │
   │ Database│             │ Fallback│
   └────┬────┘             └────┬────┘
        │                       │
        └───────────┬───────────┘
                    ▼
              ┌─────────┐
              │ Return  │
              │ Result  │
              └─────────┘
```

## 🚀 Quick Start

### Production Install

```bash
curl -fsSL https://raw.githubusercontent.com/n00n0i/ai-design-to-code/main/install-production.sh | sudo bash
```

### Manual Install

```bash
# 1. Clone
git clone https://github.com/n00n0i/ai-design-to-code.git
cd ai-design-to-code

# 2. Configure
cp .env.production.example .env.production
# Edit with your API keys

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

Access monitoring dashboards:
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🔒 Security

- JWT Authentication
- Rate Limiting (100 req/15min)
- Input Validation (Zod)
- SQL Injection Protection (Prisma)
- XSS Protection
- CSRF Tokens

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📚 API Documentation

### POST /api/generate

Generate code from natural language prompt.

**Request:**
```json
{
  "prompt": "Create a login form with email and password",
  "framework": "nextjs",
  "styling": "tailwind",
  "typescript": true
}
```

**Response:**
```json
{
  "id": "gen_123",
  "code": "export default function LoginForm() {...}",
  "tokensUsed": 150,
  "duration": 2500
}
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, FastAPI
- **Database**: PostgreSQL 15, Prisma ORM
- **Cache**: Redis 7
- **AI**: Kimi API, OpenAI API
- **Monitoring**: Prometheus, Grafana
- **Security**: JWT, bcrypt, helmet

## 📄 License

MIT
