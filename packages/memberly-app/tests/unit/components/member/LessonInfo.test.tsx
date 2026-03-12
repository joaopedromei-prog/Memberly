import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LessonInfo } from '@/components/member/LessonInfo';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const defaultProps = {
  lessonId: 'les-1',
  title: 'Introdução ao React',
  description: 'Nesta aula vamos aprender os conceitos básicos do React.',
  durationMinutes: 15 as number | null,
  pdfUrl: null as string | null,
  isCompleted: false,
  breadcrumbs: [
    { label: 'Home', href: '/' },
    { label: 'React', href: '/products/react' },
    { label: 'Módulo 1' },
    { label: 'Introdução ao React' },
  ],
};

describe('LessonInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  it('renders lesson title', () => {
    render(<LessonInfo {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Introdução ao React');
  });

  it('renders duration', () => {
    render(<LessonInfo {...defaultProps} />);
    expect(screen.getByText('15 min')).toBeInTheDocument();
  });

  it('renders breadcrumb', () => {
    render(<LessonInfo {...defaultProps} />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders "Marcar como concluída" button when not completed', () => {
    render(<LessonInfo {...defaultProps} />);
    const btn = screen.getByRole('button', { pressed: false });
    expect(btn).toHaveTextContent('Marcar como concluída');
  });

  it('renders "Concluída" button when completed', () => {
    render(<LessonInfo {...defaultProps} isCompleted={true} />);
    const btn = screen.getByRole('button', { pressed: true });
    expect(btn).toHaveTextContent('Concluída');
  });

  it('calls API on toggle complete', async () => {
    render(<LessonInfo {...defaultProps} />);
    fireEvent.click(screen.getByText('Marcar como concluída'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/progress/les-1', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

});
