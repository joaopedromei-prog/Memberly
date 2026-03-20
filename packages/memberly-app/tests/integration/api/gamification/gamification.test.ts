import { vi } from 'vitest';

// --- Scenario config ---
let mockScenario = {
  authenticated: true,
  queryResult: null as unknown,
  queryError: null as { message: string } | null,
  evaluateBadgesResult: [] as string[],
  evaluateBadgesError: false,
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

vi.mock('@/lib/gamification/badge-engine', () => ({
  evaluateBadges: vi.fn().mockImplementation(() => {
    if (mockScenario.evaluateBadgesError) {
      throw new Error('Evaluation failed');
    }
    return Promise.resolve(mockScenario.evaluateBadgesResult);
  }),
}));

// Import after mocks
import { GET as getBadges } from '@/app/api/gamification/badges/route';
import { GET as getStreak } from '@/app/api/gamification/streak/route';
import { GET as getProfile } from '@/app/api/gamification/profile/route';
import { POST as checkBadges } from '@/app/api/gamification/check/route';

function resetScenario() {
  mockScenario = {
    authenticated: true,
    queryResult: null,
    queryError: null,
    evaluateBadgesResult: [],
    evaluateBadgesError: false,
  };
}

const sampleBadges = [
  {
    id: 'badge-1',
    name: 'Primeira Aula',
    description: 'Completou a primeira aula',
    icon: 'first-lesson',
    criteria: { type: 'first_lesson', threshold: 1 },
    active: true,
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'badge-2',
    name: 'Streak de 7 dias',
    description: 'Manteve streak por 7 dias',
    icon: 'streak-7',
    criteria: { type: 'streak', threshold: 7 },
    active: true,
    created_at: '2026-03-02T00:00:00.000Z',
  },
];

const sampleMemberBadges = [
  { badge_id: 'badge-1', unlocked_at: '2026-03-15T10:00:00.000Z' },
];

const sampleStreak = {
  current_streak: 5,
  longest_streak: 12,
  last_activity_date: '2026-03-20',
};

// ========================
// GET /api/gamification/badges
// ========================
describe('GET /api/gamification/badges', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should return badges with unlock status', async () => {
    // The chainable proxy returns the same result for all .from() calls.
    // We need to differentiate by table name.
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'badges') {
        return chainable({ data: sampleBadges, error: null });
      }
      if (table === 'member_badges') {
        return chainable({ data: sampleMemberBadges, error: null });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getBadges();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    // badge-1 is unlocked
    expect(data[0].unlocked).toBe(true);
    expect(data[0].unlocked_at).toBe('2026-03-15T10:00:00.000Z');
    // badge-2 is not unlocked
    expect(data[1].unlocked).toBe(false);
    expect(data[1].unlocked_at).toBeNull();
  });

  it('should return empty array when no active badges', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'badges') {
        return chainable({ data: [], error: null });
      }
      if (table === 'member_badges') {
        return chainable({ data: [], error: null });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getBadges();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(0);
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const response = await getBadges();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 on database error', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'badges') {
        return chainable({ data: null, error: { message: 'DB error' } });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getBadges();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});

// ========================
// GET /api/gamification/streak
// ========================
describe('GET /api/gamification/streak', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should return streak data for authenticated user', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'streaks') {
        return chainable({ data: sampleStreak, error: null });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getStreak();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.current_streak).toBe(5);
    expect(data.longest_streak).toBe(12);
    expect(data.last_activity_date).toBe('2026-03-20');
  });

  it('should return defaults when no streak exists', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'streaks') {
        return chainable({ data: null, error: null });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getStreak();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.current_streak).toBe(0);
    expect(data.longest_streak).toBe(0);
    expect(data.last_activity_date).toBeNull();
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const response = await getStreak();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 on database error', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'streaks') {
        return chainable({ data: null, error: { message: 'DB error' } });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getStreak();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});

// ========================
// GET /api/gamification/profile
// ========================
describe('GET /api/gamification/profile', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should return combined badges and streak data', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'badges') {
        return chainable({ data: sampleBadges, error: null });
      }
      if (table === 'member_badges') {
        return chainable({ data: sampleMemberBadges, error: null });
      }
      if (table === 'streaks') {
        return chainable({ data: sampleStreak, error: null });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getProfile();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toHaveLength(2);
    expect(data.badges[0].unlocked).toBe(true);
    expect(data.badges[1].unlocked).toBe(false);
    expect(data.streak.current_streak).toBe(5);
    expect(data.streak.longest_streak).toBe(12);
  });

  it('should return defaults when no streak and no badges', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'badges') {
        return chainable({ data: [], error: null });
      }
      if (table === 'member_badges') {
        return chainable({ data: [], error: null });
      }
      if (table === 'streaks') {
        return chainable({ data: null, error: null });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getProfile();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toHaveLength(0);
    expect(data.streak.current_streak).toBe(0);
    expect(data.streak.longest_streak).toBe(0);
    expect(data.streak.last_activity_date).toBeNull();
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const response = await getProfile();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 on database error', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'badges') {
        return chainable({ data: null, error: { message: 'DB error' } });
      }
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await getProfile();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});

// ========================
// POST /api/gamification/check
// ========================
describe('POST /api/gamification/check', () => {
  beforeEach(() => {
    resetScenario();
    vi.clearAllMocks();
  });

  it('should return newly unlocked badge IDs', async () => {
    mockScenario.evaluateBadgesResult = ['badge-1', 'badge-3'];

    // profiles query for auth
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await checkBadges();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.unlocked).toEqual(['badge-1', 'badge-3']);
  });

  it('should return empty array when no new badges unlocked', async () => {
    mockScenario.evaluateBadgesResult = [];

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await checkBadges();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.unlocked).toEqual([]);
  });

  it('should return 401 when not authenticated', async () => {
    mockScenario.authenticated = false;

    const response = await checkBadges();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 when evaluateBadges throws', async () => {
    mockScenario.evaluateBadgesError = true;

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return chainable({ data: { role: 'member' }, error: null });
      }
      return chainable({ data: null, error: null });
    });

    const response = await checkBadges();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('EVALUATION_ERROR');
  });
});
