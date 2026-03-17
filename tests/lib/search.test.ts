import type { SearchResult } from '@/lib/supabase/types';

describe('SearchResult type', () => {
  test('search result has required fields', () => {
    const result: SearchResult = {
      type: 'article',
      title: 'Test Article',
      slug: 'test-article',
      excerpt: 'A test excerpt',
      lens: 'health',
      publishedAt: '2026-01-01',
    };
    expect(result.type).toBe('article');
    expect(result.title).toBeDefined();
    expect(result.slug).toBeDefined();
  });
});
