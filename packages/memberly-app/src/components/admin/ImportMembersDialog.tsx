'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toast-store';
import { Dialog } from '@/components/ui/Dialog';

interface ParsedRow {
  email: string;
  full_name: string;
  product_slug: string;
}

interface ImportResult {
  created: number;
  existing: number;
  errors: { row: number; email: string; reason: string }[];
}

interface ImportMembersDialogProps {
  onClose: () => void;
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          fields.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    fields.push(current.trim());
    return fields;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

export function ImportMembersDialog({ onClose }: ImportMembersDialogProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [allRows, setAllRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFile(file: File) {
    setParseError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCsv(text);

      const emailIdx = headers.indexOf('email');
      const nameIdx = headers.indexOf('full_name');
      const slugIdx = headers.indexOf('product_slug');

      if (emailIdx === -1 || nameIdx === -1 || slugIdx === -1) {
        setParseError('CSV deve ter colunas: email, full_name, product_slug');
        return;
      }

      const parsed: ParsedRow[] = rows
        .filter((r) => r[emailIdx]?.trim())
        .map((r) => ({
          email: r[emailIdx]?.trim() || '',
          full_name: r[nameIdx]?.trim() || '',
          product_slug: r[slugIdx]?.trim() || '',
        }));

      setAllRows(parsed);
      setPreview(parsed.slice(0, 10));
    };
    reader.readAsText(file, 'UTF-8');
  }

  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch('/api/members/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: allRows }),
      });
      if (!res.ok) throw new Error('Failed');
      const data: ImportResult = await res.json();
      setResult(data);
      addToast(`Import concluído: ${data.created} criados, ${data.existing} existentes`, 'success');
      router.refresh();
    } catch {
      addToast('Erro ao importar membros', 'error');
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={true} onClose={onClose} size="lg">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Importar Membros via CSV</h2>

      {!result && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            O CSV deve ter as colunas: <code>email</code>, <code>full_name</code>, <code>product_slug</code>
          </p>

          <div
            className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-blue-400"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500">Clique ou arraste um arquivo CSV</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {parseError && (
            <p className="mb-4 text-sm text-red-600">{parseError}</p>
          )}

          {preview.length > 0 && (
            <>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Preview ({allRows.length} linhas total)
              </p>
              <div className="mb-4 overflow-x-auto rounded border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">Produto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-gray-700">{row.email}</td>
                        <td className="px-3 py-1.5 text-gray-700">{row.full_name}</td>
                        <td className="px-3 py-1.5 text-gray-700">{row.product_slug}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || allRows.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'Importando...' : `Importar ${allRows.length} membros`}
            </button>
          </div>
        </>
      )}

      {result && (
        <>
          <div className="mb-4 space-y-2">
            <p className="text-sm text-green-700">Criados: {result.created}</p>
            <p className="text-sm text-gray-700">Já existentes: {result.existing}</p>
            {result.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-700">Erros: {result.errors.length}</p>
                <ul className="mt-1 max-h-40 overflow-y-auto text-xs text-red-600">
                  {result.errors.map((err, i) => (
                    <li key={i}>Linha {err.row}: {err.email} — {err.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
