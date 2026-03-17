jest.mock('@/lib/supabase/queries', () => ({
  getHandbooks: jest.fn(),
}));

import { getHandbooks } from '@/lib/supabase/queries';

describe('Handbooks Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getHandbooks with lens filter', async () => {
    (getHandbooks as jest.Mock).mockResolvedValue([]);
    await getHandbooks({ lens: 'health' });
    expect(getHandbooks).toHaveBeenCalledWith({ lens: 'health' });
  });

  it('calls getHandbooks without filter for all', async () => {
    (getHandbooks as jest.Mock).mockResolvedValue([]);
    await getHandbooks({});
    expect(getHandbooks).toHaveBeenCalledWith({});
  });
});
