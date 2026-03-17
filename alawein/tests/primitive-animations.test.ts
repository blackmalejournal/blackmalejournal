import animationTokens from '../tokens/primitives/animations.json';

describe('Primitive Animation Tokens', () => {
  test('has all required animation categories', () => {
    expect((animationTokens as any).durations).toBeDefined();
    expect((animationTokens as any).timings).toBeDefined();
    expect((animationTokens as any).easings).toBeDefined();
    expect((animationTokens as any).keyframes).toBeDefined();
  });

  test('durations has 8+ entries in milliseconds', () => {
    const durations = (animationTokens as any).durations;
    expect(Object.keys(durations).length).toBeGreaterThanOrEqual(8);
    Object.values(durations).forEach(token => {
      const value = (token as any).value;
      expect(value).toMatch(/^\d+ms$/);
    });
  });

  test('timings defines animation types', () => {
    const timings = (animationTokens as any).timings;
    expect(Object.keys(timings).length).toBeGreaterThanOrEqual(5);
    Object.entries(timings).forEach(([name, token]) => {
      expect((token as any).value).toBeDefined();
      expect((token as any).description).toBeDefined();
    });
  });

  test('easings includes standard easing functions', () => {
    const easings = (animationTokens as any).easings;
    expect(Object.keys(easings).length).toBeGreaterThanOrEqual(5);
    Object.values(easings).forEach(token => {
      const value = (token as any).value;
      expect(value).toMatch(/^(ease|cubic-bezier|linear)/);
    });
  });

  test('keyframes defines animation sequences', () => {
    const keyframes = (animationTokens as any).keyframes;
    expect(Object.keys(keyframes).length).toBeGreaterThanOrEqual(3);
    Object.values(keyframes).forEach(token => {
      expect((token as any).value).toBeDefined();
      expect((token as any).description).toBeDefined();
    });
  });

  test('all animation tokens have descriptions', () => {
    const categories = ['durations', 'timings', 'easings', 'keyframes'];
    categories.forEach(category => {
      const tokens = (animationTokens as any)[category];
      Object.values(tokens).forEach(token => {
        expect((token as any).description).toBeDefined();
        expect(typeof (token as any).description).toBe('string');
      });
    });
  });

  test('durations follow reasonable animation ranges', () => {
    const durations = (animationTokens as any).durations;
    Object.values(durations).forEach(token => {
      const value = (token as any).value.replace('ms', '');
      const ms = parseInt(value);
      expect(ms).toBeGreaterThanOrEqual(100);
      expect(ms).toBeLessThanOrEqual(2000);
    });
  });
});
