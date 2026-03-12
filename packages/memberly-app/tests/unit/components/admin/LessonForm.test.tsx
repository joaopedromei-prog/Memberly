import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LessonForm } from '@/components/admin/LessonForm';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockOnSuccess = vi.fn();
const mockOnCancel = vi.fn();

describe('LessonForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', title: 'Test Lesson' }),
    });
  });

  it('renders create form with empty fields', () => {
    render(
      <LessonForm
        moduleId="mod-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/título/i)).toHaveValue('');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /criar aula/i })).toBeInTheDocument();
  });

  it('renders edit form with pre-filled values', () => {
    const existingLesson = {
      id: 'lesson-1',
      module_id: 'mod-1',
      title: 'Existing Lesson',
      description: 'A description',
      video_provider: 'youtube' as const,
      video_id: 'dQw4w9WgXcQ',
      pdf_url: null,
      sort_order: 0,
      duration_minutes: 15,
      created_at: '2026-01-01T00:00:00Z',
    };

    render(
      <LessonForm
        moduleId="mod-1"
        lesson={existingLesson}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/título/i)).toHaveValue('Existing Lesson');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('A description');
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(
      <LessonForm
        moduleId="mod-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /criar aula/i }));

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits create form to correct endpoint', async () => {
    render(
      <LessonForm
        moduleId="mod-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'New Lesson' },
    });

    fireEvent.click(screen.getByRole('button', { name: /criar aula/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/modules/mod-123/lessons',
        expect.objectContaining({ method: 'POST' })
      );
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('submits edit form to correct endpoint', async () => {
    const existingLesson = {
      id: 'lesson-456',
      module_id: 'mod-1',
      title: 'Old Title',
      description: '',
      video_provider: 'youtube' as const,
      video_id: '',
      pdf_url: null,
      sort_order: 0,
      duration_minutes: null,
      created_at: '2026-01-01T00:00:00Z',
    };

    render(
      <LessonForm
        moduleId="mod-1"
        lesson={existingLesson}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Updated Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/lessons/lesson-456',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('calls onCancel when cancel button clicked', () => {
    render(
      <LessonForm
        moduleId="mod-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows video preview when valid YouTube URL is entered', async () => {
    render(
      <LessonForm
        moduleId="mod-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/id ou url do vídeo/i), {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    await waitFor(() => {
      expect(screen.getByText(/id extraído/i)).toBeInTheDocument();
      expect(screen.getByTitle('Video player')).toBeInTheDocument();
    });
  });
});
