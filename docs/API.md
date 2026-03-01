# API Reference

API documentation for AI Design to Code.

## Base URL

```
Native: http://localhost:3000
Docker: http://localhost:3000
Vagrant: http://localhost:3000 (forwarded from VM)
```

## Endpoints

### POST /api/generate

Generate React/Next.js code from natural language prompt.

#### Request

```typescript
{
  prompt: string;  // Description of the component/design
}
```

#### Response

```typescript
{
  code: string;    // Generated React/TypeScript code
  error?: string;  // Error message if generation failed
}
```

#### Example

**Request:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A modern landing page for a coffee shop with hero section, features grid, and contact form"
  }'
```

**Response:**
```json
{
  "code": "export default function LandingPage() {\n  return (\n    <div className=\"min-h-screen bg-amber-50\">...\n  );\n}"
}
```

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|:---|:---:|:---|
| 200 | OK | Successful generation |
| 400 | Bad Request | Missing or invalid prompt |
| 500 | Internal Error | AI service error |

### Error Response Format

```json
{
  "error": "Error message description"
}
```

## Rate Limiting

Rate limits depend on your Kimi API key tier:

| Tier | Requests/Min | Requests/Day |
|:---|:---:|:---:|
| Free | 10 | 100 |
| Standard | 60 | 10,000 |
| Premium | 120 | 50,000 |

## SDK / Client Libraries

### JavaScript/TypeScript

```typescript
async function generateCode(prompt: string): Promise<string> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.code;
}
```

### Python

```python
import requests

def generate_code(prompt: str) -> str:
    response = requests.post(
        'http://localhost:3000/api/generate',
        json={'prompt': prompt}
    )
    data = response.json()
    
    if 'error' in data:
        raise Exception(data['error'])
    
    return data['code']
```

## System Prompt

The AI uses the following system prompt for code generation:

```
You are an expert React and Next.js developer. Generate clean, 
modern React components using TypeScript and Tailwind CSS.

Guidelines:
- Use functional components with hooks
- Include proper TypeScript types
- Use Tailwind CSS for styling
- Make components responsive
- Add proper accessibility attributes
- Include comments for complex logic

Output only the code, no explanations.
```

## Environment Variables

Required for API operation:

| Variable | Required | Description |
|:---|:---:|:---|
| `KIMI_API_KEY` | ✅ | Your Kimi API key |
| `KIMI_MODEL` | ❌ | Model to use (default: kimi-k2-0711-preview) |

## Testing

### Using curl

```bash
# Test basic generation
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A button component"}'

# Test with complex prompt
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A dashboard sidebar with navigation menu, user profile section, and logout button"
  }'
```

### Using Postman/Insomnia

1. Create new POST request
2. URL: `http://localhost:3000/api/generate`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
   ```json
   {
     "prompt": "Your design description here"
   }
   ```

## WebSocket (Future)

Planned for real-time collaboration:

```
ws://localhost:3000/api/ws

Events:
- code:update
- cursor:move
- user:join
- user:leave
```
