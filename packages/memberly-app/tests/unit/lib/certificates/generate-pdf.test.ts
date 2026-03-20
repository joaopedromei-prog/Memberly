import { vi } from 'vitest';

const {
  mockText,
  mockSetFillColor,
  mockSetDrawColor,
  mockSetLineWidth,
  mockRect,
  mockLine,
  mockSetFont,
  mockSetFontSize,
  mockSetTextColor,
  mockGetTextWidth,
  mockOutput,
} = vi.hoisted(() => ({
  mockText: vi.fn().mockReturnThis(),
  mockSetFillColor: vi.fn().mockReturnThis(),
  mockSetDrawColor: vi.fn().mockReturnThis(),
  mockSetLineWidth: vi.fn().mockReturnThis(),
  mockRect: vi.fn().mockReturnThis(),
  mockLine: vi.fn().mockReturnThis(),
  mockSetFont: vi.fn().mockReturnThis(),
  mockSetFontSize: vi.fn().mockReturnThis(),
  mockSetTextColor: vi.fn().mockReturnThis(),
  mockGetTextWidth: vi.fn().mockReturnValue(100),
  mockOutput: vi.fn().mockReturnValue(new ArrayBuffer(100)),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function (this: Record<string, unknown>) {
    this.text = mockText;
    this.setFillColor = mockSetFillColor;
    this.setDrawColor = mockSetDrawColor;
    this.setLineWidth = mockSetLineWidth;
    this.rect = mockRect;
    this.line = mockLine;
    this.setFont = mockSetFont;
    this.setFontSize = mockSetFontSize;
    this.setTextColor = mockSetTextColor;
    this.getTextWidth = mockGetTextWidth;
    this.output = mockOutput;
  }),
}));

import { generateCertificatePDF } from '@/lib/certificates/generate-pdf';
import { jsPDF } from 'jspdf';

describe('generateCertificatePDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a jsPDF instance with A4 landscape', async () => {
    await generateCertificatePDF('João Silva', 'Curso de Next.js', new Date('2026-03-20'), 'abc123hash');

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
  });

  it('should return a Buffer', async () => {
    const result = await generateCertificatePDF('João Silva', 'Curso de Next.js', new Date('2026-03-20'), 'abc123hash');

    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('should include the member name in the PDF', async () => {
    await generateCertificatePDF('Maria Santos', 'Curso de React', new Date('2026-03-20'), 'hash123');

    expect(mockText).toHaveBeenCalledWith(
      'Maria Santos',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should include the product title in the PDF', async () => {
    await generateCertificatePDF('Maria Santos', 'Curso de React', new Date('2026-03-20'), 'hash123');

    expect(mockText).toHaveBeenCalledWith(
      'Curso de React',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should include the validation hash in the PDF', async () => {
    await generateCertificatePDF('Test User', 'Test Course', new Date('2026-03-20'), 'myhash456');

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('myhash456'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should set dark background color #141414', async () => {
    await generateCertificatePDF('Test', 'Course', new Date(), 'hash');

    expect(mockSetFillColor).toHaveBeenCalledWith(20, 20, 20);
  });

  it('should set accent color #e50914', async () => {
    await generateCertificatePDF('Test', 'Course', new Date(), 'hash');

    expect(mockSetDrawColor).toHaveBeenCalledWith(229, 9, 20);
  });

  it('should output as arraybuffer', async () => {
    await generateCertificatePDF('Test', 'Course', new Date(), 'hash');

    expect(mockOutput).toHaveBeenCalledWith('arraybuffer');
  });
});
