export function getDefaultFiles() {
  return [
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
    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );
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
}

export default getDefaultFiles; 