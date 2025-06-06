import { buildImportMapFromAllFiles } from "./buildImportMapFromAllFiles";
import { filenameToVar } from "./filenameToVar";
import { stripNonNpmImports } from "./stripNonNpmImports";
import { FileDescriptor } from '@/lib/types';

/**
 * Generates a blob URL for the preview iframe, given the code, files, import map, local code blocks, main code, and error handler script.
 */
export function getIframeUrl({
    code,
    files,
}: {
    code: string;
    files: FileDescriptor[] | null;
}): string {
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
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    return url;
} 