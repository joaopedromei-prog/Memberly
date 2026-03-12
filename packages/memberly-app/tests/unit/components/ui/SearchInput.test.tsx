import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchInput } from '@/components/ui/SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with placeholder', () => {
    render(<SearchInput onChange={vi.fn()} placeholder="Buscar membros..." />);
    expect(screen.getByPlaceholderText('Buscar membros...')).toBeInTheDocument();
  });

  it('calls onChange after debounce delay', () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} delay={300} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });

    expect(onChange).not.toHaveBeenCalledWith('test');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when input has value', () => {
    render(<SearchInput onChange={vi.fn()} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(screen.getByLabelText('Limpar busca')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} delay={300} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });

    fireEvent.click(screen.getByLabelText('Limpar busca'));

    expect(input).toHaveValue('');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith('');
  });
});
