import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'fs';
import path from 'path';

console.log('🔧 Ensuring assets are available...');

// Define possible source and target paths
const sourcePaths = [
  path.join(process.cwd(), '..', 'client', 'dist'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join('/app', 'client', 'dist'),
  path.join('/app', 'client_dist_backup')
];

const targetPath = path.join(process.cwd(), 'dist', 'frontend');

console.log('🔍 Checking for source assets...');
let sourceFound = null;

for (const sourcePath of sourcePaths) {
  console.log(`Checking: ${sourcePath}`);
  if (existsSync(sourcePath)) {
    console.log(`✅ Found source: ${sourcePath}`);
    const assetsPath = path.join(sourcePath, 'assets');
    if (existsSync(assetsPath)) {
      console.log(`✅ Found assets: ${assetsPath}`);
      sourceFound = sourcePath;
      break;
    } else {
      console.log(`❌ No assets in: ${sourcePath}`);
    }
  } else {
    console.log(`❌ Not found: ${sourcePath}`);
  }
}

if (!sourceFound) {
  console.log('❌ No source assets found!');
  process.exit(1);
}

// Ensure target directory exists
if (!existsSync(targetPath)) {
  console.log(`📁 Creating target directory: ${targetPath}`);
  mkdirSync(targetPath, { recursive: true });
}

// Copy assets
const sourceAssetsPath = path.join(sourceFound, 'assets');
const targetAssetsPath = path.join(targetPath, 'assets');

console.log(`📋 Copying assets from ${sourceAssetsPath} to ${targetAssetsPath}`);

if (existsSync(targetAssetsPath)) {
  console.log('🗑️ Removing existing assets directory');
  const { rmSync } = await import('fs');
  rmSync(targetAssetsPath, { recursive: true, force: true });
}

cpSync(sourceAssetsPath, targetAssetsPath, { recursive: true });

// Verify copy
console.log('✅ Assets copied successfully!');
console.log('📁 Target assets contents:');
const targetFiles = readdirSync(targetAssetsPath);
targetFiles.forEach(file => {
  const filePath = path.join(targetAssetsPath, file);
  const stat = statSync(filePath);
  console.log(`  ${file} (${stat.isDirectory() ? 'DIR' : 'FILE'})`);
});

console.log('🎉 Asset setup complete!');
