import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input id="test" label="Name" />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders aria-invalid="true" when error is present', () => {
    render(<Input id="test" error="Required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders aria-describedby pointing to error element when error is present', () => {
    render(<Input id="my-input" error="Field is required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'my-input-error');
    const errorEl = document.getElementById('my-input-error');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl).toHaveTextContent('Field is required');
  });

  it('does not render aria-invalid or aria-describedby when no error', () => {
    render(<Input id="test" />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('generates a stable id when none is provided', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy!);
    expect(errorEl).toBeInTheDocument();
  });

  it('shows helper text when no error', () => {
    render(<Input id="test" helperText="Some help" />);
    expect(screen.getByText('Some help')).toBeInTheDocument();
  });

  it('shows error text instead of helper when error is present', () => {
    render(<Input id="test" error="Bad value" helperText="Some help" />);
    expect(screen.getByText('Bad value')).toBeInTheDocument();
    expect(screen.queryByText('Some help')).not.toBeInTheDocument();
  });
});
