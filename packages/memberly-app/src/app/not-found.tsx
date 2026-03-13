import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141414] px-4 text-center">
      <h1 className="text-6xl font-bold text-[#E50914]">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-white">
        Página não encontrada
      </h2>
      <p className="mt-2 text-sm text-neutral-400">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#E50914] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#F40612]"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
