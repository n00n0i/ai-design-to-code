# Penpot Self-Hosted + AI Design to Code

Complete Docker setup for Penpot with AI integration.

## Quick Start

```bash
cd penpot-docker
./start.sh
```

Access:
- **Penpot**: http://localhost:9001
- **AI Design Tool**: http://localhost:3000 (separate)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DOCKER NETWORK                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Frontend   │  │   Backend   │  │  Exporter   │     │
│  │   :9001     │  │   (API)     │  │  (Render)   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │   Postgres  │                       │
│                   │    :5432    │                       │
│                   └─────────────┘                       │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │    Redis    │                       │
│                   │    :6379    │                       │
│                   └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

## Services

| Service | Image | Port | Purpose |
|:---|:---|:---:|:---|
| Frontend | penpotapp/frontend | 9001 | Web UI |
| Backend | penpotapp/backend | internal | API |
| Exporter | penpotapp/exporter | internal | Export PNG/SVG/PDF |
| Postgres | postgres:15 | internal | Database |
| Redis | redis:7 | internal | Cache |

## Data Persistence

```
data/
├── assets/       # Uploaded files, designs
└── postgres/     # Database files
```

## Integration with AI Tool

1. Start Penpot: `./start.sh`
2. Start AI Tool: `cd ../my-app && npm run dev`
3. Use Penpot Bridge component to export/import

## API Access

Once running, Penpot API available at:
```
http://localhost:9001/api/rpc/command/<command>
```

## Customization

Edit `docker-compose.yml`:
- Change `PENPOT_PUBLIC_URI` for external access
- Modify ports
- Add SMTP for email
- Enable LDAP

## Troubleshooting

```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Reset (WARNING: deletes data)
docker-compose down -v
rm -rf data/
```
