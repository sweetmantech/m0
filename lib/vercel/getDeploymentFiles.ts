import fs from 'fs';
import path from 'path';
import { getDefaultFiles } from './getDefaultFiles';
import { extractExternalPackagesFromFiles } from './extractExternalPackagesFromFiles';
import { getAncillaryFeatures, FileDescriptor, Feature, FeatureMatch } from './getAncillaryFeatures';

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
  };

  // --- Ancillary Feature Detection ---
  const features = getAncillaryFeatures();
  const detectedFeatures: { feature: Feature; match: FeatureMatch }[] = [];
  for (const feature of features) {
    if (feature.detect) {
      const match = feature.detect(allFiles as FileDescriptor[]);
      if (match) {
        detectedFeatures.push({ feature, match });
      }
    }
  }

  // --- Ancillary File Inclusion & Package Inclusion ---
  for (const { feature, match } of detectedFeatures) {
    let filesToAdd: { src: string; dest: string }[] = [];
    if (typeof feature.files === 'function') {
      filesToAdd = feature.files(match.matches ?? []);
    } else {
      filesToAdd = feature.files;
    }
    for (const { src, dest } of filesToAdd) {
      if (!allFilesMap.has(dest)) {
        const srcPath = path.join(process.cwd(), src);
        let fileContent = `// ${src} not found`;
        if (fs.existsSync(srcPath)) {
          fileContent = fs.readFileSync(srcPath, 'utf-8');
        }
        allFilesMap.set(dest, {
          file: dest,
          data: fileContent,
          encoding: 'utf-8',
        });
      }
    }
    let pkgsToAdd: Record<string, string> = {};
    if (typeof feature.packages === 'function') {
      pkgsToAdd = feature.packages(match);
    } else {
      pkgsToAdd = Object.fromEntries(
        Object.entries(feature.packages).filter(([_, v]) => typeof v === 'string' && v !== undefined)
      ) as Record<string, string>;
    }
    for (const [pkg, version] of Object.entries(pkgsToAdd)) {
      if (!baseDependencies[pkg]) {
        baseDependencies[pkg] = version;
      }
    }
  }

  // Remove old manual external package merge logic
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