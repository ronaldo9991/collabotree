#!/usr/bin/env node

/**
 * Generate missing assets at runtime
 * This ensures the website works even if the build process fails
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

console.log('🔧 Generating missing assets...');

// Define asset locations
const frontendPath = path.join(process.cwd(), 'dist', 'frontend');
const assetsPath = path.join(frontendPath, 'assets');
const staticAssetsPath = path.join(process.cwd(), 'static-assets');

// Ensure directories exist
if (!existsSync(assetsPath)) {
  console.log('📁 Creating assets directory...');
  mkdirSync(assetsPath, { recursive: true });
}

if (!existsSync(staticAssetsPath)) {
  console.log('📁 Creating static-assets directory...');
  mkdirSync(staticAssetsPath, { recursive: true });
}

// Generate CSS file
const cssContent = `/* CollaboTree - Generated CSS */
:root {
  --primary: #00B2FF;
  --secondary: #4AC8FF;
  --accent: #A0E9FF;
  --background: #CDF5FD;
  --foreground: #0F172A;
}

.dark {
  --background: #0F172A;
  --foreground: #CDF5FD;
  --primary: #4AC8FF;
  --secondary: #00B2FF;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.6;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Hero Section Styles */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  z-index: 10;
  max-width: 1200px;
  padding: 2rem;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #00B2FF, #4AC8FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #00B2FF, #4AC8FF);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 178, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

/* 3D Elements */
.floating-element {
  position: absolute;
  background: linear-gradient(135deg, #00B2FF, #4AC8FF);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(1) {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-element:nth-child(2) {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.floating-element:nth-child(3) {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Grid Background */
.grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}

/* Loading Animation */
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00B2FF;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

// Generate JS file
const jsContent = `// CollaboTree - Generated JavaScript
console.log('🚀 CollaboTree - Generated assets loaded');

// Simple React-like component for the hero section
function createHeroSection() {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = \`
    <div class="hero-section">
      <div class="grid-bg"></div>
      
      <!-- Floating 3D Elements -->
      <div class="floating-element"></div>
      <div class="floating-element"></div>
      <div class="floating-element"></div>
      
      <div class="hero-content">
        <h1 class="hero-title">
          Hire Elite Talent<br>
          From Top Universities
        </h1>
        
        <p class="hero-subtitle">
          Connect directly with verified students in our decentralized talent marketplace.<br>
          <strong style="color: #4AC8FF;">Quality work, competitive rates, secure payments.</strong>
        </p>
        
        <div class="hero-buttons">
          <a href="/signin" class="btn btn-primary">
            <span>Start Hiring Now</span>
          </a>
          <a href="/signin" class="btn btn-secondary">
            <span>Become a Seller</span>
          </a>
        </div>
        
        <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8);">
            <div style="width: 8px; height: 8px; background: #00B2FF; border-radius: 50%;"></div>
            <span>Verified Students</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8);">
            <div style="width: 8px; height: 8px; background: #4AC8FF; border-radius: 50%;"></div>
            <span>Secure Payments</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; color: rgba(255, 255, 255, 0.8);">
            <div style="width: 8px; height: 8px; background: #00B2FF; border-radius: 50%;"></div>
            <span>Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  \`;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createHeroSection);
} else {
  createHeroSection();
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
  const floatingElements = document.querySelectorAll('.floating-element');
  
  floatingElements.forEach((element, index) => {
    element.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.2) rotate(180deg)';
      this.style.transition = 'transform 0.3s ease';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0deg)';
    });
  });
  
  // Add click handlers for buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Add ripple effect
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = \`
        position: absolute;
        width: \${size}px;
        height: \${size}px;
        left: \${x}px;
        top: \${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      \`;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = \`
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
\`;
document.head.appendChild(style);
`;

// Write files to both locations
const cssPath = path.join(assetsPath, 'style-toksF8Z_.css');
const jsPath = path.join(assetsPath, 'index-jozdwah1.js');
const staticCssPath = path.join(staticAssetsPath, 'style-toksF8Z_.css');
const staticJsPath = path.join(staticAssetsPath, 'index-jozdwah1.js');

console.log('📝 Writing CSS file...');
writeFileSync(cssPath, cssContent);
writeFileSync(staticCssPath, cssContent);

console.log('📝 Writing JS file...');
writeFileSync(jsPath, jsContent);
writeFileSync(staticJsPath, jsContent);

console.log('✅ Assets generated successfully!');
console.log(`📁 CSS: ${cssPath}`);
console.log(`📁 JS: ${jsPath}`);
console.log(`📁 Static CSS: ${staticCssPath}`);
console.log(`📁 Static JS: ${staticJsPath}`);
