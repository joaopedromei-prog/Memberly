import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { CheckCircle2, XCircle, Download, ShieldCheck } from 'lucide-react';

interface CertificateData {
  id: string;
  hash: string;
  issued_at: string;
  certificate_url: string | null;
  profiles: { full_name: string } | null;
  products: { title: string } | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  const supabase = createAdminClient();

  const { data: certificate } = await supabase
    .from('certificates')
    .select('profiles(full_name), products(title)')
    .eq('hash', hash)
    .maybeSingle();

  if (!certificate) {
    return { title: 'Certificado Inválido — Memberly' };
  }

  const profiles = certificate.profiles as unknown as { full_name: string } | null;
  const products = certificate.products as unknown as { title: string } | null;
  const memberName = profiles?.full_name ?? 'Membro';
  const productTitle = products?.title ?? 'Curso';

  return {
    title: `Certificado de ${memberName} — ${productTitle} — Memberly`,
    description: `Certificado de conclusão de ${memberName} no curso ${productTitle}.`,
  };
}

export default async function CertificateValidationPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const supabase = createAdminClient();

  const { data: certificate } = await supabase
    .from('certificates')
    .select('id, hash, issued_at, certificate_url, profiles(full_name), products(title)')
    .eq('hash', hash)
    .maybeSingle();

  if (!certificate) {
    return <InvalidCertificate />;
  }

  const certData: CertificateData = {
    id: certificate.id,
    hash: certificate.hash,
    issued_at: certificate.issued_at,
    certificate_url: certificate.certificate_url,
    profiles: certificate.profiles as unknown as { full_name: string } | null,
    products: certificate.products as unknown as { title: string } | null,
  };

  return <ValidCertificate certificate={certData} />;
}

function ValidCertificate({ certificate }: { certificate: CertificateData }) {
  const memberName = certificate.profiles?.full_name ?? 'Membro';
  const productTitle = certificate.products?.title ?? 'Produto';
  const issuedAt = new Date(certificate.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-lg">
      {/* Card */}
      <div className="rounded-2xl border border-primary/30 bg-dark-surface p-8 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="mb-6 text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold text-white">Validação de Certificado</h1>
          <p className="mt-1 text-sm text-neutral-500">Memberly</p>
        </div>

        {/* Valid Badge */}
        <div className="mb-6 flex justify-center">
          <span
            data-testid="valid-badge"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20"
          >
            <CheckCircle2 className="h-4 w-4" />
            Certificado Válido
          </span>
        </div>

        {/* Certificate Details */}
        <div className="space-y-4 rounded-xl bg-dark-card p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Membro
            </p>
            <p data-testid="member-name" className="mt-1 text-lg font-semibold text-white">
              {memberName}
            </p>
          </div>
          <div className="border-t border-neutral-800" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Curso
            </p>
            <p data-testid="product-title" className="mt-1 text-lg font-semibold text-white">
              {productTitle}
            </p>
          </div>
          <div className="border-t border-neutral-800" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Data de Emissão
            </p>
            <p data-testid="issued-at" className="mt-1 text-base text-white">
              {issuedAt}
            </p>
          </div>
        </div>

        {/* Download Button */}
        {certificate.certificate_url && (
          <div className="mt-6">
            <a
              href={certificate.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="download-pdf"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Download className="h-4 w-4" />
              Baixar Certificado (PDF)
            </a>
          </div>
        )}

        {/* Hash */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-600 break-all">
            Código: {certificate.hash}
          </p>
        </div>
      </div>
    </div>
  );
}

function InvalidCertificate() {
  return (
    <div className="w-full max-w-lg">
      <div className="rounded-2xl border border-neutral-800 bg-dark-surface p-8 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="mb-6 text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <h1 className="text-2xl font-bold text-white">Validação de Certificado</h1>
          <p className="mt-1 text-sm text-neutral-500">Memberly</p>
        </div>

        {/* Invalid Badge */}
        <div className="mb-6 flex justify-center">
          <span
            data-testid="invalid-badge"
            className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 ring-1 ring-red-500/20"
          >
            <XCircle className="h-4 w-4" />
            Certificado Não Encontrado
          </span>
        </div>

        {/* Message */}
        <div className="rounded-xl bg-dark-card p-5 text-center">
          <p data-testid="invalid-message" className="text-sm text-neutral-400">
            O certificado com este código de validação não foi encontrado.
            Verifique se o link está correto ou entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
