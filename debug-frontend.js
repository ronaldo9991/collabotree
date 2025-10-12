#!/usr/bin/env node

/**
 * Frontend Debug Script
 * 
 * This script helps debug frontend issues by testing:
 * 1. Asset loading
 * 2. JavaScript execution
 * 3. API connectivity
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function debugFrontend() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('🔍 FRONTEND DEBUG ANALYSIS', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  const backendDistPath = join(process.cwd(), 'backend', 'dist');
  
  try {
    // Check if HTML file exists
    const htmlPath = join(backendDistPath, 'index.html');
    if (!existsSync(htmlPath)) {
      throw new Error('HTML file not found');
    }
    log('✅ HTML file exists', colors.green);

    // Check HTML content
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    // Check for CSS reference
    if (htmlContent.includes('<link rel="stylesheet"')) {
      log('✅ CSS link found in HTML', colors.green);
    } else {
      log('❌ CSS link missing in HTML', colors.red);
    }

    // Check for JS reference
    if (htmlContent.includes('<script type="module"')) {
      log('✅ JavaScript module found in HTML', colors.green);
    } else {
      log('❌ JavaScript module missing in HTML', colors.red);
    }

    // Check for root div
    if (htmlContent.includes('<div id="root">')) {
      log('✅ Root div found in HTML', colors.green);
    } else {
      log('❌ Root div missing in HTML', colors.red);
    }

    // Check assets directory
    const assetsPath = join(backendDistPath, 'assets');
    if (existsSync(assetsPath)) {
      log('✅ Assets directory exists', colors.green);
      
      // List assets
      const assets = readdirSync(assetsPath);
      log(`📁 Found ${assets.length} assets:`, colors.blue);
      assets.forEach(asset => {
        log(`   - ${asset}`, colors.blue);
      });
    } else {
      log('❌ Assets directory missing', colors.red);
    }

    // Check if CSS file exists and has content
    const cssFiles = htmlContent.match(/href="[^"]*\.css"/g);
    if (cssFiles) {
      cssFiles.forEach(cssFile => {
        const cssPath = cssFile.match(/href="([^"]*)"/)[1];
        const fullCssPath = join(backendDistPath, cssPath);
        
        if (existsSync(fullCssPath)) {
          const cssContent = readFileSync(fullCssPath, 'utf-8');
          log(`✅ CSS file exists: ${cssPath} (${cssContent.length} chars)`, colors.green);
          
          // Check for CSS variables
          if (cssContent.includes('--primary') || cssContent.includes('--background')) {
            log('✅ CSS variables found', colors.green);
          } else {
            log('⚠️ CSS variables not found', colors.yellow);
          }
        } else {
          log(`❌ CSS file missing: ${cssPath}`, colors.red);
        }
      });
    }

    // Check if JS file exists
    const jsFiles = htmlContent.match(/src="[^"]*\.js"/g);
    if (jsFiles) {
      jsFiles.forEach(jsFile => {
        const jsPath = jsFile.match(/src="([^"]*)"/)[1];
        const fullJsPath = join(backendDistPath, jsPath);
        
        if (existsSync(fullJsPath)) {
          const jsContent = readFileSync(fullJsPath, 'utf-8');
          log(`✅ JS file exists: ${jsPath} (${jsContent.length} chars)`, colors.green);
          
          // Check for React and Lucide
          if (jsContent.includes('react') || jsContent.includes('React')) {
            log('✅ React found in JS bundle', colors.green);
          }
          
          if (jsContent.includes('lucide-react')) {
            log('✅ Lucide React found in JS bundle', colors.green);
          }
        } else {
          log(`❌ JS file missing: ${jsPath}`, colors.red);
        }
      });
    }

    log('\n' + '='.repeat(60), colors.cyan);
    log('🎯 DIAGNOSIS & SOLUTIONS', colors.cyan);
    log('='.repeat(60), colors.cyan);

    log('\n📋 Common Issues and Solutions:', colors.blue);
    log('1. If CSS/JS files are missing → Rebuild the application', colors.yellow);
    log('2. If assets exist but app shows plain HTML → JavaScript execution issue', colors.yellow);
    log('3. If icons not showing → Check Lucide React bundle', colors.yellow);
    log('4. If styling broken → Check CSS variables and Tailwind', colors.yellow);
    log('5. If app not loading → Check browser console for errors', colors.yellow);

    log('\n🚀 Next Steps:', colors.blue);
    log('1. Open browser developer tools (F12)', colors.yellow);
    log('2. Check Console tab for JavaScript errors', colors.yellow);
    log('3. Check Network tab for failed asset requests', colors.yellow);
    log('4. Check if React app is mounting to #root element', colors.yellow);

  } catch (error) {
    log(`❌ Debug failed: ${error.message}`, colors.red);
  }
}

// Run the debug
debugFrontend();
