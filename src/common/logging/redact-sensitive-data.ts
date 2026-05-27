const SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authorization',
  'cookie',
  'set-cookie',
  'clientSecret',
  'secret',
  'apiKey',
  'api_key',
]);

export const REDACTED_VALUE = '[REDACTED]';

export const PINO_REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'authorization',
  'cookie',
  'headers.authorization',
  'headers.cookie',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'token',
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'secret',
  'clientSecret',
  'apiKey',
  'api_key',
];

export function sanitizeForLogging<T>(value: T): T {
  return sanitizeValue(value) as T;
}

function sanitizeValue(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((accumulator, [key, currentValue]) => {
    if (SENSITIVE_FIELD_NAMES.has(key)) {
      accumulator[key] = REDACTED_VALUE;
      return accumulator;
    }

    accumulator[key] = sanitizeValue(currentValue);
    return accumulator;
  }, {});
}
