import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
    const result = limiter.check(10, 'test-token-1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('blocks requests over the limit', () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
    for (let i = 0; i < 5; i++) {
      limiter.check(5, 'test-token-2');
    }
    const result = limiter.check(5, 'test-token-2');
    expect(result.success).toBe(false);
  });

  it('tracks different tokens independently', () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
    for (let i = 0; i < 3; i++) {
      limiter.check(3, 'token-a');
    }
    const blocked = limiter.check(3, 'token-a');
    expect(blocked.success).toBe(false);

    const allowed = limiter.check(3, 'token-b');
    expect(allowed.success).toBe(true);
  });
});
