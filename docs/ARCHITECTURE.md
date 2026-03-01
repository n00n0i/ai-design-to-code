# Architecture

System architecture and design decisions for AI Design to Code.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Next.js 16 App                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │   Prompt    │  │   Preview   │  │  Code Editor    │  │    │
│  │  │   Input     │  │  (Sandpack) │  │  (Read-only)    │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────────┘  │    │
│  │         │                │                              │    │
│  │         └────────────────┴──────────────────┐           │    │
│  │                                             │           │    │
│  │  ┌──────────────────────────────────────────┴────────┐  │    │
│  │  │              Penpot Bridge Component               │  │    │
│  │  │  (Export to Penpot / Import from Penpot)         │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js API Routes (App Router)             │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  POST /api/generate                             │    │    │
│  │  │  ├── Request: { prompt: string }                │    │    │
│  │  │  └── Response: { code: string }                 │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI SERVICE LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Kimi API (Moonshot)                   │    │
│  │  Model: kimi-k2-0711-preview                            │    │
│  │  Role: Generate React/Next.js components from prompts   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
app/
├── page.tsx              # Main page with all features
├── layout.tsx            # Root layout with providers
└── api/
    └── generate/
        └── route.ts      # AI generation API endpoint

components/
├── ui/                   # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── tabs.tsx
│   └── textarea.tsx
│
└── PenpotBridge.tsx      # Penpot integration dialogs

lib/
├── utils.ts              # Utility functions (cn, etc.)
└── svg-converter.ts      # React ↔ SVG conversion
```

### Data Flow

```
1. User enters prompt
        │
        ▼
2. Frontend sends POST /api/generate
        │
        ▼
3. API calls Kimi with system prompt
        │
        ▼
4. Kimi returns generated code
        │
        ▼
5. Frontend displays in Sandpack preview
        │
        ▼
6. User can export as ZIP or to Penpot
```

## Penpot Integration

### Architecture Decision

Instead of full Penpot API integration (complex), we use **SVG Bridge** approach:

```
React Component ──► SVG ──► Penpot (import)
     ▲                              │
     └──────────── SVG ─────────────┘ (export)
```

### SVG Bridge Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AI Generated   │     │   SVG Export    │     │  Penpot Import  │
│  React Code     │────▶│  (lib/svg-      │────▶│  (Manual/API)   │
│                 │     │   converter.ts) │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Code     │◄────│   SVG Import    │◄────│  Penpot Export  │
│  (Future)       │     │  (Future)       │     │  (SVG file)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Deployment Architecture

### Docker Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Network                              │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  ai-design-to-  │  │  penpot-        │  │  penpot-        │  │
│  │  code (Next.js) │  │  frontend       │  │  backend        │  │
│  │  Port: 3000     │  │  Port: 9001     │  │  Internal       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  penpot-        │  │  penpot-        │  │  penpot-        │  │
│  │  exporter       │  │  postgres       │  │  redis          │  │
│  │  Internal       │  │  Internal       │  │  Internal       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Vagrant Deployment

```
Host Machine
    │
    ├── VirtualBox
    │   └── Ubuntu 22.04 VM (192.168.56.10)
    │       ├── Docker Engine
    │       │   └── All containers
    │       └── Project files (/opt/ai-design-to-code)
    │
    └── Port Forwarding
        ├── localhost:3000 → VM:3000
        └── localhost:9001 → VM:9001
```

## Technology Choices

### Why Next.js?
- App Router for modern React patterns
- API routes for backend functionality
- Excellent TypeScript support
- Built-in optimizations

### Why Kimi AI?
- Strong code generation capabilities
- Good Thai language support
- Competitive pricing
- Reliable API

### Why Sandpack?
- Real-time code preview
- Isolated environment
- Error boundaries
- Professional look

### Why Penpot?
- Open source (unlike Figma)
- Self-hostable
- SVG-based (easy integration)
- Active community

## Security Considerations

1. **API Key Storage**
   - Never commit `.env` files
   - Use environment variables in production
   - Rotate keys regularly

2. **Code Execution**
   - Sandpack provides isolation
   - No server-side code execution
   - Client-side only preview

3. **Penpot Self-Hosting**
   - Internal network only recommended
   - Configure proper authentication
   - Regular backups

## Performance

### Optimizations
- Static export for AI Tool
- Docker layer caching
- Multi-stage builds
- Volume mounts for development

### Resource Requirements

| Service | CPU | RAM | Disk |
|:---|:---:|:---:|:---:|
| AI Tool | 0.5 | 512MB | 1GB |
| Penpot Frontend | 0.5 | 512MB | 500MB |
| Penpot Backend | 1.0 | 1GB | 1GB |
| PostgreSQL | 0.5 | 512MB | 5GB |
| Redis | 0.25 | 256MB | 100MB |
| **Total** | **2.75** | **2.8GB** | **7.6GB** |

## Future Architecture

### Planned Improvements

1. **Direct Penpot API**
   - Real-time sync
   - Bidirectional updates
   - WebSocket connection

2. **Component Library**
   - Pre-built templates
   - Design system integration
   - Custom components

3. **Collaboration**
   - Multi-user editing
   - Version control
   - Comments/annotations
