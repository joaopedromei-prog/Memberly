import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiWizardStep3 } from '@/components/admin/ai-wizard/AiWizardStep3';
import type { GeneratedStructure } from '@/types/ai';

// Mock PlaceholderBanner
vi.mock('@/components/admin/ai-wizard/PlaceholderBanner', () => ({
  PlaceholderBanner: ({ title }: { title: string }) => <div data-testid="placeholder-banner">{title}</div>,
}));

// Mock SortableList to render items without dnd complexity
vi.mock('@/components/ui/SortableList', () => ({
  SortableList: ({ items, renderItem }: { items: { id: string }[]; renderItem: (item: unknown, props: Record<string, unknown>) => React.ReactNode }) => (
    <div data-testid="sortable-list">
      {items.map((item) => (
        <div key={item.id}>{renderItem(item, {})}</div>
      ))}
    </div>
  ),
}));

const mockStructure: GeneratedStructure = {
  product: {
    title: 'Curso de React',
    description: 'Aprenda React do zero ao avançado',
    bannerSuggestion: 'Banner sugerido',
  },
  modules: [
    {
      title: 'Fundamentos',
      description: 'Conceitos básicos do React',
      bannerSuggestion: 'Banner módulo 1',
      lessons: [
        { title: 'Introdução', description: 'Visão geral', durationMinutes: 10 },
        { title: 'JSX', description: 'Sintaxe JSX', durationMinutes: 15 },
      ],
    },
    {
      title: 'Hooks',
      description: 'React Hooks em detalhes',
      bannerSuggestion: 'Banner módulo 2',
      lessons: [
        { title: 'useState', description: 'State management', durationMinutes: 20 },
      ],
    },
  ],
};

const defaultProps = {
  structure: mockStructure,
  banners: null,
  onApprove: vi.fn(),
  onRegenerate: vi.fn(),
  onBack: vi.fn(),
  isSaving: false,
};

describe('AiWizardStep3', () => {
  it('renders product title and description', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    expect(screen.getByText('Curso de React')).toBeInTheDocument();
    expect(screen.getByText('Aprenda React do zero ao avançado')).toBeInTheDocument();
  });

  it('renders all modules', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    // Module titles appear in both header and expanded inline edit
    expect(screen.getAllByText('Fundamentos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hooks').length).toBeGreaterThanOrEqual(1);
  });

  it('renders lessons within modules', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    expect(screen.getByText('Introdução')).toBeInTheDocument();
    expect(screen.getByText('JSX')).toBeInTheDocument();
    expect(screen.getByText('useState')).toBeInTheDocument();
  });

  it('shows AI badge on generated items', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    const badges = screen.getAllByText('IA');
    // Each module and lesson should have a badge
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('enables inline editing when clicking a title', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    // Click on the product title to edit
    const productTitle = screen.getByText('Curso de React');
    fireEvent.click(productTitle);
    // Should now show an input
    const input = screen.getByDisplayValue('Curso de React');
    expect(input).toBeInTheDocument();
  });

  it('updates title after inline edit', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    const productTitle = screen.getByText('Curso de React');
    fireEvent.click(productTitle);
    const input = screen.getByDisplayValue('Curso de React');
    fireEvent.change(input, { target: { value: 'Curso de Vue' } });
    fireEvent.blur(input);
    expect(screen.getByText('Curso de Vue')).toBeInTheDocument();
  });

  it('removes AI badge after editing a module title', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    const badgesBefore = screen.getAllByText('IA');
    const countBefore = badgesBefore.length;
    // Find the inline editable module title in the expanded section (h4 element)
    const moduleTitles = screen.getAllByText('Fundamentos');
    const editableTitle = moduleTitles.find((el) => el.tagName === 'H4')!;
    fireEvent.click(editableTitle);
    const input = screen.getByDisplayValue('Fundamentos');
    fireEvent.change(input, { target: { value: 'Basics' } });
    fireEvent.blur(input);
    // After editing, AI badge count should decrease (module badge removed)
    const badgesAfter = screen.getAllByText('IA');
    expect(badgesAfter.length).toBeLessThan(countBefore);
  });

  it('adds a new module when clicking "Adicionar Módulo"', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    const addBtn = screen.getByText('Adicionar Módulo');
    fireEvent.click(addBtn);
    // "Novo Módulo" appears in both header span and expanded inline edit
    expect(screen.getAllByText('Novo Módulo').length).toBeGreaterThanOrEqual(1);
  });

  it('adds a new lesson when clicking "Adicionar Aula"', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    const addLessonBtns = screen.getAllByText('Adicionar Aula');
    fireEvent.click(addLessonBtns[0]);
    expect(screen.getByText('Nova Aula')).toBeInTheDocument();
  });

  it('removes a lesson when clicking remove button', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    expect(screen.getByText('JSX')).toBeInTheDocument();
    const removeBtn = screen.getByLabelText('Remover aula JSX');
    fireEvent.click(removeBtn);
    expect(screen.queryByText('JSX')).not.toBeInTheDocument();
  });

  it('shows confirmation dialog when removing module with lessons', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    const removeBtn = screen.getByLabelText('Remover módulo Fundamentos');
    fireEvent.click(removeBtn);
    expect(screen.getByText(/Este módulo contém aulas/)).toBeInTheDocument();
  });

  it('removes module after confirming', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    const removeBtn = screen.getByLabelText('Remover módulo Fundamentos');
    fireEvent.click(removeBtn);
    const confirmBtn = screen.getByText('Remover');
    fireEvent.click(confirmBtn);
    expect(screen.queryByText('Fundamentos')).not.toBeInTheDocument();
  });

  it('shows total counts in header', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    expect(screen.getByText(/2 módulos, 3 aulas/)).toBeInTheDocument();
  });

  it('calls onApprove with edited structure', () => {
    const onApprove = vi.fn();
    render(<AiWizardStep3 {...defaultProps} onApprove={onApprove} />);
    fireEvent.click(screen.getByText('Aprovar e Criar'));
    expect(onApprove).toHaveBeenCalledTimes(1);
    const arg = onApprove.mock.calls[0][0];
    expect(arg.product.title).toBe('Curso de React');
    expect(arg.modules).toHaveLength(2);
  });

  it('calls onRegenerate when clicking Regenerar', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    fireEvent.click(screen.getByText('Regenerar'));
    expect(defaultProps.onRegenerate).toHaveBeenCalled();
  });

  it('calls onBack when clicking Voltar', () => {
    render(<AiWizardStep3 {...defaultProps} />);
    fireEvent.click(screen.getByText('Voltar'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });
});
