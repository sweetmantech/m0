/**
 * Converts a filename to a variable name for use in preview code.
 */
export function filenameToVar(filename: string) {
  if (filename === 'app/page.tsx') return 'Home';
  const parts = filename.split('/');
  let name = parts[parts.length - 1].replace(/\.[^.]+$/, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
} 