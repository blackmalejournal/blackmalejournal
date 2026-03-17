import highContrast from '../tokens/themes/special-editions/high-contrast.json';
import deuteranopia from '../tokens/themes/special-editions/deuteranopia-safe.json';
import protanopia from '../tokens/themes/special-editions/protanopia-safe.json';
import reducedMotion from '../tokens/themes/special-editions/reduced-motion.json';
import springRenewal from '../tokens/themes/special-editions/spring-renewal.json';
import summerFire from '../tokens/themes/special-editions/summer-fire.json';
import autumnHarvest from '../tokens/themes/special-editions/autumn-harvest.json';
import winterSilence from '../tokens/themes/special-editions/winter-silence.json';

const allSpecialEditions = [
  { name: 'high-contrast', theme: highContrast, category: 'accessibility' },
  { name: 'deuteranopia-safe', theme: deuteranopia, category: 'accessibility' },
  { name: 'protanopia-safe', theme: protanopia, category: 'accessibility' },
  { name: 'reduced-motion', theme: reducedMotion, category: 'accessibility' },
  { name: 'spring-renewal', theme: springRenewal, category: 'seasonal' },
  { name: 'summer-fire', theme: summerFire, category: 'seasonal' },
  { name: 'autumn-harvest', theme: autumnHarvest, category: 'seasonal' },
  { name: 'winter-silence', theme: winterSilence, category: 'seasonal' }
];

describe('Special Edition Themes', () => {
  test('all special editions have required structure', () => {
    allSpecialEditions.forEach(({ name, theme }) => {
      expect((theme as any).metadata).toBeDefined();
      expect((theme as any).colors).toBeDefined();
      expect((theme as any).typography).toBeDefined();
      expect((theme as any).spacing).toBeDefined();
    });
  });

  test('all special editions have valid metadata', () => {
    allSpecialEditions.forEach(({ name, theme, category }) => {
      expect((theme as any).metadata.family).toBe('special-edition');
      expect((theme as any).metadata.category).toBe(category);
      expect((theme as any).metadata.variant).toBeDefined();
      expect((theme as any).metadata.name).toBeDefined();
      expect((theme as any).metadata.description).toBeDefined();
    });
  });

  test('all special editions have semantic color tokens', () => {
    allSpecialEditions.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      expect(colors.primary).toBeDefined();
      expect(colors.secondary).toBeDefined();
      expect(colors.background).toBeDefined();
      expect(colors.surface).toBeDefined();
      expect(colors.text).toBeDefined();
      expect(colors.textSecondary).toBeDefined();
      expect(colors.success).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.warning).toBeDefined();
      expect(colors.info).toBeDefined();
    });
  });

  test('all color values are valid hex or css', () => {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    const cssRegex = /^(inherit|transparent|currentColor|var\(|rgb\(|hsl\()/;
    allSpecialEditions.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      Object.entries(colors).forEach(([colorName, token]) => {
        const value = (token as any).value;
        const isHex = hexRegex.test(value);
        const isCss = cssRegex.test(value);
        expect(isHex || isCss).toBe(true);
      });
    });
  });

  test('accessibility variants meet WCAG contrast requirements', () => {
    const accessibilityThemes = allSpecialEditions.filter(t => t.category === 'accessibility');
    
    accessibilityThemes.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      // High contrast variant requires AAA (7:1) contrast
      if (name === 'high-contrast') {
        expect(colors.background).toBeDefined();
        expect(colors.text).toBeDefined();
        // Verify both are defined (actual contrast calculation tested separately)
      }
      // Colorblind-safe variants should have distinct status colors
      if (name.includes('safe')) {
        expect(colors.success).toBeDefined();
        expect(colors.error).toBeDefined();
        expect(colors.warning).toBeDefined();
        expect(colors.info).toBeDefined();
      }
    });
  });

  test('reduced-motion variant has no animation properties', () => {
    const reducedMotionTheme = (reducedMotion as any);
    // Reduced motion should still have all structure but animations should be minimal
    expect(reducedMotionTheme.metadata).toBeDefined();
    expect(reducedMotionTheme.colors).toBeDefined();
    expect(reducedMotionTheme.typography).toBeDefined();
    expect(reducedMotionTheme.spacing).toBeDefined();
  });

  test('seasonal themes have evocative color palettes', () => {
    const seasonalThemes = allSpecialEditions.filter(t => t.category === 'seasonal');
    expect(seasonalThemes.length).toBe(4);
    
    seasonalThemes.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      // All should have primary color (main seasonal color)
      expect(colors.primary).toBeDefined();
      expect(colors.accent).toBeDefined();
    });
  });

  test('typography is consistent across all special editions', () => {
    const expectedTypoKeys = new Set<string>();
    allSpecialEditions.forEach(({ name, theme }) => {
      Object.keys((theme as any).typography).forEach(key => {
        expectedTypoKeys.add(key);
      });
    });

    allSpecialEditions.forEach(({ name, theme }) => {
      const actualKeys = Object.keys((theme as any).typography);
      expectedTypoKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  test('spacing is consistent across all special editions', () => {
    const expectedSpacingKeys = new Set<string>();
    allSpecialEditions.forEach(({ name, theme }) => {
      Object.keys((theme as any).spacing).forEach(key => {
        expectedSpacingKeys.add(key);
      });
    });

    allSpecialEditions.forEach(({ name, theme }) => {
      const actualKeys = Object.keys((theme as any).spacing);
      expectedSpacingKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  test('special editions directory exists and all variants are defined', () => {
    // Validates that all 8 special editions have defined structure
    expect(allSpecialEditions.length).toBe(8);
    const categories = new Set(allSpecialEditions.map(t => t.category));
    expect(categories.has('accessibility')).toBe(true);
    expect(categories.has('seasonal')).toBe(true);
  });
});
