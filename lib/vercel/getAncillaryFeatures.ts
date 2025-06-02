import fs from 'fs';
import path from 'path';
import { extractExternalPackagesFromFiles } from './extractExternalPackagesFromFiles';

export type FileDescriptor = { file: string; data: string; encoding: string };
export type FeatureMatch = { matches?: RegExpMatchArray[]; externalPkgs?: string[] };

export type Feature = {
  name: string;
  detect?: (allFiles: FileDescriptor[]) => FeatureMatch | null;
  triggers?: Array<{ importPath?: string; regex?: RegExp; type?: string }>;
  files: ((matches: RegExpMatchArray[] | undefined) => { src: string; dest: string }[]) | { src: string; dest: string }[];
  packages: ((match: any) => Record<string, string>) | Record<string, string>;
};

export function getAncillaryFeatures() : Feature[] {
  return [
    {
      name: "shadcn-toast",
      detect: (allFiles) => {
        const found = allFiles.some(f => f.data.includes("@/components/ui/use-toast") || f.data.includes("@/components/ui/toaster"));
        return found ? {} : null;
      },
      files: [
        { src: "hooks/use-toast.ts", dest: "components/ui/use-toast.tsx" },
        { src: "components/ui/toast.tsx", dest: "components/ui/toast.tsx" },
        { src: "components/ui/toaster.tsx", dest: "components/ui/toaster.tsx" },
        { src: "hooks/use-toast.ts", dest: "hooks/use-toast.ts" },
      ],
      packages: () => ({
        "lucide-react": "latest",
        "@radix-ui/react-toast": "^1.0.0",
      }),
    },
    {
      name: "shadcn-ui-component",
      detect: (allFiles) => {
        const matches: RegExpMatchArray[] = [];
        const regexes = [
          /from ['"]@\/components\/ui\/([\w-]+)['"]/g,
          /from ['"]\.\/ui\/([\w-]+)['"]/g,
        ];
        for (const file of allFiles) {
          for (const regex of regexes) {
            let match;
            while ((match = regex.exec(file.data))) {
              matches.push(match);
            }
          }
        }
        return matches.length > 0 ? { matches } : null;
      },
      files: (matches) => {
        const exts = [".tsx", ".ts", ".jsx", ".js"];
        const files: { src: string; dest: string }[] = [];
        if (!matches) return files;
        for (const m of matches) {
          const comp = m[1];
          for (const ext of exts) {
            const src = `components/ui/${comp}${ext}`;
            if (fs.existsSync(path.join(process.cwd(), src))) {
              files.push({ src, dest: src });
              break;
            }
          }
        }
        return files;
      },
      packages: () => ({}),
    },
    {
      name: "external-packages",
      detect: (allFiles) => {
        const pkgs = extractExternalPackagesFromFiles(allFiles);
        return pkgs.length ? { externalPkgs: pkgs } : null;
      },
      files: [],
      packages: (match: FeatureMatch) => {
        const pkgs: Record<string, string> = {};
        for (const pkg of match?.externalPkgs || []) {
          pkgs[pkg] = "latest";
        }
        return pkgs;
      },
    },
    // Add more features here as needed
  ];
} 