import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  describe('variants', () => {
    it('renders primary variant classes', () => {
      render(<Button variant="primary">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('bg-blue-600');
      expect(btn).toHaveClass('text-white');
    });

    it('renders outline variant classes', () => {
      render(<Button variant="outline">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('border');
      expect(btn).toHaveClass('text-gray-700');
    });

    it('renders ghost variant classes', () => {
      render(<Button variant="ghost">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('bg-transparent');
      expect(btn).toHaveClass('text-gray-700');
    });

    it('renders danger variant classes', () => {
      render(<Button variant="danger">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('bg-red-600');
      expect(btn).toHaveClass('text-white');
    });

    it('renders text variant classes', () => {
      render(<Button variant="text">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('bg-transparent');
      expect(btn).toHaveClass('text-blue-600');
    });

    it('renders icon variant with square aspect', () => {
      render(<Button variant="icon">X</Button>);
      const btn = screen.getByRole('button', { name: 'X' });
      expect(btn).toHaveClass('aspect-square');
      expect(btn).toHaveClass('p-0');
    });
  });

  describe('sizes', () => {
    it('renders sm size classes', () => {
      render(<Button size="sm">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('h-8');
      expect(btn).toHaveClass('px-3');
      expect(btn).toHaveClass('text-xs');
    });

    it('renders md size classes', () => {
      render(<Button size="md">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('h-10');
      expect(btn).toHaveClass('px-4');
      expect(btn).toHaveClass('text-sm');
    });

    it('renders lg size classes', () => {
      render(<Button size="lg">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('h-11');
      expect(btn).toHaveClass('px-6');
      expect(btn).toHaveClass('text-base');
    });

    it('renders icon variant with sm size as square', () => {
      render(<Button variant="icon" size="sm">X</Button>);
      const btn = screen.getByRole('button', { name: 'X' });
      expect(btn).toHaveClass('h-8');
      expect(btn).toHaveClass('w-8');
    });

    it('renders icon variant with md size as square', () => {
      render(<Button variant="icon" size="md">X</Button>);
      const btn = screen.getByRole('button', { name: 'X' });
      expect(btn).toHaveClass('h-10');
      expect(btn).toHaveClass('w-10');
    });

    it('renders icon variant with lg size as square', () => {
      render(<Button variant="icon" size="lg">X</Button>);
      const btn = screen.getByRole('button', { name: 'X' });
      expect(btn).toHaveClass('h-11');
      expect(btn).toHaveClass('w-11');
    });
  });

  describe('isLoading', () => {
    it('shows "Carregando..." and disables button when isLoading', () => {
      render(<Button isLoading>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Carregando...' });
      expect(btn).toBeDisabled();
      expect(btn).not.toHaveTextContent('Click');
    });

    it('shows "Carregando..." for danger variant', () => {
      render(<Button variant="danger" isLoading>Delete</Button>);
      const btn = screen.getByRole('button', { name: 'Carregando...' });
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass('bg-red-600');
    });
  });

  describe('defaults and backward compatibility', () => {
    it('defaults to primary + md when no props', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('bg-blue-600');
      expect(btn).toHaveClass('text-white');
      expect(btn).toHaveClass('h-10');
      expect(btn).toHaveClass('px-4');
      expect(btn).toHaveClass('text-sm');
    });

    it('existing variant="primary" still works', () => {
      render(<Button variant="primary">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('bg-blue-600');
    });

    it('existing variant="outline" still works', () => {
      render(<Button variant="outline">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('border');
      expect(btn).toHaveClass('text-gray-700');
    });

    it('passes additional className', () => {
      render(<Button className="mt-4">Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toHaveClass('mt-4');
    });

    it('passes native button props', () => {
      render(<Button type="submit" data-testid="submit-btn">Click</Button>);
      const btn = screen.getByTestId('submit-btn');
      expect(btn).toHaveAttribute('type', 'submit');
    });

    it('disabled prop works', () => {
      render(<Button disabled>Click</Button>);
      const btn = screen.getByRole('button', { name: 'Click' });
      expect(btn).toBeDisabled();
    });
  });
});
