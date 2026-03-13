export function MemberFooter() {
  return (
    <footer className="bg-dark-bg-deep px-4 py-8 md:px-8 lg:px-16">
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <a href="#" className="text-sm text-neutral-400 transition-colors hover:text-neutral-200">
          Suporte
        </a>
        <a href="#" className="text-sm text-neutral-400 transition-colors hover:text-neutral-200">
          Termos de Uso
        </a>
        <a href="#" className="text-sm text-neutral-400 transition-colors hover:text-neutral-200">
          Privacidade
        </a>
      </div>
      <p className="mt-6 text-xs text-neutral-500">
        &copy; 2026 Memberly. Todos os direitos reservados.
      </p>
    </footer>
  );
}
