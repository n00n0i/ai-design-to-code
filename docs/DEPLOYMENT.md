# AI Design to Code - Production Deployment Guide

## Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- Domain name (for SSL)
- Server with 4GB+ RAM

## Quick Deploy

```bash
# 1. Clone and setup
git clone https://github.com/n00n0i/ai-design-to-code.git
cd ai-design-to-code

# 2. Configure environment
cp .env.example .env
# Edit .env with production values

# 3. Deploy
./scripts/deploy.sh
```

## Environment Variables

### Required

| Variable | Description |
|:---|:---|
| `DATABASE_URL` | PostgreSQL connection string |
| `KIMI_API_KEY` หรือ `OPENAI_API_KEY` | AI API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

### Optional

| Variable | Default | Description |
|:---|:---:|:---|
| `LOG_LEVEL` | info | Logging level |
| `PORT` | 3000 | Application port |
| `RATE_LIMIT` | 50 | Requests per hour per user |

## Monitoring

### Metrics Endpoint

```
GET /api/metrics
```

### Health Check

```
GET /api/health
```

### Logs

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# View specific service
docker-compose -f docker-compose.prod.yml logs -f postgres
```

## Backup

```bash
# Database backup
./scripts/backup.sh

# Restore
./scripts/restore.sh backup-file.sql
```

## SSL/TLS

```bash
# Using Let's Encrypt
./scripts/setup-ssl.sh your-domain.com
```

## Troubleshooting

### High Memory Usage

```bash
# Check memory
docker stats

# Restart with more memory
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Database Connection Issues

```bash
# Check postgres logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart postgres
docker-compose -f docker-compose.prod.yml restart postgres
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall (only 80, 443, 22)
- [ ] Set up log monitoring
- [ ] Enable automated backups
- [ ] Configure rate limiting
- [ ] Set up alerts

## Support

For issues, contact: support@example.com
