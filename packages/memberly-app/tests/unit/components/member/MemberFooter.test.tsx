import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemberFooter } from '@/components/member/MemberFooter';

describe('MemberFooter', () => {
  it('renders support link', () => {
    render(<MemberFooter />);
    expect(screen.getByText('Suporte')).toBeInTheDocument();
  });

  it('renders terms link', () => {
    render(<MemberFooter />);
    expect(screen.getByText('Termos de Uso')).toBeInTheDocument();
  });

  it('renders privacy link', () => {
    render(<MemberFooter />);
    expect(screen.getByText('Privacidade')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<MemberFooter />);
    expect(screen.getByText(/© 2026 Memberly/)).toBeInTheDocument();
  });
});
