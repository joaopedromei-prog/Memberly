import { describe, it, expect } from 'vitest';
import { validatePaytIntegrationKey } from '@/lib/webhooks/payt-signature';

const VALID_KEY = '3d37f538e7f1b7fc6b2622e986096a8f';

describe('validatePaytIntegrationKey', () => {
  it('returns true for matching integration key', () => {
    expect(validatePaytIntegrationKey(VALID_KEY, VALID_KEY)).toBe(true);
  });

  it('returns false for mismatched key', () => {
    expect(validatePaytIntegrationKey('wrong-key', VALID_KEY)).toBe(false);
  });

  it('returns false for undefined key', () => {
    expect(validatePaytIntegrationKey(undefined, VALID_KEY)).toBe(false);
  });

  it('returns false for empty string key', () => {
    expect(validatePaytIntegrationKey('', VALID_KEY)).toBe(false);
  });

  it('returns false when expected key is empty', () => {
    expect(validatePaytIntegrationKey(VALID_KEY, '')).toBe(false);
  });
});
