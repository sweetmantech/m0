import React, { useEffect, useRef, useState } from 'react';
import { useDeployContext } from '@/providers/DeployProvider';

function parseImports(code: string) {
  // Matches: import X from 'pkg'; import {A, B} from 'pkg'; import * as X from 'pkg';
  const importRegex = /import\s+((\w+)|\*\s+as\s+(\w+)|\{([^}]+)\})\s+from\s+['"]([^'"@][^'"]*)['"];?|import\s+((\w+)|\*\s+as\s+(\w+)|\{([^}]+)\})\s+from\s+['"](@\/[^'"]+)['"];?/g;
  let match;
  const imports: Array<{
    defaultImport?: string;
    namedImports?: string[];
    namespaceImport?: string;
    package: string;
    isLocal: boolean;
    importStatement: string;
    importedAs?: string;
  }> = [];
  let codeWithoutImports = code;
  while ((match = importRegex.exec(code)) !== null) {
    const [full, group, defaultImport, namespaceImport, namedImports, pkg, _g2, _d2, _n2, _ni2, localPkg] = match;
    codeWithoutImports = codeWithoutImports.replace(full, '');
    if (localPkg) {
      // Local import
      if (namespaceImport) {
        imports.push({ namespaceImport, package: localPkg, isLocal: true, importStatement: full });
      } else if (namedImports) {
        imports.push({ namedImports: namedImports.split(',').map(s => s.trim().split(' as ')[0]), package: localPkg, isLocal: true, importStatement: full });
      } else if (defaultImport) {
        imports.push({ defaultImport, package: localPkg, isLocal: true, importStatement: full });
      }
    } else {
      // NPM import
      if (namespaceImport) {
        imports.push({ namespaceImport, package: pkg, isLocal: false, importStatement: full });
      } else if (namedImports) {
        imports.push({ namedImports: namedImports.split(',').map(s => s.trim().split(' as ')[0]), package: pkg, isLocal: false, importStatement: full });
      } else if (defaultImport) {
        imports.push({ defaultImport, package: pkg, isLocal: false, importStatement: full });
      }
    }
  }
  return { imports, codeWithoutImports };
}

function buildImportMap(imports: ReturnType<typeof parseImports>["imports"]) {
  // Always include react, react-dom/client
  const importMap: Record<string, string> = {
    'react': 'https://esm.sh/react@18.2.0',
    'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
  };
  imports.forEach(imp => {
    if (imp.isLocal) return;
    if (imp.package === 'react' || imp.package === 'react-dom' || imp.package === 'react-dom/client') return;
    importMap[imp.package] = `https://esm.sh/${imp.package}?deps=react@18.2.0`;
  });
  return importMap;
}

function filenameToVar(filename: string) {
  // '@/components/Header' => 'Header', 'app/page.tsx' => 'Home'
  if (filename === 'app/page.tsx') return 'Home';
  const parts = filename.split('/');
  let name = parts[parts.length - 1].replace(/\.[^.]+$/, '');
  // Capitalize
  return name.charAt(0).toUpperCase() + name.slice(1);
}

interface StaticPreviewProps {
  onClose: () => void;
}

export function StaticPreview({ onClose }: StaticPreviewProps) {
  const { files } = useDeployContext();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const prevBlobUrl = useRef<string | null>(null);

  // Find the main file
  const mainFile = files?.find((f) => f.file === 'app/page.tsx');
  const code = mainFile?.data;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (!code) {
      setError('No app/page.tsx file found for preview.');
      setBlobUrl(null);
      setLoading(false);
      return;
    }
    try {
      // Remove 'use client' directive
      let codeForPreview = code.replace(/['"]use client['"];?/g, '');
      // Parse imports in main file
      const { imports: mainImports } = parseImports(codeForPreview);
      // Build import map for npm packages only
      const importMap = buildImportMap(mainImports);
      const importMapJson = JSON.stringify({ imports: importMap }, null, 2);
      // Prepare local files as consts
      let localCodeBlocks: string[] = [];
      files?.forEach(f => {
        if (f.file === 'app/page.tsx') return;
        let localCode = f.data.replace(/['"]use client['"];?/g, '');
        // Remove all local imports from this file
        const { imports: localImports, codeWithoutImports } = parseImports(localCode);
        localCode = codeWithoutImports;
        // Wrap as const or function
        const varName = filenameToVar(f.file);
        // If file starts with 'export default function' or 'export default class', convert to const
        localCode = localCode.replace(/export default function (\w+)/, `const ${varName} = function`);
        localCode = localCode.replace(/export default class (\w+)/, `const ${varName} = class`);
        localCode = localCode.replace(/export default /, `const ${varName} = `);
        localCodeBlocks.push(localCode);
      });
      // Prepare main file code: remove local imports, use Home as default export
      let mainCode = codeForPreview;
      mainImports.forEach(imp => {
        if (imp.isLocal && imp.defaultImport) {
          // Remove import statement, use variable directly
          mainCode = mainCode.replace(imp.importStatement, '');
        }
      });
      // Replace export default function/class in main file
      mainCode = mainCode.replace(/export default function (\w+)/, 'function Home');
      mainCode = mainCode.replace(/export default class (\w+)/, 'class Home');
      mainCode = mainCode.replace(/export default /, 'const Home = ');
      // Compose HTML
      const errorHandlerScript = `<script>
        window.onerror = function(message, source, lineno, colno, error) {
          document.getElementById('root').innerHTML =
            '<div style="color:red;padding:1rem;">Error: ' + message + '<br/>' +
            (error && error.stack ? '<pre>' + error.stack + '</pre>' : '') +
            '</div>';
          return false;
        };
        window.onunhandledrejection = function(event) {
          document.getElementById('root').innerHTML =
            '<div style="color:red;padding:1rem;">Unhandled Promise Rejection: ' + event.reason + '</div>';
        };
        const origConsoleError = console.error;
        console.error = function(...args) {
          origConsoleError.apply(console, args);
          document.getElementById('root').innerHTML =
            '<div style="color:red;padding:1rem;">Console Error: ' + args.map(a => (a && a.stack) ? a.stack : a).join(' ') + '</div>';
        };
      <\/script>`;
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="importmap">${importMapJson}</script>
    <script type="module" src="https://esm.sh/tsx"></script>
  </head>
  <body>
    <div id="root"></div>
    ${errorHandlerScript}
    <script type="text/babel">
      ${localCodeBlocks.join('\n\n')}
      ${mainCode}
      import { createRoot } from 'react-dom/client';
      if (typeof Home === 'undefined') {
        document.getElementById('root').innerHTML = '<div style="color:red;padding:1rem;">Error: No default export (Home) found in app/page.tsx</div>';
      } else {
        createRoot(document.getElementById('root')).render(<Home />);
      }
    <\/script>
  </body>
</html>`;
console.log("html", html);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      if (!cancelled) {
        if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = url;
        setBlobUrl(url);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate preview');
      setBlobUrl(null);
    } finally {
      setLoading(false);
    }
    return () => {
      cancelled = true;
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    };
  }, [code, files]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-4 max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
        <button
          className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-2xl z-10"
          onClick={onClose}
          aria-label="Close Preview"
        >
          &times;
        </button>
        {loading && (
          <div className="flex items-center justify-center h-64 w-full">
            <div className="size-8 border-4 border-zinc-300 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-red-500 p-4 w-full text-center">Error: {error}</div>
        )}
        {!loading && !error && blobUrl && (
          <iframe
            src={blobUrl}
            title="Preview"
            className="w-full h-[70vh] border rounded"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
} 