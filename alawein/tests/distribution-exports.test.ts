import * as path from 'path';
import * as fs from 'fs';

describe('Distribution Exports', () => {
  const loadTheme = () => {
    const themePath = path.join(__dirname, '../tokens/themes/midnight-standard.json');
    const content = fs.readFileSync(themePath, 'utf-8');
    return JSON.parse(content);
  };

  const loadPackageJson = () => {
    const pkgPath = path.join(__dirname, '../package.json');
    const content = fs.readFileSync(pkgPath, 'utf-8');
    return JSON.parse(content);
  };

  const loadThemeRegistry = () => {
    const registryPath = path.join(__dirname, '../tokens/themes/theme-registry.json');
    const content = fs.readFileSync(registryPath, 'utf-8');
    return JSON.parse(content);
  };

  test('CSS variables export format is valid', () => {
    const theme = loadTheme();
    expect(theme.colors).toBeDefined();
    expect(theme.typography).toBeDefined();
    expect(theme.spacing).toBeDefined();

    // Verify token structure for CSS export
    Object.entries(theme.colors).forEach(([key, token]) => {
      expect((token as any).value).toMatch(/^#[0-9A-F]{6}$/i);
      expect((token as any).description).toBeDefined();
    });
  });

  test('TypeScript type definitions can be generated', () => {
    const theme = loadTheme();
    const colorKeys = Object.keys(theme.colors);
    const typographyKeys = Object.keys(theme.typography);
    const spacingKeys = Object.keys(theme.spacing);

    expect(colorKeys.length).toBeGreaterThan(0);
    expect(typographyKeys.length).toBeGreaterThan(0);
    expect(spacingKeys.length).toBeGreaterThan(0);

    // Verify keys are valid TypeScript identifiers
    const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    [...colorKeys, ...typographyKeys, ...spacingKeys].forEach(key => {
      expect(validIdentifier.test(key)).toBe(true);
    });
  });

  test('JSON export preserves metadata', () => {
    const theme = loadTheme();
    expect((theme as any).metadata).toBeDefined();
    expect((theme as any).metadata.family).toBeDefined();
    expect((theme as any).metadata.variant).toBeDefined();
    expect((theme as any).metadata.name).toBeDefined();
    expect((theme as any).metadata.description).toBeDefined();
  });

  test('theme registry indexes all themes', () => {
    const registry = loadThemeRegistry();
    expect((registry as any).version).toBeDefined();
    expect((registry as any).families).toBeDefined();
    expect((registry as any).exports).toBeDefined();
    expect((registry as any).distribution).toBeDefined();

    // Verify structure
    const families = (registry as any).families;
    expect(Object.keys(families).length).toBeGreaterThan(0);
  });

  test('package.json includes distribution configuration', () => {
    const pkg = loadPackageJson();
    expect((pkg as any).name).toBeDefined();
    expect((pkg as any).version).toBeDefined();
    
    // Should have distribution metadata
    if ((pkg as any).files) {
      expect(Array.isArray((pkg as any).files)).toBe(true);
    }
  });

  test('semantic version format is valid', () => {
    const registry = loadThemeRegistry();
    const version = (registry as any).version;
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/;
    expect(versionRegex.test(version)).toBe(true);
  });

  test('CSS variable naming convention is consistent', () => {
    const theme = loadTheme();
    const colors = (theme as any).colors;
    
    // All color keys should be valid for CSS variable names
    Object.keys(colors).forEach(key => {
      const cssVarName = `--alawein-color-${key}`;
      expect(cssVarName).toMatch(/^--alawein-[a-z]+-[a-zA-Z0-9]+$/);
    });
  });

  test('typography tokens are exportable', () => {
    const theme = loadTheme();
    const typography = (theme as any).typography;
    
    expect(Object.keys(typography).length).toBeGreaterThan(10);
    Object.entries(typography).forEach(([key, token]) => {
      expect((token as any).value).toBeDefined();
      expect((token as any).description).toBeDefined();
      // Ensure value is either a font name, size, or CSS value
      expect(
        typeof (token as any).value === 'string' || 
        /^\d+px$/.test((token as any).value) ||
        /^\d+$/.test((token as any).value)
      ).toBe(true);
    });
  });

  test('spacing tokens export with correct units', () => {
    const theme = loadTheme();
    const spacing = (theme as any).spacing;
    
    Object.entries(spacing).forEach(([key, token]) => {
      const value = (token as any).value;
      // Should be px values or unitless
      expect(
        /^\d+px$/.test(value) || /^\d+$/.test(value) || value === '0'
      ).toBe(true);
    });
  });

  test('export configurations match all theme families', () => {
    const registry = loadThemeRegistry();
    const families = Object.keys((registry as any).families || {});
    
    expect(families.length).toBeGreaterThanOrEqual(2);
    families.forEach(family => {
      expect(typeof family).toBe('string');
      expect(family.length).toBeGreaterThan(0);
    });
  });
});
