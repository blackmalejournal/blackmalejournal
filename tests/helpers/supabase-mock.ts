type SupabaseResult = { data: unknown; error: null } | { data: null; error: { message: string } };

function createChainableMock(resolvedValue: SupabaseResult = { data: [], error: null }) {
  const chain: Record<string, jest.Mock> = {};

  const methods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'contains', 'order', 'limit', 'range', 'single', 'maybeSingle'];

  for (const method of methods) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }

  // Terminal methods resolve to the value
  chain.single = jest.fn().mockResolvedValue(resolvedValue);
  chain.maybeSingle = jest.fn().mockResolvedValue(resolvedValue);

  // Make the chain itself thenable (for queries without .single())
  chain.then = jest.fn((resolve) => resolve(resolvedValue));

  // Override to make non-terminal methods return the chain
  for (const method of methods.filter(m => m !== 'single' && m !== 'maybeSingle')) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }

  return chain;
}

export function createMockSupabaseClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  const result: SupabaseResult = overrides.error
    ? { data: null, error: overrides.error }
    : { data: overrides.data ?? [], error: null };

  const queryChain = createChainableMock(result);

  const client = {
    from: jest.fn().mockReturnValue(queryChain),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    _queryChain: queryChain, // exposed for test assertions
  };

  return client;
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
