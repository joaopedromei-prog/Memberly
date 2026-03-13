import Link from 'next/link';
import { Plus, Grid, Users } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-[18px] font-semibold text-slate-900 mb-6">
        Ações Rápidas
      </h2>
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-150 text-left group w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-slate-900">
              Novo Produto
            </p>
            <p className="text-[14px] text-slate-500">Criar um novo curso</p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-150 text-left group w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
            <Grid className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-slate-900">
              Gerenciar Produtos
            </p>
            <p className="text-[14px] text-slate-500">Ver e editar cursos</p>
          </div>
        </Link>

        <Link
          href="/admin/members"
          className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-150 text-left group w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-slate-900">
              Gerenciar Membros
            </p>
            <p className="text-[14px] text-slate-500">
              Ver e gerenciar acessos
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
