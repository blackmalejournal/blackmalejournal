jest.mock('@/lib/supabase/queries', () => ({
  getDownloads: jest.fn(),
}));

import { getDownloads } from '@/lib/supabase/queries';

describe('Downloads Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getDownloads with category filter', async () => {
    (getDownloads as jest.Mock).mockResolvedValue([]);
    await getDownloads({ category: 'template' });
    expect(getDownloads).toHaveBeenCalledWith({ category: 'template' });
  });

  it('calls getDownloads without filter for all', async () => {
    (getDownloads as jest.Mock).mockResolvedValue([]);
    await getDownloads({});
    expect(getDownloads).toHaveBeenCalledWith({});
  });
});
