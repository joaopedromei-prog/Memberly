import { describe, it, expect, vi } from 'vitest';

// ForgotPasswordPage now redirects to /login (server-side redirect)
// Testing the redirect behavior requires a different approach

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
  it('redirects to /login', async () => {
    const { redirect } = await import('next/navigation');

    try {
      const { default: ForgotPasswordPage } = await import(
        '@/app/(auth)/forgot-password/page'
      );
      ForgotPasswordPage();
    } catch {
      // redirect throws in Next.js
    }

    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
