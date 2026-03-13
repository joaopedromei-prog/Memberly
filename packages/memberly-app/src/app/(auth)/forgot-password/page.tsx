'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const shouldReduceMotion = useReducedMotion();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, informe seu email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, informe um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError('Erro ao enviar email. Tente novamente.');
        setIsLoading(false);
        return;
      }

      setIsSent(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark-bg-deep font-sans text-white selection:bg-primary/30">
      {/* Background Layer */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          {/* Orb 1 */}
          <motion.div
            animate={shouldReduceMotion ? {} : {
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 top-0 h-[250px] w-[250px] rounded-full bg-primary opacity-15 mix-blend-screen blur-[70px] md:h-[500px] md:w-[500px] md:blur-[100px]"
          />
          {/* Orb 2 */}
          <motion.div
            animate={shouldReduceMotion ? {} : {
              x: [0, -80, 60, 0],
              y: [0, 80, -40, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 right-0 h-[200px] w-[200px] rounded-full bg-[#7C3AED] opacity-12 mix-blend-screen blur-[60px] md:h-[400px] md:w-[400px] md:blur-[80px]"
          />
          {/* Orb 3 */}
          <motion.div
            animate={shouldReduceMotion ? {} : {
              x: [0, 50, -50, 0],
              y: [0, 50, -50, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/2 top-1/2 h-[175px] w-[175px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-8 mix-blend-screen blur-[50px] md:h-[350px] md:w-[350px] md:blur-[70px]"
          />
        </motion.div>

        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Card Layer */}
      <div className="relative z-10 flex w-full justify-center px-4">
        <motion.div
          initial={{ y: 30, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-2xl border border-dark-input bg-dark-bg/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          {/* Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold leading-none tracking-[-0.02em] text-white md:text-[32px]">
              Memberly
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Área de Membros</p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {!isSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Lock Icon */}
                <div className="mb-6 text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="relative mx-auto h-16 w-16"
                  >
                    <motion.div
                      animate={shouldReduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full border border-dark-card bg-dark-surface"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-7 w-7 text-neutral-400" />
                    </div>
                  </motion.div>
                </div>

                {/* Description */}
                <div className="mb-6 text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-lg font-semibold text-white"
                  >
                    Esqueceu sua senha?
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.88 }}
                    className="mt-2 text-sm leading-relaxed text-neutral-400"
                  >
                    Informe seu email e enviaremos um link para redefinir sua senha.
                  </motion.p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.96 }}
                  >
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-dark-card bg-dark-bg-deep px-4 text-white transition-all duration-200 placeholder:text-neutral-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      required
                    />
                    {error && (
                      <p className="mt-2 flex items-center gap-2 text-sm text-red-400" role="alert">
                        {error}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.04 }}
                  >
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Enviar link de recuperação'
                      )}
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.12 }}
                    className="mt-5 text-center"
                  >
                    <Link
                      href="/login"
                      className="inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-hover hover:underline"
                    >
                      Voltar ao login
                    </Link>
                  </motion.div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {/* Success Icon */}
                <div className="mb-6 text-center">
                  <div className="relative mx-auto h-16 w-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="absolute inset-0 rounded-full border border-accent-success/30 bg-accent-success/10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8 text-accent-success"
                      >
                        <motion.polyline
                          points="20 6 9 17 4 12"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="mb-6 text-center">
                  <h2 className="mb-2 text-lg font-semibold text-white">
                    Email enviado!
                  </h2>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-neutral-400">
                    Se o email estiver cadastrado, você receberá um link de recuperação em instantes.
                  </p>
                </div>

                {/* Info Box */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-dark-card bg-dark-surface p-4">
                  <Mail className="h-5 w-5 shrink-0 text-neutral-500" />
                  <p className="text-sm text-neutral-400">
                    Verifique também sua pasta de spam
                  </p>
                </div>

                {/* Actions */}
                <Link
                  href="/login"
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-dark-card bg-dark-surface font-semibold text-white transition-colors duration-200 hover:bg-dark-card"
                >
                  Voltar ao login
                </Link>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSent(false);
                      setEmail('');
                      setError('');
                    }}
                    className="inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
                  >
                    Não recebeu? Reenviar email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
