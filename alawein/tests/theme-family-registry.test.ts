import themeRegistry from '../tokens/theme-registry.json';

describe('Theme Family Registry', () => {
  test('registry has all major theme families', () => {
    const families = (themeRegistry as any).families;
    expect(families).toBeDefined();
    expect(Object.keys(families).length).toBeGreaterThanOrEqual(7);
  });

  test('each theme family has required metadata', () => {
    const families = (themeRegistry as any).families;
    Object.entries(families).forEach(([familyId, family]) => {
      expect((family as any).name).toBeDefined();
      expect((family as any).description).toBeDefined();
      expect((family as any).category).toBeDefined();
      expect((family as any).baseThemes).toBeDefined();
    });
  });

  test('each family has at least 2 base themes', () => {
    const families = (themeRegistry as any).families;
    Object.entries(families).forEach(([familyId, family]) => {
      const themes = (family as any).baseThemes;
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('base themes have required properties', () => {
    const families = (themeRegistry as any).families;
    Object.entries(families).forEach(([familyId, family]) => {
      const baseThemes = (family as any).baseThemes;
      baseThemes.forEach((theme: any) => {
        expect(theme.id).toBeDefined();
        expect(theme.name).toBeDefined();
        expect(theme.semanticOverrides).toBeDefined();
      });
    });
  });

  test('registry tracks hybrid and special edition themes', () => {
    expect((themeRegistry as any).hybrids).toBeDefined();
    expect((themeRegistry as any).specialEditions).toBeDefined();
    expect(Array.isArray((themeRegistry as any).hybrids)).toBe(true);
    expect(Array.isArray((themeRegistry as any).specialEditions)).toBe(true);
  });

  test('each family category is valid', () => {
    const validCategories = ['monochromatic', 'analogous', 'complementary', 'triadic', 'neutral', 'seasonal', 'cultural'];
    const families = (themeRegistry as any).families;
    Object.entries(families).forEach(([familyId, family]) => {
      expect(validCategories).toContain((family as any).category);
    });
  });

  test('semantic overrides follow token structure', () => {
    const families = (themeRegistry as any).families;
    Object.entries(families).forEach(([familyId, family]) => {
      const baseThemes = (family as any).baseThemes;
      baseThemes.forEach((theme: any) => {
        const overrides = theme.semanticOverrides;
        if (Object.keys(overrides).length > 0) {
          Object.entries(overrides).forEach(([key, value]) => {
            expect(typeof (value as any).value).toBe('string');
            expect((value as any).value).toMatch(/^#[0-9A-F]{6}$/i);
          });
        }
      });
    });
  });
});
