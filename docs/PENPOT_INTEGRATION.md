# Penpot Integration Guide

Complete guide for integrating AI Design to Code with Penpot.

## Overview

Penpot is an open-source design tool that serves as the bridge between AI-generated code and visual design editing.

## Architecture

```
AI Generated Code ──► SVG Export ──► Penpot Import
                                          │
                                          ▼
                                    Design Editing
                                          │
                                          ▼
Penpot Export (SVG) ──► (Future) React Code
```

## Current Implementation

### Export to Penpot

1. Generate code with AI
2. Click "Export to Penpot" button
3. Download SVG file
4. Import to Penpot manually

### Import from Penpot (Planned)

1. Export design as SVG from Penpot
2. Upload to AI Design Tool
3. Convert SVG to React code

## SVG Bridge

### React to SVG

The `svg-converter.ts` library converts React components to SVG:

```typescript
import { reactComponentToSvg, downloadSvg } from '@/lib/svg-converter';

const svg = reactComponentToSvg(component, 800, 600);
downloadSvg(svg, 'my-design.svg');
```

### SVG to React (Planned)

```typescript
import { svgToReact } from '@/lib/svg-converter';

const reactCode = svgToReact(svgString, 'MyComponent');
```

## Penpot Self-Hosting

### Docker Services

```yaml
services:
  penpot-frontend:
    image: penpotapp/frontend:latest
    ports:
      - "9001:80"

  penpot-backend:
    image: penpotapp/backend:latest
    environment:
      - PENPOT_PUBLIC_URI=http://localhost:9001
      - PENPOT_DATABASE_URI=postgresql://penpot-postgres/penpot

  penpot-exporter:
    image: penpotapp/exporter:latest

  penpot-postgres:
    image: postgres:15

  penpot-redis:
    image: redis:7
```

### Configuration

| Variable | Default | Description |
|:---|:---|:---|
| `PENPOT_PUBLIC_URI` | http://localhost:9001 | Public URL |
| `PENPOT_DATABASE_URI` | postgresql://... | Database connection |
| `PENPOT_REDIS_URI` | redis://... | Redis connection |
| `PENPOT_TELEMETRY_ENABLED` | false | Analytics |

## Workflow Examples

### Example 1: Landing Page

1. **AI Generate:**
   ```
   Prompt: "Modern SaaS landing page with hero, features, pricing"
   ```

2. **Export to Penpot:**
   - Click "Export to Penpot"
   - Download `landing-page.svg`

3. **Import to Penpot:**
   - Open http://localhost:9001
   - File → Import → Select SVG

4. **Edit in Penpot:**
   - Adjust colors, spacing
   - Add animations
   - Export final design

### Example 2: Component Library

1. Generate multiple components
2. Export each as SVG
3. Import to Penpot as library
4. Create design system
5. Export for development

## API (Future)

When Penpot API is available:

```typescript
// Create file
const file = await penpot.createFile('My Design');

// Import SVG
await penpot.importSvg(file.id, svgString);

// Export
const exported = await penpot.export(file.id, 'svg');
```

## Troubleshooting

### SVG Import Fails

- Check SVG format (Penpot supports standard SVG)
- Ensure no external resources
- Simplify complex paths

### Penpot Won't Start

```bash
# Check logs
docker-compose logs penpot-backend

# Reset data
docker-compose down -v
rm -rf penpot-docker/data/
docker-compose up -d
```

### Export Quality Issues

- Increase SVG dimensions
- Check viewBox settings
- Use vector paths only

## Resources

- [Penpot Documentation](https://help.penpot.app/)
- [Penpot GitHub](https://github.com/penpot/penpot)
- [SVG Specification](https://www.w3.org/TR/SVG/)
