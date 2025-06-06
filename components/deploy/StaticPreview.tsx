import React, { useEffect, useRef, useState } from 'react';
import { useDeployContext } from '@/providers/DeployProvider';
import { buildImportMapFromAllFiles } from '@/lib/preview/buildImportMapFromAllFiles';
import { stripNonNpmImports } from '@/lib/preview/stripNonNpmImports';
import { filenameToVar } from '@/lib/preview/filenameToVar';

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
      // Build import map for all npm packages used in any file
      const importMap = buildImportMapFromAllFiles(files || []);
      const importMapJson = JSON.stringify({ imports: importMap }, null, 2);
      // Prepare local files as consts
      let localCodeBlocks: string[] = [];
      files?.forEach(f => {
        if (f.file === 'app/page.tsx') return;
        let localCode = f.data.replace(/['"]use client['"];?/g, '');
        // Remove all local, CSS, and type-only imports from this file
        localCode = stripNonNpmImports(localCode, importMap);
        // Wrap as const or function
        const varName = filenameToVar(f.file);
        localCode = localCode.replace(/export default function (\w+)/, `const ${varName} = function`);
        localCode = localCode.replace(/export default class (\w+)/, `const ${varName} = class`);
        localCode = localCode.replace(/export default /, `const ${varName} = `);
        localCodeBlocks.push(localCode);
      });
      // Prepare main file code: remove local, CSS, and type-only imports, use Home as default export
      let mainCode = stripNonNpmImports(codeForPreview, importMap);
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