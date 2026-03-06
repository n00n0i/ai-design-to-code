'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sandpack } from '@codesandbox/sandpack-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, Copy, Play, FileCode, Eye } from 'lucide-react';
import SettingsModal, { getKeyForProvider } from '@/components/SettingsModal';

// Provider & model options (client-side config)
const PROVIDER_MODELS = {
  kimi: {
    name: 'Kimi (Moonshot)',
    models: [
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2' },
      { id: 'moonshot-v1-8k',       name: 'Moonshot v1 8K' },
      { id: 'moonshot-v1-32k',      name: 'Moonshot v1 32K' },
    ],
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o',      name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
  },
} as const;

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [provider, setProvider] = useState<keyof typeof PROVIDER_MODELS>('kimi');
  const [model, setModel] = useState('kimi-k2-0711-preview');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const apiKey = getKeyForProvider(provider);
      const basePath = process.env.NEXT_PUBLIC_ASSET_PREFIX ?? '';
      const response = await fetch(`${basePath}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider, model, apiKey: apiKey || undefined }),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setError(`Server error: ${text.slice(0, 200)}`);
        return;
      }

      if (!response.ok || data.error) {
        setError(data.error?.message ?? data.error ?? `HTTP ${response.status}`);
      } else {
        setCode(data.code ?? data.data?.code ?? '');
        setActiveTab('preview');
      }
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  const exportAsZip = useCallback(async () => {
    const zip = new JSZip();
    
    // Create Next.js project structure
    zip.file('app/page.tsx', extractCodeBlock(code) || code);
    zip.file('app/layout.tsx', defaultLayoutCode);
    zip.file('app/globals.css', defaultGlobalsCss);
    zip.file('package.json', defaultPackageJson);
    zip.file('next.config.js', defaultNextConfig);
    zip.file('tailwind.config.js', defaultTailwindConfig);
    zip.file('tsconfig.json', defaultTsConfig);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'ai-generated-app.zip');
  }, [code]);

  const extractCodeBlock = (text: string) => {
    // Find all code blocks and pick the largest one
    const matches = [...text.matchAll(/```(?:tsx?|jsx?)?\n([\s\S]*?)```/g)];
    if (matches.length > 0) {
      return matches.reduce((a, b) => (a[1].length >= b[1].length ? a : b))[1];
    }
    // If no code block markers, check if it looks like raw code
    if (text.trim().startsWith('import') || text.trim().startsWith('export') || text.trim().startsWith('function')) {
      return text.trim();
    }
    return text;
  };

  const cleanCode = extractCodeBlock(code);

  const sandpackFiles = {
    '/App.tsx': cleanCode || '// Generated code will appear here',
    '/index.tsx': `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
    `,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            AI Design to Code
          </h1>
          <p className="text-slate-400 text-lg">
            Describe your design, get production-ready Next.js code
          </p>
          <div className="mt-3 flex justify-center">
            <SettingsModal />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Describe Your Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: A modern landing page for a coffee shop with hero section, features grid, and contact form. Use warm colors and elegant typography."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[180px] bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 resize-none"
              />

              {/* Provider & Model selector */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1 block">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => {
                      const p = e.target.value as keyof typeof PROVIDER_MODELS;
                      setProvider(p);
                      setModel(PROVIDER_MODELS[p].models[0].id);
                    }}
                    className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.entries(PROVIDER_MODELS).map(([id, p]) => (
                      <option key={id} value={id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1 block">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {PROVIDER_MODELS[provider].models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Generate Code
                  </span>
                )}
              </Button>
              
              {error && (
                <p className="text-red-400 text-sm bg-red-950/50 p-3 rounded-lg">{error}</p>
              )}

              {/* Quick Examples */}
              <div className="pt-4">
                <p className="text-slate-400 text-sm mb-3">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'SaaS landing page with pricing',
                    'Dashboard with sidebar nav',
                    'Contact form with validation',
                    'Portfolio gallery grid',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setPrompt(example)}
                      className="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 rounded-full hover:bg-slate-700 transition-colors border border-slate-600"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Generated Output
              </CardTitle>
              {code && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyToClipboard}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportAsZip}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export ZIP
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {code ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full bg-slate-900/50 border-b border-slate-700 rounded-none">
                    <TabsTrigger value="preview" className="flex-1 data-[state=active]:bg-slate-800">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex-1 data-[state=active]:bg-slate-800">
                      <FileCode className="w-4 h-4 mr-2" />
                      Code
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="m-0">
                    <div className="h-[450px] bg-white rounded-b-lg overflow-hidden">
                      <Sandpack
                        template="react-ts"
                        files={sandpackFiles}
                        customSetup={{
                          dependencies: {
                            'lucide-react': 'latest',
                            'class-variance-authority': 'latest',
                            'clsx': 'latest',
                          },
                        }}
                        options={{
                          showNavigator: false,
                          showLineNumbers: true,
                          showInlineErrors: true,
                          wrapContent: true,
                          editorHeight: 450,
                          externalResources: [
                            'https://cdn.tailwindcss.com',
                          ],
                        }}
                        theme="dark"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="code" className="m-0">
                    <pre className="h-[450px] bg-slate-950 rounded-b-lg p-4 overflow-auto text-sm text-slate-300 border-t border-slate-700">
                      <code>{cleanCode}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-[450px] flex flex-col items-center justify-center text-slate-500">
                  {loading ? (
                    <>
                      <div className="animate-spin text-4xl mb-4">⚡</div>
                      <p>AI is designing your component...</p>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-16 h-16 mb-4 opacity-50" />
                      <p>Generated code will appear here</p>
                      <p className="text-sm mt-2">Enter a prompt and click Generate</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Powered by {PROVIDER_MODELS[provider].name} ({model}) + Next.js + Sandpack</p>
        </div>
      </div>
    </main>
  );
}

// Default files for export
const defaultLayoutCode = `export const metadata = {
  title: 'AI Generated App',
  description: 'Generated by AI Design to Code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const defaultGlobalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

const defaultPackageJson = JSON.stringify({
  name: "ai-generated-app",
  version: "0.1.0",
  private: true,
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "next lint"
  },
  dependencies: {
    next: "^14.0.0",
    react: "^18.0.0",
    "react-dom": "^18.0.0"
  },
  devDependencies: {
    typescript: "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    tailwindcss: "^3.3.0",
    postcss: "^8.4.0",
    autoprefixer: "^10.4.0"
  }
}, null, 2);

const defaultNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
`;

const defaultTailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

const defaultTsConfig = JSON.stringify({
  compilerOptions: {
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    plugins: [{ name: "next" }],
    paths: { "@/*": ["./*"] }
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"]
}, null, 2);
