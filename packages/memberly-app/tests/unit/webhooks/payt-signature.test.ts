import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { validatePaytSignature } from '@/lib/webhooks/payt-signature';

const SECRET = 'test-secret-key';

function sign(body: string): string {
  return createHmac('sha256', SECRET).update(body).digest('hex');
}

describe('validatePaytSignature', () => {
  it('returns true for valid signature', () => {
    const body = '{"test":"data"}';
    const signature = sign(body);
    expect(validatePaytSignature(signature, body, SECRET)).toBe(true);
  });

  it('returns false for invalid signature', () => {
    const body = '{"test":"data"}';
    expect(validatePaytSignature('invalid-sig', body, SECRET)).toBe(false);
  });

  it('returns false for null signature', () => {
    const body = '{"test":"data"}';
    expect(validatePaytSignature(null, body, SECRET)).toBe(false);
  });

  it('returns false for tampered body', () => {
    const body = '{"test":"data"}';
    const signature = sign(body);
    expect(validatePaytSignature(signature, '{"test":"tampered"}', SECRET)).toBe(false);
  });

  it('returns false for wrong secret', () => {
    const body = '{"test":"data"}';
    const signature = sign(body);
    expect(validatePaytSignature(signature, body, 'wrong-secret')).toBe(false);
  });
});
