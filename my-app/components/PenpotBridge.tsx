'use client';

import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { reactComponentToSvg, downloadSvg } from '@/lib/svg-converter';

interface PenpotExportProps {
  code: string;
}

export function PenpotExport({ code }: PenpotExportProps) {
  const handleExport = () => {
    // Create a simple SVG representation of the code
    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="20" y="40" font-family="sans-serif" font-size="14" fill="#333">
    AI Generated Design
  </text>
  <rect x="20" y="60" width="760" height="500" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
  <text x="40" y="100" font-family="monospace" font-size="12" fill="#6b7280">
    ${code.substring(0, 500).replace(/[<>]/g, '').replace(/\n/g, ' ')}
  </text>
</svg>
    `.trim();
    
    downloadSvg(svgString, 'ai-design-for-penpot.svg');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
          <Download className="w-4 h-4 mr-2" />
          Export to Penpot
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Export to Penpot</DialogTitle>
          <DialogDescription className="text-slate-400">
            Download SVG file and import into Penpot
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Click "Download SVG" below</li>
            <li>Go to <a href="https://penpot.app" target="_blank" className="text-blue-400 hover:underline">penpot.app</a></li>
            <li>Create or open a project</li>
            <li>File → Import → Select the SVG file</li>
            <li>Edit and enhance your design!</li>
          </ol>
          
          <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download SVG for Penpot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PenpotImport() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
          <Upload className="w-4 h-4 mr-2" />
          Import from Penpot
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Import from Penpot</DialogTitle>
          <DialogDescription className="text-slate-400">
            Import SVG from Penpot to convert to React code
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-slate-300">
            This feature will allow importing SVG files exported from Penpot 
            and converting them back to React/Tailwind code.
          </p>
          
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Coming soon: Direct Penpot API integration</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
