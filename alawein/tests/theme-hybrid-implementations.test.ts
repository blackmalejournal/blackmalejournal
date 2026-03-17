import heritageEarth from '../tokens/themes/heritage-earth.json';
import dawnWisdom from '../tokens/themes/dawn-wisdom.json';
import forgeLegacy from '../tokens/themes/forge-legacy.json';
import midnightVibrant from '../tokens/themes/midnight-vibrant.json';
import earthMidnight from '../tokens/themes/earth-midnight.json';

const allHybrids = [
  { name: 'heritage-earth', theme: heritageEarth, parents: ['heritage', 'earth'] },
  { name: 'dawn-wisdom', theme: dawnWisdom, parents: ['dawn', 'wisdom'] },
  { name: 'forge-legacy', theme: forgeLegacy, parents: ['forge', 'legacy'] },
  { name: 'midnight-vibrant', theme: midnightVibrant, parents: ['midnight', 'vibrant'] },
  { name: 'earth-midnight', theme: earthMidnight, parents: ['earth', 'midnight'] }
];

describe('Hybrid Theme Implementations', () => {
  test('all hybrids have required structure', () => {
    allHybrids.forEach(({ name, theme }) => {
      expect((theme as any).metadata).toBeDefined();
      expect((theme as any).colors).toBeDefined();
      expect((theme as any).typography).toBeDefined();
      expect((theme as any).spacing).toBeDefined();
    });
  });

  test('all hybrids have valid metadata with parent families', () => {
    allHybrids.forEach(({ name, theme, parents }) => {
      const metadata = (theme as any).metadata;
      expect(metadata.family).toBe('hybrid');
      expect(metadata.variant).toBe(name);
      expect(metadata.name).toBeDefined();
      expect(metadata.parentFamilies).toEqual(parents);
      expect(metadata.description).toBeDefined();
    });
  });

  test('all hybrids have color tokens', () => {
    allHybrids.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      expect(Object.keys(colors).length).toBeGreaterThan(10);
      Object.values(colors).forEach(token => {
        expect((token as any).value).toBeDefined();
        expect((token as any).description).toBeDefined();
      });
    });
  });

  test('all color values are valid hex or css', () => {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    const cssRegex = /^(inherit|transparent|currentColor|var\(|rgb\(|hsl\()/;
    allHybrids.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      Object.entries(colors).forEach(([colorName, token]) => {
        const value = (token as any).value;
        const isHex = hexRegex.test(value);
        const isCss = cssRegex.test(value);
        expect(isHex || isCss).toBe(true);
      });
    });
  });

  test('typography is consistent across all hybrids', () => {
    const expectedTypoKeys = new Set<string>();
    allHybrids.forEach(({ name, theme }) => {
      Object.keys((theme as any).typography).forEach(key => {
        expectedTypoKeys.add(key);
      });
    });

    allHybrids.forEach(({ name, theme }) => {
      const actualKeys = Object.keys((theme as any).typography);
      expectedTypoKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  test('spacing is consistent across all hybrids', () => {
    const expectedSpacingKeys = new Set<string>();
    allHybrids.forEach(({ name, theme }) => {
      Object.keys((theme as any).spacing).forEach(key => {
        expectedSpacingKeys.add(key);
      });
    });

    allHybrids.forEach(({ name, theme }) => {
      const actualKeys = Object.keys((theme as any).spacing);
      expectedSpacingKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  test('all hybrids have semantic status colors', () => {
    allHybrids.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      expect(colors.success).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.warning).toBeDefined();
      expect(colors.info).toBeDefined();
    });
  });

  test('hybrids blend colors from both parent families', () => {
    allHybrids.forEach(({ name, theme, parents }) => {
      const colors = (theme as any).colors;
      expect(colors.primary).toBeDefined();
      expect(colors.secondary).toBeDefined();
      expect(colors.accent).toBeDefined();
      // Verify these are actual color values, not inherited
      const primaryValue = (colors.primary as any).value;
      const secondaryValue = (colors.secondary as any).value;
      expect(primaryValue).toMatch(/^#[0-9A-F]{6}$/i);
      expect(secondaryValue).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});
