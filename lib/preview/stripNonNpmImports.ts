/**
 * Removes all import statements for local files, CSS, and type-only imports, keeping only npm imports in the import map.
 */
export function stripNonNpmImports(code: string, importMap: Record<string, string>) {
  return code.replace(/import\s+((\w+)|\*\s+as\s+(\w+)|\{([^}]+)\})?\s*from\s*['"]([^'"]+)['"];?|import\s+['"]([^'"]+\.css)['"];?|import\s+type\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"];?/g, (full, _g1, _d1, _n1, _ni1, pkg, cssImport, typeImport) => {
    if (cssImport) return '';
    if (typeImport) return '';
    if (pkg && (pkg.startsWith('./') || pkg.startsWith('../') || pkg.startsWith('@/'))) return '';
    if (pkg && importMap[pkg]) return full; // keep npm import
    return '';
  });
} 