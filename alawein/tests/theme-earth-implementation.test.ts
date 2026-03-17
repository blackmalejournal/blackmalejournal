import earthLight from '../tokens/themes/earth-light.json';
import earthDark from '../tokens/themes/earth-dark.json';

describe('Earth Theme Implementation', () => {
  describe('Earth Light', () => {
    test('has complete token structure', () => {
      expect((earthLight as any).colors).toBeDefined();
      expect((earthLight as any).typography).toBeDefined();
      expect((earthLight as any).spacing).toBeDefined();
      expect((earthLight as any).metadata).toBeDefined();
    });

    test('includes earth-tone overrides', () => {
      expect((earthLight as any).colors.primary).toBeDefined();
      expect((earthLight as any).colors.primary.value).toBe('#C8852A');
      expect((earthLight as any).colors.accent).toBeDefined();
      expect((earthLight as any).colors.accent.value).toBe('#B8986A');
    });

    test('light background for natural feel', () => {
      const bgValue = (earthLight as any).colors.background.value;
      expect(bgValue).toBe('#FEFCF8');
      expect(bgValue).toMatch(/^#F/);
    });

    test('maintains warm color palette', () => {
      const colors = (earthLight as any).colors;
      expect(Object.keys(colors).length).toBeGreaterThan(10);
      const primaryValue = (colors.primary as any).value;
      expect(primaryValue).toMatch(/^#C[0-9A-F]{5}$/i);
    });
  });

  describe('Earth Dark', () => {
    test('has complete token structure', () => {
      expect((earthDark as any).colors).toBeDefined();
      expect((earthDark as any).typography).toBeDefined();
      expect((earthDark as any).spacing).toBeDefined();
      expect((earthDark as any).metadata).toBeDefined();
    });

    test('includes earth-tone dark overrides', () => {
      expect((earthDark as any).colors.primary).toBeDefined();
      expect((earthDark as any).colors.primary.value).toBe('#D9A125');
      expect((earthDark as any).colors.accent).toBeDefined();
      expect((earthDark as any).colors.accent.value).toBe('#C8852A');
    });

    test('dark background with warm text', () => {
      const bgValue = (earthDark as any).colors.background.value;
      const textValue = (earthDark as any).colors.text.value;
      expect(bgValue).toBe('#2A1F15');
      expect(textValue).toBe('#E8DCC8');
    });

    test('maintains warm tones in dark mode', () => {
      const colors = (earthDark as any).colors;
      const primaryValue = (colors.primary as any).value;
      const hasBrownish = primaryValue.includes('D9') || primaryValue.includes('E');
      expect(hasBrownish).toBe(true);
    });
  });

  describe('Earth Variants', () => {
    test('both variants are earth family', () => {
      expect((earthLight as any).metadata.family).toBe('earth');
      expect((earthDark as any).metadata.family).toBe('earth');
      expect((earthLight as any).metadata.variant).toBeDefined();
      expect((earthDark as any).metadata.variant).toBeDefined();
    });

    test('typography matches across variants', () => {
      const lightTypo = Object.keys((earthLight as any).typography).sort();
      const darkTypo = Object.keys((earthDark as any).typography).sort();
      expect(lightTypo).toEqual(darkTypo);
    });

    test('spacing is identical across variants', () => {
      const lightSpacing = (earthLight as any).spacing;
      const darkSpacing = (earthDark as any).spacing;
      expect(Object.keys(lightSpacing)).toEqual(Object.keys(darkSpacing));
    });

    test('both variants have success/error tokens', () => {
      expect((earthLight as any).colors.success).toBeDefined();
      expect((earthLight as any).colors.error).toBeDefined();
      expect((earthDark as any).colors.success).toBeDefined();
      expect((earthDark as any).colors.error).toBeDefined();
    });
  });
});
