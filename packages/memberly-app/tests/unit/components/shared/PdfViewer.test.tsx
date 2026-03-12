import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdfViewer } from '@/components/shared/PdfViewer';

describe('PdfViewer', () => {
  it('renders view and download buttons', () => {
    render(<PdfViewer pdfUrl="/test.pdf" />);
    expect(screen.getByText('Material da Aula (PDF)')).toBeInTheDocument();
    expect(screen.getByText('Baixar')).toBeInTheDocument();
  });

  it('download link has correct href', () => {
    render(<PdfViewer pdfUrl="/test.pdf" />);
    const downloadLink = screen.getByText('Baixar').closest('a');
    expect(downloadLink).toHaveAttribute('href', '/test.pdf');
    expect(downloadLink).toHaveAttribute('download');
  });

  it('opens modal when view button is clicked', () => {
    render(<PdfViewer pdfUrl="/test.pdf" />);
    fireEvent.click(screen.getByText('Material da Aula (PDF)'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(<PdfViewer pdfUrl="/test.pdf" />);
    fireEvent.click(screen.getByText('Material da Aula (PDF)'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Fechar PDF'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal on Escape key press', () => {
    render(<PdfViewer pdfUrl="/test.pdf" />);
    fireEvent.click(screen.getByText('Material da Aula (PDF)'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has aria-modal attribute on dialog', () => {
    render(<PdfViewer pdfUrl="/test.pdf" />);
    fireEvent.click(screen.getByText('Material da Aula (PDF)'));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has minimum touch target size on buttons', () => {
    render(<PdfViewer pdfUrl="/test.pdf" />);
    const viewButton = screen.getByText('Material da Aula (PDF)').closest('button');
    expect(viewButton?.className).toContain('min-h-[44px]');
  });
});
