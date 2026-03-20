import { vi } from 'vitest';

const mockCreateNotification = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/notifications/create-notification', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

// Mock admin client with flexible chaining
const mockResults: Record<string, unknown> = {};

const mockFrom = vi.fn().mockImplementation((table: string) => {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(mockResults[table] ?? { data: null, error: null }),
      }),
    }),
  };
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { notifyCommentReply } from '@/lib/notifications/triggers/comment-reply';

describe('notifyCommentReply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should notify parent comment author on reply', async () => {
    mockResults['comments'] = {
      data: { profile_id: 'author-1', lesson_id: 'lesson-1' },
      error: null,
    };
    mockResults['profiles'] = {
      data: { full_name: 'João' },
      error: null,
    };
    mockResults['lessons'] = {
      data: { title: 'Aula de JS' },
      error: null,
    };

    await notifyCommentReply('reply-1', 'parent-1', 'replier-1');

    expect(mockCreateNotification).toHaveBeenCalledWith({
      profileId: 'author-1',
      type: 'COMMENT_REPLY',
      title: 'Nova resposta ao seu comentário',
      body: 'João respondeu ao seu comentário em Aula de JS',
      data: { lessonId: 'lesson-1', commentId: 'reply-1', parentCommentId: 'parent-1' },
    });
  });

  it('should NOT notify on self-reply', async () => {
    mockResults['comments'] = {
      data: { profile_id: 'same-user', lesson_id: 'lesson-1' },
      error: null,
    };

    await notifyCommentReply('reply-1', 'parent-1', 'same-user');

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it('should not notify when parent comment is not found', async () => {
    mockResults['comments'] = { data: null, error: null };

    await notifyCommentReply('reply-1', 'nonexistent', 'replier-1');

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it('should use fallback names when profiles/lessons are not found', async () => {
    mockResults['comments'] = {
      data: { profile_id: 'author-1', lesson_id: 'lesson-1' },
      error: null,
    };
    mockResults['profiles'] = { data: null, error: null };
    mockResults['lessons'] = { data: null, error: null };

    await notifyCommentReply('reply-1', 'parent-1', 'replier-1');

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Alguém respondeu ao seu comentário em uma aula',
      })
    );
  });
});
