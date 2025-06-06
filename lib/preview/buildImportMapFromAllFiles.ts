import { getAllNpmImports } from './getAllNpmImports';

/**
 * Builds an import map for all npm packages used in any file.
 */
export function buildImportMapFromAllFiles(files: Array<{ file: string; data: string }>) {
  const importMap: Record<string, string> = {
    'react': 'https://esm.sh/react@18.2.0',
    'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
  };
  const pkgs = getAllNpmImports(files);
  pkgs.forEach(pkg => {
    if (pkg === 'react' || pkg === 'react-dom' || pkg === 'react-dom/client') return;
    importMap[pkg] = `https://esm.sh/${pkg}?deps=react@18.2.0`;
  });
  return importMap;
} 