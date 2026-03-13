'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Email ou senha incorretos.');
        setIsLoading(false);
        triggerShake();
        return;
      }

      // Role-based redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setIsLoading(false);
      triggerShake();
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] overflow-hidden font-sans text-white selection:bg-primary/30">
      {/* Noise Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: noiseSvg }}
      />

      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Orb 1: Top Left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.2,
            x: prefersReducedMotion ? 0 : [-80, 80, -80],
            y: prefersReducedMotion ? 0 : [-60, 60, -60],
          }}
          transition={{
            opacity: { duration: 2, ease: 'easeOut' },
            x: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute -top-[10%] -left-[10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-primary blur-[80px] md:blur-[120px]"
        />
        {/* Orb 2: Bottom Right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.15,
            x: prefersReducedMotion ? 0 : [-60, 60, -60],
            y: prefersReducedMotion ? 0 : [80, -80, 80],
          }}
          transition={{
            opacity: { duration: 2, ease: 'easeOut' },
            x: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute top-[60%] -right-[10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full bg-[#7C3AED] blur-[60px] md:blur-[100px]"
        />
        {/* Orb 3: Center Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.1,
            x: prefersReducedMotion ? 0 : [-40, 40, -40],
            y: prefersReducedMotion ? 0 : [-50, 50, -50],
          }}
          transition={{
            opacity: { duration: 2, ease: 'easeOut' },
            x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute bottom-[-10%] left-[30%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full bg-primary blur-[50px] md:blur-[80px]"
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ y: 30, scale: 0.97, opacity: 0 }}
          animate={
            isShaking
              ? { x: [-8, 8, -6, 6, -2, 2, 0], y: 0, scale: 1, opacity: 1 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
          }
          transition={{
            y: { duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0, 1] as [number, number, number, number] },
            scale: { duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0, 1] as [number, number, number, number] },
            opacity: { duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0, 1] as [number, number, number, number] },
            x: { duration: 0.5 },
          }}
          className="w-full max-w-md rounded-2xl border border-[#1F1F1F] bg-dark-bg/80 p-8 md:p-10 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-10 text-center"
          >
            <h1 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-white">
              Memberly
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Área de Membros</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-300"
              >
                Email
              </label>
              <div className="mt-2 relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className={`h-12 w-full rounded-xl border bg-[#0A0A0A] px-4 text-sm text-white placeholder-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-1 ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-dark-card focus:border-primary focus:ring-primary/30'
                  }`}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.98 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-300"
              >
                Senha
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                  className={`h-12 w-full rounded-xl border bg-[#0A0A0A] pl-4 pr-12 text-sm text-white placeholder-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-1 ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-dark-card focus:border-primary focus:ring-primary/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-neutral-600 transition-colors hover:text-neutral-400 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <div className="relative h-5 w-5">
                    <EyeOff
                      className={`absolute inset-0 transition-opacity duration-200 ${showPassword ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <Eye
                      className={`absolute inset-0 transition-opacity duration-200 ${showPassword ? 'opacity-0' : 'opacity-100'}`}
                    />
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-1 flex items-center gap-2 text-sm text-red-400"
                role="alert"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="pt-1"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover hover:-translate-y-[1px] hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.28 }}
              className="mt-5 text-center"
            >
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary transition-colors hover:text-primary-hover hover:underline"
              >
                Esqueci minha senha
              </Link>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.36 }}
            className="mt-8 border-t border-[#1F1F1F] pt-6 text-center"
          >
            <p className="text-xs text-neutral-600">
              Acesso exclusivo para membros
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
