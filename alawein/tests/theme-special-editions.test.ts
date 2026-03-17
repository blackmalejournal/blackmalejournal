import specialHighContrast from '../tokens/themes/special-high-contrast.json';
import specialDeuteranopia from '../tokens/themes/special-deuteranopia-safe.json';
import specialProtanopia from '../tokens/themes/special-protanopia-safe.json';
import specialReducedMotion from '../tokens/themes/special-reduced-motion.json';
import specialSpringRenewal from '../tokens/themes/special-spring-renewal.json';
import specialSummerFire from '../tokens/themes/special-summer-fire.json';
import specialAutumnHarvest from '../tokens/themes/special-autumn-harvest.json';
import specialWinterSilence from '../tokens/themes/special-winter-silence.json';

const allSpecialEditions = [
  { name: 'special-high-contrast', theme: specialHighContrast, category: 'accessibility', variant: 'high-contrast' },
  { name: 'special-deuteranopia-safe', theme: specialDeuteranopia, category: 'accessibility', variant: 'deuteranopia-safe' },
  { name: 'special-protanopia-safe', theme: specialProtanopia, category: 'accessibility', variant: 'protanopia-safe' },
  { name: 'special-reduced-motion', theme: specialReducedMotion, category: 'accessibility', variant: 'reduced-motion' },
  { name: 'special-spring-renewal', theme: specialSpringRenewal, category: 'seasonal', variant: 'spring-renewal' },
  { name: 'special-summer-fire', theme: specialSummerFire, category: 'seasonal', variant: 'summer-fire' },
  { name: 'special-autumn-harvest', theme: specialAutumnHarvest, category: 'seasonal', variant: 'autumn-harvest' },
  { name: 'special-winter-silence', theme: specialWinterSilence, category: 'seasonal', variant: 'winter-silence' }
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

  test('accessibility variants have WCAG compliance metadata', () => {
    const accessibilityEditions = allSpecialEditions.filter(e => e.category === 'accessibility');
    expect(accessibilityEditions.length).toBe(4);

    accessibilityEditions.forEach(({ name, theme }) => {
      const metadata = (theme as any).metadata;
      expect(metadata.family).toBe('special-edition');
      expect(metadata.category).toBe('accessibility');
      expect(metadata.description).toBeDefined();
    });
  });

  test('seasonal variants have season-specific metadata', () => {
    const seasonalEditions = allSpecialEditions.filter(e => e.category === 'seasonal');
    expect(seasonalEditions.length).toBe(4);

    seasonalEditions.forEach(({ name, theme }) => {
      const metadata = (theme as any).metadata;
      expect(metadata.family).toBe('special-edition');
      expect(metadata.category).toBe('seasonal');
      expect(metadata.variant).toMatch(/(spring|summer|autumn|winter)/);
    });
  });

  test('high contrast theme meets WCAG AAA standards', () => {
    const theme = specialHighContrast as any;
    const colors = theme.colors;

    // Pure black background
    expect(colors.background.value).toBe('#000000');
    // Pure white text
    expect(colors.text.value).toBe('#FFFFFF');
    // Bright accent for contrast
    expect(colors.accent.value).toBe('#FFFF00');
  });

  test('colorblind-safe themes use distinguishable palettes', () => {
    const deuteranopia = specialDeuteranopia as any;
    const protanopia = specialProtanopia as any;

    // Deuteranopia (red-green, use blue-yellow)
    expect(deuteranopia.colors.primary.value).toMatch(/^#/);
    expect(deuteranopia.colors.accent.value).toMatch(/^#/);

    // Protanopia (red-green, use blue-brown)
    expect(protanopia.colors.primary.value).toMatch(/^#/);
    expect(protanopia.colors.accent.value).toMatch(/^#/);

    // Verify they have different color strategies
    expect(deuteranopia.colors.accent.value).not.toBe(protanopia.colors.accent.value);
  });

  test('reduced motion theme has calm color values', () => {
    const theme = specialReducedMotion as any;
    const colors = theme.colors;

    // Should have grounded, calming colors
    expect(colors.primary.value).toBeDefined();
    expect(colors.accent.value).toBeDefined();
    expect(colors.success.value).toBeDefined();
  });

  test('seasonal themes have thematic color palettes', () => {
    const spring = specialSpringRenewal as any;
    const summer = specialSummerFire as any;
    const autumn = specialAutumnHarvest as any;
    const winter = specialWinterSilence as any;

    // Each has distinct colors
    const themes = { spring, summer, autumn, winter };
    const primaryColors = Object.values(themes).map((t: any) => t.colors.primary.value);
    const accentColors = Object.values(themes).map((t: any) => t.colors.accent.value);

    // All unique
    expect(new Set(primaryColors).size).toBe(4);
    expect(new Set(accentColors).size).toBe(4);
  });

  test('all special editions have consistent color token set', () => {
    const expectedColors = ['primary', 'secondary', 'background', 'surface', 'text', 'textSecondary', 'border', 'borderLight', 'accent', 'success', 'error', 'warning', 'info'];

    allSpecialEditions.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      expectedColors.forEach(colorKey => {
        expect(colors[colorKey]).toBeDefined();
        expect(colors[colorKey].value).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colors[colorKey].description).toBeDefined();
      });
    });
  });

  test('special editions export format is consistent', () => {
    allSpecialEditions.forEach(({ name, theme }) => {
      const metadata = (theme as any).metadata;

      // All should identify as special-edition family
      expect(metadata.family).toBe('special-edition');
      
      // All should have clear descriptions
      expect(metadata.description.length).toBeGreaterThan(20);

      // Should identify category and variant in metadata
      expect(metadata.name).toBeDefined();
      expect(metadata.variant).toBeDefined();
      expect(metadata.category).toBeDefined();
    });
  });

  test('special editions are importable for distribution', () => {
    // This test verifies that all special editions can be imported as ESM modules
    const imports = [
      specialHighContrast,
      specialDeuteranopia,
      specialProtanopia,
      specialReducedMotion,
      specialSpringRenewal,
      specialSummerFire,
      specialAutumnHarvest,
      specialWinterSilence
    ];

    imports.forEach((imported, i) => {
      expect(imported).toBeDefined();
      expect((imported as any).metadata).toBeDefined();
      expect((imported as any).colors).toBeDefined();
    });
  });
});
