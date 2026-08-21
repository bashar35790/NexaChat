/**
 * E.164-ish phone normalization for the login form. The server performs NO
 * phone validation (ISSUES.md #3), so this is the only line of defense.
 * Separators are stripped silently; a missing leading `+` is added; the
 * result must be `+` + 7–15 digits starting with a nonzero country code.
 */
const SEPARATORS = /[\s\-().]/g;

export interface NormalizedPhone {
  /** Cleaned value to send to the API. */
  value: string;
  valid: boolean;
}

export function normalizePhone(raw: string): NormalizedPhone {
  let value = raw.trim().replace(SEPARATORS, "");
  if (value && !value.startsWith("+")) value = `+${value}`;
  return { value, valid: /^\+[1-9]\d{6,14}$/.test(value) };
}
