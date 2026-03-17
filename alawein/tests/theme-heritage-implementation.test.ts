import heritageLight from '../tokens/themes/heritage-light.json';
import heritageDark from '../tokens/themes/heritage-dark.json';

describe('Heritage Theme Implementation', () => {
  describe('Heritage Light', () => {
    test('has complete token structure', () => {
      expect((heritageLight as any).colors).toBeDefined();
      expect((heritageLight as any).typography).toBeDefined();
      expect((heritageLight as any).spacing).toBeDefined();
      expect((heritageLight as any).metadata).toBeDefined();
    });

    test('includes all semantic overrides', () => {
      expect((heritageLight as any).colors.primary).toBeDefined();
      expect((heritageLight as any).colors.primary.value).toBe('#C0281F');
      expect((heritageLight as any).colors.background).toBeDefined();
      expect((heritageLight as any).colors.text).toBeDefined();
    });

    test('extends from primitives', () => {
      const colors = (heritageLight as any).colors;
      Object.values(colors).forEach(token => {
        expect((token as any).value).toBeDefined();
        expect((token as any).description).toBeDefined();
      });
    });

    test('maintains brand color palette', () => {
      const colors = (heritageLight as any).colors;
      expect(Object.keys(colors).length).toBeGreaterThan(10);
      const primaryValue = (colors.primary as any).value;
      expect(primaryValue).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('Heritage Dark', () => {
    test('has complete token structure', () => {
      expect((heritageDark as any).colors).toBeDefined();
      expect((heritageDark as any).typography).toBeDefined();
      expect((heritageDark as any).spacing).toBeDefined();
      expect((heritageDark as any).metadata).toBeDefined();
    });

    test('includes all semantic overrides', () => {
      expect((heritageDark as any).colors.primary).toBeDefined();
      expect((heritageDark as any).colors.primary.value).toBe('#FF6B6B');
      expect((heritageDark as any).colors.background).toBeDefined();
      expect((heritageDark as any).colors.text).toBeDefined();
    });

    test('dark background with light text', () => {
      const bgValue = (heritageDark as any).colors.background.value;
      const textValue = (heritageDark as any).colors.text.value;
      expect(bgValue).toBe('#0D0C0B');
      expect(textValue).toBe('#E8DCC8');
    });

    test('maintains dark theme contrast', () => {
      const colors = (heritageDark as any).colors;
      const hasLightText = colors.text && colors.text.value !== '#000000';
      const hasDarkBg = colors.background && colors.background.value === '#0D0C0B';
      expect(hasLightText && hasDarkBg).toBe(true);
    });
  });

  describe('Heritage Variants', () => {
    test('both variants have metadata', () => {
      expect((heritageLight as any).metadata.family).toBe('heritage');
      expect((heritageDark as any).metadata.family).toBe('heritage');
      expect((heritageLight as any).metadata.variant).toBeDefined();
      expect((heritageDark as any).metadata.variant).toBeDefined();
    });

    test('typography is consistent across variants', () => {
      const lightTypo = Object.keys((heritageLight as any).typography);
      const darkTypo = Object.keys((heritageDark as any).typography);
      expect(lightTypo).toEqual(darkTypo);
    });

    test('spacing is consistent across variants', () => {
      const lightSpacing = Object.keys((heritageLight as any).spacing);
      const darkSpacing = Object.keys((heritageDark as any).spacing);
      expect(lightSpacing).toEqual(darkSpacing);
    });
  });
});
