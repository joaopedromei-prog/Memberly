'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
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
    <Card>
      {isSent ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Se o email estiver cadastrado, você receberá um link de recuperação.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-blue-600 hover:text-blue-700"
          >
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Informe seu email para receber um link de recuperação de senha.
          </p>

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" isLoading={isLoading}>
            Enviar link de recuperação
          </Button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Voltar ao login
            </Link>
          </p>
        </form>
      )}
    </Card>
  );
}
