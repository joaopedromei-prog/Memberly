'use client';

interface CertificateToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function CertificateToggle({ enabled, onChange }: CertificateToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-dark-surface rounded-lg border border-white/10">
      <div>
        <h3 className="text-sm font-medium text-white">Certificado de Conclusão</h3>
        <p className="text-xs text-gray-400 mt-1">
          Membros poderão baixar um certificado ao completar 100% do curso
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
