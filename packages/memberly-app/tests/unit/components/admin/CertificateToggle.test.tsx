import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CertificateToggle } from '@/components/admin/CertificateToggle';

describe('CertificateToggle', () => {
  it('renders with disabled state', () => {
    render(<CertificateToggle enabled={false} onChange={() => {}} />);

    expect(screen.getByText('Certificado de Conclusão')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders with enabled state', () => {
    render(<CertificateToggle enabled={true} onChange={() => {}} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with toggled value when clicked', () => {
    const onChange = vi.fn();
    render(<CertificateToggle enabled={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when disabling', () => {
    const onChange = vi.fn();
    render(<CertificateToggle enabled={true} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders description text', () => {
    render(<CertificateToggle enabled={false} onChange={() => {}} />);

    expect(
      screen.getByText('Membros poderão baixar um certificado ao completar 100% do curso')
    ).toBeInTheDocument();
  });
});
