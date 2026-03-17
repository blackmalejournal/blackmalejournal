import interactiveStates from '../tokens/semantic/interactive-states.json';

const hexColorRegex = /^#[0-9A-F]{6}$/i;
const colorProps = ['bg', 'text', 'border', 'outline', 'color', 'spinner'];
const states = ['hover', 'active', 'focus', 'disabled', 'loading'];

const isColorProperty = (propName: string) =>
  colorProps.some(cp => propName.includes(cp));

const validateColorTokens = (stateObj: any) => {
  Object.entries(stateObj).forEach(([prop, token]) => {
    if (isColorProperty(prop)) {
      expect((token as any).value).toMatch(hexColorRegex);
    }
  });
};

describe('Semantic Interactive States', () => {
  test('has all required interactive state types', () => {
    expect((interactiveStates as any).hover).toBeDefined();
    expect((interactiveStates as any).active).toBeDefined();
    expect((interactiveStates as any).focus).toBeDefined();
    expect((interactiveStates as any).disabled).toBeDefined();
    expect((interactiveStates as any).loading).toBeDefined();
  });

  test('each interactive state has multiple properties', () => {
    states.forEach(state => {
      const stateObj = (interactiveStates as any)[state];
      expect(Object.keys(stateObj).length).toBeGreaterThanOrEqual(3);
    });
  });

  test('interactive states have required properties', () => {
    states.forEach(state => {
      const stateObj = (interactiveStates as any)[state];
      Object.entries(stateObj).forEach(([prop, token]) => {
        expect((token as any).value).toBeDefined();
        expect((token as any).description).toBeDefined();
      });
    });
  });

  test('interactive state colors are valid hex values', () => {
    states.forEach(state => {
      const stateObj = (interactiveStates as any)[state];
      validateColorTokens(stateObj);
    });
  });

  test('interactive states have opacity values for disabled state', () => {
    const disabledObj = (interactiveStates as any).disabled;
    Object.entries(disabledObj).forEach(([prop, token]) => {
      if (prop.includes('opacity') || prop === 'bg' || prop === 'background') {
        expect((token as any).opacity !== undefined || (token as any).value !== undefined).toBe(true);
      }
    });
  });
});
