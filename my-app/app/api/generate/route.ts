import { NextResponse } from 'next/server';

const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert React/Next.js developer and UI designer.

When given a design description, generate production-ready React code using:
- Next.js 14+ (App Router)
- React 18+ (Functional components with hooks)
- Tailwind CSS for styling
- TypeScript

Output format:
1. First, provide a brief design explanation (2-3 sentences)
2. Then provide the complete code in a code block
3. Use 'use client' directive if needed for client-side features
4. Make the design responsive and modern
5. Include proper TypeScript types

The code should be a complete, runnable page component.
`;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-0711-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Create a Next.js page for: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Kimi API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate code' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedCode = data.choices[0]?.message?.content || '';

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
