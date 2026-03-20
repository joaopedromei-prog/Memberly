import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CertificateDownloadButton } from '@/components/member/CertificateDownloadButton';

// Mock toast store
const mockAddToast = vi.fn();
vi.mock('@/stores/toast-store', () => ({
  useToastStore: (selector: (state: { addToast: typeof mockAddToast }) => unknown) =>
    selector({ addToast: mockAddToast }),
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

const defaultProps = {
  productId: 'prod-1',
  productSlug: 'curso-react',
  isComplete: true,
  certificateEnabled: true,
  completedLessons: 10,
  totalLessons: 10,
};

describe('CertificateDownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('renders download button when complete and certificate enabled', () => {
    render(<CertificateDownloadButton {...defaultProps} />);
    expect(screen.getByText('Baixar Certificado')).toBeInTheDocument();
  });

  it('does not render when isComplete is false', () => {
    render(
      <CertificateDownloadButton {...defaultProps} isComplete={false} completedLessons={7} />
    );
    expect(screen.queryByText('Baixar Certificado')).not.toBeInTheDocument();
  });

  it('does not render when certificateEnabled is false', () => {
    render(
      <CertificateDownloadButton {...defaultProps} certificateEnabled={false} />
    );
    expect(screen.queryByText('Baixar Certificado')).not.toBeInTheDocument();
  });

  it('does not render when totalLessons is 0', () => {
    render(
      <CertificateDownloadButton
        {...defaultProps}
        totalLessons={0}
        completedLessons={0}
      />
    );
    expect(screen.queryByText('Baixar Certificado')).not.toBeInTheDocument();
  });

  it('renders with "(Preview)" label when isPreview is true', () => {
    render(<CertificateDownloadButton {...defaultProps} isPreview={true} />);
    expect(screen.getByText('Baixar Certificado (Preview)')).toBeInTheDocument();
  });

  it('button is disabled in preview mode', () => {
    render(<CertificateDownloadButton {...defaultProps} isPreview={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call API when clicked in preview mode', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<CertificateDownloadButton {...defaultProps} isPreview={true} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows loading state while generating certificate', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<CertificateDownloadButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Gerando certificado...')).toBeInTheDocument();
    });
    expect(button).toBeDisabled();
  });

  it('calls API and opens certificate URL on success', async () => {
    const certificateUrl = 'https://storage.example.com/cert.pdf';
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ certificate: { certificate_url: certificateUrl } }),
    } as Response);

    render(<CertificateDownloadButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(certificateUrl, '_blank');
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/certificates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'prod-1' }),
    });
  });

  it('shows error toast when API returns error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Internal error' } }),
    } as Response);

    render(<CertificateDownloadButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        'Erro ao gerar certificado. Tente novamente.',
        'error'
      );
    });
  });

  it('shows error toast when fetch throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<CertificateDownloadButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        'Erro ao gerar certificado. Tente novamente.',
        'error'
      );
    });
  });

  it('re-enables button after successful download', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ certificate: { certificate_url: 'https://example.com/cert.pdf' } }),
    } as Response);

    render(<CertificateDownloadButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
    expect(screen.getByText('Baixar Certificado')).toBeInTheDocument();
  });

  it('re-enables button after error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('fail'));

    render(<CertificateDownloadButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
    expect(screen.getByText('Baixar Certificado')).toBeInTheDocument();
  });
});
