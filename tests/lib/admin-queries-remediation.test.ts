import { createMockSupabaseClient, type MockSupabaseClient } from '../helpers/supabase-mock';
import {
  mockArticle,
  mockBriefing,
  mockCourse,
  mockDispatch,
  mockHandbook,
  mockMember,
} from '../helpers/fixtures';
import type {
  ContactSubmission,
  Download,
  Lesson,
  NewsletterSubscriber,
} from '@/lib/supabase/types';

let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  bulkUpdateBriefingStatuses,
  bulkUpdateDispatchStatuses,
  bulkUpdateDownloadAccessTiers,
  bulkUpdateHandbookStatuses,
  countAdminMembers,
  createBriefing,
  createCourse,
  createDispatch,
  createDownload,
  createHandbook,
  createLesson,
  deleteBriefing,
  deleteCourse,
  deleteDispatch,
  deleteDownload,
  deleteHandbook,
  deleteLesson,
  getAdminCommandCenterSnapshot,
  getAdminContentPipelineInsights,
  getAdminMemberById,
  getAllBriefings,
  getAllContactSubmissions,
  getAllCourses,
  getAllDispatches,
  getAllDownloads,
  getAllHandbooks,
  getAllMembers,
  getAllSubscribers,
  getArticleById,
  getArticlesByIds,
  getBriefingById,
  getBriefingsByIds,
  getContactSubmissionCounts,
  getCourseById,
  getDispatchById,
  getDispatchesByIds,
  getDownloadById,
  getDownloadsByIds,
  getHandbookById,
  getHandbooksByIds,
  getLessonById,
  getLessonsForAdminCourse,
  getMemberAdminInsights,
  getMemberCount,
  getMessageAdminInsights,
  getSubscriberAdminInsights,
  getSubscriberCounts,
  updateAdminMember,
  updateBriefing,
  updateContactSubmission,
  updateCourse,
  updateDispatch,
  updateDownload,
  updateHandbook,
  updateLesson,
} from '@/lib/supabase/admin-queries';

const mockDownload: Download = {
  id: 'dl-1',
  title: 'Ritual Planner',
  slug: 'ritual-planner',
  description: 'Daily execution planner.',
  category: 'template',
  file_url: 'downloads/ritual-planner.pdf',
  file_type: 'pdf',
  file_size: 2048,
  access_tier: 'basic',
  cover_image: null,
  published_at: '2026-03-01T00:00:00Z',
  created_at: '2026-02-25T00:00:00Z',
};

const mockLesson: Lesson = {
  id: 'lesson-1',
  course_id: 'crs-1',
  title: 'Lesson One',
  slug: 'lesson-one',
  order_number: 1,
  body: 'Lesson body',
  video_url: null,
  duration: 42,
  published: true,
  created_at: '2026-03-01T00:00:00Z',
};

const mockSubmission: ContactSubmission = {
  id: 'msg-1',
  name: 'Marcus',
  email: 'marcus@example.com',
  subject: 'Question',
  message: 'Need support details.',
  status: 'new',
  internal_notes: null,
  handled_at: null,
  handled_by: null,
  submitted_at: '2026-03-21T00:00:00Z',
};

const mockSubscriber: NewsletterSubscriber = {
  id: 'sub-1',
  email: 'subscriber@example.com',
  source: 'homepage',
  subscribed_at: '2026-03-10T00:00:00Z',
  unsubscribed_at: null,
};

type QueryResponse = {
  table: string;
  data?: unknown;
  error?: { message: string } | null;
  count?: number | null;
};

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

function setData(data: unknown) {
  resetClient({ data });
}

function setError(message = 'test error') {
  resetClient({ error: { message } });
}

function setSingleData(data: unknown) {
  resetClient({ data });
  mockClient._queryChain.single.mockResolvedValue({ data, error: null });
}

function setSingleError(message = 'single failed') {
  resetClient();
  mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message } });
}

function setFromSequence(responses: QueryResponse[]) {
  let index = 0;
  mockClient.from = jest.fn().mockImplementation((table: string) => {
    const response = responses[index];
    if (!response) throw new Error(`No mocked response for table "${table}" at index ${index}`);
    index += 1;
    expect(table).toBe(response.table);
    const client = createMockSupabaseClient(
      response.error ? { error: response.error } : { data: response.data ?? [] },
    );
    const chain = client._queryChain;
    if (Object.prototype.hasOwnProperty.call(response, 'count')) {
      chain.then = jest.fn((resolve) =>
        resolve({
          data: response.error ? null : (response.data ?? null),
          error: response.error ?? null,
          count: response.count ?? null,
        }),
      );
    }
    return chain;
  });
}

function setFromByTable(responses: Record<string, Omit<QueryResponse, 'table'>>) {
  mockClient.from = jest.fn().mockImplementation((table: string) => {
    const response = responses[table] ?? {};
    const client = createMockSupabaseClient(
      response.error ? { error: response.error } : { data: response.data ?? [] },
    );
    const chain = client._queryChain;
    chain.then = jest.fn((resolve) =>
      resolve({
        data: response.error ? null : (response.data ?? []),
        error: response.error ?? null,
        count: response.count ?? null,
      }),
    );
    return chain;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

describe('admin-queries remediation coverage', () => {
  it('normalizes and sorts IDs for getArticlesByIds', async () => {
    const second = { ...mockArticle, id: 'art-2', title: 'Second' };
    setData([mockArticle, second]);

    const result = await getArticlesByIds([' art-2 ', 'art-1', 'art-2', '']);

    expect(mockClient._queryChain.in).toHaveBeenCalledWith('id', ['art-2', 'art-1']);
    expect(result.map((row) => row.id)).toEqual(['art-2', 'art-1']);
  });

  it('returns null for getArticleById on single-query error', async () => {
    setSingleError('not found');
    const result = await getArticleById('missing');
    expect(result).toBeNull();
  });

  it('applies numeric issue query handling in getAllBriefings', async () => {
    setData([mockBriefing]);

    await getAllBriefings({ status: 'draft', query: ' 12 ', limit: 10, offset: 5 });

    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(5, 14);
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('issue_number.eq.12'),
    );
  });

  it('creates and updates briefings with publish timestamp behavior', async () => {
    setSingleData(mockBriefing);
    await createBriefing({
      issue_number: 4,
      title: 'Weekend Briefing No. 004',
      slug: 'weekend-briefing-004',
      sections: [{ title: 'Lead', body: 'Lead body' }],
      access_tier: 'premium',
      status: 'published',
    });
    const insertPayload = mockClient._queryChain.insert.mock.calls[0][0];
    expect(insertPayload.published_at).toEqual(expect.any(String));

    setSingleData(mockBriefing);
    await updateBriefing('br-1', { status: 'published' });
    const updatePayload = mockClient._queryChain.update.mock.calls[0][0];
    expect(updatePayload.published_at).toEqual(expect.any(String));
  });

  it('handles briefing ID lookups and deletes with fallback branches', async () => {
    setData([mockBriefing]);
    const byIds = await getBriefingsByIds([' br-1 ', 'br-1']);
    expect(byIds).toHaveLength(1);

    setSingleData(mockBriefing);
    const byId = await getBriefingById('br-1');
    expect(byId?.id).toBe('br-1');

    setError('delete failed');
    const deleted = await deleteBriefing('br-1');
    expect(deleted).toBe(false);
  });

  it('runs briefing bulk status updates including published_at patching', async () => {
    const previous = [{ ...mockBriefing, id: 'br-1', status: 'draft', published_at: '' }];
    const updated = [{ ...mockBriefing, id: 'br-1', status: 'published' }];
    setFromSequence([
      { table: 'briefings', data: previous },
      { table: 'briefings', data: null },
      { table: 'briefings', data: null },
      { table: 'briefings', data: updated },
    ]);

    const result = await bulkUpdateBriefingStatuses(['br-1'], 'published');
    expect(result).toEqual({ previous, updated });
  });

  it('applies filters and mutation behavior for dispatches', async () => {
    setData([mockDispatch]);
    await getAllDispatches({ status: 'draft', lens: 'culture', query: 'narrative' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'culture');
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%narrative%'),
    );

    setSingleData(mockDispatch);
    await createDispatch({
      title: 'New Dispatch',
      slug: 'new-dispatch',
      lens: 'politics',
      excerpt: 'Excerpt',
      body: 'Body',
      status: 'published',
      author: 'The Chairman',
    });
    expect(mockClient._queryChain.insert.mock.calls[0][0].published_at).toEqual(expect.any(String));

    setSingleData(mockDispatch);
    await updateDispatch('dsp-1', { status: 'published' });
    expect(mockClient._queryChain.update.mock.calls[0][0].published_at).toEqual(expect.any(String));

    setSingleError('missing');
    const byId = await getDispatchById('missing');
    expect(byId).toBeNull();

    setError('delete failed');
    const deleted = await deleteDispatch('dsp-1');
    expect(deleted).toBe(false);
  });

  it('returns null for dispatch bulk updates when status patch fails', async () => {
    const previous = [{ ...mockDispatch, id: 'dsp-1' }];
    setFromSequence([
      { table: 'dispatches', data: previous },
      { table: 'dispatches', error: { message: 'update failed' } },
    ]);
    const result = await bulkUpdateDispatchStatuses(['dsp-1'], 'review');
    expect(result).toBeNull();
  });

  it('covers download query/create/update/delete flows', async () => {
    setData([mockDownload]);
    await getAllDownloads({ category: 'template', accessTier: 'basic', query: 'planner' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('category', 'template');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('access_tier', 'basic');
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('description.ilike.%planner%'),
    );

    setSingleData(mockDownload);
    await createDownload({
      title: 'Toolkit',
      slug: 'toolkit',
      description: 'Toolkit',
      category: 'guide',
      file_url: 'downloads/toolkit.pdf',
      file_type: 'pdf',
      file_size: 1024,
      access_tier: 'premium',
    });
    expect(mockClient._queryChain.insert.mock.calls[0][0].published_at).toEqual(expect.any(String));

    setSingleError('update failed');
    const updated = await updateDownload('dl-1', { title: 'Updated' });
    expect(updated).toBeNull();

    setSingleData(mockDownload);
    const byId = await getDownloadById('dl-1');
    expect(byId?.id).toBe('dl-1');

    setError('delete failed');
    const deleted = await deleteDownload('dl-1');
    expect(deleted).toBe(false);
  });

  it('handles empty and populated bulk download tier updates', async () => {
    const empty = await bulkUpdateDownloadAccessTiers([], 'premium');
    expect(empty).toEqual({ previous: [], updated: [] });

    const previous = [mockDownload];
    const updated = [{ ...mockDownload, access_tier: 'premium' as const }];
    setFromSequence([
      { table: 'downloads', data: previous },
      { table: 'downloads', data: null },
      { table: 'downloads', data: updated },
    ]);
    const result = await bulkUpdateDownloadAccessTiers(['dl-1'], 'premium');
    expect(result).toEqual({ previous, updated });
  });

  it('covers handbook query/create/update/delete and bulk status paths', async () => {
    setData([mockHandbook]);
    await getAllHandbooks({ status: 'draft', lens: 'health', query: 'discipline' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'health');

    setSingleData(mockHandbook);
    await createHandbook({
      title: 'Field Manual',
      slug: 'field-manual',
      lens: 'politics',
      description: 'Desc',
      body: 'Body',
      access_tier: 'basic',
      status: 'published',
      author: 'The Chairman',
    });
    expect(mockClient._queryChain.insert.mock.calls[0][0].published_at).toEqual(expect.any(String));

    setSingleData(mockHandbook);
    await updateHandbook('hb-1', { status: 'published' });
    expect(mockClient._queryChain.update.mock.calls[0][0].published_at).toEqual(expect.any(String));

    setSingleData(mockHandbook);
    const byId = await getHandbookById('hb-1');
    expect(byId?.id).toBe('hb-1');

    setData([mockHandbook]);
    const byIds = await getHandbooksByIds(['hb-1']);
    expect(byIds).toHaveLength(1);

    setError('delete failed');
    const deleted = await deleteHandbook('hb-1');
    expect(deleted).toBe(false);

    const previous = [{ ...mockHandbook, id: 'hb-1', status: 'draft', published_at: '' }];
    const updated = [{ ...mockHandbook, id: 'hb-1', status: 'published' }];
    setFromSequence([
      { table: 'handbooks', data: previous },
      { table: 'handbooks', data: null },
      { table: 'handbooks', data: null },
      { table: 'handbooks', data: updated },
    ]);
    const bulk = await bulkUpdateHandbookStatuses(['hb-1'], 'published');
    expect(bulk).toEqual({ previous, updated });
  });

  it('covers course and lesson CRUD including lesson cascade in deleteCourse', async () => {
    setData([mockCourse]);
    await getAllCourses({ published: true, category: 'martial-arts', query: 'martial' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('published', true);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('category', 'martial-arts');

    setSingleData(mockCourse);
    const createdCourse = await createCourse({
      title: 'New Course',
      slug: 'new-course',
      description: 'Desc',
      category: 'purpose',
      access_tier: 'free',
      published: false,
    });
    expect(createdCourse?.id).toBe('crs-1');

    setSingleData(mockCourse);
    const byId = await getCourseById('crs-1');
    expect(byId?.id).toBe('crs-1');

    setSingleData(mockCourse);
    const updatedCourse = await updateCourse('crs-1', { published: true });
    expect(updatedCourse?.published).toBe(true);

    setData([mockLesson]);
    const lessons = await getLessonsForAdminCourse('crs-1');
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('order_number', { ascending: true });
    expect(lessons).toHaveLength(1);

    setSingleData(mockLesson);
    const lessonById = await getLessonById('lesson-1');
    expect(lessonById?.id).toBe('lesson-1');

    setSingleData(mockLesson);
    await createLesson({
      course_id: 'crs-1',
      title: 'Lesson Two',
      slug: 'lesson-two',
      order_number: 2,
      body: 'Body',
      duration: 30,
      published: false,
    });
    expect(mockClient._queryChain.insert.mock.calls[0][0].video_url).toBeNull();

    setSingleData({ ...mockLesson, published: false });
    const updatedLesson = await updateLesson('lesson-1', { published: false });
    expect(updatedLesson?.published).toBe(false);

    setError('lesson delete failed');
    const lessonDeleted = await deleteLesson('lesson-1');
    expect(lessonDeleted).toBe(false);

    setFromSequence([
      { table: 'lessons', error: { message: 'cannot delete lessons' } },
    ]);
    const cascadeFail = await deleteCourse('crs-1');
    expect(cascadeFail).toBe(false);

    setFromSequence([
      { table: 'lessons', data: null },
      { table: 'courses', data: null },
    ]);
    const cascadeSuccess = await deleteCourse('crs-1');
    expect(cascadeSuccess).toBe(true);
  });

  it('covers member queries and count functions', async () => {
    setData([mockMember]);
    await getAllMembers({ tier: 'free', role: 'member', query: 'member@' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('tier', 'free');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('role', 'member');
    expect(mockClient._queryChain.ilike).toHaveBeenCalledWith('email', '%member@%');

    setSingleData(mockMember);
    const byId = await getAdminMemberById('mem-1');
    expect(byId?.id).toBe('mem-1');

    setSingleData(mockMember);
    const updated = await updateAdminMember('mem-1', { tier: 'basic' });
    expect(updated?.tier).toBe('free');

    setFromSequence([{ table: 'members', count: 3 }]);
    const adminCount = await countAdminMembers();
    expect(adminCount).toBe(3);

    setFromSequence([{ table: 'members', error: { message: 'count failed' }, count: null }]);
    const memberCount = await getMemberCount();
    expect(memberCount).toBe(0);
  });

  it('covers contact submission query/update/count behavior', async () => {
    setData([mockSubmission]);
    await getAllContactSubmissions({ status: 'new', query: 'support' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'new');
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('internal_notes.ilike.%support%'),
    );

    setSingleData(mockSubmission);
    await updateContactSubmission('msg-1', {
      status: 'resolved',
      internal_notes: '  handled  ',
      handled_by: 'admin-1',
    });
    const resolvedPayload = mockClient._queryChain.update.mock.calls[0][0];
    expect(resolvedPayload.internal_notes).toBe('handled');
    expect(resolvedPayload.handled_at).toEqual(expect.any(String));

    setSingleData(mockSubmission);
    await updateContactSubmission('msg-1', {
      status: 'new',
      internal_notes: '   ',
    });
    const reopenedPayload = mockClient._queryChain.update.mock.calls[0][0];
    expect(reopenedPayload.internal_notes).toBeNull();
    expect(reopenedPayload.handled_at).toBeNull();

    setFromSequence([
      { table: 'contact_submissions', count: 10 },
      { table: 'contact_submissions', count: 4 },
      { table: 'contact_submissions', count: 3 },
      { table: 'contact_submissions', count: 2 },
      { table: 'contact_submissions', count: 1 },
    ]);
    const counts = await getContactSubmissionCounts();
    expect(counts).toEqual({
      total: 10,
      new: 4,
      in_progress: 3,
      resolved: 2,
      spam: 1,
    });
  });

  it('covers subscriber list filters and count aggregates', async () => {
    setData([mockSubscriber]);
    await getAllSubscribers({ active: true, query: 'home' });
    expect(mockClient._queryChain.is).toHaveBeenCalledWith('unsubscribed_at', null);
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('source.ilike.%home%'),
    );

    setData([mockSubscriber]);
    await getAllSubscribers({ active: false });
    expect(mockClient._queryChain.not).toHaveBeenCalledWith('unsubscribed_at', 'is', null);

    setFromSequence([
      { table: 'newsletter_subscribers', count: 20 },
      { table: 'newsletter_subscribers', count: 16 },
      { table: 'newsletter_subscribers', count: 4 },
    ]);
    const counts = await getSubscriberCounts();
    expect(counts).toEqual({ total: 20, active: 16, unsubscribed: 4 });
  });

  it('covers admin insight wrapper functions and command center snapshot', async () => {
    setFromByTable({
      articles: {
        data: [
          {
            id: 'art-1',
            title: 'Discipline',
            status: 'draft',
            published_at: null,
            created_at: '2026-03-20T00:00:00Z',
            lens: 'health',
            access_tier: 'free',
          },
        ],
        count: 1,
      },
      briefings: {
        data: [
          {
            id: 'br-1',
            title: 'Weekend Briefing',
            status: 'scheduled',
            published_at: '2026-03-27T00:00:00Z',
            created_at: '2026-03-21T00:00:00Z',
            issue_number: 4,
            access_tier: 'premium',
          },
        ],
        count: 1,
      },
      dispatches: {
        data: [
          {
            id: 'dsp-1',
            title: 'Dispatch',
            status: 'published',
            published_at: '2026-03-24T00:00:00Z',
            created_at: '2026-03-22T00:00:00Z',
            lens: 'culture',
          },
        ],
        count: 1,
      },
      handbooks: {
        data: [
          {
            id: 'hb-1',
            title: 'Handbook',
            status: 'review',
            published_at: null,
            created_at: '2026-03-19T00:00:00Z',
            lens: 'politics',
            access_tier: 'basic',
          },
        ],
        count: 1,
      },
      members: {
        data: [
          {
            id: 'mem-1',
            tier: 'premium',
            role: 'admin',
            stripe_customer_id: 'cus_1',
            stripe_subscription_id: null,
            created_at: '2026-03-01T00:00:00Z',
          },
        ],
        count: 1,
      },
      contact_submissions: {
        data: [
          {
            id: 'msg-1',
            name: 'Marcus',
            email: 'marcus@example.com',
            subject: 'Question',
            status: 'new',
            submitted_at: '2026-03-22T00:00:00Z',
            handled_at: null,
          },
        ],
        count: 1,
      },
      newsletter_subscribers: {
        data: [
          {
            id: 'sub-1',
            source: 'homepage',
            subscribed_at: '2026-03-10T00:00:00Z',
            unsubscribed_at: null,
          },
        ],
        count: 1,
      },
      courses: { data: [{ id: 'crs-1' }], count: 1 },
      downloads: { data: [{ id: 'dl-1' }], count: 1 },
    });

    const pipeline = await getAdminContentPipelineInsights();
    expect(pipeline.total).toBeGreaterThanOrEqual(1);

    const members = await getMemberAdminInsights();
    expect(members.total).toBeGreaterThanOrEqual(1);

    const messages = await getMessageAdminInsights();
    expect(messages.total).toBeGreaterThanOrEqual(1);

    const subscribers = await getSubscriberAdminInsights();
    expect(subscribers.total).toBeGreaterThanOrEqual(1);

    const snapshot = await getAdminCommandCenterSnapshot();
    expect(snapshot.counts.articles.total).toBeGreaterThanOrEqual(0);
    expect(snapshot.pipeline.total).toBeGreaterThanOrEqual(1);
    expect(snapshot.activity.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.members.total).toBeGreaterThanOrEqual(1);
  });

  it('covers dispatch and download by-id/by-ids fallback branches', async () => {
    setData([mockDispatch]);
    const dispatches = await getDispatchesByIds(['dsp-1']);
    expect(dispatches).toHaveLength(1);

    setError('dispatch lookup failed');
    const dispatchFail = await getDispatchesByIds(['dsp-1']);
    expect(dispatchFail).toEqual([]);

    setData([mockDownload]);
    const downloads = await getDownloadsByIds(['dl-1']);
    expect(downloads).toHaveLength(1);

    setError('downloads lookup failed');
    const downloadsFail = await getDownloadsByIds(['dl-1']);
    expect(downloadsFail).toEqual([]);
  });
});
