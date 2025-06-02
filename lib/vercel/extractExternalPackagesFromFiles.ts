export function extractExternalPackagesFromFiles(files: Array<{ file: string; data: string; encoding: string }>): string[] {
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