import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} totalItems={5} onPageChange={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders total items count', () => {
    render(
      <Pagination page={1} totalPages={3} totalItems={50} onPageChange={vi.fn()} />
    );
    expect(screen.getByText('50 resultados')).toBeInTheDocument();
  });

  it('renders singular form for 1 result', () => {
    render(
      <Pagination page={1} totalPages={2} totalItems={1} onPageChange={vi.fn()} />
    );
    expect(screen.getByText('1 resultado')).toBeInTheDocument();
  });

  it('calls onPageChange when next is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={3} totalItems={50} onPageChange={onPageChange} />
    );

    const nextButtons = screen.getAllByText('›');
    fireEvent.click(nextButtons[0]);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination page={1} totalPages={3} totalItems={50} onPageChange={vi.fn()} />
    );

    const prevButtons = screen.getAllByText('‹');
    expect(prevButtons[0]).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination page={3} totalPages={3} totalItems={50} onPageChange={vi.fn()} />
    );

    const nextButtons = screen.getAllByText('›');
    expect(nextButtons[0]).toBeDisabled();
  });

  it('highlights current page', () => {
    render(
      <Pagination page={2} totalPages={5} totalItems={100} onPageChange={vi.fn()} />
    );

    const page2Button = screen.getByText('2');
    expect(page2Button).toHaveClass('bg-blue-600');
  });
});
