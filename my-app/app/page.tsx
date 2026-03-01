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

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('code');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setCode(data.code);
        setActiveTab('preview');
      }
    } catch (err) {
      setError('Failed to generate code. Please try again.');
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
    const match = text.match(/```(?:tsx?|jsx?)?\n([\s\S]*?)```/);
    return match ? match[1] : text;
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
                        options={{
                          showNavigator: false,
                          showLineNumbers: true,
                          showInlineErrors: true,
                          wrapContent: true,
                          editorHeight: 450,
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
          <p>Powered by Kimi AI + Next.js + Sandpack</p>
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
