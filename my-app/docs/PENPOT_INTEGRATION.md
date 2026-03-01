# Penpot Integration Bridge

Simplified SVG-based workflow for AI Design to Code with Penpot.

## Approach

Instead of full Penpot self-hosting (complex), use:
1. **SVG Export** - Generate SVG from React code
2. **Penpot Import** - Import SVG to penpot.app
3. **Penpot Export** - Export design back to SVG
4. **Code Generation** - Convert SVG to React

## Workflow

```
AI Generate React Code
        ↓
Convert to SVG (via SSR)
        ↓
Import to Penpot (manual or API)
        ↓
Design/Edit in Penpot
        ↓
Export SVG from Penpot
        ↓
Convert back to React
```

## Implementation

### 1. React to SVG Converter

```typescript
// lib/react-to-svg.ts
import { renderToString } from 'react-dom/server';

export function reactToSvg(component: React.ReactElement): string {
  const html = renderToString(component);
  // Convert HTML to SVG using html-to-svg library
  return convertHtmlToSvg(html);
}
```

### 2. SVG to Penpot

Penpot supports SVG import directly:
- Copy SVG code
- Paste in Penpot
- Or use File → Import

### 3. Penpot to React

Convert SVG elements to React components:
- `<rect>` → `<div>` with Tailwind
- `<text>` → `<span>` or `<p>`
- `<g>` → `<div>` container

## API Integration (Future)

Penpot API (when available):
```typescript
// Create file
POST /api/rpc/command/create-file

// Import SVG
POST /api/rpc/command/import-svg

// Export file
GET /api/rpc/command/export-file
```

## Current Status

- ✅ Penpot source cloned
- ⚠️ Self-hosting: Complex (requires Docker, PostgreSQL, Redis, MinIO)
- ✅ Alternative: SVG bridge (simpler)

## Recommendation

For MVP:
1. Use **SVG bridge** approach
2. Manual import/export to penpot.app
3. Later: Full self-hosting if needed

## Files

- `lib/svg-converter.ts` - React ↔ SVG conversion
- `components/PenpotExport.tsx` - Export button
- `components/PenpotImport.tsx` - Import button
