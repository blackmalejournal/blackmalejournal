import contrastTokens from '../tokens/semantic/contrast-accessibility.json';

describe('Semantic Contrast & Accessibility', () => {
  test('has all required contrast levels', () => {
    expect((contrastTokens as any).high).toBeDefined();
    expect((contrastTokens as any).normal).toBeDefined();
    expect((contrastTokens as any).reduced).toBeDefined();
    expect((contrastTokens as any).wcagAA).toBeDefined();
    expect((contrastTokens as any).wcagAAA).toBeDefined();
  });

  test('each contrast level has multiple variations', () => {
    const levels = ['high', 'normal', 'reduced', 'wcagAA', 'wcagAAA'];
    levels.forEach(level => {
      const levelObj = (contrastTokens as any)[level];
      expect(Object.keys(levelObj).length).toBeGreaterThanOrEqual(3);
    });
  });

  test('contrast tokens have required properties', () => {
    const levels = ['high', 'normal', 'reduced', 'wcagAA', 'wcagAAA'];
    levels.forEach(level => {
      const levelObj = (contrastTokens as any)[level];
      Object.entries(levelObj).forEach(([prop, token]) => {
        expect((token as any).fg).toBeDefined();
        expect((token as any).bg).toBeDefined();
        expect((token as any).ratio).toBeDefined();
        expect((token as any).description).toBeDefined();
      });
    });
  });

  test('contrast colors are valid hex values', () => {
    const levels = ['high', 'normal', 'reduced', 'wcagAA', 'wcagAAA'];
    const hexColorRegex = /^#[0-9A-F]{6}$/i;

    levels.forEach(level => {
      const levelObj = (contrastTokens as any)[level];
      Object.values(levelObj).forEach(token => {
        expect((token as any).fg).toMatch(hexColorRegex);
        expect((token as any).bg).toMatch(hexColorRegex);
      });
    });
  });

  test('all contrast pairs have numeric ratio values', () => {
    const levels = ['high', 'normal', 'reduced', 'wcagAA', 'wcagAAA'];
    levels.forEach(level => {
      const levelObj = (contrastTokens as any)[level];
      Object.values(levelObj).forEach(token => {
        const ratio = parseFloat((token as any).ratio);
        expect(isNaN(ratio)).toBe(false);
        expect(ratio).toBeGreaterThan(1);
      });
    });
  });

  test('wcagAA has sufficient contrast values', () => {
    const wcagAAObj = (contrastTokens as any).wcagAA;
    Object.values(wcagAAObj).forEach(token => {
      const ratio = parseFloat((token as any).ratio);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  test('wcagAAA has enhanced contrast values', () => {
    const wcagAAAObj = (contrastTokens as any).wcagAAA;
    Object.values(wcagAAAObj).forEach(token => {
      const ratio = parseFloat((token as any).ratio);
      expect(ratio).toBeGreaterThanOrEqual(7);
    });
  });
});
