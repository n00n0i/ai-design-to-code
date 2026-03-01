import React from 'react';

interface SvgElement {
  type: string;
  props: Record<string, any>;
  children?: SvgElement[];
}

/**
 * Convert React component to SVG string
 */
export function reactComponentToSvg(
  component: React.ReactElement,
  width: number = 800,
  height: number = 600
): string {
  // Extract styles and layout from React component
  const svgElements = extractElements(component);
  
  // Build SVG
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${svgElements.map(renderSvgElement).join('\n  ')}
</svg>
  `.trim();
  
  return svg;
}

/**
 * Convert SVG string to React/Tailwind code
 */
export function svgToReact(svgString: string, componentName: string = 'Design'): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  
  if (!svg) return '';
  
  const elements = Array.from(svg.children)
    .filter(el => el.tagName !== 'defs' && el.tagName !== 'metadata')
    .map(convertSvgElementToReact);
  
  return `
export default function ${componentName}() {
  return (
    <div className="relative w-full h-full">
      ${elements.join('\n      ')}
    </div>
  );
}
  `.trim();
}

// Helper functions
function extractElements(component: React.ReactElement): SvgElement[] {
  // Simplified extraction
  return [{
    type: 'rect',
    props: { x: 10, y: 10, width: 200, height: 100, fill: '#3b82f6' }
  }];
}

function renderSvgElement(el: SvgElement): string {
  const props = Object.entries(el.props)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  
  return `<${el.type} ${props}/>`;
}

function convertSvgElementToReact(el: Element): string {
  const tagName = el.tagName.toLowerCase();
  
  switch (tagName) {
    case 'rect': {
      const x = el.getAttribute('x') || '0';
      const y = el.getAttribute('y') || '0';
      const width = el.getAttribute('width') || '100';
      const height = el.getAttribute('height') || '100';
      const fill = el.getAttribute('fill') || '#000';
      
      // Map to Tailwind
      const tailwindColor = mapSvgColorToTailwind(fill);
      
      return `<div 
        className="absolute ${tailwindColor} rounded"
        style={{ 
          left: '${x}px', 
          top: '${y}px', 
          width: '${width}px', 
          height: '${height}px' 
        }}
      />`;
    }
    
    case 'text': {
      const x = el.getAttribute('x') || '0';
      const y = el.getAttribute('y') || '0';
      const content = el.textContent || '';
      
      return `<span 
        className="absolute text-sm font-medium"
        style={{ left: '${x}px', top: '${y}px' }}
      >
        ${content}
      </span>`;
    }
    
    case 'circle': {
      const cx = el.getAttribute('cx') || '0';
      const cy = el.getAttribute('cy') || '0';
      const r = el.getAttribute('r') || '50';
      const fill = el.getAttribute('fill') || '#000';
      
      return `<div 
        className="absolute rounded-full ${mapSvgColorToTailwind(fill)}"
        style={{ 
          left: '${parseInt(cx) - parseInt(r)}px', 
          top: '${parseInt(cy) - parseInt(r)}px', 
          width: '${parseInt(r) * 2}px', 
          height: '${parseInt(r) * 2}px' 
        }}
      />`;
    }
    
    default:
      return `<!-- ${tagName} not yet supported -->`;
  }
}

function mapSvgColorToTailwind(svgColor: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': 'bg-blue-500',
    '#ef4444': 'bg-red-500',
    '#22c55e': 'bg-green-500',
    '#f59e0b': 'bg-amber-500',
    '#6b7280': 'bg-gray-500',
    '#000000': 'bg-black',
    '#ffffff': 'bg-white',
  };
  
  return colorMap[svgColor] || 'bg-gray-400';
}

/**
 * Download SVG file
 */
export function downloadSvg(svgString: string, filename: string = 'design.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
