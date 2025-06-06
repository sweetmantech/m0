import { parseImports } from './parseImports';

/**
 * Collects all npm package imports from all files.
 */
export function getAllNpmImports(files: Array<{ file: string; data: string }>) {
  const npmPkgs = new Set<string>();
  files.forEach(f => {
    const { imports } = parseImports(f.data);
    imports.forEach(imp => {
      if (!imp.isLocal && imp.package && !imp.package.startsWith('.') && !imp.package.startsWith('@/')) {
        npmPkgs.add(imp.package);
      }
    });
  });
  return Array.from(npmPkgs);
} 