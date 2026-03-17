/** @jest-environment node */
import { GET } from '@/app/api/search/route';

jest.mock('@/lib/supabase/queries', () => ({
  searchContent: jest.fn().mockResolvedValue([
    { type: 'article', title: 'Test', slug: 'test', excerpt: 'Excerpt', lens: 'health', publishedAt: '2026-01-01' },
  ]),
}));

describe('GET /api/search', () => {
  test('returns 400 for missing query param', async () => {
    const req = new Request('http://localhost:3000/api/search');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('returns 400 for query shorter than 2 chars', async () => {
    const req = new Request('http://localhost:3000/api/search?q=a');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('returns results for valid query', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.results).toHaveLength(1);
    expect(data.query).toBe('test');
  });
});
