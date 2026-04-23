interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens tracked
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

import { createAdminClient } from '@/lib/supabase/admin';

interface MemoryRateLimitBucket {
  count: number;
  resetAt: number;
}

interface SupabaseRateLimitBucket {
  token: string;
  request_count: number;
  reset_at: string;
}

// api_rate_limits is an operational table not present in the generated schema.
// ApiRateLimitUpsert provides local type safety for all write operations.
interface ApiRateLimitUpsert {
  bucket_key: string;
  token: string;
  request_count: number;
  reset_at: string;
}

const memoryStore = new Map<string, MemoryRateLimitBucket>();
const defaultOptions = {
  table: 'api_rate_limits',
};

function clampToken(rawToken: string): string {
  const normalized = String(rawToken ?? '').trim();
  return normalized.slice(0, 128);
}

function shouldUseDistributedStore(): boolean {
  if (process.env.NODE_ENV === 'test') return false;
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function nextWindowStart(now: number, interval: number): number {
  return Math.floor(now / interval) * interval;
}

async function getDistributedLimit(
  token: string,
  interval: number,
  limit: number,
): Promise<RateLimitResult | null> {
  const now = Date.now();
  const windowStart = nextWindowStart(now, interval);
  const resetAt = windowStart + interval;
  const key = `${windowStart}:${token}`;

  const supabase = createAdminClient();
  const table = process.env.API_RATE_LIMITS_TABLE ?? defaultOptions.table;

  try {
    const { data: existingRecords, error: fetchError } = await supabase
      .from(table)
      .select('token, request_count, reset_at')
      .eq('bucket_key', key)
      .eq('token', token)
      .limit(1);

    if (fetchError) throw fetchError;

    const existing = (existingRecords as unknown as SupabaseRateLimitBucket[] | null)?.[0];
    if (!existing || new Date(existing.reset_at).getTime() <= now) {
      const upsertPayload: ApiRateLimitUpsert = {
        bucket_key: key,
        token,
        request_count: 1,
        reset_at: new Date(resetAt).toISOString(),
      };

      // api_rate_limits is not in the generated schema; cast via unknown is intentional
      const { error: upsertError } = await (supabase as any)
        .from(table)
        .upsert(upsertPayload, { onConflict: 'bucket_key,token' });

      if (upsertError) throw upsertError;
      return { success: true, remaining: limit - 1 };
    }

    if (existing.request_count >= limit) {
      return { success: false, remaining: 0 };
    }

    const updatePayload: Partial<ApiRateLimitUpsert> = {
      request_count: existing.request_count + 1,
    };

    // api_rate_limits is not in the generated schema; cast via unknown is intentional
    const { error: updateError } = await (supabase as any)
      .from(table)
      .update(updatePayload)
      .eq('bucket_key', key)
      .eq('token', token)
      .eq('reset_at', existing.reset_at);

    if (updateError) throw updateError;
    return { success: true, remaining: limit - (existing.request_count + 1) };
  } catch (error) {
    console.error('[rateLimit] distributed check failed, falling back to in-memory', error);
    return null;
  }
}

function getMemoryLimit(
  token: string,
  interval: number,
  uniqueTokenPerInterval: number,
  limit: number,
): RateLimitResult {
  const now = Date.now();
  if (memoryStore.size > uniqueTokenPerInterval) {
    for (const [key, bucket] of memoryStore) {
      if (now > bucket.resetAt) memoryStore.delete(key);
    }
  }

  const bucket = memoryStore.get(token);
  if (!bucket || now > bucket.resetAt) {
    memoryStore.set(token, { count: 1, resetAt: now + interval });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;

  return {
    async check(limit: number, token: string): Promise<RateLimitResult> {
      const safeToken = clampToken(token);
      if (!safeToken) {
        return { success: false, remaining: 0 };
      }

      if (shouldUseDistributedStore()) {
        const result = await getDistributedLimit(safeToken, interval, limit);
        if (result) return result;
      }

      return getMemoryLimit(safeToken, interval, uniqueTokenPerInterval, limit);
    },
  };
}
