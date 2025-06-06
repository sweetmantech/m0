import { getDefaultFiles } from './getDefaultFiles';
import { extractExternalPackagesFromFiles } from './extractExternalPackagesFromFiles';

export function getDeploymentFiles(
  uniqueName: string,
  files?: Array<{ file: string; data: string; encoding: string }>,
  requiredPackages?: string[]
) {
  // Default files
  const defaultFiles = getDefaultFiles();

  if (!files || files.length === 0) files = [];

  const findUserFile = (filename: string) => files!.find(f => f.file === filename);
  const merged = defaultFiles.map(def => findUserFile(def.file) || def);
  const defaultFileNames = new Set(defaultFiles.map(f => f.file));
  const extraUserFiles = files!.filter(f => !defaultFileNames.has(f.file));

  // Filter out duplicates (prioritize user files, then uiFiles)
  const allFilesMap = new Map<string, { file: string; data: string; encoding: string }>();
  [...merged, ...extraUserFiles].forEach(f => {
    if (!allFilesMap.has(f.file)) {
      allFilesMap.set(f.file, f);
    }
  });

  // --- PACKAGE DETECTION AND MERGE ---
  const allFiles = Array.from(allFilesMap.values());
  const importPackages = extractExternalPackagesFromFiles(allFiles);

  // Default dependencies
  const baseDependencies: Record<string, string> = {
    next: '15.3.3',
    react: '19.0.0',
    'react-dom': '19.0.0',
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
  };

  // Add importPackages to baseDependencies
  for (const pkg of importPackages) {
    if (!baseDependencies[pkg]) {
      baseDependencies[pkg] = 'latest';
    }
  }

  // Merge requiredPackages with baseDependencies
  const allPkgs = new Set([...(requiredPackages || [])]);
  for (const pkg of allPkgs) {
    if (!baseDependencies[pkg]) {
      baseDependencies[pkg] = 'latest';
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
        "eslint": "^9",
        "eslint-config-next": "15.3.3",
        "@eslint/eslintrc": "^3"
      }
    }, null, 2);
  }

  return Array.from(allFilesMap.values());
} 