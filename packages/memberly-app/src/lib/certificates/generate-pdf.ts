import { jsPDF } from 'jspdf';

/**
 * Generate a certificate PDF with Netflix-style dark theme.
 * A4 landscape format with member name, product title, date, and validation hash.
 */
export async function generateCertificatePDF(
  memberName: string,
  productTitle: string,
  issuedAt: Date,
  hash: string
): Promise<Buffer> {
  // A4 landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // --- Background ---
  doc.setFillColor(20, 20, 20); // #141414
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // --- Border accent ---
  doc.setDrawColor(229, 9, 20); // #e50914
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

  // --- Inner border ---
  doc.setDrawColor(42, 42, 42); // #2a2a2a
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');

  // --- Top accent line ---
  doc.setFillColor(229, 9, 20); // #e50914
  doc.rect(20, 20, pageWidth - 40, 3, 'F');

  // --- Title: CERTIFICADO DE CONCLUSÃO ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(229, 9, 20); // #e50914
  doc.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, 40, { align: 'center' });

  // --- Decorative line under title ---
  doc.setDrawColor(229, 9, 20);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, 44, pageWidth / 2 + 40, 44);

  // --- "Certificamos que" ---
  doc.setFontSize(12);
  doc.setTextColor(180, 180, 180); // light gray
  doc.text('Certificamos que', pageWidth / 2, 60, { align: 'center' });

  // --- Member name ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255); // white
  doc.text(memberName, pageWidth / 2, 78, { align: 'center' });

  // --- Underline for name ---
  const nameWidth = doc.getTextWidth(memberName);
  doc.setDrawColor(229, 9, 20);
  doc.setLineWidth(0.8);
  doc.line(
    pageWidth / 2 - nameWidth / 2,
    82,
    pageWidth / 2 + nameWidth / 2,
    82
  );

  // --- "concluiu com sucesso o curso" ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(180, 180, 180);
  doc.text('concluiu com sucesso o curso', pageWidth / 2, 96, { align: 'center' });

  // --- Product title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(229, 9, 20); // #e50914
  doc.text(productTitle, pageWidth / 2, 112, { align: 'center' });

  // --- Date ---
  const formattedDate = issuedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(150, 150, 150);
  doc.text(`Data de emissão: ${formattedDate}`, pageWidth / 2, 132, { align: 'center' });

  // --- Bottom accent line ---
  doc.setFillColor(229, 9, 20);
  doc.rect(20, pageHeight - 23, pageWidth - 40, 3, 'F');

  // --- Validation hash ---
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Código de validação: ${hash}`, pageWidth / 2, pageHeight - 30, {
    align: 'center',
  });

  // --- Platform branding ---
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Memberly', pageWidth / 2, pageHeight - 13, { align: 'center' });

  // Convert to Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
