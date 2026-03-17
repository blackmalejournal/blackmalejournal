import statusColors from '../tokens/semantic/status-colors.json';

describe('Semantic Status Colors', () => {
  test('has all required status types', () => {
    expect((statusColors as any).success).toBeDefined();
    expect((statusColors as any).error).toBeDefined();
    expect((statusColors as any).warning).toBeDefined();
    expect((statusColors as any).info).toBeDefined();
  });

  test('each status has color variations', () => {
    const statuses = ['success', 'error', 'warning', 'info'];
    statuses.forEach(status => {
      const statusObj = (statusColors as any)[status];
      expect(Object.keys(statusObj).length).toBeGreaterThanOrEqual(5);
    });
  });

  test('status colors have required properties', () => {
    const statuses = ['success', 'error', 'warning', 'info'];
    statuses.forEach(status => {
      for (const [variant, token] of Object.entries((statusColors as any)[status])) {
        expect((token as any).value).toBeDefined();
        expect((token as any).description).toBeDefined();
      }
    });
  });

  test('status colors are valid hex values', () => {
    const statuses = ['success', 'error', 'warning', 'info'];
    statuses.forEach(status => {
      for (const token of Object.values((statusColors as any)[status])) {
        expect((token as any).value).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });
  });
});
