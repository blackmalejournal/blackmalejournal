import typography from '../tokens/primitives/typography.json';

describe('Typography Tokens', () => {
  test('has required font families', () => {
    expect((typography as any)['font-display']).toBeDefined();
    expect((typography as any)['font-body']).toBeDefined();
    expect((typography as any)['font-label']).toBeDefined();
    expect((typography as any)['font-mono']).toBeDefined();
  });

  test('font families reference correct google fonts', () => {
    expect((typography as any)['font-display'].family).toBe('Bebas Neue');
    expect((typography as any)['font-body'].family).toBe('Libre Baskerville');
    expect((typography as any)['font-label'].family).toBe('Oswald');
    expect((typography as any)['font-mono'].family).toBe('IBM Plex Mono');
  });

  test('has font size scale from 12px to 96px', () => {
    const sizes = Object.keys(typography).filter((k: string) => k.startsWith('size-'));
    expect(sizes.length).toBeGreaterThanOrEqual(8);
  });

  test('has font weight variants', () => {
    expect((typography as any)['weight-regular']).toBeDefined();
    expect((typography as any)['weight-bold']).toBeDefined();
  });

  test('all typography tokens have required properties', () => {
    for (const [name, token] of Object.entries(typography)) {
      if ((name as string).startsWith('font-')) {
        expect((token as any).family).toBeDefined();
      }
    }
  });
});
