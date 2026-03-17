import { validateTokens } from '../src/token-schema';

describe('Token Validation', () => {
  test('primitives have required color properties', () => {
    const result = validateTokens({
      primitives: {
        colors: {
          'bmj-black': { value: '#0D0C0B', category: 'neutral' }
        }
      }
    });
    expect(result.valid).toBe(true);
  });

  test('rejects color without required fields', () => {
    const result = validateTokens({
      primitives: {
        colors: {
          'invalid-token': {}
        }
      }
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing required fields'))).toBe(true);
  });

  test('validates hex color format', () => {
    const result = validateTokens({
      primitives: {
        colors: {
          'bad-hex': { value: 'notahex', category: 'neutral' }
        }
      }
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('invalid hex format'))).toBe(true);
  });

  test('accepts valid color tokens', () => {
    const result = validateTokens({
      primitives: {
        colors: {
          'valid-1': { value: '#FFFFFF', category: 'neutral' },
          'valid-2': { value: '#000000', category: 'accent' }
        }
      }
    });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
