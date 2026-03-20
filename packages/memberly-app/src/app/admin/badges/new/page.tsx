import { BadgeForm } from '@/components/admin/BadgeForm';

export default function NewBadgePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Novo Badge</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <BadgeForm />
      </div>
    </div>
  );
}
