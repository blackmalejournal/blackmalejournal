import spacing from '../tokens/primitives/spacing.json';

describe('Spacing Tokens', () => {
  test('follows 8px grid base', () => {
    expect((spacing as any)['space-0'].value).toBe('0px');
    expect((spacing as any)['space-1'].value).toBe('8px');
    expect((spacing as any)['space-2'].value).toBe('16px');
    expect((spacing as any)['space-3'].value).toBe('24px');
  });

  test('has spacing scale up to 128px', () => {
    const scale = Object.keys(spacing).filter((k: string) => k.startsWith('space-'));
    expect(scale.length).toBeGreaterThanOrEqual(16);
  });

  test('all spacing values are multiples of 8', () => {
    for (const token of Object.values(spacing)) {
      const px = parseInt((token as any).value);
      expect(px % 8).toBe(0);
    }
  });
});
