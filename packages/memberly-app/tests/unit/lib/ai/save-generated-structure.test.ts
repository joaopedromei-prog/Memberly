import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockSingle = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  delete: mockDelete,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}));

const validStructure = {
  product: {
    title: 'Curso de Marketing Digital',
    description: 'Um curso completo.',
    bannerSuggestion: 'Banner descritivo',
  },
  modules: [
    {
      title: 'Módulo 1',
      description: 'Introdução',
      bannerSuggestion: 'Banner módulo',
      lessons: [
        { title: 'Aula 1', description: 'Conceitos', durationMinutes: 15 },
        { title: 'Aula 2', description: 'Prática', durationMinutes: 20 },
        { title: 'Aula 3', description: 'Exercícios', durationMinutes: 10 },
      ],
    },
    {
      title: 'Módulo 2',
      description: 'Avançado',
      bannerSuggestion: 'Banner avançado',
      lessons: [
        { title: 'Aula 1', description: 'SEO', durationMinutes: 30 },
      ],
    },
  ],
};

describe('saveGeneratedStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      insert: mockInsert,
      delete: mockDelete,
    });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  it('creates product, modules, and lessons in correct order', async () => {
    const productId = 'prod-123';
    const moduleIds = ['mod-1', 'mod-2'];
    let moduleInsertCount = 0;

    // Product insert
    mockSingle.mockResolvedValueOnce({ data: { id: productId }, error: null });
    // Module 1 insert
    mockSingle.mockResolvedValueOnce({ data: { id: moduleIds[0] }, error: null });
    // Module 2 insert
    mockSingle.mockResolvedValueOnce({ data: { id: moduleIds[1] }, error: null });

    // Lessons inserts (batch)
    mockInsert.mockImplementation((data) => {
      if (Array.isArray(data)) {
        // Lessons batch insert
        return { error: null };
      }
      // Single insert (product/module)
      moduleInsertCount++;
      return { select: mockSelect };
    });

    const { saveGeneratedStructure } = await import('@/lib/ai/save-generated-structure');
    const result = await saveGeneratedStructure(validStructure);

    expect(result).toEqual({ productId });

    // Verify product created with slug and draft status
    expect(mockFrom).toHaveBeenCalledWith('products');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Curso de Marketing Digital',
        slug: 'curso-de-marketing-digital',
        is_published: false,
      })
    );

    // Verify modules created
    expect(mockFrom).toHaveBeenCalledWith('modules');

    // Verify lessons created
    expect(mockFrom).toHaveBeenCalledWith('lessons');
  });

  it('rolls back product on module creation failure', async () => {
    const productId = 'prod-456';

    mockSingle
      .mockResolvedValueOnce({ data: { id: productId }, error: null }) // product
      .mockResolvedValueOnce({ data: null, error: { message: 'Module insert failed' } }); // module fail

    const { saveGeneratedStructure } = await import('@/lib/ai/save-generated-structure');
    await expect(saveGeneratedStructure(validStructure)).rejects.toThrow('Erro ao criar módulo');

    // Verify rollback was attempted
    expect(mockFrom).toHaveBeenCalledWith('products');
    expect(mockDelete).toBeDefined();
  });

  it('throws on product creation failure', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Duplicate slug' },
    });

    const { saveGeneratedStructure } = await import('@/lib/ai/save-generated-structure');
    await expect(saveGeneratedStructure(validStructure)).rejects.toThrow('Erro ao criar produto');
  });
});
