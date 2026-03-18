import { getLatestDispatches } from '@/lib/supabase/queries';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

function setupChain(data: unknown[] | null, error: { message: string } | null = null) {
  mockLimit.mockResolvedValue({ data, error });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockEq.mockReturnValue({ order: mockOrder });
  mockSelect.mockReturnValue({ eq: mockEq });
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn(() => ({ select: mockSelect })),
  });
}

describe('getLatestDispatches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns dispatches with default limit of 3', async () => {
    const mockData = [
      { id: '1', title: 'D1', slug: 'd1', lens: 'health', excerpt: '', body: '', status: 'published', author: 'The Chairman', cover_image: null, published_at: '2026-03-18', created_at: '2026-03-18' },
    ];
    setupChain(mockData);

    const result = await getLatestDispatches();
    expect(result).toEqual(mockData);
    expect(mockLimit).toHaveBeenCalledWith(3);
  });

  it('respects custom limit', async () => {
    setupChain([]);
    await getLatestDispatches(5);
    expect(mockLimit).toHaveBeenCalledWith(5);
  });

  it('returns empty array on error', async () => {
    setupChain(null, { message: 'fail' });
    const result = await getLatestDispatches();
    expect(result).toEqual([]);
  });
});
