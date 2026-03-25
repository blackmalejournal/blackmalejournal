import { createMockSupabaseClient, type MockSupabaseClient } from '../helpers/supabase-mock';
import { mockArticle } from '../helpers/fixtures';
import type { AdminActivityLog } from '@/lib/supabase/types';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

// Suppress console.error noise from expected error paths
jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  bulkUpdateArticleStatuses,
  bulkUpdateDownloadAccessTiers,
  createAdminActivityLogEntry,
  getAllArticles,
  getAdminActivityLogForEntity,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getContentCounts,
} from '@/lib/supabase/admin-queries';

const mockAdminActivity: AdminActivityLog = {
  id: 'activity-1',
  actor_user_id: 'member-1',
  actor_email: 'operator@blackmalejournal.com',
  actor_role: 'admin',
  entity_type: 'article',
  entity_id: 'art-1',
  entity_title: 'The Discipline of Morning Routines',
  action: 'updated',
  summary: 'Updated article "The Discipline of Morning Routines": status draft -> published.',
  metadata: {
    previous: {
      title: 'The Discipline of Morning Routines',
      status: 'draft',
    },
    next: {
      title: 'The Discipline of Morning Routines',
      status: 'published',
    },
  },
  created_at: '2026-03-25T10:00:00Z',
};

const mockDraftArticle = {
  ...mockArticle,
  status: 'draft' as const,
  published_at: '',
};

const mockPublishedArticle = {
  ...mockArticle,
  status: 'published' as const,
};

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
    await getAllArticles({ lens: 'culture' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'culture');
  });

  it('applies search query filter', async () => {
    setData([mockArticle]);
    await getAllArticles({ query: 'discipline' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%discipline%'),
    );
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

describe('bulkUpdateArticleStatuses', () => {
  it('updates selected article statuses and preserves per-row publish timestamps', async () => {
    resetClient();

    const previous = [
      { ...mockDraftArticle, id: 'art-1', title: 'Draft One' },
      { ...mockPublishedArticle, id: 'art-2', title: 'Draft Two' },
    ];
    const updated = [
      { ...mockPublishedArticle, id: 'art-1', title: 'Draft One' },
      { ...mockPublishedArticle, id: 'art-2', title: 'Draft Two' },
    ];

    const responses = [
      { data: previous, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: updated, error: null },
    ];
    const chains: MockSupabaseClient[] = [];
    let callIndex = 0;

    mockClient.from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe('articles');
      const response = responses[callIndex++];
      const chainClient = createMockSupabaseClient(response.error ? { error: response.error } : { data: response.data });
      chains.push(chainClient);
      return chainClient._queryChain;
    });

    const result = await bulkUpdateArticleStatuses(['art-1', 'art-2'], 'published');

    expect(result).toEqual({ previous, updated });
    expect(chains[0]._queryChain.in).toHaveBeenCalledWith('id', ['art-1', 'art-2']);
    expect(chains[1]._queryChain.update).toHaveBeenCalledWith({ status: 'published' });
    expect(chains[1]._queryChain.in).toHaveBeenCalledWith('id', ['art-1', 'art-2']);
    expect(chains[2]._queryChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ published_at: expect.any(String) }),
    );
    expect(chains[2]._queryChain.in).toHaveBeenCalledWith('id', ['art-1']);
  });
});

describe('bulkUpdateDownloadAccessTiers', () => {
  it('updates the access tier across selected downloads', async () => {
    resetClient();

    const previous = [
      {
        id: 'dl-1',
        title: 'Planner',
        slug: 'planner',
        description: 'Desc',
        category: 'template',
        file_url: 'downloads/planner.pdf',
        file_type: 'pdf',
        file_size: 1024,
        access_tier: 'free' as const,
        cover_image: null,
        published_at: '2026-01-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    const updated = [
      {
        ...previous[0],
        access_tier: 'premium' as const,
      },
    ];

    const responses = [
      { data: previous, error: null },
      { data: null, error: null },
      { data: updated, error: null },
    ];
    const chains: MockSupabaseClient[] = [];
    let callIndex = 0;

    mockClient.from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe('downloads');
      const response = responses[callIndex++];
      const chainClient = createMockSupabaseClient(response.error ? { error: response.error } : { data: response.data });
      chains.push(chainClient);
      return chainClient._queryChain;
    });

    const result = await bulkUpdateDownloadAccessTiers(['dl-1'], 'premium');

    expect(result).toEqual({ previous, updated });
    expect(chains[1]._queryChain.update).toHaveBeenCalledWith({ access_tier: 'premium' });
    expect(chains[1]._queryChain.in).toHaveBeenCalledWith('id', ['dl-1']);
  });
});

// ── admin activity log ───────────────────────────────────────────────────────

describe('createAdminActivityLogEntry', () => {
  it('inserts a log entry and returns it', async () => {
    resetClient({ data: mockAdminActivity });
    mockClient._queryChain.single.mockResolvedValue({ data: mockAdminActivity, error: null });

    const result = await createAdminActivityLogEntry({
      actor_user_id: 'member-1',
      actor_email: 'operator@blackmalejournal.com',
      actor_role: 'admin',
      entity_type: 'article',
      entity_id: 'art-1',
      entity_title: mockArticle.title,
      action: 'updated',
      summary: mockAdminActivity.summary,
      metadata: mockAdminActivity.metadata,
    });

    expect(result).toEqual(mockAdminActivity);
    expect(mockClient.from).toHaveBeenCalledWith('admin_activity_log');
    expect(mockClient._queryChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_email: 'operator@blackmalejournal.com',
        actor_role: 'admin',
        entity_type: 'article',
        entity_id: 'art-1',
        entity_title: mockArticle.title,
        action: 'updated',
        summary: mockAdminActivity.summary,
        metadata: mockAdminActivity.metadata,
      }),
    );
  });

  it('returns null on insert error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'insert failed' } });

    const result = await createAdminActivityLogEntry({
      actor_user_id: null,
      actor_email: 'operator@blackmalejournal.com',
      actor_role: 'editor',
      entity_type: 'dispatch',
      entity_id: 'dispatch-1',
      entity_title: 'Dispatch title',
      action: 'created',
      summary: 'Created dispatch "Dispatch title".',
    });

    expect(result).toBeNull();
  });
});

describe('getAdminActivityLogForEntity', () => {
  it('returns activity ordered by created_at desc for one entity', async () => {
    setData([mockAdminActivity]);

    const result = await getAdminActivityLogForEntity('article', 'art-1', 5);

    expect(result).toEqual([mockAdminActivity]);
    expect(mockClient.from).toHaveBeenCalledWith('admin_activity_log');
    expect(mockClient._queryChain.eq).toHaveBeenNthCalledWith(1, 'entity_type', 'article');
    expect(mockClient._queryChain.eq).toHaveBeenNthCalledWith(2, 'entity_id', 'art-1');
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockClient._queryChain.limit).toHaveBeenCalledWith(5);
  });

  it('returns empty array on query error', async () => {
    setError('query failed');

    const result = await getAdminActivityLogForEntity('article', 'art-1');

    expect(result).toEqual([]);
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
    // articles(total,pub,draft), briefings(total,pub,draft), courses(total,published,draft),
    // dispatches(total,pub,draft), downloads(total), handbooks(total,pub,draft),
    // members(total), messages(total), subscribers(total)
    const counts = [10, 5, 3, 8, 4, 2, 6, 4, 2, 15, 7, 5, 12, 7, 5, 2, 42, 9, 99];
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
      courses: { total: 6, published: 4, draft: 2 },
      dispatches: { total: 15, published: 7, draft: 5 },
      downloads: { total: 12 },
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
      courses: { total: 0, published: 0, draft: 0 },
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
    expect(tablesCalled).toContain('courses');
    expect(tablesCalled).toContain('dispatches');
    expect(tablesCalled).toContain('downloads');
    expect(tablesCalled).toContain('handbooks');
    expect(tablesCalled).toContain('members');
    expect(tablesCalled).toContain('contact_submissions');
    expect(tablesCalled).toContain('newsletter_subscribers');
  });
});
