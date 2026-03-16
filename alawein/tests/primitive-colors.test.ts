import colors from '../tokens/primitives/colors.json';

describe('Primitive Colors', () => {
  test('has bmj brand colors', () => {
    expect(colors['bmj-black']).toBeDefined();
    expect(colors['bmj-red']).toBeDefined();
    expect(colors['bmj-cream']).toBeDefined();
  });

  test('brand colors have correct hex values', () => {
    expect((colors as any)['bmj-black'].value).toBe('#0D0C0B');
    expect((colors as any)['bmj-red'].value).toBe('#C0281F');
    expect((colors as any)['bmj-cream'].value).toBe('#E8DCC8');
  });

  test('all colors are categorized', () => {
    for (const [name, token] of Object.entries(colors)) {
      expect((token as any).category).toBeDefined();
      expect(['neutral', 'accent', 'semantic']).toContain((token as any).category);
    }
  });

  test('has at least 300 colors', () => {
    expect(Object.keys(colors).length).toBeGreaterThanOrEqual(300);
  });
});
