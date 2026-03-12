import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '@/components/member/ProductCard';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('ProductCard', () => {
  it('renders card title', () => {
    render(<ProductCard slug="marketing" title="Marketing Digital" bannerUrl={null} progress={45} />);
    expect(screen.getByText('Marketing Digital')).toBeInTheDocument();
  });

  it('renders progress bar with label', () => {
    render(<ProductCard slug="marketing" title="Marketing" bannerUrl={null} progress={45} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('links to product page', () => {
    render(<ProductCard slug="marketing" title="Marketing" bannerUrl={null} progress={0} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/marketing');
  });

  it('shows completed badge at 100%', () => {
    render(<ProductCard slug="done" title="Concluído" bannerUrl={null} progress={100} />);
    expect(screen.getByText('✓ 100%')).toBeInTheDocument();
  });

  it('renders banner image when URL provided', () => {
    render(<ProductCard slug="curso" title="Curso" bannerUrl="/img.jpg" progress={50} />);
    const img = screen.getByAltText('Curso');
    expect(img).toBeInTheDocument();
  });

  it('renders placeholder when no banner', () => {
    const { container } = render(<ProductCard slug="curso" title="Curso" bannerUrl={null} progress={0} />);
    expect(container.querySelector('.aspect-video')).toBeInTheDocument();
  });
});
