import { createMockSupabaseClient, type MockSupabaseClient } from '../helpers/supabase-mock';
import { mockArticle } from '../helpers/fixtures';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

// Suppress console.error noise from expected error paths
jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getContentCounts,
} from '@/lib/supabase/admin-queries';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

function setError(message = 'test error') {
  resetClient({ error: { message } });
}

function setData(data: unknown) {
  resetClient({ data });
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getAllArticles ────────────────────────────────────────────────────────────

describe('getAllArticles', () => {
  it('returns articles on success', async () => {
    setData([mockArticle]);
    const result = await getAllArticles();
    expect(result).toEqual([mockArticle]);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
  });

  it('orders by created_at DESC', async () => {
    setData([]);
    await getAllArticles();
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applies default limit of 50', async () => {
    setData([]);
    await getAllArticles();
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(0, 49);
  });

  it('applies status filter', async () => {
    setData([mockArticle]);
    await getAllArticles({ status: 'draft' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
  });

  it('applies lens filter', async () => {
    setData([mockArticle]);
    await getAllArticles({ lens: 'philosophy' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'philosophy');
  });

  it('applies custom limit and offset', async () => {
    setData([]);
    await getAllArticles({ limit: 10, offset: 20 });
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(20, 29);
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllArticles();
    expect(result).toEqual([]);
  });

  it('does not filter by status when none provided', async () => {
    setData([]);
    await getAllArticles();
    // eq should not have been called (no status, no lens)
    expect(mockClient._queryChain.eq).not.toHaveBeenCalled();
  });
});

// ── getArticleById ───────────────────────────────────────────────────────────

describe('getArticleById', () => {
  it('returns article on success', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const result = await getArticleById('art-1');
    expect(result).toEqual(mockArticle);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'art-1');
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getArticleById('nonexistent');
    expect(result).toBeNull();
  });
});

// ── createArticle ────────────────────────────────────────────────────────────

describe('createArticle', () => {
  const baseData = {
    title: 'Test Article',
    slug: 'test-article',
    lens: 'health' as const,
    tags: ['test'],
    excerpt: 'Test excerpt',
    body: 'Test body',
    access_tier: 'free' as const,
    status: 'draft' as const,
    featured: false,
    author: 'The Chairman',
  };

  it('inserts article with correct data', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const result = await createArticle(baseData);
    expect(result).toEqual(mockArticle);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Article',
        slug: 'test-article',
        lens: 'health',
        status: 'draft',
        cover_image: null,
        published_at: null,
      }),
    );
  });

  it('auto-sets published_at when status is published and no date provided', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const before = new Date().toISOString();
    await createArticle({ ...baseData, status: 'published' });
    const insertCall = mockClient._queryChain.insert.mock.calls[0][0];
    expect(insertCall.published_at).toBeDefined();
    expect(new Date(insertCall.published_at).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
  });

  it('uses provided published_at when given', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const date = '2026-06-01T00:00:00Z';
    await createArticle({ ...baseData, status: 'published', published_at: date });
    const insertCall = mockClient._queryChain.insert.mock.calls[0][0];
    expect(insertCall.published_at).toBe(date);
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    const result = await createArticle(baseData);
    expect(result).toBeNull();
  });

  it('chains select and single after insert', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    await createArticle(baseData);
    expect(mockClient._queryChain.insert).toHaveBeenCalled();
    expect(mockClient._queryChain.select).toHaveBeenCalledWith('*');
    expect(mockClient._queryChain.single).toHaveBeenCalled();
  });
});

// ── updateArticle ────────────────────────────────────────────────────────────

describe('updateArticle', () => {
  it('updates article by id', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const result = await updateArticle('art-1', { title: 'Updated Title' });
    expect(result).toEqual(mockArticle);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.update).toHaveBeenCalledWith({ title: 'Updated Title' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'art-1');
  });

  it('auto-sets published_at when status changes to published', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const before = new Date().toISOString();
    await updateArticle('art-1', { status: 'published' });
    const updateCall = mockClient._queryChain.update.mock.calls[0][0];
    expect(updateCall.published_at).toBeDefined();
    expect(new Date(updateCall.published_at).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
  });

  it('does not override explicit published_at', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const date = '2026-06-01T00:00:00Z';
    await updateArticle('art-1', { status: 'published', published_at: date });
    const updateCall = mockClient._queryChain.update.mock.calls[0][0];
    expect(updateCall.published_at).toBe(date);
  });

  it('does not set published_at for non-publish status changes', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    await updateArticle('art-1', { status: 'draft' });
    const updateCall = mockClient._queryChain.update.mock.calls[0][0];
    expect(updateCall.published_at).toBeUndefined();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'update failed' } });
    const result = await updateArticle('art-1', { title: 'x' });
    expect(result).toBeNull();
  });
});

// ── deleteArticle ────────────────────────────────────────────────────────────

describe('deleteArticle', () => {
  it('deletes article by id and returns true', async () => {
    resetClient();
    const result = await deleteArticle('art-1');
    expect(result).toBe(true);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.delete).toHaveBeenCalled();
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'art-1');
  });

  it('returns false on error', async () => {
    setError('delete failed');
    const result = await deleteArticle('art-1');
    expect(result).toBe(false);
  });
});

// ── getContentCounts ─────────────────────────────────────────────────────────

describe('getContentCounts', () => {
  it('returns structured counts from all tables', async () => {
    // The mock chain resolves via .then, and count comes from the resolved value.
    // We need to override the chain to include count in the resolved value.
    resetClient();

    // Override from() to return different count values per call
    let callIndex = 0;
    // articles(total,pub,draft), briefings(total,pub,draft), dispatches(total,pub,draft),
    // downloads(total), handbooks(total,pub,draft), members(total), messages(total), subscribers(total)
    const counts = [10, 5, 3, 8, 4, 2, 6, 3, 1, 15, 7, 5, 2, 42, 9, 99];
    mockClient.from = jest.fn().mockImplementation(() => {
      const idx = callIndex++;
      const chain = { ...mockClient._queryChain };
      // Make the chain thenable with count
      chain.then = jest.fn((resolve) => resolve({ data: null, error: null, count: counts[idx] }));
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.is = jest.fn().mockReturnValue(chain);
      chain.select = jest.fn().mockReturnValue(chain);
      return chain;
    });

    const result = await getContentCounts();
    expect(result).toEqual({
      articles: { total: 10, published: 5, draft: 3 },
      briefings: { total: 8, published: 4, draft: 2 },
      dispatches: { total: 6, published: 3, draft: 1 },
      downloads: { total: 15 },
      handbooks: { total: 7, published: 5, draft: 2 },
      members: { total: 42 },
      messages: { total: 9 },
      subscribers: { total: 99 },
    });
  });

  it('returns zeros when counts are null', async () => {
    resetClient();

    mockClient.from = jest.fn().mockImplementation(() => {
      const chain = { ...mockClient._queryChain };
      chain.then = jest.fn((resolve) => resolve({ data: null, error: null, count: null }));
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.is = jest.fn().mockReturnValue(chain);
      chain.select = jest.fn().mockReturnValue(chain);
      return chain;
    });

    const result = await getContentCounts();
    expect(result).toEqual({
      articles: { total: 0, published: 0, draft: 0 },
      briefings: { total: 0, published: 0, draft: 0 },
      dispatches: { total: 0, published: 0, draft: 0 },
      downloads: { total: 0 },
      handbooks: { total: 0, published: 0, draft: 0 },
      members: { total: 0 },
      messages: { total: 0 },
      subscribers: { total: 0 },
    });
  });

  it('queries correct tables', async () => {
    resetClient();

    const tablesCalled: string[] = [];
    mockClient.from = jest.fn().mockImplementation((table: string) => {
      tablesCalled.push(table);
      const chain = { ...mockClient._queryChain };
      chain.then = jest.fn((resolve) => resolve({ data: null, error: null, count: 0 }));
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.is = jest.fn().mockReturnValue(chain);
      chain.select = jest.fn().mockReturnValue(chain);
      return chain;
    });

    await getContentCounts();
    expect(tablesCalled).toContain('articles');
    expect(tablesCalled).toContain('briefings');
    expect(tablesCalled).toContain('dispatches');
    expect(tablesCalled).toContain('downloads');
    expect(tablesCalled).toContain('handbooks');
    expect(tablesCalled).toContain('members');
    expect(tablesCalled).toContain('contact_submissions');
    expect(tablesCalled).toContain('newsletter_subscribers');
  });
});
