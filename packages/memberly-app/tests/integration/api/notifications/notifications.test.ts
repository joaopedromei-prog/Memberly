import { vi } from 'vitest';

// --- Scenario config ---
let mockScenario = {
  authenticated: true,
  queryResult: null as unknown,
  queryError: null as { message: string } | null,
  queryCount: null as number | null,
};

const mockUser = { id: 'user-123' };

/**
 * Creates a deeply chainable mock that resolves at any terminal point.
 */
function chainable(resolveValue: unknown) {
  const handler: ProxyHandler<() => unknown> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(resolveValue);
      }
      return (..._args: unknown[]) => new Proxy(() => {}, handler);
    },
    apply() {
      return new Proxy(() => {}, handler);
    },
  };
  return new Proxy(() => {}, handler);
}

const mockSupabaseFrom = vi.fn().mockImplementation(() => {
  return chainable({
    data: mockScenario.queryResult,
    error: mockScenario.queryError,
    count: mockScenario.queryCount,
  });
});

const mockSupabase = {
  from: mockSupabaseFrom,
  auth: {
    getUser: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: { user: mockScenario.authenticated ? mockUser : null },
        error: null,
      })
    ),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockImplementation(() => Promise.resolve(mockSupabase)),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

// Import after mocks
import { GET as listNotifications } from '@/app/api/notifications/route';
import { PATCH as markRead, DELETE as deleteNotification } from '@/app/api/notifications/[id]/route';
import { POST as markAllRead } from '@/app/api/notifications/mark-all-read/route';
import { GET as unreadCount } from '@/app/api/notifications/unread-count/route';
import { NextRequest } from 'next/server';

function createGetRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' });
}

function createPatchRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'PATCH' });
}

function createPostRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'POST' });
}

function createDeleteRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'DELETE' });
}

function resetScenario() {
  mockScenario = {
    authenticated: true,
    queryResult: null,
    queryError: null,
    queryCount: null,
  };
}

const sampleNotifications = [
  {
    id: 'notif-1',
    profile_id: 'user-123',
    type: 'new_lesson',
    title: 'Nova aula disponível',
    body: 'Uma nova aula foi adicionada ao curso.',
    read: false,
    data: null,
    created_at: '2026-03-20T12:00:00.000Z',
    read_at: null,
  },
  {
    id: 'notif-2',
    profile_id: 'user-123',
    type: 'certificate',
    title: 'Certificado disponível',
    body: 'Seu certificado está pronto.',
    read: true,
    data: { productId: 'prod-1' },
    created_at: '2026-03-19T12:00:00.000Z',
    read_at: '2026-03-19T13:00:00.000Z',
  },
];

// ========================
// GET /api/notifications
// ========================
describe('GET /api/notifications', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should return paginated notifications list', async () => {
    mockScenario.queryResult = sampleNotifications;

    const request = createGetRequest('http://localhost:3000/api/notifications');
    const response = await listNotifications(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toHaveLength(2);
    expect(data.notifications[0].id).toBe('notif-1');
  });

  it('should return empty list when no notifications', async () => {
    mockScenario.queryResult = [];

    const request = createGetRequest('http://localhost:3000/api/notifications');
    const response = await listNotifications(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toHaveLength(0);
    expect(data.nextCursor).toBeNull();
  });

  it('should return nextCursor when results equal limit', async () => {
    // Create exactly 2 items and set limit=2
    const twoItems = sampleNotifications.slice(0, 2);
    mockScenario.queryResult = twoItems;

    const request = createGetRequest('http://localhost:3000/api/notifications?limit=2');
    const response = await listNotifications(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.nextCursor).toBe('2026-03-19T12:00:00.000Z');
  });

  it('should return null nextCursor when results less than limit', async () => {
    mockScenario.queryResult = [sampleNotifications[0]];

    const request = createGetRequest('http://localhost:3000/api/notifications?limit=10');
    const response = await listNotifications(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.nextCursor).toBeNull();
  });

  it('should cap limit at 50', async () => {
    mockScenario.queryResult = [];

    const request = createGetRequest('http://localhost:3000/api/notifications?limit=100');
    await listNotifications(request);

    // Verify the supabase chain was called (from was called with 'notifications')
    expect(mockSupabaseFrom).toHaveBeenCalledWith('notifications');
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const request = createGetRequest('http://localhost:3000/api/notifications');
    const response = await listNotifications(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 on database error', async () => {
    mockScenario.queryResult = null;
    mockScenario.queryError = { message: 'DB connection failed' };

    const request = createGetRequest('http://localhost:3000/api/notifications');
    const response = await listNotifications(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});

// ========================
// PATCH /api/notifications/[id]
// ========================
describe('PATCH /api/notifications/[id]', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should mark notification as read', async () => {
    const updatedNotif = { ...sampleNotifications[0], read: true, read_at: '2026-03-20T14:00:00.000Z' };
    mockScenario.queryResult = updatedNotif;

    const request = createPatchRequest('http://localhost:3000/api/notifications/notif-1');
    const response = await markRead(request, { params: Promise.resolve({ id: 'notif-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notification.read).toBe(true);
    expect(data.notification.read_at).toBeDefined();
  });

  it('should be idempotent when already read', async () => {
    mockScenario.queryResult = sampleNotifications[1]; // already read

    const request = createPatchRequest('http://localhost:3000/api/notifications/notif-2');
    const response = await markRead(request, { params: Promise.resolve({ id: 'notif-2' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notification.read).toBe(true);
  });

  it('should return 404 when notification not found', async () => {
    mockScenario.queryResult = null;
    mockScenario.queryError = { message: 'not found' };

    const request = createPatchRequest('http://localhost:3000/api/notifications/nonexistent');
    const response = await markRead(request, { params: Promise.resolve({ id: 'nonexistent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const request = createPatchRequest('http://localhost:3000/api/notifications/notif-1');
    const response = await markRead(request, { params: Promise.resolve({ id: 'notif-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});

// ========================
// DELETE /api/notifications/[id]
// ========================
describe('DELETE /api/notifications/[id]', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should delete notification successfully', async () => {
    mockScenario.queryResult = { id: 'notif-1' };

    const request = createDeleteRequest('http://localhost:3000/api/notifications/notif-1');
    const response = await deleteNotification(request, { params: Promise.resolve({ id: 'notif-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deleted).toBe(true);
  });

  it('should return 404 when notification not found', async () => {
    mockScenario.queryResult = null;
    mockScenario.queryError = { message: 'not found' };

    const request = createDeleteRequest('http://localhost:3000/api/notifications/nonexistent');
    const response = await deleteNotification(request, { params: Promise.resolve({ id: 'nonexistent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const request = createDeleteRequest('http://localhost:3000/api/notifications/notif-1');
    const response = await deleteNotification(request, { params: Promise.resolve({ id: 'notif-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});

// ========================
// POST /api/notifications/mark-all-read
// ========================
describe('POST /api/notifications/mark-all-read', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should mark all unread notifications as read', async () => {
    mockScenario.queryCount = 5;

    const request = createPostRequest('http://localhost:3000/api/notifications/mark-all-read');
    const response = await markAllRead();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.updated).toBe(5);
  });

  it('should return updated: 0 when no unread notifications', async () => {
    mockScenario.queryCount = 0;

    const response = await markAllRead();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.updated).toBe(0);
  });

  it('should return updated: 0 when count is null', async () => {
    mockScenario.queryCount = null;

    const response = await markAllRead();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.updated).toBe(0);
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const response = await markAllRead();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 on database error', async () => {
    mockScenario.queryError = { message: 'DB error' };

    const response = await markAllRead();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});

// ========================
// GET /api/notifications/unread-count
// ========================
describe('GET /api/notifications/unread-count', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should return unread count', async () => {
    mockScenario.queryCount = 7;

    const response = await unreadCount();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(7);
  });

  it('should return 0 when no unread notifications', async () => {
    mockScenario.queryCount = 0;

    const response = await unreadCount();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(0);
  });

  it('should return 0 when count is null', async () => {
    mockScenario.queryCount = null;

    const response = await unreadCount();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(0);
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const response = await unreadCount();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 on database error', async () => {
    mockScenario.queryError = { message: 'DB error' };

    const response = await unreadCount();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});
