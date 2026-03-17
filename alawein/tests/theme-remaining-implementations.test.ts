import midnightStandard from '../tokens/themes/midnight-standard.json';
import midnightHighContrast from '../tokens/themes/midnight-high-contrast.json';
import dawnPrimary from '../tokens/themes/dawn-primary.json';
import dawnSoft from '../tokens/themes/dawn-soft.json';
import wisdomLight from '../tokens/themes/wisdom-light.json';
import wisdomDark from '../tokens/themes/wisdom-dark.json';
import forgeDefault from '../tokens/themes/forge-default.json';
import forgeIndustrial from '../tokens/themes/forge-industrial.json';
import legacyWarm from '../tokens/themes/legacy-warm.json';
import legacyCool from '../tokens/themes/legacy-cool.json';
import vibrantBold from '../tokens/themes/vibrant-bold.json';
import vibrantDark from '../tokens/themes/vibrant-dark.json';

const allThemes = [
  { name: 'midnight-standard', theme: midnightStandard, family: 'midnight' },
  { name: 'midnight-high-contrast', theme: midnightHighContrast, family: 'midnight' },
  { name: 'dawn-primary', theme: dawnPrimary, family: 'dawn' },
  { name: 'dawn-soft', theme: dawnSoft, family: 'dawn' },
  { name: 'wisdom-light', theme: wisdomLight, family: 'wisdom' },
  { name: 'wisdom-dark', theme: wisdomDark, family: 'wisdom' },
  { name: 'forge-default', theme: forgeDefault, family: 'forge' },
  { name: 'forge-industrial', theme: forgeIndustrial, family: 'forge' },
  { name: 'legacy-warm', theme: legacyWarm, family: 'legacy' },
  { name: 'legacy-cool', theme: legacyCool, family: 'legacy' },
  { name: 'vibrant-bold', theme: vibrantBold, family: 'vibrant' },
  { name: 'vibrant-dark', theme: vibrantDark, family: 'vibrant' }
];

describe('Remaining Theme Implementations', () => {
  test('all themes have required structure', () => {
    allThemes.forEach(({ name, theme }) => {
      expect((theme as any).metadata).toBeDefined();
      expect((theme as any).colors).toBeDefined();
      expect((theme as any).typography).toBeDefined();
      expect((theme as any).spacing).toBeDefined();
    });
  });

  test('all themes have valid metadata', () => {
    allThemes.forEach(({ name, theme, family }) => {
      expect((theme as any).metadata.family).toBe(family);
      expect((theme as any).metadata.variant).toBeDefined();
      expect((theme as any).metadata.name).toBeDefined();
      expect((theme as any).metadata.description).toBeDefined();
    });
  });

  test('all themes have color tokens', () => {
    allThemes.forEach(({ name, theme }) => {
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
    allThemes.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      Object.entries(colors).forEach(([colorName, token]) => {
        const value = (token as any).value;
        const isHex = hexRegex.test(value);
        const isCss = cssRegex.test(value);
        expect(isHex || isCss).toBe(true);
      });
    });
  });

  test('typography is consistent across all themes', () => {
    const expectedTypoKeys = new Set<string>();
    allThemes.forEach(({ name, theme }) => {
      Object.keys((theme as any).typography).forEach(key => {
        expectedTypoKeys.add(key);
      });
    });

    allThemes.forEach(({ name, theme }) => {
      const actualKeys = Object.keys((theme as any).typography);
      expectedTypoKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  test('spacing is consistent across all themes', () => {
    const expectedSpacingKeys = new Set<string>();
    allThemes.forEach(({ name, theme }) => {
      Object.keys((theme as any).spacing).forEach(key => {
        expectedSpacingKeys.add(key);
      });
    });

    allThemes.forEach(({ name, theme }) => {
      const actualKeys = Object.keys((theme as any).spacing);
      expectedSpacingKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  test('each family has at least 2 variants', () => {
    const familyVariants: { [key: string]: string[] } = {};
    allThemes.forEach(({ name, theme, family }) => {
      if (!familyVariants[family]) {
        familyVariants[family] = [];
      }
      familyVariants[family].push(name);
    });

    Object.entries(familyVariants).forEach(([family, variants]) => {
      expect(variants.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('all themes have semantic status colors', () => {
    allThemes.forEach(({ name, theme }) => {
      const colors = (theme as any).colors;
      expect(colors.success).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.warning).toBeDefined();
      expect(colors.info).toBeDefined();
    });
  });
});
