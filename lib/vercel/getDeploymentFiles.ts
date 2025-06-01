import fs from 'fs';
import path from 'path';

// Map of known packages to versions (add more as needed)
const KNOWN_PACKAGE_VERSIONS: Record<string, string> = {
  '@radix-ui/react-alert-dialog': '^1.0.0',
  '@radix-ui/react-dialog': '^1.0.0',
  '@radix-ui/react-popover': '^1.0.0',
  '@radix-ui/react-tooltip': '^1.0.0',
  '@radix-ui/react-select': '^1.0.0',
  '@radix-ui/react-dropdown-menu': '^1.0.0',
  '@radix-ui/react-menubar': '^1.0.0',
  'class-variance-authority': '^0.7.0',
  'lucide-react': 'latest',
  'zustand': '^4.4.0',
};

function extractExternalPackagesFromFiles(files: Array<{ file: string; data: string; encoding: string }>): string[] {
  const packageRegex = /from ['"]([^'"]+)['"]/g;
  const externalPackages = new Set<string>();
  for (const file of files) {
    let match;
    while ((match = packageRegex.exec(file.data))) {
      const pkg = match[1];
      // Ignore relative and alias imports
      if (!pkg.startsWith('.') && !pkg.startsWith('@/')) {
        // For scoped packages, only take the first two segments (e.g., @radix-ui/react-alert-dialog)
        const parts = pkg.split('/');
        const dep = pkg.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
        externalPackages.add(dep);
      }
    }
  }
  return Array.from(externalPackages);
}

function collectRequiredUiFiles(
  entryFiles: Array<{ file: string; data: string; encoding: string }>,
  uiDir: string
): Array<{ file: string; data: string; encoding: string }> {
  const required = new Set<{ file: string; data: string; encoding: string }>();
  const seen = new Set<string>();
  const importRegex = /from ['"]((?:@\/components\/ui\/|\.\/ui\/)([\w-]+))(?:\.\w+)?['"]/g;

  function resolveUiFile(importPath: string): string | null {
    // Handles both @/components/ui/Button and ./ui/Button
    const match = importPath.match(/(?:@\/components\/ui\/|\.\/ui\/)([\w-]+)/);
    if (!match) return null;
    const base = match[1];
    // Try .tsx, .ts, .jsx, .js in order
    const exts = ['.tsx', '.ts', '.jsx', '.js'];
    for (const ext of exts) {
      const candidate = path.join(uiDir, base + ext);
      if (fs.existsSync(candidate)) return candidate;
    }
    return null;
  }

  function addFile(filePath: string) {
    if (seen.has(filePath)) return;
    seen.add(filePath);
    const data = fs.readFileSync(filePath, 'utf-8');
    required.add({
      file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      data,
      encoding: 'utf-8',
    });
    // Recursively scan for further UI imports
    let match;
    while ((match = importRegex.exec(data))) {
      const importPath = match[1];
      const resolved = resolveUiFile(importPath);
      if (resolved) addFile(resolved);
    }
  }

  for (const entry of entryFiles) {
    let match;
    while ((match = importRegex.exec(entry.data))) {
      const importPath = match[1];
      const resolved = resolveUiFile(importPath);
      if (resolved) addFile(resolved);
    }
  }
  return Array.from(required);
}

export function getDeploymentFiles(uniqueName: string, files?: Array<{ file: string; data: string; encoding: string }>) {
  // Default files
  const defaultFiles = [
    {
      file: 'package.json',
      data: '', // Will be filled in later
      encoding: 'utf-8',
    },
    {
      file: 'tsconfig.json',
      data: JSON.stringify({
        "compilerOptions": {
          "target": "ES2017",
          "lib": ["dom", "dom.iterable", "esnext"],
          "allowJs": true,
          "skipLibCheck": true,
          "strict": true,
          "noEmit": true,
          "esModuleInterop": true,
          "module": "esnext",
          "moduleResolution": "bundler",
          "resolveJsonModule": true,
          "isolatedModules": true,
          "jsx": "preserve",
          "incremental": true,
          "plugins": [
            {
              "name": "next"
            }
          ],
          "paths": {
            "@/*": ["./*"]
          }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
      }, null, 2),
      encoding: 'utf-8',
    },
    {
      file: 'app/page.tsx',
      data: "export default function Home() { return <h1>Hello from hard-coded Next.js!</h1>; }",
      encoding: 'utf-8',
    },
    {
      file: 'app/layout.tsx',
      data: `import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang=\"en\">
      <body>{children}</body>
    </html>
  );
}
`,
      encoding: 'utf-8',
    },
    {
      file: 'app/globals.css',
      data: `@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
`,
      encoding: 'utf-8',
    },
    {
      file: 'vercel.json',
      data: JSON.stringify({ version: 2 }),
      encoding: 'utf-8',
    },
    {
      file: 'lib/utils.ts',
      data: `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`,
      encoding: 'utf-8',
    },
    {
      file: 'postcss.config.mjs',
      data: `const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
`,
      encoding: 'utf-8',
    },
  ];

  if (!files || files.length === 0) files = [];

  const findUserFile = (filename: string) => files!.find(f => f.file === filename);
  const merged = defaultFiles.map(def => findUserFile(def.file) || def);
  const defaultFileNames = new Set(defaultFiles.map(f => f.file));
  const extraUserFiles = files!.filter(f => !defaultFileNames.has(f.file));

  // --- Only add required UI files ---
  let uiFiles: Array<{ file: string; data: string; encoding: string }> = [];
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const uiDir = path.join(process.cwd(), 'components/ui');
    if (fs.existsSync(uiDir)) {
      uiFiles = collectRequiredUiFiles([...merged, ...extraUserFiles], uiDir);
    }
  }

  // Filter out duplicates (prioritize user files, then uiFiles)
  const allFilesMap = new Map<string, { file: string; data: string; encoding: string }>();
  [...merged, ...extraUserFiles, ...uiFiles].forEach(f => {
    if (!allFilesMap.has(f.file)) {
      allFilesMap.set(f.file, f);
    }
  });

  // --- PACKAGE DETECTION AND MERGE ---
  const allFiles = Array.from(allFilesMap.values());
  const requiredPackages = extractExternalPackagesFromFiles(allFiles);

  // Default dependencies
  const baseDependencies: Record<string, string> = {
    next: '15.3.3',
    react: '19.0.0',
    'react-dom': '19.0.0',
  };

  // Merge required packages with known versions
  for (const pkg of requiredPackages) {
    if (!baseDependencies[pkg]) {
      baseDependencies[pkg] = KNOWN_PACKAGE_VERSIONS[pkg] || 'latest';
    }
  }

  // Update package.json in allFilesMap
  const pkgJson = allFilesMap.get('package.json');
  if (pkgJson) {
    pkgJson.data = JSON.stringify({
      name: uniqueName,
      version: '1.0.0',
      private: true,
      scripts: {
        "dev": "next dev --turbopack",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },      
      dependencies: baseDependencies,
      "devDependencies": {
        "typescript": "^5",
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "@tailwindcss/postcss": "^4",
        "tailwindcss": "^4",
        "eslint": "^9",
        "eslint-config-next": "15.3.3",
        "@eslint/eslintrc": "^3"
      }
    }, null, 2);
  }

  return Array.from(allFilesMap.values());
} 