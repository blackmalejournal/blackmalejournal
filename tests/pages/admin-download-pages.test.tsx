import { render, screen } from '@testing-library/react';
import type { Download } from '@/lib/supabase/types';

const mockDownload: Download = {
  id: 'dl-abc-123',
  title: 'Test Download Title',
  slug: 'test-download-title',
  description: 'A short description.',
  category: 'template',
  file_url: 'downloads/test-file.pdf',
  file_type: 'pdf',
  file_size: 1048576,
  access_tier: 'free',
  cover_image: 'covers/test.webp',
  published_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
};

const mockNotFound = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: (...args: unknown[]) => mockNotFound(...args),
  redirect: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock DownloadForm to avoid hooks issues in server component tests.
// The DownloadForm itself is tested in admin-download-form.test.tsx.
jest.mock('@/app/(auth)/admin/downloads/DownloadForm', () => ({
  DownloadForm: ({ download, action }: { download?: Download; action: unknown }) => (
    <div data-testid="download-form">
      <span data-testid="form-mode">{download ? 'edit' : 'create'}</span>
      <span data-testid="form-action">{typeof action}</span>
      {download && <span data-testid="form-download-id">{download.id}</span>}
      <button type="submit">{download ? 'Update Download' : 'Create Download'}</button>
    </div>
  ),
}));

// ── New Download Page ──────────────────────────────────────────────────────────

describe('NewDownloadPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "NEW DOWNLOAD" heading', async () => {
    jest.mock('@/app/(auth)/admin/downloads/actions', () => ({
      createDownloadAction: jest.fn(),
    }));

    const { default: NewDownloadPage } = await import(
      '@/app/(auth)/admin/downloads/new/page'
    );
    render(NewDownloadPage());

    expect(
      screen.getByRole('heading', { level: 1, name: 'NEW DOWNLOAD' }),
    ).toBeInTheDocument();
  });

  it('renders DownloadForm in create mode', async () => {
    jest.mock('@/app/(auth)/admin/downloads/actions', () => ({
      createDownloadAction: jest.fn(),
    }));

    const { default: NewDownloadPage } = await import(
      '@/app/(auth)/admin/downloads/new/page'
    );
    render(NewDownloadPage());

    expect(screen.getByTestId('download-form')).toBeInTheDocument();
    expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    expect(
      screen.getByRole('button', { name: /create download/i }),
    ).toBeInTheDocument();
  });
});

// ── Edit Download Page ─────────────────────────────────────────────────────────

describe('EditDownloadPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "EDIT DOWNLOAD" heading when download exists', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDownloadById: jest.fn().mockResolvedValue(mockDownload),
    }));
    jest.mock('@/app/(auth)/admin/downloads/actions', () => ({
      updateDownloadAction: jest.fn(),
    }));

    const { default: EditDownloadPage } = await import(
      '@/app/(auth)/admin/downloads/[id]/edit/page'
    );
    const result = await EditDownloadPage({
      params: Promise.resolve({ id: 'dl-abc-123' }),
    });
    render(result);

    expect(
      screen.getByRole('heading', { level: 1, name: 'EDIT DOWNLOAD' }),
    ).toBeInTheDocument();
  });

  it('shows download ID', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDownloadById: jest.fn().mockResolvedValue(mockDownload),
    }));
    jest.mock('@/app/(auth)/admin/downloads/actions', () => ({
      updateDownloadAction: jest.fn(),
    }));

    const { default: EditDownloadPage } = await import(
      '@/app/(auth)/admin/downloads/[id]/edit/page'
    );
    const result = await EditDownloadPage({
      params: Promise.resolve({ id: 'dl-abc-123' }),
    });
    render(result);

    expect(screen.getByText('ID: dl-abc-123')).toBeInTheDocument();
  });

  it('renders DownloadForm in edit mode with "Update Download" button', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDownloadById: jest.fn().mockResolvedValue(mockDownload),
    }));
    jest.mock('@/app/(auth)/admin/downloads/actions', () => ({
      updateDownloadAction: jest.fn(),
    }));

    const { default: EditDownloadPage } = await import(
      '@/app/(auth)/admin/downloads/[id]/edit/page'
    );
    const result = await EditDownloadPage({
      params: Promise.resolve({ id: 'dl-abc-123' }),
    });
    render(result);

    expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('form-download-id')).toHaveTextContent('dl-abc-123');
    expect(
      screen.getByRole('button', { name: /update download/i }),
    ).toBeInTheDocument();
  });

  it('calls notFound() when download is null', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDownloadById: jest.fn().mockResolvedValue(null),
    }));
    jest.mock('@/app/(auth)/admin/downloads/actions', () => ({
      updateDownloadAction: jest.fn(),
    }));

    const { default: EditDownloadPage } = await import(
      '@/app/(auth)/admin/downloads/[id]/edit/page'
    );

    await EditDownloadPage({
      params: Promise.resolve({ id: 'nonexistent' }),
    }).catch(() => {
      // notFound() may throw — that's expected
    });

    expect(mockNotFound).toHaveBeenCalled();
  });
});
