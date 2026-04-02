/**
 * Validates the Payt postback integration key.
 * Payt sends the integration_key in the JSON body (not as a header signature).
 * We compare it against the PAYT_INTEGRATION_KEY env var.
 */
export function validatePaytIntegrationKey(
  receivedKey: string | undefined,
  expectedKey: string
): boolean {
  if (!receivedKey || !expectedKey) return false;
  return receivedKey === expectedKey;
}
