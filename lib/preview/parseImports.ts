/**
 * Parses import statements from a code string, returning both the list of imports and the code with those imports removed.
 */
export function parseImports(code: string) {
  const importRegex = /import\s+((\w+)|\*\s+as\s+(\w+)|\{([^}]+)\})?\s*from\s*['"]([^'"]+)['"];?|import\s+['"]([^'"]+\.css)['"];?|import\s+type\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"];?/g;
  let match;
  const imports: Array<{
    defaultImport?: string;
    namedImports?: string[];
    namespaceImport?: string;
    package: string;
    isLocal: boolean;
    importStatement: string;
    importedAs?: string;
    isTypeOnly?: boolean;
    isCss?: boolean;
  }> = [];
  let codeWithoutImports = code;
  while ((match = importRegex.exec(code)) !== null) {
    const [full, group, defaultImport, namespaceImport, namedImports, pkg, cssImport, typeImport] = match;
    if (cssImport) {
      codeWithoutImports = codeWithoutImports.replace(full, '');
      continue;
    }
    if (typeImport) {
      codeWithoutImports = codeWithoutImports.replace(full, '');
      continue;
    }
    if (pkg && (pkg.startsWith('./') || pkg.startsWith('../') || pkg.startsWith('@/'))) {
      codeWithoutImports = codeWithoutImports.replace(full, '');
      if (namespaceImport) {
        imports.push({ namespaceImport, package: pkg, isLocal: true, importStatement: full });
      } else if (namedImports) {
        imports.push({ namedImports: namedImports.split(',').map(s => s.trim().split(' as ')[0]), package: pkg, isLocal: true, importStatement: full });
      } else if (defaultImport) {
        imports.push({ defaultImport, package: pkg, isLocal: true, importStatement: full });
      }
      continue;
    }
    if (pkg) {
      imports.push({
        defaultImport,
        namedImports: namedImports ? namedImports.split(',').map(s => s.trim().split(' as ')[0]) : undefined,
        namespaceImport,
        package: pkg,
        isLocal: false,
        importStatement: full
      });
    }
  }
  return { imports, codeWithoutImports };
} 