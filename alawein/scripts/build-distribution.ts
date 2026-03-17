/**
 * Build distribution artifacts from design tokens
 * Generates CSS, TypeScript types, and optimized JSON exports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportThemeCss, exportThemeCssMinified } from '../src/export-css-variables';
import { generateThemeTypes, generateCssVariableTypes } from '../src/generate-typescript-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const tokensDir = path.join(projectRoot, 'tokens');
const themesDir = path.join(tokensDir, 'themes');
const distDir = path.join(projectRoot, 'dist');

/**
 * Ensure distribution directory exists
 */
function ensureDistDir(): void {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
}

/**
 * Load all theme files
 */
function loadThemes(): Map<string, any> {
  const themes = new Map<string, any>();

  const files = fs.readdirSync(themesDir)
    .filter(f => f.endsWith('.json') && f !== 'theme-registry.json');

  files.forEach(file => {
    const filePath = path.join(themesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const theme = JSON.parse(content);
    themes.set(file.replace('.json', ''), theme);
  });

  return themes;
}

/**
 * Build CSS exports
 */
function buildCssExports(themes: Map<string, any>): void {
  console.log('Building CSS exports...');

  const cssLines: string[] = [];
  cssLines.push('/* Alawein Design System - CSS Custom Properties */');
  cssLines.push(`/* Generated: ${new Date().toISOString()} */`);
  cssLines.push('/* Version: 1.0.0 */');
  cssLines.push('');

  let themeIndex = 0;
  themes.forEach((theme, name) => {
    if (themeIndex > 0) cssLines.push('');
    cssLines.push(exportThemeCss(theme));
    themeIndex++;
  });

  const cssContent = cssLines.join('\n');
  fs.writeFileSync(path.join(distDir, 'alawein.css'), cssContent);

  // Generate minified version
  const minLines: string[] = [];
  minLines.push('/* Alawein Design System - Minified */');
  themes.forEach((theme) => {
    minLines.push(exportThemeCssMinified(theme));
  });
  const minContent = minLines.join('');
  fs.writeFileSync(path.join(distDir, 'alawein.min.css'), minContent);

  console.log(`✓ Generated alawein.css (${cssContent.length} bytes)`);
  console.log(`✓ Generated alawein.min.css (${minContent.length} bytes)`);
}

/**
 * Build TypeScript type exports
 */
function buildTypeScriptExports(themes: Map<string, any>): void {
  console.log('Building TypeScript exports...');

  const typeLines: string[] = [];
  typeLines.push('/**');
  typeLines.push(' * Alawein Design System - TypeScript Type Definitions');
  typeLines.push(` * Generated: ${new Date().toISOString()}`);
  typeLines.push(' * Version: 1.0.0');
  typeLines.push(' */');
  typeLines.push('');

  // Export all theme types
  themes.forEach((theme, name) => {
    typeLines.push(`// ${name}`);
    typeLines.push(generateThemeTypes(theme));
    typeLines.push('');
  });

  // Global CSS variable types
  typeLines.push('// Global CSS Variable Types');
  const firstTheme = Array.from(themes.values())[0];
  if (firstTheme) {
    typeLines.push(generateCssVariableTypes(firstTheme));
  }

  const typeContent = typeLines.join('\n');
  fs.writeFileSync(path.join(distDir, 'alawein.d.ts'), typeContent);

  console.log(`✓ Generated alawein.d.ts (${typeContent.length} bytes)`);
}

/**
 * Build JSON exports with metadata
 */
function buildJsonExports(themes: Map<string, any>): void {
  console.log('Building JSON exports...');

  // Single file with all themes
  const allThemes: Record<string, any> = {};
  themes.forEach((theme, name) => {
    allThemes[name] = theme;
  });

  const jsonData = {
    metadata: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      description: 'Alawein Design System - All themes and tokens',
    },
    themes: allThemes,
  };

  const jsonContent = JSON.stringify(jsonData, null, 2);
  fs.writeFileSync(path.join(distDir, 'alawein.json'), jsonContent);

  // Minified version
  const minContent = JSON.stringify(jsonData);
  fs.writeFileSync(path.join(distDir, 'alawein.min.json'), minContent);

  console.log(`✓ Generated alawein.json (${jsonContent.length} bytes)`);
  console.log(`✓ Generated alawein.min.json (${minContent.length} bytes)`);
}

/**
 * Build theme index for CDN delivery
 */
function buildThemeIndex(themes: Map<string, any>): void {
  console.log('Building theme index...');

  const index: Record<string, any> = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    total: themes.size,
    themes: {},
  };

  themes.forEach((theme, name) => {
    index.themes[name] = {
      family: theme.metadata.family,
      variant: theme.metadata.variant,
      name: theme.metadata.name,
      description: theme.metadata.description,
      path: `/themes/${name}.json`,
      formats: {
        css: `/css/${name}.css`,
        typescript: `/types/${name}.d.ts`,
        json: `/themes/${name}.json`,
      },
    };
  });

  const indexContent = JSON.stringify(index, null, 2);
  fs.writeFileSync(path.join(distDir, 'index.json'), indexContent);

  console.log(`✓ Generated index.json (${indexContent.length} bytes)`);
}

/**
 * Generate package metadata
 */
function generatePackageMetadata(): void {
  console.log('Generating package metadata...');

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
  );

  const metadata = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: packageJson.author,
    license: packageJson.license,
    repository: packageJson.repository,
    keywords: packageJson.keywords,
    main: packageJson.main,
    type: packageJson.type,
    exports: packageJson.exports,
    files: packageJson.files,
    generated: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('✓ Generated package metadata');
}

/**
 * Create distribution summary
 */
function generateDistributionSummary(themes: Map<string, any>): void {
  console.log('Generating distribution summary...');

  const distFiles = fs.readdirSync(distDir);
  const totalSize = distFiles.reduce((sum, file) => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    return sum + stats.size;
  }, 0);

  const summary = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    distribution: {
      location: distDir,
      formats: ['css', 'typescript', 'json', 'esm'],
      files: distFiles.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      themes: themes.size,
    },
    artifacts: {
      css: 'alawein.css',
      css_minified: 'alawein.min.css',
      typescript: 'alawein.d.ts',
      json: 'alawein.json',
      json_minified: 'alawein.min.json',
      index: 'index.json',
      package: 'package.json',
    },
  };

  fs.writeFileSync(
    path.join(distDir, 'distribution-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`✓ Distribution Summary:`);
  console.log(`  - ${summary.distribution.files} files`);
  console.log(`  - ${summary.distribution.totalSize} total size`);
  console.log(`  - ${summary.distribution.themes} themes`);
  console.log('');
}

/**
 * Main build function
 */
async function buildDistribution(): Promise<void> {
  try {
    console.log('🔨 Building Alawein Design System Distribution...\n');

    ensureDistDir();
    const themes = loadThemes();

    console.log(`Found ${themes.size} themes\n`);

    buildCssExports(themes);
    console.log('');
    buildTypeScriptExports(themes);
    console.log('');
    buildJsonExports(themes);
    console.log('');
    buildThemeIndex(themes);
    console.log('');
    generatePackageMetadata();
    console.log('');
    generateDistributionSummary(themes);

    console.log('✅ Distribution build complete!');
    console.log(`📦 Output: ${distDir}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildDistribution();
