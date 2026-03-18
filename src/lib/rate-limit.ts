interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens tracked
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;
  const tokenCounts = new Map<string, { count: number; resetAt: number }>();

  return {
    check(limit: number, token: string): RateLimitResult {
      const now = Date.now();

      // Lazy cleanup of expired entries when map gets large
      if (tokenCounts.size > uniqueTokenPerInterval) {
        for (const [key, value] of tokenCounts) {
          if (now > value.resetAt) tokenCounts.delete(key);
        }
      }

      const entry = tokenCounts.get(token);

      if (!entry || now > entry.resetAt) {
        tokenCounts.set(token, { count: 1, resetAt: now + interval });
        return { success: true, remaining: limit - 1 };
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0 };
      }

      entry.count += 1;
      return { success: true, remaining: limit - entry.count };
    },
  };
}
