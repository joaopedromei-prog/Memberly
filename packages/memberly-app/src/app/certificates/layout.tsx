import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Validação de Certificado — Memberly',
  description: 'Verifique a autenticidade de um certificado de conclusão.',
};

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      {children}
    </div>
  );
}
