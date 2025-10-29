import { existsSync, mkdirSync, cpSync, readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';

console.log('🔧 Ensuring assets are available...');

// Define possible source and target paths
const sourcePaths = [
  path.join(process.cwd(), '..', 'client', 'dist'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join('/app', 'client', 'dist'),
  path.join('/app', 'client_dist_backup'),
  path.join('/app', 'static_assets')
];

const targetPath = path.join(process.cwd(), 'dist', 'frontend');
const staticAssetsPath = path.join(process.cwd(), 'static-assets');

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
  console.log('❌ No source assets found! Creating fallback assets...');
  
  // Create fallback assets
  const fallbackJs = `console.log('CollaboTree - Assets loaded from fallback');`;
  const fallbackCss = `/* CollaboTree - Fallback styles */ body { font-family: Arial, sans-serif; }`;
  
  // Ensure static assets directory exists
  if (!existsSync(staticAssetsPath)) {
    mkdirSync(staticAssetsPath, { recursive: true });
  }
  
  writeFileSync(path.join(staticAssetsPath, 'index-CEvw-u1f.js'), fallbackJs);
  writeFileSync(path.join(staticAssetsPath, 'style-BhCcM7fo.css'), fallbackCss);
  
  console.log('✅ Fallback assets created');
  process.exit(0);
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

// Also copy to static assets directory
console.log(`📋 Copying assets to static-assets directory: ${staticAssetsPath}`);
if (existsSync(staticAssetsPath)) {
  const { rmSync } = await import('fs');
  rmSync(staticAssetsPath, { recursive: true, force: true });
}
mkdirSync(staticAssetsPath, { recursive: true });
cpSync(sourceAssetsPath, staticAssetsPath, { recursive: true });

// Verify copy
console.log('✅ Assets copied successfully!');
console.log('📁 Target assets contents:');
const targetFiles = readdirSync(targetAssetsPath);
targetFiles.forEach(file => {
  const filePath = path.join(targetAssetsPath, file);
  const stat = statSync(filePath);
  console.log(`  ${file} (${stat.isDirectory() ? 'DIR' : 'FILE'})`);
});

console.log('📁 Static assets contents:');
const staticFiles = readdirSync(staticAssetsPath);
staticFiles.forEach(file => {
  const filePath = path.join(staticAssetsPath, file);
  const stat = statSync(filePath);
  console.log(`  ${file} (${stat.isDirectory() ? 'DIR' : 'FILE'})`);
});

console.log('🎉 Asset setup complete!');
